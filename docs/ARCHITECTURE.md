# Architecture and contract notes

## Calculation boundary

The engine accepts a `Scenario` and returns a `SimulationResult` through `simulateScenario`. The UI renders results and paths. It does not compute FSPL, noise, SNR, antenna loss, propagation loss, or link margin.

Version 1 contract examples appear in sections 6–8 of the [source plan](BUILD_PLAN.md). Draft TypeScript types now live in `packages/contracts/index.ts`.

The result includes received power, noise, SNR, required SNR, link margin, status, confidence, calculation trees, ranked limiting factors, propagation geometry, warnings, and explanation keys.

Computer B starts against `packages/contracts/mockSimulation.ts` in this baseline. The mock must be deterministic, conform to the agreed schema, and identify its values as mocked.

## Decisions needed before freezing version 1

- Review the initial `EnvironmentConfig` with `model: "free-space"` and `temperatureK`, and `SimulationTime` with `utcIso`. Terrain and HF fields require a coordinated extension.
- Specify terrain obstruction inputs, HF environmental inputs, time representation, and deterministic defaults.
- Specify geographic and local path coordinate conventions, including altitude reference and units.
- Define input validation and invalid-input behavior at the engine boundary.
- Define thresholds for good, marginal, and failed results.
- Define confidence semantics and signs for limiting-factor impact values.
- Agree on mode IDs, educational SNR reference bandwidths, and citation fields.

These types are a draft for coordination with Computer B. They are not a frozen cross-machine agreement. The intended `utcIso` value is a UTC ISO 8601 timestamp. Runtime scenario validation is still pending.

## Validation directory

Use root `validation/`. Sections 10, 12, and 30 of the source plan use root-level validation or demo directories, while section 5 also lists `packages/validation`. A single root validation directory avoids duplicate ownership and fixtures.

## Runtime constraints

Simulation runs on SEND IT or a deliberate preview update, never in the render loop. Normal calculations target less than 100 ms. Heavier solves target less than 500 ms where reasonable.

Graphics modes change rendering detail without changing physics. Every important visual also needs numeric results, text, and accessible controls. The demo targets at least 30 FPS on the presentation machine.
