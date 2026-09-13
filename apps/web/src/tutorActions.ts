import { applyTutorAction } from "../../../packages/tutor/actions";
import {
  describeTutorContext,
  type TutorContext,
} from "../../../packages/tutor/context";

export function stageTutorActions(
  context: TutorContext,
  actions: unknown,
): TutorContext {
  if (!Array.isArray(actions) || actions.length > 20)
    throw new Error("The tutor returned an invalid set of changes.");
  let next = structuredClone(context);
  for (const action of actions) {
    const validated = applyTutorAction(next, action);
    next =
      context.mode === "disaster"
        ? { ...next, network: validated.network }
        : { ...next, scenario: validated.scenario };
  }
  return next;
}

// Execute only completed responses, never partial or cancelled function arguments.
export function runVoiceTools(
  event: unknown,
  snapshot: TutorContext,
  current: TutorContext,
  seen: Set<string>,
  commit: (next: TutorContext, expected: TutorContext) => void,
) {
  const data = event as {
    type?: string;
    response?: { status?: string; output?: unknown[] };
  } | null;
  if (
    data?.type !== "response.done" ||
    data.response?.status !== "completed" ||
    !Array.isArray(data.response.output)
  )
    return [];
  const outputs: {
    type: "conversation.item.create";
    item: { type: "function_call_output"; call_id: string; output: string };
  }[] = [];
  let working = current;
  let edits = 0;
  for (const raw of data.response.output) {
    const call = raw as {
      type?: string;
      call_id?: string;
      name?: string;
      arguments?: string;
    } | null;
    if (
      call?.type !== "function_call" ||
      typeof call.call_id !== "string" ||
      seen.has(call.call_id)
    )
      continue;
    seen.add(call.call_id);
    let result: unknown;
    try {
      if (JSON.stringify(snapshot) !== JSON.stringify(current))
        throw new Error(
          "The workspace changed during this response. Inspect the current experiment and try again.",
        );
      if (call.name === "inspect_experiment") {
        result = describeTutorContext(working);
      } else if (call.name === "update_experiment") {
        if (++edits > 20) throw new Error("Too many changes in one response.");
        if (typeof call.arguments !== "string" || call.arguments.length > 4000)
          throw new Error("Invalid tool arguments.");
        const next = stageTutorActions(working, [JSON.parse(call.arguments)]);
        const before = describeTutorContext(working);
        commit(next, working);
        working = next;
        result = {
          workspaceChanged: true,
          before,
          after: describeTutorContext(working),
        };
      } else throw new Error("Unknown workspace tool.");
    } catch (error) {
      result = {
        error:
          error instanceof Error
            ? error.message
            : "Could not change the workspace.",
        workspaceChanged: false,
      };
    }
    outputs.push({
      type: "conversation.item.create",
      item: {
        type: "function_call_output",
        call_id: call.call_id,
        output: JSON.stringify(result),
      },
    });
  }
  return outputs;
}
