import {
  Agent,
  Runner,
  OpenAIProvider,
  tool,
  user,
  assistant,
  setTracingDisabled,
} from "@openai/agents";
import { z } from "zod";
import {
  buildTutorInstructions,
  describeTutorContext,
  lookupLesson,
  simulateWhatIf,
  type TutorContext,
  type TutorMessage,
} from "../../packages/tutor/context";
setTracingDisabled(true);
export interface TutorProvider {
  chat(
    messages: TutorMessage[],
    context: TutorContext,
    signal: AbortSignal,
  ): Promise<string>;
  realtime(
    sdp: string,
    context: TutorContext,
    signal: AbortSignal,
  ): Promise<string>;
}
export function createProvider(
  apiKey: string,
  textModel: string,
  voiceModel: string,
  request: typeof fetch = fetch,
): TutorProvider {
  return {
    async chat(messages, context, signal) {
      const agent = new Agent({
        name: "Signal radio tutor",
        model: textModel,
        instructions: buildTutorInstructions(context),
        modelSettings: { maxTokens: 1200, store: false },
        tools: [
          tool({
            name: "inspect_experiment",
            description:
              "Read the current authoritative simulation result and model assumptions.",
            parameters: z.object({}),
            execute: async () => JSON.stringify(describeTutorContext(context)),
          }),
          tool({
            name: "lookup_lesson",
            description:
              "Look up BIG SIGNAL teaching content by lesson ID, without quiz answer keys.",
            parameters: z.object({ id: z.string().max(100) }),
            execute: async ({ id }) => JSON.stringify(lookupLesson(id)),
          }),
          tool({
            name: "simulate_what_if",
            description:
              "Run a hypothetical read-only engine comparison. Null leaves an input unchanged. Never changes the workspace.",
            parameters: z.object({
              powerDbm: z.number().min(-100).max(100).nullable(),
              frequencyHz: z.number().min(100000).max(100000000000).nullable(),
              txHeightM: z.number().min(0).max(20000).nullable(),
              rxHeightM: z.number().min(0).max(20000).nullable(),
            }),
            execute: async (changes) =>
              JSON.stringify(simulateWhatIf(context, changes)),
          }),
        ],
      });
      const runner = new Runner({
        modelProvider: new OpenAIProvider({ apiKey }),
        tracingDisabled: true,
        traceIncludeSensitiveData: false,
      });
      const result = await runner.run(
        agent,
        messages.map((message) =>
          message.role === "user"
            ? user(message.content)
            : assistant(message.content),
        ),
        { maxTurns: 5, signal },
      );
      if (typeof result.finalOutput !== "string" || !result.finalOutput.trim())
        throw new Error("Empty provider response");
      return result.finalOutput;
    },
    async realtime(sdp, context, signal) {
      const form = new FormData();
      form.set("sdp", sdp);
      form.set(
        "session",
        JSON.stringify({
          type: "realtime",
          model: voiceModel,
          instructions: buildTutorInstructions(context, true),
          max_output_tokens: 1000,
          audio: {
            input: {
              transcription: { model: "gpt-4o-mini-transcribe" },
              turn_detection: {
                type: "server_vad",
                create_response: true,
                interrupt_response: true,
              },
            },
            output: { voice: "marin" },
          },
        }),
      );
      const response = await request(
        "https://api.openai.com/v1/realtime/calls",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}` },
          body: form,
          signal,
        },
      );
      if (!response.ok) throw new Error("Voice provider rejected request");
      const answer = await response.text();
      if (!answer.startsWith("v=0") || answer.length > 100000)
        throw new Error("Invalid voice response");
      return answer;
    },
  };
}
