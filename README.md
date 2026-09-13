# B I G S I G N A L

An experimental educational RF simulator for students, teachers, and radio clubs.
Build a communication link, predict the result, press **SEND IT**, and inspect why it works or fails.

## Current status

This repository contains the initial documentation and directory layout. The app, contracts, mock engine, dependencies, and tests are not implemented yet. Computer A owns simulation and validation. Computer B owns the experience.

The core loop is mission → predict → configure → send → watch → result → WHY → MATH → change something → retry.

## Read the docs

- [Finalized build plan](docs/BUILD_PLAN.md) preserves the supplied plan in full.
- [Collaboration guide](CONTRIBUTING.md) defines ownership, branches, and integration checks.
- [Architecture and contract notes](docs/ARCHITECTURE.md) records boundaries and unresolved contract details.
- [Build checklist](docs/BUILD_CHECKLIST.md) tracks bootstrap and demo readiness.
- [Computer A handoff](docs/COMPUTER_A.md) gives the engine implementation order.
- [Validation plan](validation/README.md) defines required evidence.
- [Demo script](demo/demo-script.md) describes the judging sequence.

## Planned stack

TypeScript, React, Vite, Three.js, React Three Fiber, Zustand, and Vitest. Use Bun for dependency management and commit its lockfile during bootstrap.

Phase 0 must add the `dev`, `build`, `test`, and `test:physics` package scripts. These commands are not available in this documentation baseline.

The core demo must work offline without accounts or a required cloud backend. A teaching agent and voice control are optional additions after the simulator works.
