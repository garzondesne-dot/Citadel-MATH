// 모두의 던전 (Everyone's Dungeon) custom: an alchemist's thrown flask. Trail technique after pixelfx projectiles/_lib (MIT).
import { fit, hex, TAU, WHITE } from "../../core/index.js";
import { beat, wake, spark } from "./_lib.js";

export const meta = {
  name: "Potion flask",
  desc: "A round glass flask of bubbling green potion tumbles end over end as it flies right, cork popping light, bubbles and drops shedding behind it.",
  tags: ["projectile", "potion", "flask", "alchemy", "thrown", "directional", "loop"],
  size: [104, 52],
  origin: [76, 26],
  duration: 0.6,
  loop: true,
  fps: 30,
  bg: "dark",
  options: { palette: ["#06200e", "#0c4a1e", "#1a8a34", "#3cd05a", "#8cff8a", "#d8ffd0", "#ffffff"], glass: "#bfe6ff", cork: "#a8743a", speed: 190, seed: 7 },
};

// upright flask, neck up: k = cork, g = glass rim, l = liquid, h = highlight, d = deep liquid
const FLASK = [
  ".....kk.....",
  ".....kk.....",
  "....gggg....",
  ".....gg.....",
  ".....gg.....",
  "....g..g....",
  "..gg....gg..",
  ".g.hlllll.g.",
  "g.hlllllll.g",
  "gllllllllllg",
  "glllllllldlg",
  "glllllllddlg",
  ".gllllldddg.",
  "..gggggggg..",
];
const rotate = (rows) => rows[0].split("").map((_, c) => rows.map((r) => r[c]).reverse().join(""));
const FRAMES = [FLASK, rotate(FLASK), rotate(rotate(FLASK)), rotate(rotate(rotate(FLASK)))];

export function draw(p, t, o) {
  const C = fit(o.palette, 7), D = meta.duration, ph = t / D, V = o.speed, left = -meta.origin[0] + 2;
  const glass = hex(o.glass), cork = hex(o.cork);
  // drops and bubbles shed behind
  beat(t, D, 9, o.seed, (r) => r.range(0.25, 0.5), (age, life, r) => {
    const [x, y] = wake(-6, r.range(-4, 4), r.range(-30, 10), r.range(-50, 20), age, V * 0.5, 1.8, 260), k = age / life;
    if (x > left + 3) { p.circle(x, y, k < 0.5 ? 1.3 : 0.8, k < 0.3 ? C[4] : C[3]); if (k < 0.4) p.px(x - 0.5, y - 0.8, C[5]); }
  });
  beat(t, D, 8, o.seed + 3, (r) => r.range(0.15, 0.3), (age, life, r) => {
    const [x, y, vx, vy] = wake(-4, r.range(-6, 6), r.range(-40, 40), r.range(-60, 60), age, V * 0.6, 2.4, 0);
    if (x > left + 4) spark(p, x, y, vx, vy, 1 - age / life, [WHITE, C[5], C[4], C[3]], 0.35, 0.012, 4);
  });
  p.glow(0, 0, 20, C[3], 0.3);
  const F = FRAMES[Math.floor(ph * 8 + 1e-6) % 4], W = F[0].length, H = F.length; // two tumbles per loop, 90 degree steps
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) p.sprite(F, { k: C[0], g: C[0], l: C[0], h: C[0], d: C[0] }, -Math.floor(W / 2) + dx, -Math.floor(H / 2) + dy);
  p.sprite(F, { k: cork, g: glass, l: C[3], h: WHITE, d: C[2] }, -Math.floor(W / 2), -Math.floor(H / 2));
  p.glow(0, 0, 7, C[4], 0.3);
}
