import { beforeEach, describe, expect, it, vi } from "vitest";
import { getLessonScenario, lessons } from "../../content/lessons";
import {
  describeTutorContext,
  type TutorContext,
} from "../../packages/tutor/context";

const sdk = vi.hoisted(() => ({
  run: vi.fn(),
  runnerConfig: vi.fn(),
  providerConfig: vi.fn(),
}));
vi.mock("@openai/agents", () => ({
  Agent: class {
    constructor(options: object) {
      Object.assign(this, options);
    }
  },
  Runner: class {
    constructor(config: unknown) {
      sdk.runnerConfig(config);
    }
    run = sdk.run;
  },
  OpenAIProvider: class {
    constructor(config: unknown) {
      sdk.providerConfig(config);
    }
  },
  tool: (options: unknown) => options,
  user: (content: string) => ({ role: "user", content }),
  assistant: (content: string) => ({ role: "assistant", content }),
  setTracingDisabled: vi.fn(),
}));
import { createProvider } from "./provider";

type AgentTools = {
  tools: Array<{ name: string; execute: (input: unknown) => Promise<string> }>;
};
function execute(agent: AgentTools, name: string, input: unknown = {}) {
  return agent.tools
    .find((tool) => tool.name === name)!
    .execute(input)
    .then(JSON.parse);
}
const context: TutorContext = {
  mode: "lab",
  scenario: getLessonScenario(lessons[0]!.id),
};
const action = {
  target: "transmitter",
  targetId: null,
  field: "powerDbm",
  value: 25,
};
const messages = [
  { role: "user" as const, content: "Show me what more power changes." },
];

describe("tutor workspace tools", () => {
  beforeEach(() => {
    sdk.run.mockReset();
    sdk.runnerConfig.mockClear();
    sdk.providerConfig.mockClear();
  });

  it("reuses a Responses API runner while keeping tools and edits isolated per request", async () => {
    const agents: AgentTools[] = [];
    sdk.run.mockImplementation(async (agent: AgentTools) => {
      agents.push(agent);
      if (agents.length === 1)
        await execute(agent, "update_experiment", action);
      else
        expect(await execute(agent, "inspect_experiment")).toEqual(
          describeTutorContext(context),
        );
      return { finalOutput: "Explained." };
    });
    const provider = createProvider("test", "text", "voice");
    const first = await provider.chat(
      messages,
      context,
      new AbortController().signal,
    );
    const second = await provider.chat(
      messages,
      context,
      new AbortController().signal,
    );
    expect(first).toMatchObject({ actions: [action] });
    expect(second).toMatchObject({ actions: [] });
    expect(sdk.runnerConfig).toHaveBeenCalledOnce();
    expect(sdk.providerConfig).toHaveBeenCalledExactlyOnceWith({
      apiKey: "test",
      useResponses: true,
    });
    expect(sdk.runnerConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        tracingDisabled: true,
        traceIncludeSensitiveData: false,
      }),
    );
    expect(agents[0]).not.toBe(agents[1]);
    expect(
      agents[0]!.tools.find((tool) => tool.name === "update_experiment"),
    ).toMatchObject({
      strict: true,
      description: expect.stringContaining("antennaType selects"),
    });
    expect(agents[0]).toHaveProperty("modelSettings.parallelToolCalls", false);
    expect(sdk.run.mock.calls[0]![2]).toMatchObject({ maxTurns: 8 });
  });

  it("stages sequential edits and lets later inspection see authoritative changed inputs", async () => {
    const original = structuredClone(context);
    sdk.run.mockImplementation(async (agent: AgentTools) => {
      const output = await execute(agent, "update_experiment", action);
      expect(output.pendingWorkspaceUpdate).toBe(true);
      const expected = structuredClone(context);
      expected.scenario!.transmitter.powerDbm = 25;
      expect(await execute(agent, "inspect_experiment")).toEqual(
        describeTutorContext(expected),
      );
      const comparison = await execute(agent, "simulate_what_if", {
        powerDbm: 30,
        frequencyHz: null,
        txHeightM: null,
        rxHeightM: null,
      });
      expect(
        comparison.after.receivedPowerDbm - comparison.before.receivedPowerDbm,
      ).toBeCloseTo(5);
      return { finalOutput: "I raised transmit power to 25 dBm." };
    });
    const result = await createProvider("test", "test", "test").chat(
      messages,
      context,
      new AbortController().signal,
    );
    expect(result).toEqual({
      text: "I raised transmit power to 25 dBm.",
      actions: [action],
    });
    expect(context).toEqual(original);
  });

  it("returns invalid edits as tool errors without changing the pending context", async () => {
    sdk.run.mockImplementation(async (agent: AgentTools) => {
      expect(
        await execute(agent, "update_experiment", {
          ...action,
          field: "unknownField",
        }),
      ).toHaveProperty("error");
      expect(await execute(agent, "inspect_experiment")).toEqual(
        describeTutorContext(context),
      );
      return { finalOutput: "That setting cannot be changed." };
    });
    expect(
      await createProvider("test", "test", "test").chat(
        messages,
        context,
        new AbortController().signal,
      ),
    ).toEqual({ text: "That setting cannot be changed.", actions: [] });
  });

  it("does not return staged actions when a provider fails or cancellation arrives", async () => {
    const controller = new AbortController();
    sdk.run.mockImplementation(async (agent: AgentTools) => {
      await execute(agent, "update_experiment", action);
      controller.abort();
      return { finalOutput: "Changed." };
    });
    await expect(
      createProvider("test", "test", "test").chat(
        messages,
        context,
        controller.signal,
      ),
    ).rejects.toThrow("cancelled");
    expect(context.scenario!.transmitter.powerDbm).not.toBe(25);
  });
});
