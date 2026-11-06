// 모두의 던전 (Everyone's Dungeon) custom: 수식 책사(남학생) — a spinning compass circle. Trail technique after pixelfx projectiles/_lib (MIT).
import { fit, hex, TAU, WHITE } from "../../core/index.js";
import { beat, wake, spark } from "./_lib.js";

export const meta = {
  name: "Compass orb",
  desc: "A gold ruled circle with a turning radius arm and a white centre pin flies right, shedding tick marks, tiny digits and cyan sparks.",
  tags: ["projectile", "math", "compass", "circle", "directional", "loop"],
  size: [116, 52],
  origin: [86, 26],
  duration: 0.6,
  loop: true,
  fps: 30,
  bg: "dark",
  options: { palette: ["#04121f", "#0a2c46", "#12557a", "#1f8fb8", "#4fd0f0", "#a8f0ff", "#ffffff"], gold: "#ffd25a", speed: 220, seed: 21 },
};
const DIG = [["###", "#.#", "#.#", "#.#", "###"], [".#.", "##.", ".#.", ".#.", "###"], ["###", "..#", "###", "#..", "###"], ["###", "..#", ".##", "..#", "###"]];

export function draw(p, t, o) {
  const C = fit(o.palette, 7), D = meta.duration, ph = t / D, V = o.speed, left = -meta.origin[0] + 2, gold = hex(o.gold);
  beat(t, D, 5, o.seed, 0.55, (age, life, r, i) => {
    const [x, y] = wake(-10, r.range(-8, 8), -10, r.range(-20, 20), age, V * 0.5, 2, 0), k = age / life;
    if (x > left + 4) p.sprite(DIG[i % 4], { "#": k < 0.3 ? C[5] : C[4] }, Math.round(x), Math.round(y - 2), { a: 1 - k });
  });
  beat(t, D, 12, o.seed + 3, (r) => r.range(0.12, 0.28), (age, life, r) => {
    const [x, y, vx, vy] = wake(-8, r.range(-9, 9), r.range(-40, 40), r.range(-60, 60), age, V * 0.6, 2.4, 0);
    if (x > left + 4) spark(p, x, y, vx, vy, 1 - age / life, [WHITE, gold, C[5], C[4]], 0.4, 0.012, 5);
  });
  // a dotted arc trail: the circle being ruled behind it
  for (let i = 1; i < 9; i++) { const a = Math.PI / 2 + i * 0.32; p.px(-8 - i * 3.2 + Math.cos(a) * 3, Math.sin(a) * 11, i % 2 ? gold : C[4]); }
  p.glowLine(-6, 0, -34, 0, 8, C[3], 0.28);
  p.glow(0, 0, 26, C[4], 0.3);
  const rot = ph * TAU; // one full turn per loop
  p.ring(0, 0, 11, 2, gold);
  p.ring(0, 0, 9, 1, C[5]);
  for (let i = 0; i < 12; i++) { const a = rot * 0.25 + (i / 12) * TAU, l = i % 3 ? 1 : 3; p.line(Math.cos(a) * 12.5, Math.sin(a) * 12.5, Math.cos(a) * (12.5 + l), Math.sin(a) * (12.5 + l), i % 3 ? C[4] : WHITE); }
  const ex = Math.cos(rot) * 9, ey = Math.sin(rot) * 9;
  p.line(0, 0, ex, ey, WHITE);
  p.glow(ex, ey, 6, WHITE, 0.6); p.px(ex, ey, WHITE);
  p.circle(0, 0, 1.6, WHITE);
}
