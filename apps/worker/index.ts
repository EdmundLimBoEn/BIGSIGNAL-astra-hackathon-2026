import { createTutorHandler } from "../server/app";
import { createProvider } from "../server/provider";
import { readVoiceTuning } from "../server/tuning";

export type WorkerBindings = Omit<Env, "ASSETS"> & {
  ASSETS: Pick<Env["ASSETS"], "fetch">;
  OPENAI_API_KEY?: string;
  BIGSIGNAL_TUTOR_TOKEN?: string;
};

type TutorHandler = ReturnType<typeof createTutorHandler>;
const handlers = new WeakMap<WorkerBindings, { settings: string[]; handle: TutorHandler }>();

function tutorHandler(env: WorkerBindings): TutorHandler {
  const settings = [env.OPENAI_API_KEY ?? "", env.BIGSIGNAL_TUTOR_TOKEN ?? "",
    env.APP_ORIGIN, env.OPENAI_TEXT_MODEL, env.OPENAI_VOICE_MODEL,
    env.OPENAI_VOICE_THRESHOLD, env.OPENAI_VOICE_SILENCE_MS, env.OPENAI_VOICE_NOISE_REDUCTION];
  const cached = handlers.get(env);
  if (cached && settings.every((value, index) => value === cached.settings[index])) return cached.handle;
  const handle = createTutorHandler({
    apiKey: env.BIGSIGNAL_TUTOR_TOKEN ? env.OPENAI_API_KEY : undefined,
    accessCode: env.BIGSIGNAL_TUTOR_TOKEN,
    textModel: env.OPENAI_TEXT_MODEL,
    voiceModel: env.OPENAI_VOICE_MODEL,
    origins: [env.APP_ORIGIN],
  }, createProvider(env.OPENAI_API_KEY ?? "", env.OPENAI_TEXT_MODEL, env.OPENAI_VOICE_MODEL, fetch,
    readVoiceTuning({
      OPENAI_VOICE_THRESHOLD: env.OPENAI_VOICE_THRESHOLD,
      OPENAI_VOICE_SILENCE_MS: env.OPENAI_VOICE_SILENCE_MS,
      OPENAI_VOICE_NOISE_REDUCTION: env.OPENAI_VOICE_NOISE_REDUCTION,
    })));
  handlers.set(env, { settings, handle });
  return handle;
}

export default {
  async fetch(request: Request, env: WorkerBindings): Promise<Response> {
    const path = new URL(request.url).pathname;
    if (path !== "/api" && !path.startsWith("/api/")) return env.ASSETS.fetch(request);
    try {
      if (request.method === "POST" && !env.BIGSIGNAL_TUTOR_TOKEN) {
        return Response.json({ error: "The tutor is unavailable until the host configures its access code." }, {
          status: 503, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
        });
      }
      const response = await tutorHandler(env)(request, request.headers.get("CF-Connecting-IP") ?? "unknown");
      console.log(JSON.stringify({ event: "tutor_request", method: request.method, path, status: response.status }));
      return response;
    } catch {
      console.error(JSON.stringify({ event: "tutor_adapter_error", method: request.method, path }));
      return Response.json({ error: "The tutor is unavailable. Check the host configuration." }, {
        status: 503, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
      });
    }
  },
};
