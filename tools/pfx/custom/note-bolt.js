// 모두의 던전 (Everyone's Dungeon) custom: a bard's magic note in flight. Trail technique after pixelfx projectiles/_lib (MIT).
import { fit, TAU, WHITE } from "../../core/index.js";
import { beat, wake, spark } from "./_lib.js";

export const meta = {
  name: "Note bolt",
  desc: "A glowing golden eighth note flies right, bobbing on a wave; little notes and sparkles peel off behind it on a fading ribbon of staff lines.",
  tags: ["projectile", "music", "note", "bard", "magic", "directional", "loop"],
  size: [112, 48],
  origin: [84, 26],
  duration: 0.6,
  loop: true,
  fps: 30,
  bg: "dark",
  options: { palette: ["#2a1400", "#6a3a06", "#b8700e", "#f0a828", "#ffd25a", "#fff0a8", "#ffffff"], speed: 200, seed: 3 },
};

const NOTE = [
  "......##",
  "......#o#",
  "......#.o#",
  "......#..#",
  "......#...",
  "......#...",
  "..####....",
  ".#oooo#...",
  "#oooooo#..",
  "#oooooo#..",
  ".######...",
];
const MINI = ["..#", "..#", "###", "##."];

export function draw(p, t, o) {
  const C = fit(o.palette, 7), D = meta.duration, ph = t / D, V = o.speed, left = -meta.origin[0] + 2;
  const bob = Math.round(Math.sin(ph * TAU) * 2);
  // short ribbon: two staff lines just behind, fading fast
  for (let s = -1; s <= 1; s += 2) p.line(-8, s * 4 + bob, -34, s * 4 + Math.round(Math.sin(ph * TAU - 1.2) * 3), C[3], (u) => (1 - u) * 0.6);
  // little notes left behind
  beat(t, D, 4, o.seed, 0.5, (age, life, r) => {
    const [x, y] = wake(-8, r.range(-7, 7), -20, r.range(-30, 30), age, V * 0.5, 2.2, -20), k = age / life;
    if (x > left + 4) p.sprite(MINI, { "#": k < 0.4 ? C[5] : C[4] }, Math.round(x), Math.round(y - 3), { a: 1 - k });
  });
  beat(t, D, 10, o.seed + 9, (r) => r.range(0.12, 0.3), (age, life, r) => {
    const [x, y, vx, vy] = wake(-4, r.range(-8, 8), r.range(-40, 40), r.range(-60, 60), age, V * 0.6, 2.4, 0);
    if (x > left + 4) spark(p, x, y, vx, vy, 1 - age / life, [WHITE, C[5], C[4], C[3]], 0.4, 0.012, 4);
  });
  p.glow(0, bob, 22, C[3], 0.3);
  // the note at 2x: dark outline ring first (offsets), then body, then glint
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) p.sprite(NOTE, { "#": C[0], o: C[0] }, -9 + dx, bob - 12 + dy, { scale: 2 });
  p.sprite(NOTE, { "#": C[4], o: C[5] }, -9, bob - 12, { scale: 2 });
  p.px(-6, bob + 3, WHITE); p.px(-5, bob + 2, WHITE); p.px(-4, bob + 2, WHITE);
}
