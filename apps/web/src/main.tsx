import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import type {
  CalculationNode,
  Scenario,
  SimulationResult,
} from "../../../packages/contracts";
import { exampleScenario } from "../../../packages/contracts/exampleScenario";
import { wattsToDbm, dbmToWatts } from "../../../packages/units/src";
import { runSimulation } from "./simulationAdapter";
import { Scene } from "./Scene";
import { explanations } from "../../../content/explanations";
import "./style.css";

type Prediction = "good" | "marginal" | "failed";
export type Graphics = "BIG" | "NORMAL" | "POTATO";
type Settings = {
  band: "VHF" | "HF";
  scenario: Scenario;
  graphics: Graphics;
  prediction: Prediction | null;
  attempts: number;
};
const labels = { good: "Strong", marginal: "Marginal", failed: "Dead" };
const defaults = (): Settings => ({
  band: "VHF",
  scenario: structuredClone(exampleScenario),
  graphics: "NORMAL",
  prediction: null,
  attempts: 0,
});
function read(key: string): Settings {
  const s = JSON.parse(localStorage.getItem(key) || "null");
  if (
    !s ||
    !["VHF", "HF"].includes(s.band) ||
    !["BIG", "NORMAL", "POTATO"].includes(s.graphics) ||
    ![null, "good", "marginal", "failed"].includes(s.prediction) ||
    !Number.isInteger(s.attempts) ||
    s.attempts < 0
  )
    throw Error("Invalid settings");
  const base = defaults().scenario;
  // Validate the stored shape before allowing persisted values into controls.
  const validate = (a: unknown, b: unknown): boolean =>
    typeof b === "number"
      ? typeof a === "number" && Number.isFinite(a)
      : typeof b === "object" && b !== null
        ? typeof a === "object" &&
          a !== null &&
          Object.entries(b).every(([k, v]) =>
            validate((a as Record<string, unknown>)[k], v),
          )
        : typeof a === typeof b;
  if (
    !validate(s.scenario, base) ||
    s.scenario.frequencyHz <= 0 ||
    s.scenario.transmitter.powerDbm < 0 ||
    s.scenario.transmitter.powerDbm > 80
  )
    throw Error("Invalid scenario");
  return s;
}
function MathNode({ node }: { node: CalculationNode }) {
  return (
    <details open>
      <summary>
        {node.label}
        <b>
          {node.value.toFixed(2)} {node.unit}
        </b>
      </summary>
      {node.equation && <code>{node.equation}</code>}
      {node.assumptions?.map((x) => (
        <p key={x}>{x}</p>
      ))}
      {node.children?.map((x) => (
        <MathNode key={x.id} node={x} />
      ))}
    </details>
  );
}
function App() {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      return read("bigsignal-v1");
    } catch {
      return defaults();
    }
  });
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [sentPrediction, setSentPrediction] = useState<Prediction | null>(null);
  const [running, setRunning] = useState(false);
  const [tab, setTab] = useState<"WHY" | "MATH">("WHY");
  const [view, setView] = useState<"globe" | "terrain">("globe");
  const [notice, setNotice] = useState("");
  const [presenting, setPresenting] = useState(false);
  const [offlineStatus, setOfflineStatus] = useState(
    "Local lab · no account required.",
  );
  useEffect(() => {
    if (!import.meta.env.PROD) return;
    if (!("serviceWorker" in navigator)) {
      setOfflineStatus(
        "Offline reload unavailable in this browser. Keep the local server running.",
      );
      return;
    }
    setOfflineStatus("Preparing offline cache…");
    navigator.serviceWorker
      .register(
        `${import.meta.env.BASE_URL}sw.js?build=${encodeURIComponent(import.meta.url)}`,
      )
      .then(() => navigator.serviceWorker.ready)
      .then(() =>
        setOfflineStatus(
          "Offline cache installed · close and reopen this tab after updates.",
        ),
      )
      .catch(() =>
        setOfflineStatus(
          "Offline cache unavailable. Keep the local server running.",
        ),
      );
  }, []);
  const { scenario, band, graphics, prediction, attempts } = settings;
  const advanced = scenario.difficulty === "advanced";
  useEffect(() => {
    try {
      localStorage.setItem("bigsignal-v1", JSON.stringify(settings));
    } catch {
      setNotice("Storage unavailable. Changes will not survive a reload.");
    }
  }, [settings]);
  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => setRunning(false), 1800);
    return () => clearTimeout(timer);
  }, [running]);
  function edit(change: (s: Scenario) => void) {
    setSettings((old) => {
      const s = structuredClone(old.scenario);
      change(s);
      return { ...old, scenario: s };
    });
    setResult(null);
    setRunning(false);
  }
  function selectBand(next: "VHF" | "HF") {
    const s = structuredClone(exampleScenario);
    s.difficulty = scenario.difficulty;
    if (next === "HF") {
      s.id = "hf-expedition";
      s.title = "Singapore to Tokyo";
      s.frequencyHz = 14e6;
      s.modeId = "ssb";
      s.receiver.bandwidthHz = 2400;
      s.transmitter.position = {
        latitudeDeg: 1.35,
        longitudeDeg: 103.8,
        altitudeM: 0,
      };
      s.receiver.position = {
        latitudeDeg: 35.7,
        longitudeDeg: 139.7,
        altitudeM: 0,
      };
    }
    setSettings({ ...settings, band: next, scenario: s, prediction: null });
    setResult(null);
    setRunning(false);
    setView(next === "HF" ? "globe" : "terrain");
  }
  function send() {
    if (!prediction || running) return;
    setResult(runSimulation(scenario));
    setSentPrediction(prediction);
    setRunning(true);
    setSettings((s) => ({ ...s, attempts: s.attempts + 1 }));
  }
  function save() {
    try {
      localStorage.setItem("bigsignal-experiment", JSON.stringify(settings));
      setNotice("Experiment saved on this device.");
    } catch {
      setNotice("Could not save: browser storage unavailable.");
    }
  }
  function load() {
    try {
      setSettings(read("bigsignal-experiment"));
      setResult(null);
      setRunning(false);
      setView("globe");
      setNotice("Saved experiment loaded.");
    } catch {
      setNotice("No valid saved experiment found.");
    }
  }
  const field = (
    label: string,
    value: number,
    min: number,
    max: number,
    change: (s: Scenario, v: number) => void,
    step = 0.1,
  ) => (
    <label className="number-field" key={label}>
      {label}
      <input
        type="number"
        value={Number(value.toFixed(3))}
        min={min}
        max={max}
        step={step}
        onChange={(e) => {
          if (e.target.value !== "" && e.target.validity.valid) {
            const v = e.target.valueAsNumber;
            edit((s) => change(s, v));
          }
        }}
      />
    </label>
  );
  return (
    <div className={`app ${presenting ? "presentation" : ""}`}>
      <header className="topbar">
        <a className="brand" href="#">
          <span className="brand-icon">◖)))</span> BIG SIGNAL
          <span className="lab-tag">RADIO LAB</span>
        </a>
        <div className="top-right">
          <button
            className="present-button"
            aria-pressed={presenting}
            onClick={() => setPresenting(!presenting)}
          >
            {presenting ? "↙ Back to lab" : "▣ Present"}
          </button>
          <button onClick={save}>Save experiment ↗</button>
          <button onClick={load}>Load</button>
        </div>
      </header>
      <div className="mission-heading">
        <div>
          <p className="eyebrow">EXPEDITION 01 / THE INVISIBLE CONNECTION</p>
          <h1>
            Make the invisible <em>visible.</em>
          </h1>
          <p>One mission. Two radios. A whole planet in the way.</p>
        </div>
        <div className="attempt">
          <b>{String(attempts).padStart(2, "0")}</b>
          <span>TRANSMISSIONS</span>
        </div>
      </div>
      <nav className="learning-loop" aria-label="Experiment progress">
        <span className={!prediction ? "active" : ""}>
          <i>01</i> Predict the link
        </span>
        <b>→</b>
        <span className={prediction && !result ? "active" : ""}>
          <i>02</i> Send your signal
        </span>
        <b>→</b>
        <span className={result ? "active" : ""}>
          <i>03</i> Discover why
        </span>
        <small>AN INTERACTIVE RADIO LABORATORY</small>
      </nav>
      <main className="workspace">
        <section className="visual-column">
          <div className="scene-card">
            <div className="scene-top">
              <div className="segmented">
                {(["VHF", "HF"] as const).map((x) => (
                  <button
                    key={x}
                    aria-pressed={band === x}
                    onClick={() => selectBand(x)}
                  >
                    {x}
                    <small>{x === "VHF" ? "GROUND LINK" : "SKYWAVE"}</small>
                  </button>
                ))}
              </div>
              <span className="scene-label">
                {band === "VHF"
                  ? "BASE CAMP → REMOTE TEAM"
                  : "SINGAPORE → TOKYO"}
              </span>
              <span className={`transmission-badge ${running ? "on-air" : ""}`}>
                {running
                  ? "● TRANSMITTING"
                  : result
                    ? "◉ TRANSMISSION COMPLETE"
                    : "○ READY TO EXPERIMENT"}
              </span>
            </div>
            <Scene
              band={band}
              view={view}
              graphics={graphics}
              scenario={scenario}
              paths={result?.propagationPaths ?? []}
              running={running}
            />
            <div className="scene-caption">
              <span className="eyebrow">
                {view === "globe"
                  ? "01 / ORBITAL VIEW"
                  : "02 / TERRAIN PROFILE"}
              </span>
              <h2>
                {band === "HF"
                  ? "A little help from the sky."
                  : "The hill continues to exist."}
              </h2>
              <p>
                {result
                  ? `${result.propagationPaths.length} illustrative path(s) · ${result.success.toUpperCase()} · fixture preview`
                  : "Orbit the globe. Set your parameters. Find your signal."}
              </p>
            </div>
            <div className="scene-bottom">
              <div className="segmented compact">
                <button
                  aria-pressed={view === "globe"}
                  onClick={() => setView("globe")}
                >
                  ◎ Globe
                </button>
                <button
                  disabled={band === "HF"}
                  aria-pressed={view === "terrain"}
                  onClick={() => setView("terrain")}
                >
                  △ Terrain
                </button>
              </div>
              <span>DRAG TO ORBIT · SCROLL TO ZOOM</span>
              <label>
                Graphics{" "}
                <select
                  aria-label="Graphics mode"
                  value={graphics}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      graphics: e.target.value as Graphics,
                    })
                  }
                >
                  {["BIG", "NORMAL", "POTATO"].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>
          <div className="mock-banner">
            <span>◈</span>
            <div>
              <b>Experience preview · mock engine</b>
              <p>
                Numbers and paths are illustrative fixtures. Real RF results
                await Computer A’s engine.
              </p>
            </div>
          </div>
          <section className="results" aria-live="polite">
            <div className="result-status">
              <span className="eyebrow">LINK STATUS</span>
              <h3>
                {running
                  ? "ON THE AIR…"
                  : result
                    ? {
                        good: "SIGNAL MADE IT",
                        marginal: "MARGINAL",
                        failed: "NOPE.",
                      }[result.success]
                    : "AWAITING SIGNAL"}
              </h3>
              <small>
                {result
                  ? `${result.confidence.level} confidence · mock`
                  : "Predict, configure, send."}
              </small>
            </div>
            {[
              ["RX POWER", result?.receivedPowerDbm, "dBm"],
              ["NOISE FLOOR", result?.noiseFloorDbm, "dBm"],
              ["SNR", result?.snrDb, "dB"],
              ["LINK MARGIN", result?.linkMarginDb, "dB"],
            ].map(([label, value, unit]) => (
              <div className="metric" key={label}>
                <span>{label}</span>
                <b>
                  {typeof value === "number" ? value.toFixed(1) : "—"}
                  <small>{unit}</small>
                </b>
              </div>
            ))}
          </section>
          <section className="inspector">
            <div className="inspector-heading">
              <div className="segmented">
                {(["WHY", "MATH"] as const).map((x) => (
                  <button
                    key={x}
                    aria-pressed={tab === x}
                    onClick={() => setTab(x)}
                  >
                    {x}
                    <small>
                      {x === "WHY" ? "UNDERSTAND IT" : "SHOW YOUR WORK"}
                    </small>
                  </button>
                ))}
              </div>
              <span>CURIOUS MINDS WELCOME</span>
            </div>
            {!result ? (
              <p className="empty">
                Every experiment starts with a question. Send a signal to
                inspect its story.
              </p>
            ) : tab === "WHY" ? (
              <div className="why-content">
                <p>
                  You predicted{" "}
                  <b>{sentPrediction ? labels[sentPrediction] : "—"}</b> ·
                  Fixture result: <b>{labels[result.success]}</b>
                </p>
                {result.limitingFactors.map((f, i) => (
                  <article key={f.id}>
                    <span className="factor-index">0{i + 1}</span>
                    <div>
                      <h3>{f.label}</h3>
                      <p>
                        {explanations[f.explanationKey]?.[
                          advanced ? "advanced" : "beginner"
                        ] ?? f.explanationKey}
                      </p>
                    </div>
                    <strong>
                      +{f.possibleImprovementDb} dB
                      <small>fixture potential</small>
                    </strong>
                  </article>
                ))}
                {result.explanationKeys
                  .filter(
                    (key) =>
                      !result.limitingFactors.some(
                        (x) => x.explanationKey === key,
                      ),
                  )
                  .map((key) => (
                    <p key={key}>
                      {explanations[key]?.[
                        advanced ? "advanced" : "beginner"
                      ] ?? key}
                    </p>
                  ))}
                <small>
                  Required SNR: {result.requiredSnrDb} dB ·{" "}
                  {result.confidence.reasons.join(" ")}
                </small>
              </div>
            ) : (
              <div className="math-content">
                <p>
                  Fixture values only. These are not validated calculations.
                </p>
                {result.calculations.length ? (
                  result.calculations.map((node) => (
                    <MathNode key={node.id} node={node} />
                  ))
                ) : (
                  <p>The engine has not supplied calculation provenance yet.</p>
                )}
                {result.warnings.map((w) => (
                  <p key={w}>{w}</p>
                ))}
              </div>
            )}
          </section>
        </section>
        <aside className="controls">
          <div className="panel-title">
            <h2>Your radio, your rules.</h2>
            <span>01 / CONFIGURE</span>
          </div>
          <button
            className="advanced-toggle"
            aria-pressed={advanced}
            onClick={() =>
              edit((s) => {
                s.difficulty = advanced ? "beginner" : "advanced";
              })
            }
          >
            {advanced ? "← BACK TO BEGINNER" : "⚙ REVEAL NERD KNOBS"}
          </button>
          <div className="control-group">
            <div className="control-label">
              <label htmlFor="frequency">Frequency</label>
              <b>
                {(scenario.frequencyHz / 1e6).toFixed(1)} <small>MHz</small>
              </b>
            </div>
            <input
              id="frequency"
              type="range"
              min={band === "HF" ? 3 : 30}
              max={band === "HF" ? 30 : 450}
              step="0.1"
              value={scenario.frequencyHz / 1e6}
              onChange={(e) =>
                edit((s) => {
                  s.frequencyHz = +e.target.value * 1e6;
                })
              }
            />
            <div className="range-labels">
              <span>{band === "HF" ? "3 MHz" : "30 MHz"}</span>
              <span>{band === "HF" ? "30 MHz" : "450 MHz"}</span>
            </div>
          </div>
          <div className="control-group">
            <div className="control-label">
              <span>Transmit power</span>
              <b>
                {dbmToWatts(scenario.transmitter.powerDbm).toFixed(1)}{" "}
                <small>W</small>
              </b>
            </div>
            <div className="preset-grid">
              {[
                [1, "Small"],
                [5, "Normal"],
                [50, "Big"],
                [1000, "Questionably big"],
              ].map(([w, label]) => (
                <button
                  key={w}
                  aria-pressed={
                    Math.abs(
                      dbmToWatts(scenario.transmitter.powerDbm) - Number(w),
                    ) < 0.01
                  }
                  onClick={() =>
                    edit((s) => {
                      s.transmitter.powerDbm = wattsToDbm(Number(w));
                    })
                  }
                >
                  {label}
                  <small>{w} W</small>
                </button>
              ))}
            </div>
            {scenario.transmitter.powerDbm >= 60 && (
              <p className="humor">
                We acknowledge your commitment to solving problems incorrectly.
              </p>
            )}
          </div>
          <div className="control-group">
            <label htmlFor="antenna">Antenna</label>
            <select
              id="antenna"
              value={scenario.transmitter.antenna.type}
              onChange={(e) =>
                edit((s) => {
                  const type = e.target
                    .value as Scenario["transmitter"]["antenna"]["type"];
                  s.transmitter.antenna.type = type;
                  s.transmitter.antenna.gainDbi =
                    type === "yagi" ? 9 : type === "dipole" ? 2.15 : 2;
                })
              }
            >
              <option value="vertical">↟ Vertical · starter</option>
              <option value="rubber-duck">Handheld · rubber duck</option>
              <option value="dipole">Simple wire · dipole</option>
              <option value="yagi">Directional · Yagi</option>
            </select>
          </div>
          <div className="control-group">
            <div className="control-label">
              <span>Antenna height</span>
              <b>
                {scenario.transmitter.antenna.heightM} <small>m</small>
              </b>
            </div>
            <div className="height-presets">
              {[
                [2, "Low"],
                [15, "Rooftop"],
                [30, "Tower"],
              ].map(([h, label]) => (
                <button
                  key={h}
                  aria-pressed={scenario.transmitter.antenna.heightM === h}
                  onClick={() =>
                    edit((s) => {
                      s.transmitter.antenna.heightM = Number(h);
                    })
                  }
                >
                  {label}
                  <small>{h} m</small>
                </button>
              ))}
            </div>
          </div>
          {advanced && (
            <div className="advanced-fields">
              {field(
                "Power / dBm",
                scenario.transmitter.powerDbm,
                0,
                80,
                (s, v) => {
                  s.transmitter.powerDbm = v;
                },
              )}
              {field(
                "Power / W",
                dbmToWatts(scenario.transmitter.powerDbm),
                0.001,
                100000,
                (s, v) => {
                  s.transmitter.powerDbm = wattsToDbm(v);
                },
                0.001,
              )}
              {field(
                "TX gain / dBi",
                scenario.transmitter.antenna.gainDbi,
                -20,
                50,
                (s, v) => {
                  s.transmitter.antenna.gainDbi = v;
                },
              )}
              {field(
                "TX height / m",
                scenario.transmitter.antenna.heightM,
                0,
                1000,
                (s, v) => {
                  s.transmitter.antenna.heightM = v;
                },
              )}
              {field(
                "Bandwidth / Hz",
                scenario.receiver.bandwidthHz,
                1,
                1000000,
                (s, v) => {
                  s.receiver.bandwidthHz = v;
                },
                1,
              )}
              {field(
                "Noise figure / dB",
                scenario.receiver.noiseFigureDb,
                0,
                30,
                (s, v) => {
                  s.receiver.noiseFigureDb = v;
                },
              )}
              {field(
                "TX feedline loss / dB",
                scenario.transmitter.feedline.lossDb,
                0,
                40,
                (s, v) => {
                  s.transmitter.feedline.lossDb = v;
                },
              )}
              <label>
                TX polarization
                <select
                  value={scenario.transmitter.antenna.polarization}
                  onChange={(e) =>
                    edit((s) => {
                      s.transmitter.antenna.polarization = e.target
                        .value as Scenario["transmitter"]["antenna"]["polarization"];
                    })
                  }
                >
                  {["vertical", "horizontal", "circular", "unknown"].map(
                    (x) => (
                      <option key={x}>{x}</option>
                    ),
                  )}
                </select>
              </label>
              <label>
                Mode
                <select
                  value={scenario.modeId}
                  onChange={(e) =>
                    edit((s) => {
                      s.modeId = e.target.value;
                    })
                  }
                >
                  {["fm-voice", "ssb", "cw", "ft8"].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
            </div>
          )}
          <div className="prediction">
            <p className="eyebrow">02 / MAKE A CALL</p>
            <h3>Will your signal make it?</h3>
            <div className="height-presets">
              {(["good", "marginal", "failed"] as const).map((x) => (
                <button
                  key={x}
                  aria-pressed={prediction === x}
                  onClick={() => setSettings({ ...settings, prediction: x })}
                >
                  {labels[x]}
                </button>
              ))}
            </div>
          </div>
          <button
            className="send"
            disabled={!prediction || running}
            onClick={send}
          >
            {running ? "TRANSMITTING…" : "SEND IT"} <span>↗</span>
          </button>
          <p className="send-help">
            {prediction
              ? "03 / PUT YOUR THEORY ON THE AIR"
              : "Choose a prediction to start your experiment."}
          </p>
          <button
            className="reset"
            onClick={() => {
              setSettings(defaults());
              setResult(null);
              setRunning(false);
              setView("globe");
              setNotice("Universe reset. Saved experiment kept.");
            }}
          >
            ↺ RESET THE UNIVERSE
          </button>
        </aside>
      </main>
      {presenting && (
        <section className="present-dock" aria-label="Presentation controls">
          <div>
            <span className="eyebrow">YOUR PREDICTION</span>
            <div className="height-presets">
              {(["good", "marginal", "failed"] as const).map((x) => (
                <button
                  key={x}
                  aria-pressed={prediction === x}
                  onClick={() => setSettings({ ...settings, prediction: x })}
                >
                  {labels[x]}
                </button>
              ))}
            </div>
          </div>
          <p>
            {band === "HF"
              ? "Can the ionosphere bring your signal home?"
              : "Can your signal get past the ridge?"}
            <small>Illustrative preview · physics integration pending</small>
          </p>
          <button
            className="send"
            disabled={!prediction || running}
            onClick={send}
          >
            {running ? "ON THE AIR…" : "SEND IT ↗"}
          </button>
        </section>
      )}
      <footer>
        <span>BIG SIGNAL / SMALL PLANET / ENDLESS POSSIBILITIES</span>
        <span role="status">{notice || offlineStatus}</span>
      </footer>
    </div>
  );
}
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
