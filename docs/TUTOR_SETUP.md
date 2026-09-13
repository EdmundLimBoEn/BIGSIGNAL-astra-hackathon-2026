# Signal tutor setup

The optional tutor uses the OpenAI Agents SDK for text and OpenAI Realtime WebRTC for spoken conversation. The lessons and simulation remain usable without a key or internet. No simulated AI answers are substituted when the service is unavailable.

## Run locally

1. Copy `.env.example` to `.env` and set `OPENAI_API_KEY` to a project key with access to the configured models. Keep this file out of git. Never put the key in a `VITE_` variable or the browser.
2. Run `bun install`.
3. For development, run `bun run dev:server` and `bun run dev` in separate terminals. Vite proxies `/api` to port 8787.
4. For the complete production server, run `bun run build` followed by `bun run start`, then open `http://localhost:8787`.
5. Open Signal, send a question, then start voice and permit the microphone. Voice requires localhost or HTTPS, WebRTC, and network access to OpenAI. End voice when finished.

`GET /api/tutor/status` reports configuration presence, not provider connectivity or credit availability. No paid request occurs merely by loading the page. The bundled test suite uses mocks, not a live provider key.

## Configuration

| Variable                | Default                | Purpose                                                            |
| ----------------------- | ---------------------- | ------------------------------------------------------------------ |
| `OPENAI_API_KEY`        | unset                  | Required for text and voice; server only                           |
| `OPENAI_TEXT_MODEL`     | `gpt-4.1-mini`         | Agents SDK model                                                   |
| `OPENAI_VOICE_MODEL`    | `gpt-realtime-2.1`     | Realtime model; requires account access                            |
| `BIGSIGNAL_TUTOR_TOKEN` | unset                  | Optional local classroom access code; mandatory for public binding |
| `APP_ORIGIN`            | listed localhost ports | Exact allowed browser origins, comma separated                     |
| `HOST`                  | `127.0.0.1`            | Binding address; public binding requires origin and access code    |
| `PORT`                  | `8787`                 | Application and API server port                                    |

To deploy the server, use a Bun-capable host behind HTTPS with `HOST=0.0.0.0`, `APP_ORIGIN=https://your-domain.example` and a strong `BIGSIGNAL_TUTOR_TOKEN`. Set provider spend limits in your OpenAI project. A static-only Pages deployment cannot run these API routes. No hosting target or paid infrastructure has been provisioned.

The access code is shared classroom access, not per-student identity. The server uses the direct socket address for rate limiting; it deliberately does not trust spoofable forwarding headers. Behind a reverse proxy all students may share that rate bucket. For larger deployments, use authenticated users and a shared rate limiter at your trusted ingress. Current limits are 12 provider requests per minute per direct client, 60 context refreshes, four concurrent requests, 250 KB request bodies, 20 chat messages, 24,000 conversation characters, five agent turns, and a 45-second server timeout. Realtime audio travels directly between browser and OpenAI after the server creates the connection; HTTP limits govern connection creation, not ongoing audio spending. Classroom access control and provider spend limits remain important.

## Grounding and privacy

The text agent uses the Agents SDK with Responses, rather than a hosted Agents API session. It has three read-only tools: inspect the current experiment, retrieve a lesson, and compare a bounded hypothetical change through the authoritative RF engine. It cannot move controls, run arbitrary code, browse the web, or award mastery. The voice session receives current engine calculations and refreshed context. Voice does not execute what-if tools; it asks the learner to change controls and run the experiment before discussing new numbers.

A question sends the visible experiment settings and recent conversation to OpenAI. Starting voice sends microphone audio to OpenAI and may transcribe it. Do not share personal information in classroom experiments. The application server does not persist student conversations or log prompts, audio, credentials, or upstream error bodies. Agents SDK tracing is disabled and text Responses storage is disabled. Provider processing and retention are governed by the account's OpenAI data settings; these application controls are not a zero-retention guarantee. Browser experiment storage remains local. AI guidance may be mistaken; numerical claims should be checked against the deterministic results and model assumptions.

## Verification and live smoke check

`bun run test apps/server/app.test.ts` checks missing configuration, access code, origins, request bounds, rate limiting, timeout recovery, invalid scenarios, prompt roles, read-only engine comparisons, voice request format, and sanitized failures with mocked providers.

After setting a real key, perform this live check: ask why adding 10 dB of power changes received power, ask the tutor to compare that change, start voice, interrupt a spoken answer, change the experiment, ask about the updated result, mute, and end voice. Confirm the microphone indicator stops. Live model quality, voice negotiation, billing and account permissions cannot be verified without your key.

## Official references

- [OpenAI Agents SDK](https://openai.github.io/openai-agents-js/)
- [Running agents](https://openai.github.io/openai-agents-js/guides/running-agents/)
- [Tracing controls](https://openai.github.io/openai-agents-js/guides/tracing/)
- [Realtime API calls](https://platform.openai.com/docs/api-reference/realtime)
- [Realtime WebRTC](https://developers.openai.com/api/docs/guides/voice-webrtc)
