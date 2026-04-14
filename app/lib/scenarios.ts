import { scenarioMap } from "../components/steps/data";
import type { ScenarioData, ScenarioKey } from "../components/steps/types";

/**
 * Returns scenario data for the given key.
 * Currently wraps static data; replace the body with a fetch call
 * once a real scenarios API exists.
 */
export async function getScenario(key: ScenarioKey): Promise<ScenarioData> {
  return scenarioMap[key];
}
