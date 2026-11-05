// 모두의 던전 (Everyone's Dungeon) custom: gale — a spiralling burst of wind bands blows outward from the target, leaves and dust fly.
import { fit, rng, TAU, WHITE, clamp } from "../../core/index.js";

export const meta = {
  name: "Gale",
  desc: "A spiralling gust bursts from the target: curved bands of wind unwind outward and thin away, leaves are flung round and dust skids across the floor.",
  tags: ["nature", "wind", "gust", "burst", "one-shot"],
  size: [180, 130],
  origin: [90, 100],
  duration: 1.1,
  loop: false,
  fps: 30,
  bg: "ground",
  options: { palette: ["#062a20", "#0f5a40", "#23a06a", "#4fe09a", "#a8ffd2", "#e8fff4", "#ffffff"], leaf: ["#2f7a2a", "#5cbf3a", "#a6e85a", "#d8f070"], seed: 9 },
};

export function draw(p, t, o) {
  const C = fit(o.palette, 7), L = fit(o.leaf, 4), cy = -26;
  // 6 spiral bands unwinding outward
  for (let i = 0; i < 9; i++) {
    const r0 = rng(o.seed, i), t0 = i * 0.04, k = (t - t0) / 0.85;
    if (k <= 0 || k >= 1) continue;
    const base = r0.range(0, TAU) + k * 2.8, rad = 10 + k * (46 + i * 2), sy = 0.62, len = 1.6 - k * 0.6, fade = Math.min(1, (1 - k) * 1.6);
    const pts = [];
    for (let s = 0; s <= 10; s++) { const a = base + (s / 10) * len, rr = rad * (0.85 + 0.15 * s / 10); pts.push([Math.cos(a) * rr, cy + Math.sin(a) * rr * sy]); }
    p.polyline(pts.map(([x, y]) => [x, y + 1]), C[3], fade * 0.8);
    p.polyline(pts, k < 0.45 ? WHITE : C[5], fade);
    p.polyline(pts.map(([x, y]) => [x, y - 1]), C[4], fade * 0.9);
    const [hx, hy] = pts[pts.length - 1]; if (k < 0.6) p.px(hx, hy, WHITE);
  }
  // center flash and glow
  if (t < 0.15) { p.glow(0, cy, 34 * (1 - t / 0.15), C[4], 0.5); p.circle(0, cy, 6 * (1 - t / 0.15), WHITE); }
  p.glow(0, cy, 40, C[3], 0.18 * clamp(1 - t / 0.9, 0, 1));
  // leaves flung round the spiral
  for (let i = 0; i < 14; i++) {
    const r = rng(o.seed + 3, i), t0 = r.range(0, 0.25), k = (t - t0) / r.range(0.55, 0.8);
    if (k <= 0 || k >= 1) continue;
    const a = r.range(0, TAU) + k * 3, rad = 6 + k * r.range(40, 70), x = Math.cos(a) * rad, y = cy + Math.sin(a) * rad * 0.6 + 14 * k * k;
    const c = L[i % 4], f = Math.floor((t * 30 + i) % 3);
    p.px(x, y, c); p.px(x + (f ? 1 : 0), y - (f === 2 ? 1 : 0), c); if (f === 1) p.px(x + 2, y, c);
  }
  // dust skidding along the floor
  for (let i = 0; i < 8; i++) {
    const r = rng(o.seed + 11, i), side = i % 2 ? 1 : -1, k = (t - 0.05) / 0.8;
    if (k <= 0 || k >= 1) continue;
    const x = side * (10 + k * r.range(40, 70)), rr = 2 + k * 5;
    p.disc(x, -1 - k * 3, rr, C[2], 0.35 * (1 - k));
  }
}
