import { tsunamiContent } from "../../content/explanations/tsunami";

export interface TsunamiState {
  phase: "blackout" | "equipment" | "message" | "acknowledged";
  power: "grid" | "battery";
  route: "phone" | "radio";
  feedback: string;
}

export type TsunamiAction =
  | { type: "begin" }
  | { type: "power"; value: TsunamiState["power"] }
  | { type: "route"; value: TsunamiState["route"] }
  | { type: "connect" }
  | { type: "send"; message: "vague" | "clear" }
  | { type: "reset" };

export const initialTsunamiState: TsunamiState = {
  phase: "blackout",
  power: "grid",
  route: "phone",
  feedback: "",
};

export function tsunamiReducer(
  state: TsunamiState,
  action: TsunamiAction,
): TsunamiState {
  const copy = tsunamiContent.feedback;
  if (action.type === "reset") return initialTsunamiState;
  switch (state.phase) {
    case "blackout":
      return action.type === "begin"
        ? { ...state, phase: "equipment", feedback: copy.start }
        : state;
    case "equipment":
      if (action.type === "power")
        return { ...state, power: action.value, feedback: "" };
      if (action.type === "route")
        return { ...state, route: action.value, feedback: "" };
      if (action.type !== "connect") return state;
      if (state.power === "grid") return { ...state, feedback: copy.grid };
      if (state.route === "phone") return { ...state, feedback: copy.phone };
      return { ...state, phase: "message", feedback: copy.connected };
    case "message":
      if (action.type !== "send") return state;
      return action.message === "clear"
        ? { ...state, phase: "acknowledged", feedback: copy.acknowledged }
        : { ...state, feedback: copy.vague };
    case "acknowledged":
      return state;
  }
}
