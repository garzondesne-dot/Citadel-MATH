// 모두의 던전 (Everyone's Dungeon) custom 📐 Ⅱ: a compass draws a glowing circle round the target, then the circle
// snaps shut into a burst. Release flash and spark spray after Sprite Fusion's open-source energy charge
// (https://www.spritefusion.com/pixel-art-vfx/energy), MIT License, Copyright (c) 2026 Hugo Duprez.
import { Particles, Lights, P, Rng, fit, flare, sparkle, clamp, ease, TAU, WHITE } from "../../core/index.js";
import { CYAN, GOLD } from "./_mathlib.js";

const RAD = 30, PIN = 0.1, SWEEP = 0.34, SNAP = 0.5;

export const meta = {
  name: "Math compass circle",
  desc: "A compass pin stabs the target, its pencil leg sweeps a full turn ruling a gold circle, cross-hairs flash, then the circle snaps shut into a white burst of sparks and rings.",
  tags: ["math", "compass", "circle", "impact", "one-shot"],
  size: [168, 164],
  origin: [84, 82],
  duration: 1.35,
  loop: false,
  fps: 30,
  bg: "dark",
  options: { palette: CYAN, gold: GOLD, seed: 5 },
};

export function create(o) {
  const C = fit(o.palette, 7), G = fit(o.gold, 7), R = new Rng(o.seed);
  const ps = new Particles({ rng: R, ground: () => 60, sparks: [WHITE, G[5], G[4], C[4]] }), lights = new Lights();
  let t = 0, boom = false, closed = false;
  const A0 = -Math.PI / 2;
  return {
    update(dt) {
      t += dt;
      if (t >= PIN + SWEEP && !closed) { closed = true; lights.add(0, 0, 60, G[4], 0.7, 0.2); for (let i = 0; i < 16; i++) { const a = (i / 16) * TAU; ps.spawn(P.STAR, Math.cos(a) * RAD, Math.sin(a) * RAD, Math.cos(a) * 20, Math.sin(a) * 20, R.range(0.2, 0.4), R.pick([WHITE, G[5]]), 1); } }
      if (t >= SNAP + 0.08 && !boom) {
        boom = true;
        lights.add(0, 0, 90, C[4], 1, 0.45); lights.add(0, 0, 26, WHITE, 1, 0.1);
        for (let i = 0; i < 60; i++) { const a = R.range(0, TAU), sp = R.range(110, 260); ps.spawn(R.chance(0.6) ? P.SPARK : P.MOTE, 0, 0, Math.cos(a) * sp, Math.sin(a) * sp - 20, R.range(0.2, 0.5), R.pick([WHITE, G[5], C[5]]), 1); }
        for (let i = 0; i < 18; i++) { const a = R.range(0, TAU), sp = R.range(30, 90); ps.spawn(P.STAR, 0, 0, Math.cos(a) * sp, Math.sin(a) * sp, R.range(0.35, 0.7), R.pick([WHITE, G[5], C[5]]), R.range(0.8, 1.8)); }
      }
      ps.update(dt); lights.update(dt);
    },
    draw(p) {
      // the pin: a bright point that lands on the target
      if (t < SNAP + 0.08) {
        const k = clamp(t / PIN); p.glow(0, 0, 10, C[5], 0.5 * k); p.circle(0, 0, 1.5 + (1 - k) * 3, WHITE);
        if (k < 1) p.ring(0, 0, 4 + 10 * (1 - k), 1, C[5], k);
      }
      if (t >= PIN && t < SNAP + 0.08) {
        const sw = clamp((t - PIN) / SWEEP), e = ease.inOutCubic(sw), a1 = A0 + e * TAU, shut = clamp((t - SNAP) / 0.08), r = RAD * (1 - 0.85 * ease.inCubic(shut));
        const ex = Math.cos(a1) * r, ey = Math.sin(a1) * r;
        // the drawn arc, glowing behind the pen; closed it pulses white
        p.glowRing(0, 0, r, 3, C[4], 0.35);
        p.arc(0, 0, r, 2, A0, a1, sw >= 1 ? (shut > 0 || ((t * 30) | 0) % 2 ? WHITE : G[5]) : G[4]);
        p.arc(0, 0, r - 0.5, 1, A0, a1, G[5]);
        // the compass: the radius leg from pin to pencil, a hinge knob above
        if (sw < 1) {
          p.line(0, 0, ex, ey, C[5]);
          const hx = ex * 0.5 - Math.sin(a1) * 9, hy = ey * 0.5 + Math.cos(a1) * 9;
          p.line(0, 0, hx, hy, G[3]); p.line(hx, hy, ex, ey, G[3]); p.circle(hx, hy, 1.5, G[5]);
          p.glow(ex, ey, 9, WHITE, 0.7); p.circle(ex, ey, 1.4, WHITE);
          p.text("r", ex * 0.5 + 3, ey * 0.5 - 6, C[5], { font: "mini", outline: C[1], align: "center" });
        } else {
          // cross-hairs once it is closed: a diameter and its perpendicular, tick marks round the rim
          const k = clamp((t - PIN - SWEEP) / 0.1);
          p.line(-r * k, 0, r * k, 0, C[5]); p.line(0, -r * k, 0, r * k, C[5]);
          for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU, l = i % 3 ? 2 : 4; p.line(Math.cos(a) * (r + 1), Math.sin(a) * (r + 1), Math.cos(a) * (r + 1 + l), Math.sin(a) * (r + 1 + l), i % 3 ? G[4] : WHITE); }
          p.glow(0, 0, 14 + 12 * shut, WHITE, 0.3 + 0.6 * shut);
        }
      }
      if (boom) {
        const q = (t - SNAP - 0.08) / 0.45;
        if (q < 1) {
          if (q < 0.18) { p.circle(0, 0, 12 * (1 - q / 0.18) + 2, C[5]); p.circle(0, 0, 9 * (1 - q / 0.18), WHITE); }
          if (q < 0.5) flare(p, 0, 0, 34 * (1 - q / 0.5) + 4, 1 - q / 0.5, C);
          const e = ease.outCubic(q);
          p.ring(0, 0, 4 + 52 * e, Math.max(1, 4 * (1 - q)), q < 0.2 ? WHITE : G[5], 1.15 - q);
          p.ring(0, 0, 3 + 34 * ease.outCubic(Math.min(1, q * 1.3)), Math.max(1, 2 * (1 - q)), C[5], 1 - q);
          p.glow(0, 0, 50 * (0.4 + 0.6 * e), C[4], 0.8 * (1 - q));
          if (q < 0.3) sparkle(p, 0, 0, 10 * (1 - q / 0.3) + 3, WHITE, C[5], 0.6);
        }
      }
      ps.draw(p); lights.draw(p);
    },
  };
}
