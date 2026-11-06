// 모두의 던전 (Everyone's Dungeon) custom: shared bits for the 📐 math effects — chalk-gold lines lit cyan, set glyphs, pixel digits.
// Lives next to the effects in src/fx/arcane/ (files starting with _ are helpers, not effects).
import { hex } from "../../core/index.js";

export const CYAN = ["#04121f", "#0a2c46", "#12557a", "#1f8fb8", "#4fd0f0", "#a8f0ff", "#ffffff"];
export const GOLD = ["#2a1606", "#6a3c08", "#b0700e", "#e8a818", "#ffd25a", "#fff1b0", "#ffffff"];

// 5-row set symbols (∈ ⊂ ∪ ∩ ∅ ⊃ = +)
export const GLYPH = {
  in: [".###", "#...", "####", "#...", ".###"],
  sub: [".###", "#...", "#...", "#...", ".###"],
  sup: ["###.", "...#", "...#", "...#", "###."],
  cup: ["#..#", "#..#", "#..#", "#..#", ".##."],
  cap: [".##.", "#..#", "#..#", "#..#", "#..#"],
  empty: [".###.", "#..##", "#.#.#", "##..#", ".###."],
  eq: ["####", "....", "####"],
  plus: [".#.", "###", ".#."],
  pi: ["#####", ".#.#.", ".#.#.", ".#.#.", ".#..#"],
  qed: ["#####", "#####", "#####", "#####", "#####"],
};
export const SET_KEYS = ["in", "sub", "cup", "cap", "empty", "sup"];

// a glyph with a dark rim so it reads over the glow; (x, y) is its centre
export function glyph(p, key, x, y, c, rim, { scale = 1, a = 1 } = {}) {
  const g = GLYPH[key], w = g[0].length * scale, h = g.length * scale, X = Math.round(x - w / 2), Y = Math.round(y - h / 2);
  if (rim != null) for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) p.sprite(g, { "#": rim }, X + dx, Y + dy, { scale, a });
  p.sprite(g, { "#": c }, X, Y, { scale, a });
}
export const H = (s) => hex(s);
