// 모두의 던전 (Everyone's Dungeon) custom 📐 Ⅰ: a glowing ruler stroke. Release flash and spark spray after
// Sprite Fusion's open-source energy charge (https://www.spritefusion.com/pixel-art-vfx/energy), MIT License, Copyright (c) 2026 Hugo Duprez.
import { Particles, Lights, P, Rng, fit, flare, clamp, ease, WHITE } from "../../core/index.js";
import { CYAN, GOLD } from "./_mathlib.js";

const DRAW = 0.13, AX = -44, AY = -26, BX = 44, BY = 26;

export const meta = {
  name: "Math ruler slash",
  desc: "A gold ruler line is ruled across the target in a blink, tick marks stamping in behind the pen; it flashes white, splits in two and spills tick marks and little digits.",
  tags: ["math", "slash", "ruler", "impact", "one-shot"],
  size: [140, 116],
  origin: [70, 58],
  duration: 0.95,
  loop: false,
  fps: 30,
  bg: "dark",
  options: { palette: CYAN, gold: GOLD, seed: 3 },
};

export function create(o) {
  const C = fit(o.palette, 7), G = fit(o.gold, 7), R = new Rng(o.seed);
  const L = Math.hypot(BX - AX, BY - AY), ux = (BX - AX) / L, uy = (BY - AY) / L, nx = -uy, ny = ux;
  const ps = new Particles({ rng: R, ground: () => 46, sparks: [WHITE, G[5], G[4], G[3]] }), lights = new Lights();
  const ticks = []; for (let s = 4; s < L - 2; s += 6) ticks.push({ s, big: ticks.length % 5 === 0 });
  const digits = [1, 2, 3, 4, 5].map((d, i) => ({ d, s: 10 + i * 17, vy: -R.range(28, 46), vx: R.range(-10, 10) }));
  let t = 0, hit = false;
  const at = (s) => [AX + ux * s, AY + uy * s];
  return {
    update(dt) {
      t += dt;
      if (t >= DRAW && !hit) {
        hit = true;
        lights.add(0, 0, 70, C[4], 1, 0.35);
        lights.add(0, 0, 22, WHITE, 1, 0.08);
        for (let i = 0; i < 34; i++) {
          const side = i % 2 ? 1 : -1, sp = R.range(90, 230), j = R.range(-0.5, 0.5), s = R.range(0.2, 0.8) * L, [x, y] = at(s);
          ps.spawn(P.SPARK, x, y, (nx * side + ux * j) * sp, (ny * side + uy * j) * sp - 30, R.range(0.15, 0.4));
        }
        for (let i = 0; i < 14; i++) {
          const [x, y] = at(R.range(0.1, 0.9) * L);
          ps.spawn(P.STAR, x, y, R.range(-40, 40), R.range(-70, -10), R.range(0.3, 0.6), R.pick([WHITE, G[5], C[5]]), R.range(0.8, 1.6));
        }
      }
      if (hit && t < DRAW + 0.45 && R.chance(0.5)) { const tk = R.pick(ticks), [x, y] = at(tk.s); ps.spawn(P.MOTE, x + nx * 2, y + ny * 2, R.range(-12, 12), R.range(-10, 20), R.range(0.25, 0.45), G[4], 0.6); }
      ps.update(dt); lights.update(dt);
    },
    draw(p) {
      const head = Math.min(1, ease.outQuart(clamp(t / DRAW))) * L, [hx, hy] = at(head);
      const after = hit ? (t - DRAW) / 0.55 : 0, split = hit ? 4.5 * ease.outCubic(clamp(after)) : 0, fade = hit ? 1 - clamp(after) : 1;
      if (fade > 0) {
        for (const sg of hit ? [-1, 1] : [0]) {
          const ox = nx * split * sg, oy = ny * split * sg;
          p.glowLine(AX + ox, AY + oy, hx + ox, hy + oy, 6, C[4], 0.35 * fade);
          p.beam(AX + ox, AY + oy, hx + ox, hy + oy, hit && after < 0.12 ? 3 : 2, hit && after < 0.15 ? WHITE : G[4], fade);
          p.line(AX + ox, AY + oy, hx + ox, hy + oy, (u) => (u > 0.85 && !hit ? WHITE : G[5]), fade);
          for (const tk of ticks) {
            if (tk.s > head) break;
            const [x, y] = at(tk.s), len = tk.big ? 5 : 3, dir = sg || 1;
            p.line(x + ox, y + oy, x + ox + nx * len * dir, y + oy + ny * len * dir, tk.big ? G[5] : G[4], fade);
          }
        }
        if (!hit) { p.glow(hx, hy, 12, WHITE, 0.6); p.circle(hx, hy, 1.6, WHITE); }
      }
      if (hit) {
        const q = (t - DRAW) / 0.3;
        if (q < 1) {
          if (q < 0.2) { p.circle(0, 0, 9 * (1 - q / 0.2) + 2, C[5]); p.circle(0, 0, 7 * (1 - q / 0.2), WHITE); }
          if (q < 0.45) flare(p, 0, 0, 26 * (1 - q / 0.45) + 4, 1 - q / 0.45, C);
          p.ring(0, 0, 4 + 30 * ease.outCubic(q), Math.max(1, 3 * (1 - q)), q < 0.25 ? WHITE : C[5], 1.1 - q);
        }
        for (const dg of digits) {
          const k = (t - DRAW) / 0.6; if (k >= 1) continue;
          const [x, y] = at(dg.s), e = ease.outCubic(k);
          p.text(String(dg.d), x + nx * 6 + dg.vx * e, y + ny * 6 + dg.vy * e, k < 0.2 ? WHITE : G[5], { font: "mini", outline: C[1], align: "center", a: 1 - k * k });
        }
      }
      ps.draw(p); lights.draw(p);
    },
  };
}
