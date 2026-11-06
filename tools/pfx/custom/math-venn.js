// 모두의 던전 (Everyone's Dungeon) custom 📐 Ⅲ: a Venn diagram burst — two set circles slide together, the
// intersection heats white and blows out flinging set symbols (∈ ⊂ ∪ ∩ ∅). The flung-glyph choreography follows
// Sprite Fusion's open-source energy charge (https://www.spritefusion.com/pixel-art-vfx/energy), MIT License, Copyright (c) 2026 Hugo Duprez.
import { Particles, Lights, P, Rng, fit, flare, sparkle, clamp, ease, TAU, WHITE } from "../../core/index.js";
import { CYAN, GOLD, glyph, SET_KEYS } from "./_mathlib.js";

const RAD = 22, SLIDE = 0.26, HEAT = 0.42, N = 10;

export const meta = {
  name: "Math Venn burst",
  desc: "Set A (cyan) and set B (gold) slide in and overlap over the target; the intersection lens heats to white and blows out, flinging glowing set symbols that pop into sparks.",
  tags: ["math", "venn", "set", "burst", "impact", "one-shot"],
  size: [212, 164],
  origin: [106, 82],
  duration: 1.7,
  loop: false,
  fps: 30,
  bg: "dark",
  options: { palette: CYAN, gold: GOLD, seed: 7 },
};

