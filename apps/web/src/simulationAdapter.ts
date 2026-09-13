import type { Scenario, SimulationResult } from "../../../packages/contracts";
import { mockSimulation } from "../../../packages/contracts/mockSimulation";
// Replace this boundary with Computer A's simulateScenario after coordination.
// Fixed visual fixtures deliberately do not model responses to parameter changes.
export function runSimulation(scenario: Scenario): SimulationResult {
  const result = mockSimulation(scenario);
  if (scenario.id === "hf-expedition")
    return {
      ...result,
      success: "good",
      receivedPowerDbm: -95,
      noiseFloorDbm: -113,
      snrDb: 18,
      requiredSnrDb: 12,
      linkMarginDb: 6,
      limitingFactors: [],
      explanationKeys: ["skywave"],
      propagationPaths: [
        {
          type: "skywave",
          points: [
            { lat: 1.35, lon: 103.8, altitudeM: 0 },
            { lat: 10, lon: 112, altitudeM: 220000 },
            { lat: 20, lon: 123, altitudeM: 350000 },
            { lat: 29, lon: 132, altitudeM: 220000 },
            { lat: 35.7, lon: 139.7, altitudeM: 0 },
          ],
        },
      ],
    };
  return {
    ...result,
    propagationPaths: [
      {
        type: "diffracted",
        points: [
          { localX: -4, localY: 0.4, localZ: 0 },
          { localX: 0, localY: 2.5, localZ: 0 },
          { localX: 4, localY: 0.4, localZ: 0 },
        ],
      },
    ],
  };
}
