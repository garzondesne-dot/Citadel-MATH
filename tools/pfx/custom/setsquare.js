// 모두의 던전 (Everyone's Dungeon) custom: 수식 책사(여학생) — a spinning set-square triangle with a protractor wake. Trail technique after pixelfx projectiles/_lib (MIT).
import { fit, hex, TAU, WHITE } from "../../core/index.js";
import { beat, wake, spark } from "./_lib.js";

export const meta = {
  name: "Set square",
  desc: "A gold right-triangle ruler spins as it flies right, a fading protractor arc with angle ticks trailing behind it and sparks peeling off its corners.",
  tags: ["projectile", "math", "triangle", "ruler", "directional", "loop"],
  size: [116, 56],
  origin: [86, 28],
  duration: 0.6,
  loop: true,
  fps: 30,
  bg: "dark",
  options: { palette: ["#04121f", "#0a2c46", "#12557a", "#1f8fb8", "#4fd0f0", "#a8f0ff", "#ffffff"], gold: "#ffd25a", speed: 230, seed: 23 },
};

export function draw(p, t, o) {
  const C = fit(o.palette, 7), D = meta.duration, ph = t / D, V = o.speed, left = -meta.origin[0] + 2, gold = hex(o.gold);
  beat(t, D, 14, o.seed, (r) => r.range(0.12, 0.3), (age, life, r) => {
    const [x, y, vx, vy] = wake(-6, r.range(-10, 10), r.range(-40, 40), r.range(-70, 70), age, V * 0.6, 2.4, 0);
    if (x > left + 4) spark(p, x, y, vx, vy, 1 - age / life, [WHITE, gold, C[5], C[4]], 0.4, 0.012, 5);
  });
  // the protractor wake: a half-disc arc with degree ticks, stretched behind
  for (let i = 0; i <= 12; i++) {
    const a = Math.PI / 2 + (i / 12) * Math.PI, x = -16 + Math.cos(a) * 14, y = Math.sin(a) * 14;
    p.dot(x, y, C[4], 0.8); if (i % 3 === 0) p.line(x, y, -16 + Math.cos(a) * 11, Math.sin(a) * 11, gold);
  }
  p.line(-16, -14, -16, 14, C[3]);
  p.glowLine(-6, 0, -36, 0, 9, C[3], 0.28);
  p.glow(0, 0, 24, gold, 0.25);
  // the triangle: one full turn per loop, legs 18 and 12, a hollow centre like a real set square
  const rot = ph * TAU, cs = Math.cos(rot), sn = Math.sin(rot), T = (x, y) => [x * cs - y * sn, x * sn + y * cs];
  const pts = [[-7, 6], [11, 6], [-7, -6]].map(([x, y]) => T(x, y)), inner = [[-4, 3.5], [4.5, 3.5], [-4, -1.5]].map(([x, y]) => T(x, y));
  p.poly(pts, gold);
  p.poly(inner, C[1]);
  for (let i = 0; i < 3; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % 3]; p.line(x0, y0, x1, y1, i === 0 ? WHITE : hex("#fff1b0")); }
  for (let i = 1; i < 6; i++) { const [x0, y0] = T(-7 + i * 3, 6), [x1, y1] = T(-7 + i * 3, 4.5); p.line(x0, y0, x1, y1, hex("#6a3c08")); }
  p.glow(pts[1][0], pts[1][1], 6, WHITE, 0.5);
}
