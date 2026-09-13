import { useState } from "react";
import type { Scenario } from "../../../packages/contracts";
import { hospitalContent as copy } from "../../../content/explanations/hospital";
import {
  assessHospitalContact,
  createHospitalScenario,
  hospitalRoutes,
  type HospitalContact,
  type HospitalRoute,
} from "../../../packages/missions/tsunami";
import {
  DEFAULT_BATTERY,
  estimateBattery,
} from "../../../packages/simulation/src/laboratory";
import { dbmToWatts } from "../../../packages/units/src";
import { LabWorkspace } from "./LabWorkspace";
import { NumberField } from "./LabControls";
import { HospitalNetworkScene } from "./HospitalNetworkScene";
import {
  hospitalNetworkNodes,
  hospitalNetworkLinks,
  hospitalNetworkCopy as networkCopy,
} from "../../../content/explanations/hospital-network";
import { greatCircleDistanceM } from "../../../packages/propagation/src";
import { switchScenarioBand } from "./productDomain";
import type { Graphics } from "./missions";
import "./tsunami-level.css";

export function TsunamiLevel({
  onExit,
  onOpenLesson,
}: {
  onExit?: () => void;
  onOpenLesson?: (id: string) => void;
}) {
  const [scenario, setScenario] = useState(createHospitalScenario);
  const [graphics, setGraphics] = useState<Graphics>("NORMAL");
  const [contact, setContact] = useState<HospitalContact | null>(null);
  const [delivered, setDelivered] = useState(false);
  const [messageKind, setMessageKind] = useState<"medical" | "family">(
    "medical",
  );
  const [route, setRoute] = useState<HospitalRoute | "custom">(
    "meulaboh-medan",
  );
  const [capacity, setCapacity] = useState(120);
  const [duty, setDuty] = useState(10);
  const [revision, setRevision] = useState(0);
  const energy = estimateBattery({
    ...DEFAULT_BATTERY,
    capacityWh: capacity,
    rfPowerW: dbmToWatts(scenario.transmitter.powerDbm),
    transmitDutyCycle: duty / 100,
  });
  function edit(next: Scenario) {
    setScenario(next);
    setContact(null);
    setDelivered(false);
    if (
      JSON.stringify(next.transmitter.position) !==
        JSON.stringify(scenario.transmitter.position) ||
      JSON.stringify(next.receiver.position) !==
        JSON.stringify(scenario.receiver.position)
    )
      setRoute("custom");
  }
  function selectRoute(id: HospitalRoute) {
    const preset = createHospitalScenario(id);
    edit({
      ...scenario,
      id: preset.id,
      title: preset.title,
      transmitter: {
        ...scenario.transmitter,
        position: preset.transmitter.position,
      },
      receiver: { ...scenario.receiver, position: preset.receiver.position },
    });
    setRoute(id);
  }
  function tune(band: "HF" | "VHF", frequencyHz: number) {
    edit({ ...switchScenarioBand(scenario, band), frequencyHz });
  }
  function reset() {
    setScenario(createHospitalScenario());
    setContact(null);
    setDelivered(false);
    setRoute("meulaboh-medan");
    setCapacity(120);
    setDuty(10);
    setRevision((r) => r + 1);
  }
  return (
    <section
      className="tsunami-level hospital-level"
      aria-labelledby="hospital-title"
    >
      <header className="hospital-heading">
        <div>
          <span className="eyebrow">
            WHEN PHONES FAIL / HOSPITALS ACROSS A REGION
          </span>
          <h1 id="hospital-title">{networkCopy.title}</h1>
          <p className="hospital-subtitle">{networkCopy.subtitle}</p>
        </div>
        <div>
          <p>{networkCopy.introduction}</p>
          <div className="hospital-header-actions">
            {onExit && <button onClick={onExit}>← Disaster lab</button>}
            <button onClick={reset}>Reset hospital experiment ↺</button>
          </div>
        </div>
      </header>
      <div className="hospital-route-bar">
        <label>
          Follow a documented connection
          <select
            value={route}
            onChange={(e) => selectRoute(e.target.value as HospitalRoute)}
          >
            {route === "custom" && (
              <option value="custom" disabled>
                Custom experiment coordinates
              </option>
            )}
            {hospitalRoutes.map((r) => (
              <option value={r.id} key={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
        <p>
          {route === "custom"
            ? "You moved the stations. The engine now evaluates your custom route."
            : hospitalRoutes.find((r) => r.id === route)?.evidence}
        </p>
        <div className="hospital-tuning">
          <span>Reported station frequencies</span>
          <button onClick={() => tune("VHF", 145.5e6)}>
            VHF · 145.500 MHz
          </button>
          <button onClick={() => tune("HF", 7.055e6)}>HF · 7.055 MHz</button>
        </div>
      </div>
      <div className="hospital-selected-link">
        <div>
          <span className="eyebrow">
            {route === "custom"
              ? "EXPERIMENTAL PAIR"
              : hospitalRoutes.find((r) => r.id === route)?.kind ===
                  "patient-transfer"
                ? "DOCUMENTED PATIENT TRANSFER"
                : "DOCUMENTED RADIO CONTACT"}
          </span>
          <strong>
            ≈{" "}
            {Math.round(
              greatCircleDistanceM(
                scenario.transmitter.position,
                scenario.receiver.position,
              ) / 1000,
            )}{" "}
            km apart
          </strong>
        </div>
        <p>{networkCopy.historicalLines}</p>
        {route !== "custom" && (
          <a
            href={hospitalRoutes.find((r) => r.id === route)!.sourceUrl}
            target="_blank"
            rel="noreferrer"
          >
            Read the connection's source ↗
          </a>
        )}
      </div>
      <LabWorkspace
        key={revision}
        scenario={scenario}
        onChange={edit}
        graphics={graphics}
        onGraphics={setGraphics}
        renderScene={(props) => (
          <HospitalNetworkScene
            {...props}
            nodes={hospitalNetworkNodes}
            routes={hospitalNetworkLinks}
            selectedRouteId={route}
            voiceReady={contact?.voiceReady}
            onSelectRoute={(id) => selectRoute(id as HospitalRoute)}
          />
        )}
        keepSceneOnSend
        onAttempt={(result) => {
          setContact(assessHospitalContact(scenario, result));
          setDelivered(false);
        }}
      />
      {contact && (
        <div className="hospital-radio-readout" aria-live="polite">
          <strong>
            {contact.outward.propagationAvailable
              ? contact.outward.success.toUpperCase()
              : "NO RADIO PATH"}
          </strong>
          {!contact.outward.propagationAvailable && (
            <span>Hypothetical budget only</span>
          )}
          <span>
            Received {contact.outward.receivedPowerDbm.toFixed(1)} dBm
          </span>
          <span>SNR {contact.outward.snrDb.toFixed(1)} dB</span>
          <span>Margin {contact.outward.linkMarginDb.toFixed(1)} dB</span>
          <span>
            Return path{" "}
            {contact.reply.propagationAvailable
              ? contact.reply.success
              : "unavailable"}
          </span>
        </div>
      )}
      <p className="hospital-assumptions">{copy.radioNote}</p>
      <section
        className="hospital-handoffs"
        aria-label="How a hospital request travels"
      >
        <article>
          <span className="eyebrow">01 / ASK</span>
          <h3>A hospital needs help.</h3>
          <p>
            A local operator turns the request into a short message with a
            destination, a need and a way to reply.
          </p>
        </article>
        <article>
          <span className="eyebrow">02 / RELAY</span>
          <h3>Another operator hears it.</h3>
          <p>
            Net control can pass the request to the people coordinating medical
            support. Acknowledgement tells the sender it was heard.
          </p>
        </article>
        <article>
          <span className="eyebrow">03 / ACT</span>
          <h3>People arrange the response.</h3>
          <p>
            Radio carries information. Medical teams arrange care and transport;
            a successful signal alone does not deliver either.
          </p>
        </article>
      </section>
      <details className="hospital-directory">
        <summary>
          Explore all {hospitalNetworkNodes.length} documented sites and
          experiment with another pair
        </summary>
        <p>{networkCopy.scope}</p>
        <p>{networkCopy.geography}</p>
        <div className="hospital-pair-controls">
          {(["transmitter", "receiver"] as const).map((end) => (
            <label key={end}>
              {end === "transmitter" ? "Send from" : "Receive at"}
              <select
                value={
                  hospitalNetworkNodes.find(
                    (n) =>
                      n.latitudeDeg === scenario[end].position.latitudeDeg &&
                      n.longitudeDeg === scenario[end].position.longitudeDeg,
                  )?.id ?? "custom"
                }
                onChange={(e) => {
                  const n = hospitalNetworkNodes.find(
                    (n) => n.id === e.target.value,
                  )!;
                  edit({
                    ...scenario,
                    [end]: {
                      ...scenario[end],
                      position: {
                        latitudeDeg: n.latitudeDeg,
                        longitudeDeg: n.longitudeDeg,
                        altitudeM: 0,
                      },
                    },
                  });
                  setRoute("custom");
                }}
              >
                <option value="custom" disabled>
                  Custom coordinates
                </option>
                {hospitalNetworkNodes.map((n) => (
                  <option value={n.id} key={n.id}>
                    {n.label}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
        <ul>
          {hospitalNetworkNodes.map((n, index) => (
            <li key={n.id}>
              <strong>
                {index + 1}. {n.label}
              </strong>
              <span>
                {n.callSign ?? "Command post"} ·{" "}
                {n.kind === "coordination"
                  ? "Coordination station"
                  : n.kind === "field-hospital"
                    ? "Emergency hospital"
                    : "Hospital"}
              </span>
              <p>{n.note}</p>
            </li>
          ))}
        </ul>
      </details>
      <section
        className="hospital-techniques"
        aria-label="Radio techniques used in the response"
      >
        {networkCopy.techniques.map((t) => (
          <article key={t.title}>
            <h3>{t.title}</h3>
            <p>{t.body}</p>
            <a href={t.url} target="_blank" rel="noreferrer">
              Evidence ↗
            </a>
          </article>
        ))}
      </section>
      <section className="hospital-family" aria-labelledby="family-heading">
        <div className="hospital-family-story">
          <span className="eyebrow">WHY THIS CONNECTION MATTERS</span>
          <h2 id="family-heading">{copy.familyTitle}</h2>
          <p>{copy.familyStory}</p>
          <a href={copy.sources[4].url} target="_blank" rel="noreferrer">
            Read the documented family-contact story ↗
          </a>
          <p className="hospital-small">{copy.familyLimit}</p>
        </div>
        <div className="hospital-message">
          <span className="eyebrow">YOUR PRACTICE MESSAGE / FICTIONAL</span>
          <label className="hospital-message-kind">
            Message to practise
            <select
              value={messageKind}
              onChange={(e) => {
                setMessageKind(e.target.value as "medical" | "family");
                setDelivered(false);
              }}
            >
              <option value="medical">Request medical support</option>
              <option value="family">Request family contact</option>
            </select>
          </label>
          <p className="hospital-transcript">
            {messageKind === "medical"
              ? copy.medicalMessage.replace(
                  "Medan net control",
                  route === "custom"
                    ? "Receiving station"
                    : (hospitalNetworkNodes.find(
                        (n) =>
                          n.id ===
                          hospitalRoutes.find((r) => r.id === route)?.to,
                      )?.shortLabel ?? "Receiving station"),
                )
              : copy.message}
          </p>
          <div role="status" aria-live="polite">
            {delivered ? (
              <p className="hospital-received">
                {messageKind === "family"
                  ? copy.received
                  : "Request acknowledged in this exercise. The next operator can pass it to a relief coordinator. This does not mean supplies or staff have arrived."}
              </p>
            ) : contact ? (
              <p>
                {contact.voiceReady
                  ? "Both modeled voice paths work. You can pass the request."
                  : "The message is waiting. Both directions need a usable voice link. Try 7.055 MHz HF for the regional Medan link."}{" "}
                <small>
                  Outward {contact.outward.success} · reply{" "}
                  {contact.reply.success}
                </small>
              </p>
            ) : (
              <p>
                Make a prediction and SEND IT to test the radio before passing
                the request.
              </p>
            )}
          </div>
          <button
            className="primary"
            disabled={!contact?.voiceReady || delivered}
            onClick={() => setDelivered(true)}
          >
            {delivered
              ? "Request passed to the next operator ✓"
              : "Pass the request ↗"}
          </button>
          <details>
            <summary>What does the return-link check assume?</summary>
            <p>{copy.replyNote}</p>
          </details>
        </div>
      </section>
      <section
        className="hospital-learning"
        aria-label="Connections to the first learning levels"
      >
        {copy.experiments.map((e, i) => (
          <article key={e.lessonId}>
            <span className="eyebrow">0{i + 1} / FROM THE LEARNING LAB</span>
            <h3>{e.title}</h3>
            <p>{e.body}</p>
            {onOpenLesson && (
              <button onClick={() => onOpenLesson(e.lessonId)}>
                Open this learning level ↗
              </button>
            )}
          </article>
        ))}
      </section>
      <details className="hospital-energy">
        <summary>How long can the radio keep running?</summary>
        <div>
          <NumberField
            label="Battery capacity / Wh"
            value={capacity}
            min={1}
            max={1000}
            onChange={setCapacity}
          />
          <NumberField
            label="Time transmitting / %"
            value={duty}
            min={0}
            max={60}
            onChange={setDuty}
          />
          <p>
            <strong>{energy.runtimeHours?.toFixed(1)} hours</strong> estimated
            runtime at {dbmToWatts(scenario.transmitter.powerDbm).toFixed(1)} W
            RF output.
          </p>
        </div>
        <p>
          Illustrative battery, not a historical measurement. 80% usable energy,
          40% amplifier efficiency, 40% of time receiving; the remaining time is
          idle. Increase transmit power in Your radio and compare the runtime.
        </p>
      </details>
      <details className="hospital-sources">
        <summary>What is documented, and what is reconstructed?</summary>
        <p>{copy.layoutNote}</p>
        <ul>
          {copy.sources.map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noreferrer">
                {s.title} ↗
              </a>
              <p>{s.note}</p>
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
}
