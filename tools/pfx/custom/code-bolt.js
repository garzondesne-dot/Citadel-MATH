// 모두의 던전 (Everyone's Dungeon) custom: 해커 — a bolt of green code. Trail technique after pixelfx projectiles/_lib (MIT).
import { fit, hex, WHITE } from "../../core/index.js";
import { beat, wake, spark } from "./_lib.js";

export const meta = {
  name: "Code bolt",
  desc: "A bright </> glyph rides a crackling green-and-cyan zigzag to the right, shedding a stream of 0 and 1 bits and electric sparks.",
  tags: ["projectile", "code", "hacker", "electric", "directional", "loop"],
  size: [128, 48],
  origin: [98, 24],
  duration: 0.6,
  loop: true,
  fps: 30,
  bg: "dark",
  options: { palette: ["#020a04", "#05200c", "#0a3c16", "#106624", "#1a9a34", "#3cd650", "#a4ffa8", "#e8ffe8"], cyan: "#6ff0ff", speed: 260, seed: 31 },
};
const BIT = [[".#.", "#.#", "#.#", "#.#", ".#."], [".#", "##", ".#", ".#", ".#"]];
const TAG = ["..#.....#..", ".#...#...#.", "#...#.....#", ".#.#....#..", "..#.....#.."]; // < / >

export function draw(p, t, o) {
  const C = fit(o.palette, 8), D = meta.duration, ph = t / D, V = o.speed, left = -meta.origin[0] + 2, cy = hex(o.cyan);
  beat(t, D, 9, o.seed, 0.5, (age, life, r, i) => {
    const [x, y] = wake(-12, r.range(-9, 9), -10, r.range(-16, 16), age, V * 0.5, 2, 0), k = age / life;
    if (x > left + 4) p.sprite(BIT[i % 2], { "#": k < 0.3 ? C[6] : C[5] }, Math.round(x), Math.round(y - 2), { a: 1 - k });
  });
  beat(t, D, 12, o.seed + 7, (r) => r.range(0.1, 0.24), (age, life, r) => {
    const [x, y, vx, vy] = wake(-8, r.range(-8, 8), r.range(-30, 30), r.range(-70, 70), age, V * 0.6, 2.6, 0);
    if (x > left + 4) spark(p, x, y, vx, vy, 1 - age / life, [WHITE, cy, C[6], C[5]], 0.4, 0.012, 5);
  });
  // the zigzag: a jagged line that re-jags 6 times per loop (step function of the phase, so it loops)
  const s = Math.floor(ph * 6), pts = [[-60, 0]];
  for (let i = 1; i <= 8; i++) pts.push([-60 + i * 7.5, i === 8 ? 0 : (((s * 7 + i * 13) % 9) - 4) * 1.2]);
  p.glowLine(-60, 0, 0, 0, 8, C[4], 0.35);
  p.polyline(pts, (u) => (u > 0.75 ? WHITE : u > 0.4 ? cy : C[5]));
  p.polyline(pts.map(([x, y]) => [x, y + 1]), C[4], 0.6);
  p.glow(0, 0, 24, C[5], 0.3); p.glow(0, 0, 8, cy, 0.12);
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, 1], [-1, 1], [1, -1]]) p.sprite(TAG, { "#": C[0] }, -11 + dx, -5 + dy, { scale: 2 });
  p.sprite(TAG, { "#": ph % 0.5 < 0.25 ? WHITE : C[6] }, -11, -5, { scale: 2 });
}
