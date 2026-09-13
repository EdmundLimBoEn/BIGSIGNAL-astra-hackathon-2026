# Computer A handoff

## Current state

Computer A initialized the documentation repository. No engine implementation has started. The next milestone is coordinated Phase 0, followed by A1.

## Implementation order

- [ ] Phase 0. Install the baseline stack, create scripts, agree on complete contracts, and publish deterministic mocks.
- [ ] A1. Implement and test W, mW, dBm, dB, Hz, MHz, m, and km conversions.
- [ ] A2. Implement FSPL with frequency, distance, equation, units, and calculation provenance.
- [ ] A3. Implement transmitter and receiver link budget terms.
- [ ] A4. Implement thermal noise, receiver noise figure, and SNR.
- [ ] Integration 1. Verify the 5 W to 50 W example through the UI.
- [ ] A5. Add educational FM voice, SSB, CW, and FT8 profiles with references and confidence.
- [ ] A6. Add bundled VHF terrain, radio horizon, and a single knife-edge obstruction.
- [ ] A7. Add simplified HF time, effective F2 height, MUF, absorption, hop count, and path geometry.
- [ ] A8. Rank limiting factors by achievable improvement, not largest loss.
- [ ] Integration 2. Verify that antenna height beats increased power in the ridge fixture.
- [ ] A9. Complete physics validation and documented assumptions.
- [ ] Integration 3. Verify HF success and above-MUF failure through the UI.

## Handoff evidence

At each integration, record the commit, contract changes, commands run, outcomes, fixture assumptions, and remaining blockers. Computer B needs a working mock before starting UI integration.
