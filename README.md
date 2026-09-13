# B I G S I G N A L

An educational RF simulator for students, teachers, and radio clubs. Configure a radio link, predict the result, press **SEND IT**, and inspect the propagation path, link budget, noise, and limiting factors.

The `integration` branch combines the simulation engine from `engine` and the web experience from `experience`. The app runs the real `simulateScenario` locally. No API server, account, or cloud service is required.

## Run locally

```sh
bun install --frozen-lockfile
bun run dev
```

Open `http://127.0.0.1:5173`, or the next available port printed by Vite.

## Verify and preview

```sh
bun run test
bun run test:physics
bun run build
bunx vite preview apps/web --host 127.0.0.1 --port 4173
```

The production build is written to `apps/web/dist`. Visit the production preview once while online and wait for the offline cache notice before testing an offline reload. After an update, close old tabs and reopen the app to activate its new cache.

## Try the integrated missions

- VHF starts with the engine's ridge scenario. Compare 5 W with 50 W, then return to 5 W and raise the transmitter from 2 m to 15 m. Power adds 10 dB; raising the antenna clears enough diffraction loss to help more.
- HF runs Singapore to Tokyo under configured daytime conditions. Try 14 MHz, then 30 MHz. Above the modeled MUF, the ray escapes and the link fails. Any remaining positive budget is explicitly hypothetical because no supported path reaches the receiver.
- Open WHY for explanations and ranked improvements, or MATH for the calculation tree and assumptions. Advanced controls, saved experiments, graphics modes, and presentation mode use the same engine.

Terrain is a schematic profile of the configured single obstruction. Horizontal spacing and vertical heights are exaggerated for visibility. The globe uses the engine's geographic path coordinates. These are educational approximations, not operational RF predictions.

## Project guides

- [Build plan](docs/BUILD_PLAN.md)
- [Collaboration and branch ownership](CONTRIBUTING.md)
- [Architecture and integration boundary](docs/ARCHITECTURE.md)
- [Backend contracts](packages/contracts/README.md)
- [Simulation guide](packages/simulation/README.md)
- [Validation](validation/README.md)

The stack is TypeScript, React, Vite, Three.js, React Three Fiber, and Vitest. Dependencies use the committed Bun lockfile. There is no configured hosted deployment target in this repository.
