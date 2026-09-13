import { describe, expect, it } from "vitest";
import { exampleScenario } from "../../../packages/contracts/exampleScenario";
import { runSimulation } from "./simulationAdapter";
describe("experience adapter boundary", () => {
  it("does not mutate the scenario and labels fixtures honestly", () => {
    const scenario = structuredClone(exampleScenario);
    const before = structuredClone(scenario);
    const result = runSimulation(scenario);
    expect(scenario).toEqual(before);
    expect(result.warnings.join(" ")).toContain("MOCK");
    expect(result.confidence.level).toBe("low");
  });
  it("does not invent RF responses to power or height", () => {
    const changed = structuredClone(exampleScenario);
    changed.transmitter.powerDbm = 60;
    changed.transmitter.antenna.heightM = 100;
    expect(runSimulation(changed)).toEqual(runSimulation(exampleScenario));
  });
  it("returns independent fixtures and geographic HF geometry", () => {
    const hf = structuredClone(exampleScenario);
    hf.id = "hf-expedition";
    hf.frequencyHz = 14e6;
    hf.modeId = "ssb";
    const result = runSimulation(hf);
    expect(result.propagationPaths[0].type).toBe("skywave");
    result.propagationPaths[0].points.length = 0;
    expect(runSimulation(hf).propagationPaths[0].points.length).toBeGreaterThan(
      2,
    );
  });
});
