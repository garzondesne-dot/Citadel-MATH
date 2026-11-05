// 모두의 던전 (Everyone's Dungeon) custom: wind blade — two crescent air blades cross the target, streaks and leaves peel off.
import { fit, rng, TAU, WHITE, clamp } from "../../core/index.js";

export const meta = {
  name: "Wind blade",
  desc: "Two pale green crescent blades of air slice across the target in an X, wind streaks race past and a few leaves spin away.",
  tags: ["nature", "wind", "slash", "impact", "one-shot"],
  size: [140, 110],
  origin: [70, 60],
  duration: 0.85,
  loop: false,
  fps: 30,
  bg: "dark",
  options: { palette: ["#06261a", "#0d4a30", "#1d8a58", "#3fd08a", "#9cf5c4", "#e2fff0", "#ffffff"], leaf: ["#2f7a2a", "#5cbf3a", "#a6e85a"], seed: 4 },
};

export function draw(p, t, o) {
  const C = fit(o.palette, 7), L = fit(o.leaf, 3), D = meta.duration;
  // two crescents, the second a beat later, each sweeping a 130 degree arc then thinning out
  const blade = (t0, cx, cy, r, a0, dir) => {
    const u = (t - t0) / 0.32; if (u <= 0 || u > 1.6) return;
    const head = clamp(u, 0, 1), tail = clamp(u - 0.45, 0, 1), span = 2.3;
    const A0 = a0 + dir * span * tail, A1 = a0 + dir * span * head, fade = u > 1 ? 1 - (u - 1) / 0.6 : 1;
    if (Math.abs(A1 - A0) < 0.02) return;
    const lo = Math.min(A0, A1), hi = Math.max(A0, A1);
    p.arc(cx, cy, r + 2, (w) => 1 + 2 * Math.sin(Math.PI * w), lo, hi, C[3], 0.7 * fade);
    p.arc(cx, cy, r, (w) => 2 + 5 * Math.sin(Math.PI * w), lo, hi, C[4], 0.95 * fade);
    p.arc(cx, cy, r - 2, (w) => 1 + 2.2 * Math.sin(Math.PI * w), lo, hi, WHITE, fade);
    const tx = cx + Math.cos(A1) * r, ty = cy + Math.sin(A1) * r;
    if (u < 1) { p.glow(tx, ty, 10, C[5], 0.5 * fade); p.px(tx, ty, WHITE); }
  };
  blade(0.0, -8, 6, 34, -2.6, 1);
  blade(0.1, 8, 6, 34, -0.55, -1);
  // wind streaks racing left to right across the hit
  for (let i = 0; i < 9; i++) {
    const r = rng(o.seed, i), t0 = r.range(0, 0.35), life = r.range(0.18, 0.32), k = (t - t0) / life;
    if (k <= 0 || k >= 1) continue;
    const y = r.range(-30, 24), x = -55 + k * 110, len = r.range(10, 22) * (1 - Math.abs(k - 0.5));
    p.line(x - len, y, x, y + r.range(-2, 2), k < 0.5 ? C[5] : C[4], (q) => q * (1 - k));
  }
  // leaves spinning away
  for (let i = 0; i < 6; i++) {
    const r = rng(o.seed + 7, i), t0 = 0.08 + r.range(0, 0.2), k = (t - t0) / 0.5;
    if (k <= 0 || k >= 1) continue;
    const a = r.range(-1.2, 0.6), sp = r.range(40, 75), x = Math.cos(a) * sp * k + r.range(-6, 6), y = Math.sin(a) * sp * k - 6 + 30 * k * k;
    const flip = Math.floor((t * 30 + i) % 4);
    const c = L[i % 3];
    if (flip === 0) { p.px(x, y, c); p.px(x + 1, y, c); p.px(x + 2, y - 1, c); }
    else if (flip === 1) { p.px(x, y, c); p.px(x + 1, y - 1, c); p.px(x + 1, y + 1, c); }
    else { p.px(x, y, c); p.px(x, y - 1, c); p.px(x + 1, y - 2, c); }
  }
  if (t < 0.12) p.glow(0, 0, 30 * (1 - t / 0.12), C[4], 0.35);
  { const k = (t - 0.12) / 0.4; if (k > 0 && k < 1) p.ring(0, 2, 6 + k * 40, 1, C[4], 1 - k); }
}
