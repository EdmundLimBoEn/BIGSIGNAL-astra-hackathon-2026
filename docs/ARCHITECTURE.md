# Architecture and contract notes

## Calculation boundary

`Scenario` enters `simulateScenario` from `@bigsignal/simulation`, and `SimulationResult` returns all RF results. The web adapter uses that entry point directly. React renders the result and never computes path loss, noise, SNR, or link margin.

The `integration` checkpoint combines `engine` and `experience` without changing the engine's version 1 contracts. `EnvironmentConfig` selects free space, VHF terrain, or HF skywave with explicit model inputs. The UI missions load complete engine scenarios and set the HF endpoints and demonstration time.

`validateScenario` checks inputs at the engine boundary. Persisted settings use the same validator. Invalid saved settings fall back to the mission default, and simulation validation errors appear in the UI.

`propagationAvailable` distinguishes a supported route from a hypothetical budget. When it is false, the UI displays the failed status and a warning next to the numeric results even if the hypothetical margin is positive.

See [contract notes](../packages/contracts/README.md) for the schema and [simulation documentation](../packages/simulation/README.md) for thresholds, mode profiles, assumptions, and confidence semantics.

## Geometry and explanations

Engine paths contain latitude and longitude in degrees and altitude in metres above mean sea level. Endpoint altitude already includes antenna height. The globe renders these coordinates directly.

The terrain view projects geographic points onto the transmitter-to-receiver profile. It places the single obstruction at the middle of the illustration by stretching each side independently. A shared projection places the antenna tips, terrain crest, and returned paths in the same coordinates. Heights and spacing are exaggerated for visibility. This is display geometry and does not change the engine result.

Educational text lives in `content/explanations`. The engine returns explanation keys, warnings, calculation nodes, and ranked limiting factors. The UI displays each, including cases where restoring a path matters more than a numeric dB improvement.

## Runtime and validation

Simulation runs on SEND IT, never in the render loop. Graphics modes change rendering detail without changing physics. The app bundles its data and runs without a cloud backend. A production service worker caches the built app for offline reloads.

Use root `validation/` for physics and numerical checks. Web integration tests exercise mission inputs, engine responses, persisted settings, and terrain projection. Run the full test suite and production build before publishing changes. Browser checks must also cover the VHF power and height experiment and HF above-MUF behavior.
