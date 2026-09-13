import { useEffect, useId, useReducer, useRef } from "react";
import {
  initialTsunamiState,
  tsunamiReducer,
} from "../../../packages/missions/tsunami";
import { tsunamiContent as copy } from "../../../content/explanations/tsunami";
import "./tsunami-level.css";

function HospitalIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path
        d="M8 42V16h32v26M4 42h40M18 42V30h12v12M24 6v12M18 12h12M14 23h4m12 0h4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function RadioIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path
        d="m24 19-9 23m9-23 9 23M18 34h12M12 42h24M24 19v-7M17 21a10 10 0 0 1 0-14m14 0a10 10 0 0 1 0 14M11 26a17 17 0 0 1 0-24m26 0a17 17 0 0 1 0 24"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="13" r="3" fill="currentColor" />
    </svg>
  );
}

export function TsunamiLevel({ onExit }: { onExit?: () => void }) {
  const [state, dispatch] = useReducer(tsunamiReducer, initialTsunamiState);
  const uniqueId = useId();
  const heading = useRef<HTMLHeadingElement>(null);
  const previousPhase = useRef(state.phase);
  const connected = state.phase === "message" || state.phase === "acknowledged";
  const acknowledged = state.phase === "acknowledged";
  const stages = ["Blackout", "Power & route", "The message", "Acknowledged"];
  const currentStage = [
    "blackout",
    "equipment",
    "message",
    "acknowledged",
  ].indexOf(state.phase);
  useEffect(() => {
    if (previousPhase.current !== state.phase) heading.current?.focus();
    previousPhase.current = state.phase;
  }, [state.phase]);

  return (
    <section className="tsunami-level" aria-labelledby={`${uniqueId}-title`}>
      <div className="tsunami-topline">
        <span className="tsunami-eyebrow">{copy.ui.eyebrow}</span>
        {onExit && (
          <button className="tsunami-exit" onClick={onExit}>
            ← Back to missions
          </button>
        )}
      </div>
      <header className="tsunami-intro">
        <div>
          <p className="tsunami-dateline">
            DISASTER COMMUNICATION · INTERACTIVE HISTORY
          </p>
          <h1 id={`${uniqueId}-title`}>{copy.title}</h1>
          <p className="tsunami-subtitle">{copy.subtitle}</p>
        </div>
        <p className="tsunami-context">{copy.introduction}</p>
      </header>
      <ol className="tsunami-progress" aria-label="Level progress">
        {stages.map((stage, index) => (
          <li
            key={stage}
            className={
              index === currentStage
                ? "is-current"
                : index < currentStage
                  ? "is-complete"
                  : ""
            }
            aria-current={index === currentStage ? "step" : undefined}
          >
            <span>{index < currentStage ? "✓" : `0${index + 1}`}</span>
            {stage}
          </li>
        ))}
      </ol>
      <div className="tsunami-workspace">
        <div className="tsunami-diagram-panel">
          <div className="tsunami-panel-heading">
            <div>
              <p className="tsunami-kicker">Historical communication diagram</p>
              <h2>{copy.ui.diagramTitle}</h2>
            </div>
            <span className={`tsunami-status ${connected ? "is-live" : ""}`}>
              <i />
              {acknowledged
                ? "Reply received"
                : connected
                  ? "Radio link open"
                  : "Contact lost"}
            </span>
          </div>
          <p className="tsunami-diagram-description">
            {copy.ui.diagramDescription}
          </p>
          <figure
            className={`tsunami-diagram ${connected ? "is-connected" : ""} ${acknowledged ? "is-acknowledged" : ""}`}
          >
            <div className="tsunami-phone-label">
              <span>×</span> Telephone network disrupted
            </div>
            <svg
              className="tsunami-links"
              viewBox="0 0 900 300"
              preserveAspectRatio="none"
              role="img"
              aria-labelledby={`${uniqueId}-diagram-title ${uniqueId}-diagram-description`}
            >
              <title id={`${uniqueId}-diagram-title`}>
                Hospital communication through amateur radio
              </title>
              <desc id={`${uniqueId}-diagram-description`}>
                {copy.ui.diagramDescription}
              </desc>
              <path
                className="tsunami-phone-path"
                d="M130 165V50H380 M520 50H770V165"
              />
              <path className="tsunami-radio-path" d="M130 165H770" />
              {connected && (
                <circle className="tsunami-packet" r="5" cy="165" cx="130" />
              )}
              {acknowledged && (
                <path
                  className="tsunami-return-path"
                  d="M770 205V262H130V205"
                />
              )}
            </svg>
            <div className="tsunami-nodes">
              <div className="tsunami-node">
                <div className="tsunami-node-icon">
                  <HospitalIcon />
                </div>
                <strong>Melati Hospital</strong>
                <span>Perbaungan</span>
                <small>
                  {connected ? "Battery-powered radio" : "Awaiting contact"}
                </small>
              </div>
              <div className="tsunami-node tsunami-node-relay">
                <div className="tsunami-node-icon">
                  <RadioIcon />
                </div>
                <strong>VHF repeater</strong>
                <span>Amateur radio relay</span>
                <small>
                  {connected
                    ? "Operators passing traffic"
                    : "Surviving radio equipment"}
                </small>
              </div>
              <div className="tsunami-node">
                <div className="tsunami-node-icon">
                  <HospitalIcon />
                </div>
                <strong>Adam Malik Hospital</strong>
                <span>Medan</span>
                <small>
                  {acknowledged ? "Acknowledgement returned" : "Receiving end"}
                </small>
              </div>
            </div>
            {acknowledged && (
              <div className="tsunami-reply-label">
                ← Message received · reply returned
              </div>
            )}
            <figcaption>{copy.ui.schematicNote}</figcaption>
          </figure>
          <div className="tsunami-history-note">
            <span aria-hidden="true">↳</span>
            <p>{copy.historyNote}</p>
          </div>
        </div>
        <div className="tsunami-action-panel">
          <p className="tsunami-kicker">
            Your turn · {String(currentStage + 1).padStart(2, "0")} / 04
          </p>
          <h2 ref={heading} tabIndex={-1}>
            {state.phase === "blackout"
              ? copy.ui.blackoutTitle
              : state.phase === "equipment"
                ? copy.ui.equipmentTitle
                : state.phase === "message"
                  ? copy.ui.messageTitle
                  : copy.ui.acknowledgedTitle}
          </h2>
          {state.phase === "blackout" && (
            <>
              <p>{copy.ui.blackoutBody}</p>
              <div className="tsunami-silence" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
              <button
                className="tsunami-primary"
                onClick={() => dispatch({ type: "begin" })}
              >
                Try to restore contact <span>→</span>
              </button>
            </>
          )}
          {state.phase === "equipment" && (
            <>
              <p>{copy.ui.equipmentBody}</p>
              <fieldset>
                <legend>1. Choose your power</legend>
                <div className="tsunami-choices">
                  {(
                    [
                      ["grid", "Mains power", "Plug into the grid"],
                      ["battery", "Battery", "Independent power"],
                    ] as const
                  ).map(([value, label, detail]) => (
                    <button
                      key={value}
                      aria-pressed={state.power === value}
                      onClick={() => dispatch({ type: "power", value })}
                    >
                      <strong>{label}</strong>
                      <span>{detail}</span>
                    </button>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend>2. Choose your route</legend>
                <div className="tsunami-choices">
                  {(
                    [
                      ["phone", "Telephone", "Local phone network"],
                      ["radio", "Amateur radio", "Operator relay"],
                    ] as const
                  ).map(([value, label, detail]) => (
                    <button
                      key={value}
                      aria-pressed={state.route === value}
                      onClick={() => dispatch({ type: "route", value })}
                    >
                      <strong>{label}</strong>
                      <span>{detail}</span>
                    </button>
                  ))}
                </div>
              </fieldset>
              <button
                className="tsunami-primary"
                onClick={() => dispatch({ type: "connect" })}
              >
                Test the connection <span>→</span>
              </button>
            </>
          )}
          {state.phase === "message" && (
            <>
              <p>{copy.ui.messageBody}</p>
              <div className="tsunami-message-brief">
                <span className="tsunami-kicker">Practice message</span>
                <p>{copy.message}</p>
              </div>
              <div className="tsunami-message-options">
                <button
                  onClick={() => dispatch({ type: "send", message: "vague" })}
                >
                  <span>01 · Send a general call</span>
                  {copy.ui.vagueMessage}
                </button>
                <button
                  onClick={() => dispatch({ type: "send", message: "clear" })}
                >
                  <span>02 · Send a structured message</span>
                  {copy.ui.clearMessage}
                </button>
              </div>
            </>
          )}
          {acknowledged && (
            <>
              <div className="tsunami-acknowledgement">
                <span className="tsunami-kicker">Return transmission</span>
                <p>{copy.acknowledgement}</p>
              </div>
              <p>{copy.completion}</p>
              <button
                className="tsunami-primary"
                onClick={() => dispatch({ type: "reset" })}
              >
                Replay the level <span>↺</span>
              </button>
            </>
          )}
          <div
            className={`tsunami-feedback ${state.feedback ? "has-feedback" : ""}`}
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {state.feedback}
          </div>
        </div>
      </div>
      <section
        className="tsunami-takeaway"
        aria-labelledby={`${uniqueId}-lesson`}
      >
        <div>
          <p className="tsunami-kicker">What stays with us</p>
          <h2 id={`${uniqueId}-lesson`}>{copy.ui.lessonTitle}</h2>
          <p>{copy.ui.lessonBody}</p>
        </div>
        <div className="tsunami-explainers">
          {copy.explainers.map((explainer, index) => (
            <article key={explainer.title}>
              <span>0{index + 1}</span>
              <h3>{explainer.title}</h3>
              <p>{explainer.body}</p>
            </article>
          ))}
        </div>
      </section>
      <footer className="tsunami-footer">
        <p>{copy.ui.limitation}</p>
        <details>
          <summary>Historical sources & interpretation</summary>
          <p className="tsunami-model-note">{copy.modelNote}</p>
          <ul>
            {copy.sources.map((source) => (
              <li key={source.url}>
                <a href={source.url} target="_blank" rel="noreferrer">
                  {source.title} ↗
                </a>
                <p>{source.note}</p>
              </li>
            ))}
          </ul>
        </details>
      </footer>
    </section>
  );
}
