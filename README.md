# B I G S I G N A L

An experimental educational RF simulator for students, teachers, and radio clubs.
Explore an interactive 3D globe, build a communication link, predict the result, press **SEND IT**, and inspect why it works or fails.

The intended view has Earth, an ionosphere shell, geographic transmitter and receiver positions, and animated propagation paths. The current starter is temporary tooling verification.

## Current status

The repository now has a runnable React starter, draft TypeScript contracts, a deterministic mock, and tested RF foundation functions. Computer A owns simulation and validation. Computer B owns the experience.

The starter displays mock values. The canonical `simulateScenario` adapter, terrain, HF, and full mission UI remain to be built.

The core loop is mission → predict → configure → send → watch → result → WHY → MATH → change something → retry.

## Read the docs

- [Finalized build plan](docs/BUILD_PLAN.md) preserves the supplied plan in full.
- [Collaboration guide](CONTRIBUTING.md) defines ownership, branches, and integration checks.
- [Architecture and contract notes](docs/ARCHITECTURE.md) records boundaries and unresolved contract details.
- [Build checklist](docs/BUILD_CHECKLIST.md) tracks bootstrap and demo readiness.
- [Computer A handoff](docs/COMPUTER_A.md) gives the engine implementation order.
- [Computer B handoff](docs/COMPUTER_B.md) records the globe direction and mock integration.
- [Validation plan](validation/README.md) defines required evidence.
- [Demo script](demo/demo-script.md) describes the judging sequence.

## Run locally

```sh
bun install --frozen-lockfile
bun run dev
bun run build
bun run test
bun run test:physics
```

The development server opens at `http://127.0.0.1:5173`. The production build is written to `apps/web/dist`.

## Stack

TypeScript, React, Vite, Three.js, React Three Fiber, Zustand, and Vitest. Use Bun 1.3.14 for dependency management. The lockfile is committed.

React is pinned to 19.2.8 to satisfy React Three Fiber 9.7.0 peer requirements.

The core demo must work offline without accounts or a required cloud backend. A teaching agent and voice control are optional additions after the simulator works.
