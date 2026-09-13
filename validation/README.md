# Simulation validation

Computer A owns this directory. Run `bun run test:physics` for the current unit conversion, FSPL, noise, and link-budget tests. Full VHF and HF scenario validation is pending.

Required cases are unit conversion round trips, FSPL, thermal noise, a simple VHF link, a blocked VHF link, working HF, and HF above modeled MUF.

Each reference fixture must record inputs with units, expected outputs, tolerances, the reference or independent derivation, and model assumptions. Do not generate expected values with the same function under test.

Integration evidence must cover the approximately 10 dB change from 5 W to 50 W, the ridge fixture's larger improvement from antenna height, and loss of the returning skywave path above modeled MUF.

Mode thresholds are educational approximations. Document references and bandwidth conventions before accepting numeric expectations.

## Current model assumptions and references

FSPL uses the free-space far-field formula. The primitive checks positive distance and frequency but does not determine whether a physical antenna is in its far field. The scenario adapter must state that assumption. See [ITU-R P.525-5](https://www.itu.int/rec/R-REC-P.525-5-202411-I/en).

Noise uses `kTB` plus receiver noise figure. The default temperature is 290 K. Adding conventional noise figure at other temperatures is an educational approximation. See [Keysight noise figure overview](https://www.keysight.com/in/en/products/noise-figure-and-phase-noise-analyzers/noise-figure-analyzers.html).

The speed of light and Boltzmann constant use exact SI values. See [NIST SI defining constants](https://www.nist.gov/pml/special-publication-330/sp-330-section-2).
