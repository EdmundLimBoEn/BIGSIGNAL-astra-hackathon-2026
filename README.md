# B I G S I G N A L

An offline educational radio laboratory. Predict a result, configure a link, press **SEND IT**, and discover why it works. The existing RF engine and 3D terrain/globe views power a complete course and open sandbox.

## Run the product

```sh
bun install --frozen-lockfile
bun run dev
```

Open the local URL printed by Vite. First launch starts a guided lesson without an account, radio hardware, or cloud backend.

## Work in one place

Lessons use Brief, Experiment, and Reflect steps. The lab keeps the map and radio controls together, with direct views for results, comparisons, instruments, and physics settings. SEND IT stays within reach. Disaster Lab opens on the network, with separate briefing and result views.

**Ask Signal** opens the optional AI tutor beside the lab on desktop or as a compact panel on mobile. It receives the current experiment or disaster network, answers text questions with engine tools and can demonstrate changes directly in the workspace, with undo, and supports spoken conversations through OpenAI Realtime. Setup is in [Signal tutor setup](docs/TUTOR_SETUP.md). No key is required for the lessons or simulation.

## Explore the four modes

- **Learn** has 10 beginner, 8 intermediate, and 14 advanced lessons. Each has a prediction, hands-on experiment, explanation, transfer question, and local mastery record. Each tier has its own entry point. Detailed concepts identify which quantities are modeled and which remain conceptual.
- **Lab** lets you place stations, change bands while keeping endpoints fixed, compare A/B designs, inspect WHY/MATH, and use the antenna and receiver workbench. Raise antenna height, change polarization, inspect Fresnel zones, or test a weak-signal mode.
- **Disaster Lab** has six civil-resilience exercises. Learn why direct radio can help when power, fiber, Internet, or cellular infrastructure fails. Place relays in 3D or on a map, configure bidirectional links, and compare coverage, redundancy, battery endurance, and communication requirements.
- **Unreasonable Engineering** keeps ordinary physics for extreme equipment. Its separate fantasy mode can change Earth curvature, ionosphere presence, spreading, or the speed of light. Files and comparisons preserve the selected universe.

POTATO graphics renders lightweight SVG scenes with the same simulation results. BIG and NORMAL render interactive 3D. Reduced motion, keyboard controls, responsive layouts, and graphics fallbacks keep the lab usable on modest equipment.

## Teach with a portable challenge

1. Open **Teacher Tools**. Choose a lesson or the current lab setup.
2. Enter the objective, available equipment, frequencies, hints, and numerical limits.
3. Open the student challenge to adjust its simulation parameters. Use **Teacher Tools** again to refine its teaching metadata.
4. Download the `.bigsignal.json` file and distribute it through your normal classroom channel.
5. Students choose **Open file**, make a prediction, and test their designs. They can save and export the resulting experiment.

Structured requirements check the physical model, usable one-way path, margin, power, frequency, equipment, and optional antenna height. Written planning constraints require classroom discussion. Battery requirements belong in Disaster Lab, where complete station energy inputs exist. No account or student roster is collected.

Network files use `.bigsignal-network.json` and import within Disaster Lab. Wire files use `.bigsignal-wire.json` and import in the custom wire editor. Custom wires are geometric designs, not solved electromagnetic antenna models.

## Verify and use offline

```sh
bun run test
bun run test:physics
bun run build
bun x vite preview apps/web --host 127.0.0.1 --port 4180
```

The production artifact is `apps/web/dist`. Load the preview once and wait for **Ready offline**. The core lessons, simulations, and bundled assets then work on an offline reload. Close old tabs and reopen after updates. The development server does not install an offline cache.

## Inspect the engineering

`simulateScenario` remains the authoritative RF entry point. `simulateLaboratory` adds explicit real/fantasy settings. `simulateNetwork` evaluates each configured edge in both directions before assessing connectivity, redundancy, and energy. Physics never lives in React.

Model assumptions, equations, units, and confidence appear in MATH and the equipment workbench. HF uses synthetic ionospheric conditions, terrain uses a configured single obstruction, and antenna patterns are analytical teaching shapes. The app is not an operational emergency communications plan or permission to transmit.

- [Architecture and integration boundaries](docs/ARCHITECTURE.md)
- [Course and model coverage](docs/product/CURRICULUM.md)
- [Product verification](docs/product/VERIFICATION.md)
- [Decision trail](docs/product/decisions.tsv)
- [Simulation models and limits](packages/simulation/README.md)
- [Numerical validation](validation/README.md)
- [Original build plan](docs/BUILD_PLAN.md)
- [Collaboration workflow](CONTRIBUTING.md)

The stack is TypeScript, React, Vite, Three.js, React Three Fiber, and Vitest with the committed Bun lockfile. The optional Bun server uses the OpenAI Agents SDK and Realtime API; its key stays on the server. There is no configured hosted deployment target.
