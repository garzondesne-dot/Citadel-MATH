// 모두의 던전 (Everyone's Dungeon) custom: a mathematician's sigma rune. Trail technique after pixelfx projectiles/_lib (MIT).
import { fit, hex, TAU, WHITE } from "../../core/index.js";
import { beat, wake, spark } from "./_lib.js";

export const meta = {
  name: "Sigma rune",
  desc: "A glowing sigma rune flies right inside a spinning ring of tick marks; tiny plus, minus and equals glyphs and cyan sparks stream off behind it.",
  tags: ["projectile", "rune", "math", "sigma", "magic", "directional", "loop"],
  size: [112, 52],
  origin: [82, 26],
  duration: 0.6,
  loop: true,
  fps: 30,
  bg: "dark",
  options: { palette: ["#02121e", "#063a5a", "#0c6e9a", "#1fb0d8", "#6fe6ff", "#c8f8ff", "#ffffff"], gold: "#ffd25a", speed: 210, seed: 11 },
};

const SIGMA = ["#######", "##....#", ".##....", "..##...", "...##..", "..##...", ".##....", "##....#", "#######"];
const GLYPH = [["...", "#.#", ".#.", "#.#"], [".#.", "###", ".#."], ["...", "###", "..."], ["###", "...", "###"]];

export function draw(p, t, o) {
  const C = fit(o.palette, 7), D = meta.duration, ph = t / D, V = o.speed, left = -meta.origin[0] + 2, gold = hex(o.gold);
  // glyphs streaming behind
  beat(t, D, 6, o.seed, 0.55, (age, life, r, i) => {
    const [x, y] = wake(-8, r.range(-9, 9), -10, r.range(-25, 25), age, V * 0.5, 2, 0), k = age / life;
    if (x > left + 4) p.sprite(GLYPH[i % 4], { "#": k < 0.35 ? C[5] : C[4] }, Math.round(x), Math.round(y - 2), { a: 1 - k });
  });
  beat(t, D, 14, o.seed + 5, (r) => r.range(0.12, 0.3), (age, life, r) => {
    const [x, y, vx, vy] = wake(-6, r.range(-10, 10), r.range(-40, 40), r.range(-70, 70), age, V * 0.6, 2.4, 0);
    if (x > left + 4) spark(p, x, y, vx, vy, 1 - age / life, [WHITE, C[5], C[4], C[3]], 0.4, 0.012, 5);
  });
  p.glowLine(-6, 0, -30, 0, 9, C[3], 0.3);
  p.glow(0, 0, 30, C[3], 0.25);
  // the spinning ring with 8 ticks (rotates 1/8 turn per loop so it tiles)
  const rot = (ph * TAU) / 8;
  p.ring(0, 0, 13.5, 1, C[3]);
  for (let i = 0; i < 8; i++) { const a = rot + (i * TAU) / 8; p.px(Math.cos(a) * 15.5, Math.sin(a) * 15.5, i % 2 ? C[5] : gold); p.px(Math.cos(a) * 16.5, Math.sin(a) * 16.5, i % 2 ? C[4] : gold); }
  // the rune at 2x with a dark outline so the glow never washes it out
  const pulse = 0.5 + 0.5 * Math.sin(ph * TAU);
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) p.sprite(SIGMA, { "#": C[0] }, -7 + dx, -9 + dy, { scale: 2 });
  p.sprite(SIGMA, { "#": gold }, -7, -9, { scale: 2 });
  if (pulse > 0.75) p.sprite(SIGMA, { "#": WHITE }, -7, -9, { scale: 2, a: 0.45 });
}
