// 모두의 던전 (Everyone's Dungeon) custom 📐 Ⅳ: "Q.E.D." — a geometry magic circle rules itself round the target
// (tick ring, inscribed triangle, angle arcs, orbiting symbols), then a white proof-box ∎ slams down into it and
// everything blows out. Release choreography after Sprite Fusion's open-source energy charge
// (https://www.spritefusion.com/pixel-art-vfx/energy), MIT License, Copyright (c) 2026 Hugo Duprez.
import { Particles, Lights, P, Rng, fit, flare, sparkle, clamp, ease, TAU, WHITE } from "../../core/index.js";
import { CYAN, GOLD, glyph, SET_KEYS } from "./_mathlib.js";

const RAD = 40, RING = 0.24, TRI = 0.5, DROP = 0.54, HIT = 0.8, N = 12;

export const meta = {
  name: "Math QED",
  desc: "A geometry magic circle rules itself round the target: tick ring, inscribed triangle, angle arcs, orbiting symbols; then a white proof box slams in and it all blows out.",
  tags: ["math", "proof", "qed", "magic-circle", "ultimate", "impact", "one-shot"],
  size: [244, 208],
  origin: [122, 108],
  duration: 2.2,
  loop: false,
  fps: 30,
  bg: "dark",
  options: { palette: CYAN, gold: GOLD, seed: 13 },
};

