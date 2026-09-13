import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { mockSimulation } from "../../../packages/contracts/mockSimulation";
import { exampleScenario } from "../../../packages/contracts/exampleScenario";
import "./style.css";

function App() {
  const [result, setResult] = useState<ReturnType<typeof mockSimulation> | null>(null);
  return <main>
    <p>COMPUTER A · DEVELOPMENT BASELINE</p>
    <h1>B I G S I G N A L</h1>
    <h2>{exampleScenario.title}</h2>
    <p>Can we get a signal from here to there, and what is stopping us?</p>
    <p>This starter uses fixed mock results. Computer B owns the mission interface and 3D scenes.</p>
    <button onClick={() => setResult(mockSimulation(exampleScenario))}>SEND IT</button>
    <button onClick={() => setResult(null)}>RESET THE UNIVERSE</button>
    <section aria-live="polite">{result && <>
      <h2>NOPE · MOCK RESULT</h2>
      <dl>{[["RX power", result.receivedPowerDbm, "dBm"], ["Noise", result.noiseFloorDbm, "dBm"], ["SNR", result.snrDb, "dB"], ["Link margin", result.linkMarginDb, "dB"]].map(([label, value, unit]) => <div key={label}><dt>{label}</dt><dd>{value} {unit}</dd></div>)}</dl>
      <p>{result.warnings[0]}</p>
    </>}</section>
  </main>;
}

createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
