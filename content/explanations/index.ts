export const explanations: Record<
  string,
  { beginner: string; advanced: string }
> = {
  "terrain-obstruction": {
    beginner:
      "The ridge blocks the direct path. Try raising your antenna before reaching for more power.",
    advanced:
      "Terrain can introduce diffraction loss. This fixture illustrates the explanation layout; obstruction geometry and improvement estimates need the real engine.",
  },
  skywave: {
    beginner:
      "HF can return toward Earth through the ionosphere. The usable frequency depends on conditions, so higher is not always better.",
    advanced:
      "The ionosphere can refract HF back to Earth. MUF, absorption, and hop geometry must be supplied by Computer A; this path is illustrative.",
  },
};