export function create(o) {
  const C = fit(o.palette, 7), G = fit(o.gold, 7), R = new Rng(o.seed);
  const ps = new Particles({ rng: R, ground: () => 74, sparks: [WHITE, G[5], C[5], G[4]] }), lights = new Lights();
  const runes = Array.from({ length: N }, (_, i) => { const a = (i / N) * TAU + R.range(-0.2, 0.2), sp = R.range(150, 200); return { k: SET_KEYS[i % SET_KEYS.length], x: 0, y: 0, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * 0.75, pop: HEAT + 0.42 + i * 0.05 + R.range(0, 0.04), popped: false, gold: i % 2 }; });
  const pops = [];
  let t = 0, boom = false;
  const off = () => 24 * (1 - ease.outBack(clamp(t / SLIDE))) + 12; // the circles' centres: far apart → overlapping
  return {
    update(dt) {
      t += dt;
      if (t > SLIDE && t < HEAT) for (let i = 0; i < 2; i++) { const a = R.range(0, TAU), D = R.range(18, 34); ps.spawn(P.STREAK, Math.cos(a) * D, Math.sin(a) * D * 0.8, -Math.cos(a) * 160, -Math.sin(a) * 130, 0.14, R.chance(0.5) ? WHITE : C[5]); }
      if (t >= HEAT && !boom) {
        boom = true;
        lights.add(0, 0, 110, C[4], 1, 0.5); lights.add(0, 0, 30, WHITE, 1, 0.12); lights.add(0, 0, 70, G[4], 0.6, 0.35);
        for (let i = 0; i < 80; i++) { const a = R.range(0, TAU), sp = R.range(100, 260); ps.spawn(R.chance(0.6) ? P.MOTE : P.STAR, 0, 0, Math.cos(a) * sp, Math.sin(a) * sp * 0.8, R.range(0.25, 0.55), R.pick([WHITE, C[5], G[5]]), R.range(0.8, 1.8)); }
        for (let i = 0; i < 22; i++) { const a = R.range(0, TAU), sp = R.range(130, 280); ps.spawn(P.SPARK, 0, 0, Math.cos(a) * sp, Math.sin(a) * sp, R.range(0.2, 0.45)); }
      }
      if (boom) for (const r of runes) {
        if (r.popped) continue;
        r.vx -= r.vx * 4 * dt; r.vy -= r.vy * 4 * dt + 10 * dt; r.x += r.vx * dt; r.y += r.vy * dt;
        if (R.chance(0.3)) ps.spawn(P.MOTE, r.x, r.y, r.vx * 0.2, r.vy * 0.2 - 12, R.range(0.2, 0.35), r.gold ? G[5] : C[5], 0.5);
        if (t >= r.pop) {
          r.popped = true; pops.push({ t, x: r.x, y: r.y, gold: r.gold });
          lights.add(r.x, r.y, 30, r.gold ? G[4] : C[4], 0.9, 0.2); lights.add(r.x, r.y, 10, WHITE, 0.8, 0.06);
          for (let i = 0; i < 8; i++) { const a = R.range(0, TAU), sp = R.range(60, 180); ps.spawn(P.SPARK, r.x, r.y, Math.cos(a) * sp, Math.sin(a) * sp - 30, R.range(0.15, 0.35)); }
        }
      }
      ps.update(dt); lights.update(dt);
    },
    draw(p) {
      if (t < HEAT + 0.3) {
        const d = off(), fade = boom ? 1 - clamp((t - HEAT) / 0.3) : clamp(t / 0.08), grow = boom ? 1 + 0.9 * ease.outCubic(clamp((t - HEAT) / 0.3)) : 1, r = RAD * grow;
        const dd = d * grow;
        // the two sets: soft fills, bright rims, letters A and B
        p.disc(-dd, 0, r, C[3], 0.22 * fade); p.disc(dd, 0, r, G[3], 0.22 * fade);
        p.glowRing(-dd, 0, r, 3, C[4], 0.3 * fade); p.glowRing(dd, 0, r, 3, G[4], 0.3 * fade);
        p.ring(-dd, 0, r, 2, C[5], fade); p.ring(dd, 0, r, 2, G[5], fade);
        if (!boom) { p.text("A", -dd - r * 0.55, -r - 8, C[5], { font: "mini", outline: C[1], align: "center", a: fade }); p.text("B", dd + r * 0.55, -r - 8, G[5], { font: "mini", outline: G[1], align: "center", a: fade }); }
        // the intersection lens: heats from gold to white once they overlap
        const heat = clamp((t - SLIDE) / (HEAT - SLIDE));
        if (heat > 0) {
          const hot = boom ? WHITE : heat > 0.7 ? WHITE : heat > 0.35 ? G[6] : G[5];
          p.shade(-r, -r, r, r, (x, y) => { const inA = (x + dd) ** 2 + y * y < r * r, inB = (x - dd) ** 2 + y * y < r * r; return inA && inB ? hot : undefined; });
          p.glow(0, 0, 10 + 16 * heat, WHITE, (0.3 + 0.6 * heat) * fade);
          if (!boom) glyph(p, "cap", 0, -1, C[1], null, { scale: 1, a: heat });
        }
      }
      if (boom) {
        const q = (t - HEAT) / 0.55;
        if (q < 1) {
          if (q < 0.15) { p.circle(0, 0, 14 * (1 - q / 0.15) + 2, C[5]); p.circle(0, 0, 11 * (1 - q / 0.15), WHITE); }
          if (q < 0.4) flare(p, 0, 0, 40 * (1 - q / 0.4) + 4, 1 - q / 0.4, C);
          const e = ease.outCubic(q);
          p.ring(0, 0, 4 + 70 * e, Math.max(1, 5 * (1 - q)), q < 0.2 ? WHITE : C[5], 1.15 - q);
          p.ring(0, 0, 3 + 48 * ease.outCubic(Math.min(1, q * 1.3)), Math.max(1, 2 * (1 - q)), G[5], 1 - q);
          p.glow(0, 0, 70 * (0.4 + 0.6 * e), C[4], 0.8 * (1 - q));
        }
        for (const r of runes) {
          if (r.popped) continue;
          const left = r.pop - t, hotR = t - HEAT < 0.08 || left < 0.06;
          glyph(p, r.k, r.x, r.y, hotR ? WHITE : r.gold ? G[5] : C[5], C[0], { scale: 2 });
          p.glow(r.x, r.y, 12, r.gold ? G[4] : C[4], hotR ? 0.7 : 0.35);
        }
        for (const q2 of pops) {
          const k = (t - q2.t) / 0.32; if (k >= 1) continue;
          if (k < 0.35) flare(p, q2.x, q2.y, 11 * (1 - k / 0.35) + 2, 1 - k / 0.35, q2.gold ? G : C);
          p.ring(q2.x, q2.y, 2 + 11 * ease.outCubic(k), Math.max(1, 2 * (1 - k)), k < 0.3 ? WHITE : q2.gold ? G[5] : C[5], 1.15 - k);
          if (k < 0.2) sparkle(p, q2.x, q2.y, 5, WHITE, C[5], 0.5);
        }
      }
      ps.draw(p); lights.draw(p);
    },
  };
}
