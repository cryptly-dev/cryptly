/** Grey presets, in display order. Each maps to an html[data-greys] block in greys.css. */
export const GREY_PRESETS = [
  "Neutral",
  "Stone",
  "Paper",
  "Sand",
  "Clay",
  "Rose",
  "Plum",
  "Sage",
  "Slate",
  "Ink",
] as const;

export type GreyPreset = (typeof GREY_PRESETS)[number];

/** Swatch colors for the Appearance picker: dark, mid and light steps of each ramp. */
export const GREY_SWATCHES: Record<GreyPreset, [string, string, string]> = {
  Neutral: ["#141414", "#828282", "#f0f0f0"],
  Stone: ["#161413", "#86817e", "#f2efee"],
  Paper: ["#151412", "#85827c", "#f1f0ed"],
  Sand: ["#171411", "#898178", "#f3efeb"],
  Clay: ["#171312", "#8a807c", "#f4eeed"],
  Rose: ["#171314", "#898081", "#f3eeef"],
  Plum: ["#161416", "#868086", "#f2eff2"],
  Sage: ["#131513", "#7e847e", "#eef1ee"],
  Slate: ["#121517", "#7d838a", "#edf0f3"],
  Ink: ["#12141a", "#7b8291", "#ecf0f7"],
};
