import { useState } from "react";
import type {
  CalculationNode,
  Scenario,
  SimulationResult,
} from "../../../packages/contracts";
import { explanations } from "../../../content/explanations";

export function MathNode({ node }: { node: CalculationNode }) {
  return (
    <details>
      <summary>
        {node.label}
        <b>
          {Number(node.value.toPrecision(5))} {node.unit}
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
export function Results({
  result,
  scenario,
}: {
  result: SimulationResult | null;
  scenario: Scenario;
}) {
  const [tab, setTab] = useState<"WHY" | "MATH" | "TRY">("WHY");
  return (
    <section className="lab-results" aria-label="Simulation results">
      <div className="result-tabs">
        {(["WHY", "MATH", "TRY"] as const).map((t) => (
          <button key={t} aria-pressed={tab === t} onClick={() => setTab(t)}>
            {t === "TRY" ? "WHAT SHOULD I TRY?" : t}
          </button>
        ))}
      </div>
      {!result ? (
        <div className="result-empty">
          <span>↗</span>
          <h3>Your experiment starts with a guess.</h3>
          <p>
            Predict, press SEND IT, then inspect what happened. Suggestions
            appear after your first attempt.
          </p>
        </div>
      ) : (
        <>
          <div className={`outcome outcome-${result.success}`} role="status">
            <b>
              {result.success === "good"
                ? "SIGNAL MADE IT"
                : result.success === "marginal"
                  ? "JUST ABOUT."
                  : "NOPE."}
            </b>
            <span>
              {result.propagationAvailable
                ? "A modeled path reaches the receiver."
                : "No supported path reaches the receiver. Any numeric budget is hypothetical."}
            </span>
          </div>
          <div className="metric-grid">
            {[
              ["Received", result.receivedPowerDbm, "dBm"],
              ["Noise floor", result.noiseFloorDbm, "dBm"],
              ["SNR", result.snrDb, "dB"],
              ["Link margin", result.linkMarginDb, "dB"],
            ].map(([label, value, unit]) => (
              <div key={label}>
                <span>{label}</span>
                <b>
                  {Number(value).toFixed(1)}
                  <small> {unit}</small>
                </b>
              </div>
            ))}
          </div>
          {result.explanationKeys.includes("hf-above-muf") && (
            <p className="sky-refusal">
              THE IONOSPHERE HAS DECLINED YOUR REQUEST.
            </p>
          )}
          <div className="result-body">
            {tab === "WHY" ? (
              <>
                {result.explanationKeys.map((key) => (
                  <p key={key}>
                    {explanations[key]?.[scenario.difficulty] ??
                      explanations[key]?.beginner ??
                      key.replaceAll("-", " ")}
                  </p>
                ))}
                <div className="assumption-note">
                  Confidence {result.confidence.level}.{" "}
                  {result.confidence.reasons.join(" ")} Values describe the
                  configured educational model, not a field measurement.
                </div>
              </>
            ) : tab === "MATH" ? (
              <>
                <p>
                  Every result below comes from the simulation engine. Expand a
                  calculation to inspect its equation, inputs, units, and
                  assumptions.
                </p>
                {result.calculations.map((n) => (
                  <MathNode key={n.id} node={n} />
                ))}
              </>
            ) : (
              <>
                <p>
                  These estimates come from changing one input and rerunning the
                  model. Improvements may interact; do not add them blindly.
                </p>
                {result.limitingFactors.length ? (
                  result.limitingFactors.map((f, i) => (
                    <article className="suggestion" key={f.id}>
                      <span>{i + 1}</span>
                      <div>
                        <b>{f.label}</b>
                        <p>
                          {explanations[f.explanationKey]?.[
                            scenario.difficulty
                          ] ?? explanations[f.explanationKey]?.beginner}
                        </p>
                      </div>
                      <strong>
                        {f.possibleImprovementDb > 0
                          ? `+${f.possibleImprovementDb.toFixed(1)} dB`
                          : "Restore path"}
                      </strong>
                    </article>
                  ))
                ) : (
                  <p>
                    No modeled single-control improvement was found. Review the
                    assumptions and communication requirements.
                  </p>
                )}
              </>
            )}
            <details className="model-warnings">
              <summary>
                Model limits and warnings ({result.warnings.length})
              </summary>
              {result.warnings.map((w) => (
                <p key={w}>{w}</p>
              ))}
            </details>
          </div>
        </>
      )}
    </section>
  );
}
