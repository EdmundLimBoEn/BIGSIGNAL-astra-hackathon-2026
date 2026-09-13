import { describe, expect, it } from "vitest";
import {
  initialTsunamiState,
  tsunamiReducer,
  type TsunamiAction,
} from "./tsunami";

const play = (...actions: TsunamiAction[]) =>
  actions.reduce(tsunamiReducer, initialTsunamiState);

describe("hospital communication exercise", () => {
  it("requires independent power and a radio route before sending", () => {
    const start = play({ type: "begin" }, { type: "connect" });
    expect(start.phase).toBe("equipment");
    expect(start.feedback).toContain("mains");
    const battery = tsunamiReducer(start, { type: "power", value: "battery" });
    expect(tsunamiReducer(battery, { type: "connect" }).feedback).toContain(
      "phone",
    );
    const radio = play(
      { type: "begin" },
      { type: "route", value: "radio" },
      { type: "connect" },
    );
    expect(radio.phase).toBe("equipment");
  });

  it("does not acknowledge a vague request, then accepts a clear request", () => {
    const connected = play(
      { type: "begin" },
      { type: "power", value: "battery" },
      { type: "route", value: "radio" },
      { type: "connect" },
    );
    expect(connected.phase).toBe("message");
    const vague = tsunamiReducer(connected, { type: "send", message: "vague" });
    expect(vague.phase).toBe("message");
    expect(vague.feedback).toContain("who is calling");
    const done = tsunamiReducer(vague, { type: "send", message: "clear" });
    expect(done.phase).toBe("acknowledged");
    expect(tsunamiReducer(done, { type: "reset" })).toEqual(
      initialTsunamiState,
    );
  });

  it("ignores out of sequence actions and keeps acknowledgement terminal", () => {
    expect(play({ type: "send", message: "clear" })).toEqual(
      initialTsunamiState,
    );
    expect(
      play({ type: "begin" }, { type: "send", message: "clear" }).phase,
    ).toBe("equipment");
    const done = play(
      { type: "begin" },
      { type: "power", value: "battery" },
      { type: "route", value: "radio" },
      { type: "connect" },
      { type: "send", message: "clear" },
    );
    expect(tsunamiReducer(done, { type: "power", value: "grid" })).toEqual(
      done,
    );
  });
});
