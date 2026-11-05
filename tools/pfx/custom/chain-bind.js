// 모두의 던전 (Everyone's Dungeon) custom: chain bind — glowing magic chains shoot in from both sides, cross over the target,
// tighten into a ring of links with a lock rune at the front, pulse, then crumble into fading links.
import { fit, rng, TAU, WHITE, clamp } from "../../core/index.js";

export const meta = {
  name: "Chain bind",
  desc: "Two glowing magic chains whip in from left and right, cross over the target in an X, a ring of links snaps tight round it with a lock rune, flashes, holds, then the links fade away.",
  tags: ["status", "bind", "chain", "root", "lock", "one-shot"],
  size: [150, 120],
  origin: [75, 64],
  duration: 1.4,
  loop: false,
  fps: 30,
  bg: "dark",
  options: { palette: ["#1a1206", "#4a3410", "#8a6420", "#d0a040", "#ffd870", "#fff2c0", "#ffffff"], glow: "#7fd8ff", links: 1, seed: 6 },
};

// one chain link: a tiny rounded rectangle along the chain direction, alternating flat / edge-on
function link(p, x, y, a, edge, C, k) {
  const ca = Math.cos(a), sa = Math.sin(a);
  if (edge) { p.line(x - ca * 3, y - sa * 3, x + ca * 3, y + sa * 3, C[4], k); p.line(x - ca * 3 + sa, y - sa * 3 - ca, x + ca * 3 + sa, y + sa * 3 - ca, C[2], k); p.px(x, y, C[6], k); return; }
  for (let s = 0; s < 12; s++) { const t = (s / 12) * TAU; for (const rr of [1, 0.7]) { const lx = Math.cos(t) * 3.6 * rr, ly = Math.sin(t) * 2 * rr; p.px(x + lx * ca - ly * sa, y + lx * sa + ly * ca, s < 4 ? C[5] : rr < 1 ? C[2] : C[3], k); } }
}
function chain(p, x0, y0, x1, y1, u, C, k, phase) {
  const L = Math.hypot(x1 - x0, y1 - y0), a = Math.atan2(y1 - y0, x1 - x0), n = Math.floor((L * u) / 4.6);
  for (let i = 0; i < n; i++) { const d = i * 4.6, x = x0 + Math.cos(a) * d, y = y0 + Math.sin(a) * d + Math.sin(d * 0.25 + phase) * 1.2 * (1 - u); link(p, x, y, a, i % 2 === 1, C, k); }
  if (u < 1) { const hx = x0 + Math.cos(a) * L * u, hy = y0 + Math.sin(a) * L * u; p.glow(hx, hy, 8, C[5], 0.5 * k); p.px(hx, hy, WHITE); }
}

export function draw(p, t, o) {
  const C = fit(o.palette, 7), D = meta.duration, cy = -14;
  const fade = t > 1.0 ? 1 - (t - 1.0) / 0.34 : 1;
  if (fade <= 0.02) return;
  // 1) two chains whip in (0 .. 0.28) and cross in an X
  const u = clamp(t / 0.28, 0, 1), sp = 52;
  chain(p, -sp - 10, cy - 30, sp * 0.55, cy + 26, u, C, fade, 0);
  chain(p, sp + 10, cy - 30, -sp * 0.55, cy + 26, u, C, fade, 1.7);
  // 2) ring of links snaps tight (0.22 .. 0.45), slight squash for the bind
  const r = 34 - 12 * clamp((t - 0.22) / 0.2, 0, 1);
  if (t > 0.22) {
    const N = 20;
    for (let i = 0; i < N; i++) { const a = (i / N) * TAU + t * 0.6, x = Math.cos(a) * r, y = cy + Math.sin(a) * r * 0.42; if (Math.sin(a) < -0.1) link(p, x, y, a + Math.PI / 2, i % 2 === 1, C, fade * 0.65); }
    for (let i = 0; i < N; i++) { const a = (i / N) * TAU + t * 0.6, x = Math.cos(a) * r, y = cy + Math.sin(a) * r * 0.42; if (Math.sin(a) >= -0.1) link(p, x, y, a + Math.PI / 2, i % 2 === 1, C, fade); }
    // second ring higher up when links > 1 (the big ultimate bind)
    if (o.links > 1) for (let i = 0; i < N; i++) { const a = (i / N) * TAU - t * 0.6, x = Math.cos(a) * r * 0.85, y = cy - 18 + Math.sin(a) * r * 0.36; link(p, x, y, a + Math.PI / 2, i % 2 === 0, C, fade * (Math.sin(a) < 0 ? 0.6 : 1)); }
  }
  // 3) snap flash + lock rune at the front (0.42 ..)
  if (t > 0.4) {
    const k = clamp((t - 0.4) / 0.08, 0, 1), pulse = 0.6 + 0.4 * Math.sin((t - 0.4) * 18);
    if (t < 0.55) { p.glow(0, cy, 46 * (1 - (t - 0.4) / 0.15), C[5], 0.55); p.ring(0, cy, 20 + (t - 0.4) * 160, 1, C[5], 1 - (t - 0.4) / 0.15); }
    const lx = 0, ly = cy + r * 0.42 + 1;
    p.rect(lx - 4, ly - 2, 9, 7, C[2], fade * k); p.rect(lx - 3, ly - 1, 7, 5, C[4], fade * k);
    p.arc(lx + 0.5, ly - 2, 3, 1.2, Math.PI, TAU, C[5], fade * k); p.px(lx + 0.5, ly + 1, C[0], fade * k);
    p.glow(lx, ly, 10, C[5], 0.35 * pulse * fade);
  }
  // 4) sparks thrown off when the ring snaps
  for (let i = 0; i < 14; i++) {
    const g = rng(o.seed, i), t0 = 0.4 + g.range(0, 0.06), k = (t - t0) / g.range(0.25, 0.45); if (k <= 0 || k >= 1) continue;
    const a = g.range(0, TAU), d = 14 + k * g.range(20, 40); p.px(Math.cos(a) * d, cy + Math.sin(a) * d * 0.6 - 10 * k, k < 0.4 ? WHITE : C[4], 1 - k);
  }
}