export function create(o) {
  const C = fit(o.palette, 7), G = fit(o.gold, 7), R = new Rng(o.seed);
  const ps = new Particles({ rng: R, ground: () => 92, sparks: [WHITE, G[5], C[5], G[4]] }), lights = new Lights();
  const V = [0, 1, 2].map((i) => { const a = -Math.PI / 2 + (i * TAU) / 3; return [Math.cos(a) * RAD, Math.sin(a) * RAD]; });
  const flung = Array.from({ length: N }, (_, i) => { const a = (i / N) * TAU + R.range(-0.15, 0.15), sp = R.range(170, 230); return { k: i % 3 === 2 ? null : SET_KEYS[i % SET_KEYS.length], d: (i * 7) % 10, x: Math.cos(a) * (RAD + 6), y: Math.sin(a) * (RAD + 6), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * 0.8, pop: HIT + 0.45 + i * 0.04 + R.range(0, 0.04), popped: false, gold: i % 2 }; });
  const pops = [];
  let t = 0, boom = false;
  return {
    update(dt) {
      t += dt;
      if (t < DROP) for (let i = 0; i < 2; i++) { const a = R.range(0, TAU), D = R.range(RAD + 14, RAD + 40); ps.spawn(P.STREAK, Math.cos(a) * D, Math.sin(a) * D, -Math.cos(a) * 150, -Math.sin(a) * 150, 0.15, R.chance(0.5) ? G[5] : C[5]); }
      if (t >= HIT && !boom) {
        boom = true;
        lights.add(0, 0, 150, C[4], 1, 0.7); lights.add(0, 0, 40, WHITE, 1, 0.15); lights.add(0, 0, 90, G[4], 0.8, 0.45);
        for (let i = 0; i < 120; i++) { const a = R.range(0, TAU), sp = R.range(120, 320); ps.spawn(R.chance(0.6) ? P.MOTE : P.STAR, 0, 0, Math.cos(a) * sp, Math.sin(a) * sp * 0.8, R.range(0.3, 0.7), R.pick([WHITE, C[5], G[5]]), R.range(0.8, 2)); }
        for (let i = 0; i < 36; i++) { const a = R.range(0, TAU), sp = R.range(150, 330); ps.spawn(P.SPARK, 0, 0, Math.cos(a) * sp, Math.sin(a) * sp, R.range(0.25, 0.55)); }
      }
      if (boom) for (const r of flung) {
        if (r.popped) continue;
        r.vx -= r.vx * 3.8 * dt; r.vy -= r.vy * 3.8 * dt + 8 * dt; r.x += r.vx * dt; r.y += r.vy * dt;
        if (R.chance(0.3)) ps.spawn(P.MOTE, r.x, r.y, r.vx * 0.2, r.vy * 0.2 - 12, R.range(0.2, 0.35), r.gold ? G[5] : C[5], 0.5);
        if (t >= r.pop) { r.popped = true; pops.push({ t, x: r.x, y: r.y, gold: r.gold }); lights.add(r.x, r.y, 30, r.gold ? G[4] : C[4], 0.9, 0.2); for (let i = 0; i < 8; i++) { const a = R.range(0, TAU), sp = R.range(60, 180); ps.spawn(P.SPARK, r.x, r.y, Math.cos(a) * sp, Math.sin(a) * sp - 30, R.range(0.15, 0.35)); } }
      }
      ps.update(dt); lights.update(dt);
    },
    drawBack(p) { const k = boom ? Math.max(0, 1 - (t - HIT) / 1.2) : clamp(t / DROP) * 0.5; if (k > 0) p.glow(0, 0, 80, C[3], 0.3 * k); },
    draw(p) {
      const fade = boom ? 1 - clamp((t - HIT) / 0.35) : 1, spin = t * 1.6, grow = boom ? 1 + 0.6 * ease.outCubic(clamp((t - HIT) / 0.35)) : 1;
      if (fade > 0) {
        // the outer ring rules itself round, ticks every 15°, labels 0 · 90 · 180 · 270 style marks every 90°
        const rk = ease.outCubic(clamp(t / RING)), r1 = (RAD + 10) * grow, a0 = -Math.PI / 2;
        p.glowRing(0, 0, r1, 4, C[4], 0.35 * fade);
        p.arc(0, 0, r1, 2, a0, a0 + rk * TAU, G[5], fade);
        p.ring(0, 0, r1 - 5, 1, C[4], rk * fade * 0.8);
        for (let i = 0; i < 24; i++) { const a = spin * 0.3 + (i / 24) * TAU; if (((a - a0) % TAU + TAU) % TAU > rk * TAU) continue; const l = i % 6 ? 2 : 5; p.line(Math.cos(a) * (r1 + 1), Math.sin(a) * (r1 + 1), Math.cos(a) * (r1 + 1 + l), Math.sin(a) * (r1 + 1 + l), i % 6 ? G[4] : WHITE, fade); }
        // orbiting symbols on the inner track
        if (t > RING * 0.6) for (let i = 0; i < 6; i++) { const a = -spin + (i / 6) * TAU, rr = (RAD + 18) * grow; glyph(p, SET_KEYS[i], Math.cos(a) * rr, Math.sin(a) * rr, i % 2 ? G[5] : C[5], C[0], { a: clamp((t - RING * 0.6) / 0.15) * fade }); }
        // the inscribed triangle, edge by edge, then arcs at each corner
        const tk = clamp((t - RING) / (TRI - RING)) * 3;
        for (let e = 0; e < 3; e++) {
          const u = clamp(tk - e); if (u <= 0) continue;
          const [x0, y0] = V[e], [x1, y1] = V[(e + 1) % 3], xe = x0 + (x1 - x0) * u, ye = y0 + (y1 - y0) * u;
          p.glowLine(x0 * grow, y0 * grow, xe * grow, ye * grow, 5, C[4], 0.3 * fade);
          p.line(x0 * grow, y0 * grow, xe * grow, ye * grow, u < 1 ? WHITE : G[5], fade);
          if (u < 1) { p.glow(xe * grow, ye * grow, 8, WHITE, 0.7); p.circle(xe * grow, ye * grow, 1.3, WHITE); }
          else { const ang = Math.atan2(y0, x0) + Math.PI, s = 0.52; p.arc(x1 * grow, y1 * grow, 7, 1, Math.atan2(y1, x1) + Math.PI - s, Math.atan2(y1, x1) + Math.PI + s, C[5], fade); sparkle(p, x0 * grow, y0 * grow, 3, WHITE, G[5], 0.5); void ang; }
        }
        // the charge at the centre while the box falls
        if (t > TRI) { const k = clamp((t - TRI) / (HIT - TRI)); p.glow(0, 0, 10 + 18 * k, WHITE, 0.3 + 0.6 * k); p.circle(0, 0, 1 + 3 * k, WHITE); }
      }
      // the proof box ∎ drops in from above and slams the centre
      if (t > DROP && t < HIT + 0.5) {
        const k = clamp((t - DROP) / (HIT - DROP)), y = -70 * (1 - ease.inCubic(k)), s = boom ? 1 - clamp((t - HIT) / 0.5) : 1, w = 9 * (boom ? 1 + 0.6 * (1 - s) : 1);
        if (!boom) { p.beam(0, y - 26, 0, y - 6, 3, C[5], 0.6); p.glowLine(0, y - 30, 0, y, 6, WHITE, 0.4); }
        p.rect(-w - 1, y - w - 1, 2 * w + 2, 2 * w + 2, C[1], s);
        p.rect(-w, y - w, 2 * w, 2 * w, k < 1 || !boom ? WHITE : G[6], s);
        p.glow(0, y, 18, WHITE, 0.8 * s);
      }
      if (boom) {
        const q = (t - HIT) / 0.7;
        if (q < 1) {
          if (q < 0.12) { p.circle(0, 0, 20 * (1 - q / 0.12) + 3, C[5]); p.circle(0, 0, 16 * (1 - q / 0.12), WHITE); }
          if (q < 0.4) flare(p, 0, 0, 56 * (1 - q / 0.4) + 6, 1 - q / 0.4, C);
          const e = ease.outCubic(q);
          p.ring(0, 0, 6 + 92 * e, Math.max(1, 6 * (1 - q)), q < 0.18 ? WHITE : C[5], 1.15 - q);
          p.ring(0, 0, 4 + 64 * ease.outCubic(Math.min(1, q * 1.3)), Math.max(1, 3 * (1 - q)), G[5], 1 - q);
          p.ring(0, 0, 3 + 36 * ease.outCubic(Math.min(1, q * 1.8)), Math.max(1, 2 * (1 - q)), WHITE, 0.9 - q);
          p.glow(0, 0, 90 * (0.4 + 0.6 * e), C[4], 0.9 * (1 - q));
          if (q < 0.5) { const h = 90 * (1 - q / 0.5); p.beam(0, -h, 0, 0, 5 * (1 - q / 0.5) + 1, WHITE, 1 - q / 0.5); p.glowLine(0, -h, 0, 0, 10, C[5], 0.5 * (1 - q / 0.5)); }
        }
        for (const r of flung) {
          if (r.popped) continue;
          const hotR = t - HIT < 0.08 || r.pop - t < 0.06, c = hotR ? WHITE : r.gold ? G[5] : C[5];
          if (r.k) glyph(p, r.k, r.x, r.y, c, C[0], { scale: 2 }); else p.text(String(r.d), r.x, r.y - 7, c, { font: "big", outline: C[0], align: "center" });
          p.glow(r.x, r.y, 12, r.gold ? G[4] : C[4], hotR ? 0.7 : 0.35);
        }
        for (const q2 of pops) {
          const k = (t - q2.t) / 0.32; if (k >= 1) continue;
          if (k < 0.35) flare(p, q2.x, q2.y, 11 * (1 - k / 0.35) + 2, 1 - k / 0.35, q2.gold ? G : C);
          p.ring(q2.x, q2.y, 2 + 11 * ease.outCubic(k), Math.max(1, 2 * (1 - k)), k < 0.3 ? WHITE : q2.gold ? G[5] : C[5], 1.15 - k);
        }
      }
      ps.draw(p); lights.draw(p);
    },
  };
}
