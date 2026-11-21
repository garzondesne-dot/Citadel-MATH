// 그래픽 배치표 — 그림 파일 이름은 여기에만 (정식 assets/manifest.js 방식)
// 'mimic:0' = 정식 monsters-extra-v2 시트의 3번 줄(이끼 미믹 · 정식 sprite 'extra:3')만 잘라 옮긴 것 · 칸 256 · 자세 3
// 끝에 '@h120' = 색 변형 (hue-rotate · 정식과 같은 꼴) — b2 는 그림 하나로 몬스터 · 보스를 색만 바꿔 씀
export interface Sheet { src: string; cols: number; rows: number; cell: number; poses: Record<'idle' | 'attack' | 'down', number> & { idleB?: number; hit?: number }; names: string[]; /** 🎲 룬 원판 [x, y, r] (칸 비율) · 줄 × 칸 · null = 기호 없음 */ rune?: ([number, number, number] | null)[][] }
export type MonPose = 'idle' | 'idleB' | 'attack' | 'hit' | 'down';
/** 몬스터 자세 → 칸 (5칸 시트만 대기 B · 맞음이 있음 · 3칸 시트 = 대기 · 공격 · 쓰러짐으로 대신) */
export const poseCol = (s: Sheet, p: MonPose) => (p === 'idleB' ? s.poses.idleB ?? s.poses.idle : p === 'hit' ? s.poses.hit ?? s.poses.idle : s.poses[p]);

import { SUBJ } from '../engine/subject';
import RDUN_JSON from './rdun.json';
import RDUN_BOSS from './rdun-boss.json'; // 👑 보스 묶음 시트 (보스 줄이 없는 던전 · bossRef = '묶음:줄')
/** 🎲 랜덤 던전 (DECISIONS 「🎲 랜덤 던전」 · 그림 없는 차시에 차례로) — 과목과 상관없는 그림 표 */
export interface Rdun { name: string; src: string; cell: number; rows: number; names: string[]; boss: number | null; bossRef?: string; bossName: string; attack: string[]; rowAttack?: string[]; bossAttack: string[]; bg: string; rune: ([number, number, number] | null)[][] }
export const RDUN = RDUN_JSON as unknown as Record<string, Rdun>;
export const RDUN_IDS = Object.keys(RDUN).sort();
/** 🔍 확대 품질 비교 (2026-11-14 머리 📎): 주소 ?rdx2 = 도트 전용 2배(Scale2x)로 미리 구운 시트 + 부드러운 축소 (tools/rdun/scale2x.py) */
const RDX2 = typeof location !== 'undefined' && /[?&]rdx2\b/.test(location.search);
const GEN = SUBJ.themes; // 몬스터 줄 · 던전 배경 표 = 과목 팩 (#132 · #136)
export const SHEETS: Record<string, Sheet> = {
  mimic: { src: 'art/monster-mimic-v1.webp', cols: 3, rows: 1, cell: 256, poses: { idle: 0, attack: 1, down: 2 }, names: ['이끼 미믹'] },
  // 🧩 #132 정식 차시가 쓰는 몬스터 줄만 잘라 온 것 (tools/pack-from-release · 'new2:0' = 정식 'new:2')
  //   🏰 성채 시트 (📜 2026-11-14) = 여러 줄 (rows · 'castle1:줄')
  ...Object.fromEntries(Object.entries(GEN.sheets as Record<string, { src: string; cell: number; names: string[]; rows?: number }>).map(([k, v]) => [k, { src: v.src, cols: 3, rows: v.rows ?? 1, cell: v.cell, poses: { idle: 0, attack: 1, down: 2 }, names: v.names }])),
  // 🎲 5칸 = 대기 A · 대기 B(숨쉬기) · 공격 · 맞음(움찔) · 쓰러짐
  ...Object.fromEntries(Object.entries({ ...RDUN, ...(RDUN_BOSS as unknown as Record<string, Rdun>) }).map(([k, v]) => [k, { src: RDX2 ? v.src.replace('.webp', 'x2.webp') : v.src, cols: 5, rows: v.rows, cell: RDX2 ? v.cell * 2 : v.cell, poses: { idle: 0, idleB: 1, attack: 2, hit: 3, down: 4 }, names: v.names, rune: v.rune }])),
};

/** 그림 주소: '시트:줄' + '@h120'(색 돌리기) + '@r∪'(🎲 몸 룬 기호 · 맨 끝) + '@e'(대장 · 엘리트 = 1.3배 · 금빛 테두리 · 🎲 소레이드 대장 · 그림 없는 보스) */
export function spriteOf(ref: string) {
  const rm = /@r(.+)$/.exec(ref), rune = rm?.[1] ?? '';
  const r0 = rm ? ref.slice(0, rm.index) : ref, elite = /@e\b/.test(r0);
  const [base, h] = r0.replace(/@e\b/, '').split('@h');
  const [k, i] = (base || '').split(':');
  const s = SHEETS[k || ''];
  if (!s) throw new Error(`배치표에 없는 그림: ${ref}`);
  return { sheet: s, row: Number(i || 0) % s.rows, hue: Number(h) || 0, elite, rune, url: `${import.meta.env.BASE_URL}${s.src}` };
}
/** 🎲 룬 원판 자리 (칸 비율) · 없으면 null */
export const runeAt = (s: Sheet, row: number, col: number) => s.rune?.[row]?.[col] ?? null;

// 던전 배경 (정식 manifest.dungeons · 차시 팩 theme) — 원본 1672 × 941 을 정확히 절반(최근접)으로 줄인 판
export const DUNGEONS: Record<string, string> = {
  '01-burrow': 'art/dg-01-burrow-v1h.webp',
  'citadel-room': 'art/dg-citadel-room-v1h.webp', 'citadel-boss': 'art/dg-citadel-boss-v1h.webp', // 🏰 성채 방 · 보스 방 (정식 citadel.room · boss)
  ...(GEN.dungeons as Record<string, string>),
  // 🎲 랜덤 던전 배경 12 (📜 2026-11-14 🎨 「배경화면12종」 · 던전마다 하나 · 원본 1672 × 941 → 정확히 절반)
  ...Object.fromEntries(Array.from({ length: 12 }, (_, i) => { const k = `d${String(i + 1).padStart(2, '0')}`; return [`rd-${k}`, `art/rdun/bg-${k}-v1h.webp`]; })),
};
export const dungeonOf = (theme?: string) => `${import.meta.env.BASE_URL}${DUNGEONS[theme || ''] ?? DUNGEONS['01-burrow']}`;

// 용사 (정식 heroesV2 · 칸 80 × 64 · 4열 × 12줄 · 0줄 = idle · 2줄 = 공격 · 8줄 = 앉기) — b7: 31명 (그림 파일 이름 = hero-data.json sprite)
import { baseOf, heroOf, PORTRAITS } from '../model/hero';
import { savedLook } from '../store/me.svelte';
export const HERO = { w: 80, h: 64, cols: 4, rows: 12, idleRow: 0, atkRow: 2, sitRow: 8 };
/** 🎞 용사 모션 표 = 정식 assets/manifest.js anims 그대로 (📜 2026-11-14 머리 🔨 「용사 공격할 때 공격 모션으로 안 나가 · 모션 전부 점검」): [줄, 칸 수, 한 바퀴 초, 한 번만] */
export type HPose = 'idle' | 'walk' | 'attack' | 'hit' | 'win' | 'fall' | 'heal' | 'portal' | 'sit' | 'healed' | 'think' | 'pant';
export const ANIM: Record<HPose, [number, number, number, boolean?]> = { idle: [0, 4, 1.28], walk: [1, 4, 0.64], attack: [2, 4, 0.48], hit: [3, 1, 0.4], win: [4, 2, 0.7], fall: [5, 2, 0.6, true], heal: [6, 2, 0.7], portal: [7, 4, 0.9, true], sit: [8, 2, 1.6], healed: [9, 2, 0.8], think: [10, 2, 1.4], pant: [11, 2, 0.5] };
// 🎯 캐릭터 정중앙 (#121): 그림 틀(80 × 64 · 256)이 아니라 보이는 부분(알파 상자 · tools/make-sprite-bbox.py) 가운데를 칸 가운데 · 발을 칸 아래 기준선에
//   가로 = 서 있는 줄(0) 상자 가운데(공격 줄도 몸이 같은 자리 · 무기가 뻗어도 흔들리지 않게) · 앉기 줄(8)은 그 줄 상자 · 세로 = 그 줄 상자 아래
import BBOX from './sprite-bbox.json';
import { AWK_HAVE, heroKey } from '../model/hero';
{ // 🌟 #29 금발 시트 = 로안 시트 색만 바꿈 → 칸 상자 · 머리 자리 같음
  const B = BBOX as unknown as { heroes: Record<string, unknown>; heads?: Record<string, unknown> };
  B.heroes['hero-blond-v1.webp'] = B.heroes['hero-sword-v3c.webp']; if (B.heads) B.heads['hero-blond-v1.webp'] = B.heads['hero-sword-v3c.webp'];
  for (const k of AWK_HAVE.map(heroKey)) for (const a of [`hero-${k}-awk-v7.webp`, `hero-${k}-awk-v8.webp`]) { const o = `hero-${k}-v7.webp`; B.heroes[a] ??= B.heroes[o] ?? B.heroes[o.replace('-v7.', '-v8.')]; if (B.heads) B.heads[a] ??= B.heads[o] ?? B.heads[o.replace('-v7.', '-v8.')]; } // ⚡ #83 각성 시트 = 같은 칸 · 같은 자리
}
type Box = [number, number, number, number];
// 🧙 새 화풍 세밀 시트 (#166 · #167 · tools/hero-hd/cut.py): 칸 192 × 144 · 화면 = ½(k=2 → 96 × 72) · 발 = 칸 아래 8px(화면 4px)
//   옛 80 × 64 칸과 섞여도 됨: 화면 자리(레이아웃)는 옛 칸 80 × 64 그대로 · 새 그림은 그 칸 바닥 가운데에 발을 맞춰 위 · 옆으로 넘쳐 그림
//   ⏸ #170 꺼 둠: 오늘은 34명 같은 화풍(옛 꼬마 시트 + PixelLab 숨쉬기) → hero-data 가 새 파일을 안 가리킴 · 표 · 파일 · cut.py 는 남김(새 화풍을 다시 시작하면 hero-data sprite 만 바꿈)
export const HERO_HD: Record<string, { cw: number; ch: number; k: number; base: number }> = {
  'hero-sword-v4a.webp': { cw: 192, ch: 144, k: 2, base: 8 },
  'hero-priest-v4a.webp': { cw: 192, ch: 144, k: 2, base: 8 },
  // 🧙 #50 용사 세밀화 v4 시트 31명 (tools/hero-hd/cut_v4.py · 칸 256 × 144 · 서 있기 키 118 · 발 = 아래 8) · 11/17 덧: 로안 · 에이라 · 🌟 각성한 로안(unmix = 흰 빛 고리 되돌림) → 33명 + 각성 모두 새 시트
  'hero-sword-v7.webp': { cw: 256, ch: 144, k: 2, base: 8 },
  'hero-valkyrie-v7.webp': { cw: 256, ch: 144, k: 2, base: 8 },
  'hero-blond-v7.webp': { cw: 256, ch: 144, k: 2, base: 8 },
  // ⚡ #83 각성 시트 (hero-v2 docs/handoff/assets/hero-awaken · v5 와 같은 칸 · 그림이 온 용사만 · 모습 id = 100 + 용사)
  'hero-dknight-awk-v8.webp': { cw: 256, ch: 144, k: 2, base: 8 },
  'hero-witch-v7.webp': { cw: 256, ch: 144, k: 2, base: 8 },
  'hero-elf-v7.webp': { cw: 256, ch: 144, k: 2, base: 8 },
  'hero-ninja-v7.webp': { cw: 256, ch: 144, k: 2, base: 8 },
  'hero-priest-v7.webp': { cw: 256, ch: 144, k: 2, base: 8 },
  'hero-lancer-v7.webp': { cw: 256, ch: 144, k: 2, base: 8 },
  'hero-dwarf-v7.webp': { cw: 256, ch: 144, k: 2, base: 8 },
  'hero-sage-v7.webp': { cw: 256, ch: 144, k: 2, base: 8 },
  'hero-paladin-v7.webp': { cw: 256, ch: 144, k: 2, base: 8 },
  'hero-monk-v7.webp': { cw: 256, ch: 144, k: 2, base: 8 },
  'hero-dancer-v7.webp': { cw: 256, ch: 144, k: 2, base: 8 },
  'hero-bard-v7.webp': { cw: 256, ch: 144, k: 2, base: 8 },
  'hero-alchemist-v7.webp': { cw: 256, ch: 144, k: 2, base: 8 },
  'hero-pirate-v7.webp': { cw: 256, ch: 144, k: 2, base: 8 },
  'hero-frost-v7.webp': { cw: 256, ch: 144, k: 2, base: 8 },
  'hero-tamer-v7.webp': { cw: 256, ch: 144, k: 2, base: 8 },
  'hero-math-v7.webp': { cw: 256, ch: 144, k: 2, base: 8 },
  'hero-dknight-v8.webp': { cw: 256, ch: 144, k: 2, base: 8 },
  'hero-mathboy-v7.webp': { cw: 256, ch: 144, k: 2, base: 8 },
  'hero-mathgirl-v7.webp': { cw: 256, ch: 144, k: 2, base: 8 },
  'hero-mechanic-v7.webp': { cw: 256, ch: 144, k: 2, base: 8 },
  'hero-hacker-v7.webp': { cw: 256, ch: 144, k: 2, base: 8 },
  'hero-dragoon-v7.webp': { cw: 256, ch: 144, k: 2, base: 8 },
  'hero-spellblade-v7.webp': { cw: 256, ch: 144, k: 2, base: 8 },
  'hero-bone-v7.webp': { cw: 256, ch: 144, k: 2, base: 8 },
  'hero-crossbow-v7.webp': { cw: 256, ch: 144, k: 2, base: 8 },
  'hero-abacus-v7.webp': { cw: 256, ch: 144, k: 2, base: 8 },
  'hero-geometry-v7.webp': { cw: 256, ch: 144, k: 2, base: 8 },
  'hero-merchant-v7.webp': { cw: 256, ch: 144, k: 2, base: 8 },
  'hero-drone-v7.webp': { cw: 256, ch: 144, k: 2, base: 8 },
  'hero-elemental-v7.webp': { cw: 256, ch: 144, k: 2, base: 8 },
  'hero-astro-v7.webp': { cw: 256, ch: 144, k: 2, base: 8 },
};
for (const k of AWK_HAVE.map(heroKey)) HERO_HD[`hero-${k}-awk-v8.webp`] ??= { cw: 256, ch: 144, k: 2, base: 8 }; // ⚡ #44 각성 GPT 시트 = 원래 v7 과 같은 칸
// 🫁 대기 = PixelLab 숨쉬기 8프레임 · 34명 모두 (#169 시험 → #170 · DECISIONS 「🧍 v1.0 용사 대기 = PixelLab 숨쉬기 34명」) — 되돌리기 = on: false 한 줄 (파일 하나: 줄 = 용사 번호 · 칸 80 × 64 · 8칸)
//   그 용사 줄에 그림이 있을 때만 · 새 화풍 세밀 시트(HERO_HD) 용사는 그 시트 그대로 · 늘이기 없이 칸만 차례로(약 1.3초에 8장)
export const IDLE8 = { on: true, src: 'art/heroes/hero-idle8-pl-v4.webp', frames: 8, rows: 34, ms: 1300, has: Array.from({ length: 34 }, (_, i) => i),
  /** 정중앙 (#121): 8칸을 합친 보이는 상자(알파 > 40) 가운데 → 칸 가운데 · 발 → 칸 바닥 = [dx, dy] */ nd: {0: [6, 1], 1: [8, 1], 2: [8, 1], 3: [14, 1], 4: [5, 1], 5: [2, 1], 6: [4, 1], 7: [7, 1], 8: [4, 1], 9: [18, 1], 10: [10, 1], 11: [9, 1], 12: [6, 1], 13: [10, 1], 14: [8, 1], 15: [12, 1], 16: [6, 1], 17: [13, 1], 18: [11, 1], 19: [16, 1], 20: [12, 1], 21: [14, 1], 22: [7, 1], 23: [4, 1], 24: [4, 1], 25: [8, 1], 26: [10, 1], 27: [10, 1], 28: [10, 1], 29: [11, 1], 30: [0, 1], 31: [3, 1], 32: [5, 1], 33: [8, 1]} as Record<number, [number, number]> };
export const idle8Of = (id: number) => (IDLE8.on && IDLE8.has.includes(id) && !HERO_HD[heroOf(id).sprite || ''] ? `${import.meta.env.BASE_URL}${IDLE8.src}` : null);
import IDLE8_HD_MAP from './idle8-hd-map.json';
// 🫁 #63 세밀화(HERO_HD v5) 용사 숨쉬기 8장 (PixelLab · 2026-11-18): 용사마다 띠 하나 `hero-<이름>-idle8-v1.webp` · 칸 256 × 144 × 8 = v5 시트 칸과 같은 크기 · 같은 발 자리(k=2 · base=8)
//   대기(idle) 줄만 이 띠로 · 1.3초에 8장 · 띠가 없거나 못 받으면 v5 시트 대기 4칸 그대로 · 되돌리기 = on: false 한 줄
export const IDLE8_HD = { on: true, frames: 8, ms: 1300, map: IDLE8_HD_MAP as Record<string, string> };
/** ✨ 숨쉬기 빛 칸 (📜 2026-11-20 선생님 「녹스 대검 빨간 줄 · 게임 안 코드로 깜빡」): 같은 8칸 띠 · 빛나는 픽셀만 · 1.2초 주기로 켰다 껐다 (폰 CSS · TV Pixi) */
export const IDLE8_GLOW: Record<string, string> = { 'hero-dknight-idle8-v8b.webp': 'hero-dknight-idle8-glow-v8.webp' };
export const GLOW_MS = 1200;
export const glowOf = (idle8Url: string | null): string | null => { const n = idle8Url?.split('/').pop() || '', g = IDLE8_GLOW[n]; return g ? idle8Url!.replace(n, g) : null; };
export const idle8HdOf = (id: number): string | null => { const f = heroOf(id).sprite || '', n = IDLE8_HD.on && HERO_HD[f] ? IDLE8_HD.map[f] : undefined; return n ? `${import.meta.env.BASE_URL}art/heroes/${n}` : null; };
const hd8Seen = new Map<string, Promise<boolean>>();
/** 띠 그림을 받아 둠 (보이는 용사만 · 한 번) → 받았으면 true · 실패 = false (그때는 v5 시트 4칸) */
export function idle8HdReady(url: string): Promise<boolean> {
  let p = hd8Seen.get(url);
  if (!p) { p = typeof Image === 'undefined' ? Promise.resolve(false) : new Promise<boolean>((ok) => { const im = new Image(); im.onload = () => ok(true); im.onerror = () => ok(false); im.src = url; }); hd8Seen.set(url, p); }
  return p;
}
/** 👑 머리 자리 (tools/make-hero-head.py · 「후광 = 머리 뒤 중앙」 2026-11-13): [가로(보이는 상자 가운데에서), 높이(발에서 위로)] · 옛 칸 80 × 64 px · idle8 = 캠프 숨쉬기 시트 */
export function heroHead(id: number, idle8 = false): [number, number] {
  const H = (BBOX as unknown as { heads?: Record<string, [number, number]> }).heads ?? {};
  return H[idle8 && idle8Of(id) ? `idle8:${id}` : heroOf(id).sprite || 'hero-sword-v3c.webp'] ?? [0, 37];
}
/** 그리는 칸: cw · ch = 그림 칸 · w · h = 화면 칸 · dx · dy = 옛 80 × 64 칸 왼쪽 위에서 그릴 상자까지(배율 1 기준) */
export function heroGeo(id: number) {
  const f = heroOf(id).sprite || 'hero-sword-v3c.webp', hd = HERO_HD[f];
  if (!hd) return { hd: false, cw: HERO.w, ch: HERO.h, k: 1, w: HERO.w, h: HERO.h, dx: 0, dy: 0, base: 0 };
  const w = hd.cw / hd.k, h = hd.ch / hd.k;
  return { hd: true, cw: hd.cw, ch: hd.ch, k: hd.k, w, h, dx: (HERO.w - w) / 2, dy: HERO.h - h + hd.base / hd.k, base: hd.base };
}
export function heroNudge(id: number, row: number): { dx: number; dy: number } {
  const f = heroOf(id).sprite || 'hero-sword-v3c.webp';
  if (HERO_HD[f]) return { dx: 0, dy: 0 }; // 새 화풍 = 자를 때 이미 가운데 · 발 맞춤
  const rows = (BBOX.heroes as unknown as Record<string, Record<string, Box>>)[f];
  const base = rows?.[row === HERO.sitRow ? '8' : '0'], own = rows?.[String(row)] ?? base;
  if (!base || !own) return { dx: 0, dy: 0 };
  return { dx: HERO.w / 2 - (base[0] + base[2]) / 2, dy: HERO.h - own[3] };
}
/** 몬스터 칸(줄 · 자세 열)의 보이는 부분 → 가운데 · 발 맞춤 (칸 크기 기준 비율) */
/** 몬스터 칸 상자 (2배 구운 시트 = 원본 상자 × 2) */
function bbOf(src: string, row: number, col: number): Box | null {
  const f = src.split('/').pop() ?? '', x2 = f.endsWith('x2.webp'), b = (BBOX.monsters as unknown as Record<string, Record<string, Box | null>>)[x2 ? f.replace('x2.webp', '.webp') : f]?.[`${row}:${col}`];
  return b && x2 ? (b.map((v) => v * 2) as Box) : b ?? null;
}
export function monNudge(src: string, row: number, col: number, cell: number): { dx: number; dy: number } {
  const b = bbOf(src, row, col);
  return b ? { dx: (cell / 2 - (b[0] + b[2]) / 2) / cell, dy: (cell - b[3]) / cell } : { dx: 0, dy: 0 };
}
/** ⚔ 몬스터 보이는 몸통 (칸 비율 「x0,y0,x1,y1」 · 정식 bodies 자리 · fx/attack.ts body) */
export function monBody(src: string, row: number, col: number, cell: number): string {
  const b = bbOf(src, row, col);
  return b ? b.map((v) => (v / cell).toFixed(3)).join(',') : '';
}
/** 몬스터 칸의 보이는 높이 (칸 대비 비율 · 체력 막대를 머리 바로 위에 놓을 때) */
export function monVis(src: string, row: number, col: number, cell: number): number {
  const b = bbOf(src, row, col);
  return b ? (b[3] - b[1]) / cell : 1;
}
/** 용사 그림 주소 · id 를 안 주면 이 기기에 저장된 출전 용사 */
export const heroUrl = (id: number = savedLook().hero) => `${import.meta.env.BASE_URL}art/heroes/${heroOf(id).sprite || 'hero-sword-v3c.webp'}`;
/** 용사 얼굴(소개 카드) = 정식 hero-portraits-v2 6 × 6 */
export const portraitOf = (id: number) => { const c = PORTRAITS.list[String(id)] ?? PORTRAITS.list[String(baseOf(id))]; return c ? { url: `${import.meta.env.BASE_URL}art/heroes/${PORTRAITS.src}`, cols: PORTRAITS.cols, rows: PORTRAITS.rows, c } : null; };

// 🏕 캠프 v2 (📜 2026-11-18 선생님 시안 · 머리 #71 · 원본 픽셀 1182 × 1330 · 자리표 = hero-v2 docs/handoff/assets/camp2/README)
//   배경 = 텐트 · 던전 문(횃불) · 성채가 그려진 빈 배경 · 물건 = 투명 그림 한 줄(① 평소 ② 상태 ③~⑥ 누름 반응 4칸 · 텐트 = 평소 + 반응 4칸)
const A = (f: string) => `${import.meta.env.BASE_URL}art/camp/${f}`;
/** 원본 px 상자 → 캠프 그림 % (left · bottom · width) */
const at = (x: number, y: number, w: number, h: number) => ({ left: +((x / 1182) * 100).toFixed(2), bottom: +(((1330 - y - h) / 1330) * 100).toFixed(2), width: +((w / 1182) * 100).toFixed(2), aspect: `${w} / ${h}` });
export const CAMP = {
  size: [1182, 1330] as const,
  bg: A('camp2-bg-v2.webp'), // 📜 #71 덧: 성채 뺀 배경 · 성채 = 겹침 그림 2장
  // 🏰 성채 = 배경에 그려짐 · 열림 = 둘레 금빛 빛무리(코드 · 「성채 불 켜짐」 그림 전 임시) / ⛺ 텐트 = 배경 + 같은 자리 반응 그림(누를 때만) / 🚪 던전 문 = 배경 · 열림 = 빛(코드)
  zones: { castle: [507, 154, 902, 380], tent: [290, 405, 540, 555], gate: [860, 330, 1020, 580] } as Record<string, [number, number, number, number]>,
  /** 🏰 성채 = 평소 dark · 성채 열림 = lit(창 불 · 금빛) · 같은 자리 겹침 */
  castle: { dark: A('camp2-castle-dark-v1.webp'), lit: A('camp2-castle-lit-v1.webp'), ...at(474, 149, 461, 231) },
  /** 🚪 던전 문 닫힘(나무 문) = 문 부분만 겹침 · 3상태: 닫힘 / 🔥 탐사 가능(닫힌 문 + 횃불 크게 · 문틈 주황) / ⚔ 수업 열림(배경 파란 문) */
  gateClosed: { src: A('camp2-gate-closed-v1.webp'), ...at(905, 355, 140, 175), torch: { left: 89.3, top: 30.8 }, crack: { left: 82.5, top: 30.5, height: 7.5 } },
  tentFx: { src: A('camp2-tent-v1.webp'), cols: 5, ...at(298, 402, 248, 156) },
  /** 🔥 모닥불 + 그루터기 = 4칸 불꽃 루프 (선생님 GPT fire-4 · 📜 #71 덧) */
  fire: { src: A('camp2-fire-v1.webp'), cols: 4, rows: 1, frames: 4, ms: 150, aspect: 470 / 218, ...(({ left, bottom, width }) => ({ left, bottom, width }))(at(360, 737, 470, 218)) },
  // ⚠ 물건 자리는 아래 CAMP_PROPS 한 곳 (학생 캠프 · 교사 「나」 내 캠프 · 테스트 모드 · 체험판이 모두 이 표를 읽음)
  hero: { left: 34, bottom: 22 },
};

// 🏕 캠프 물건 자리표 = 한 곳 (🔨 2026-11-13 밤 「캠프라는 캠프는 모두 지침대로」 · 📜 2026-11-18 새 캠프 자리)
//   📋 게시판(k = 'dummy') 왼쪽 가운데 · 📮 우편함 왼쪽 아래 · 🎯 허수아비 + 무기 걸이 = 던전 문 가는 길 앞 · ✏ 출제 공방 책상(k = 'tent') = 오른쪽 아래 구석(시안의 62%) · ⚒ 모루 = 텐트 앞
//   칸: ① 평소(0) · ② 상태(1 · 게시판 모집 중 · 우편함 새 소식 · 허수아비 맞음 · 책상 새 소식) · ③~⑥ 누름 반응 4칸(2~5)
export type CampPropKey = 'anvil' | 'scare' | 'dummy' | 'mail' | 'tent';
export interface CampProp { k: CampPropKey; src: string; cols: number; aspect: string; left: number; bottom: number; width: number; feat?: 'forge' | 'scarecrow' | 'board' | 'author'; state?: number; react?: number[] }
const R4 = [2, 3, 4, 5];
export const CAMP_PROPS: CampProp[] = [
  { k: 'dummy', src: A('camp2-board-v1.webp'), cols: 6, ...at(43, 510, 454, 360), feat: 'board', state: 1, react: R4 },
  { k: 'mail', src: A('camp2-mail-v1.webp'), cols: 6, ...at(58, 876, 332, 324), state: 1, react: R4 },
  { k: 'scare', src: A('camp2-scare-v1.webp'), cols: 6, ...at(690, 516, 299, 254), feat: 'scarecrow', state: 1, react: R4 },
  { k: 'tent', src: A('camp2-desk-v1.webp'), cols: 6, ...at(890, 876, 243, 237), feat: 'author', state: 1, react: R4 },
  { k: 'anvil', src: A('anvil-v1.webp'), cols: 3, ...at(440, 545, 165, 165), feat: 'forge' },
];
/** 🌀 파란 포털 (정식 dportal-bonus · 게시판 오른쪽 아래 바닥) · 크기 = 평소 0.15(불씨) · 모집 0.85 · 출발 1.0 */
/** 📋 게시판 옆 「같이 하자」 용사 자리 (캠프 그림 % · 11/17 #9 · 게시판 아래 · 우편함 오른쪽) */
export const CAMP_BUDDY = { left: 54, bottom: 1 };
export const CAMP_PORTAL = { src: A('obj-portal-v1.webp'), left: 33, bottom: 34.5, width: 7, aspect: '200 / 300', scale: { idle: 0.15, recruit: 0.85, open: 1 } }; // 📜 2026-11-15 캠프 A: 모집 중 = 0.85
export const campProp = (k: CampPropKey) => CAMP_PROPS.find((p) => p.k === k)!;
export const propPos = (p: { left: number; bottom: number; width: number }) => `left:${p.left}%;bottom:${p.bottom}%;width:${p.width}%`;
/** 그림 칸 한 장 (cols 칸 중 col 번째) */
export const cellBg = (src: string, cols: number, col: number) => `background-image:url(${src});background-size:${cols * 100}% 100%;background-position:${cols > 1 ? (col / (cols - 1)) * 100 : 0}% 0`;

// 🧊 얼음 공격 그림 (정식 hero-v2 12e8be3 docs/handoff/ice · 2026-11-13 밤) — 칸 5개 · 알파로 잘라 기준선 맞춤 · 가운데 반투명 그대로
//   btn = 노란 단추: ① 멀쩡 ② 금 하나 ③ 별 금 ④ 크게 금 ⑤ 깨져 흩어짐 (bar = 단추 몸이 있는 줄 · 단추 가운데에 맞춤)
//   tv = 용사 얼음: ① 발밑 서리 ② 반 ③ 다 얼음 ④ 녹으며 물방울 ⑤ 거의 녹음 (발 기준선 = 칸 아래)
/** ⛓ 속박 사슬 그림 (📜 2026-11-14 🎨 chain-bind · 6칸: ① 왼쪽 날아옴 ② 오른쪽 날아옴 ③ X 교차 ④ 철컥 번쩍 ⑤ 금 · 불티 ⑥ 조각나 흩어짐) */
export const CHAIN = { src: `${import.meta.env.BASE_URL}art/chain/chain-bind-v1.webp`, n: 6 };
export const ICE = {
  /** ❄ 얼음 결정 조각 8종 (📜 2026-11-14 🎨 ice-crystal · 정식 ce40993 · 96 × 96 칸: 0 가시 · 1 육각 · 2 세 갈래 · 3 눈송이 · 4 깨진 조각 · 5 반짝이 · 6 휜 조각 · 7 덩어리) — 용사 얼음 · ❄ 맞는 순간 파편 · 🧊 단추 깨짐 */
  crystal: { src: `${import.meta.env.BASE_URL}art/ice/ice-crystal-v1.webp`, n: 8, cell: 96 },
  btn: { src: `${import.meta.env.BASE_URL}art/ice/ice-btn-v1.webp`, cols: 5, w: 206, h: 342, barTop: 130, barBot: 210 },
  tv: { src: `${import.meta.env.BASE_URL}art/ice/ice-tv-v1.webp`, cols: 5, w: 202, h: 352 },
};

// 🏕 쉼터 놀이 그림 · 배경음 (#142-2 · 정식 manifest fun · td · bgm 에서 옮김) — 교실 TV 에서만
export const FUN_BG: Record<string, string> = { bal: 'art/fun/fun-arena-v1.webp', rev: 'art/fun/fun-dorm-v1.webp', quiz: 'art/fun/fun-ox-safe-v1.webp', nun: 'art/fun/fun-arena-v1.webp' };
export const TD_ART: Record<string, string> = { forest: 'art/td/td-forest-v1.webp', volcano: 'art/td/td-volcano-v1.webp', ice: 'art/td/td-ice-v1.webp', desert: 'art/td/td-desert-v1.webp', crypt: 'art/td/td-crypt-v1.webp' };
/** ⚖ 🔄 ⭕ 쉼터 무대 그림 (정식 manifest fun 그대로 · 📜 2026-11-15 「미니게임 연출 = 정식과 같게」): bg 다리 · plat 발판 2칸(멀쩡 · 금 감) · bgRev 숙소 · bgOx 낭떠러지(수학 OX) · bgQuiz 바닥 다 있음(OX 타임) · ox ⭕ ❌ 발판 + 무너지는 발판 */
export const FUN_ART = { bg: 'art/fun/fun-arena-v1.webp', plat: 'art/fun/fun-plat-v2.webp', platFrames: 2, bgRev: 'art/fun/fun-dorm-v1.webp', bgOx: 'art/fun/fun-ox-pit-v1.webp', bgQuiz: 'art/fun/fun-ox-safe-v1.webp', ox: { a: 'art/fun/fun-ox-o-v1.webp', b: 'art/fun/fun-ox-x-v1.webp', aBreak: 'art/fun/fun-ox-o-break-v1.webp', bBreak: 'art/fun/fun-ox-x-break-v1.webp' } } as const;
export const BGM: Record<string, string> = { camp: 'bgm/camp-campfire-v1.mp3' /* 📜 2026-11-20 선생님 「캠프 배경음 이걸로」 */, lobby: 'bgm/lobby-v1.mp3', 'raid-1': 'bgm/raid-1-v1.mp3', 'raid-2': 'bgm/raid-2-v1.mp3', 'raid-3': 'bgm/raid-3-v1.mp3', 'boss-1': 'bgm/boss-1-v1.mp3', 'boss-2': 'bgm/boss-2-v1.mp3', win: 'bgm/win-v1.mp3', rest: 'bgm/rest-v1.mp3', bal: 'bgm/bal-v1.mp3', rev: 'bgm/rev-v1.mp3', quiz: 'bgm/ox-v1.mp3', nun: 'bgm/nun-v1.mp3', td: 'bgm/td-v1.mp3' };
export const artUrl = (p: string) => `${import.meta.env.BASE_URL}${p}`;

//   CSS 변수(url) 로 넘기므로 절대 주소 (상대 주소는 그 변수를 쓰는 스타일 파일 기준으로 풀려 assets/ 아래를 가리킴)
export const absArt = (p: string) => (typeof document !== 'undefined' ? new URL(artUrl(p), document.baseURI).href : artUrl(p));
// ✏ 출제 책상 (obj-quest · 캠프 물건 꼴 192 × 96 · 칸 96 · ① 평소 ② 새 소식) — 캠프 자리 · 기능은 출제 공방 시안 컨펌 뒤
export const QUEST_DESK = { src: artUrl('art/camp/obj-quest-v1.webp'), cols: 2 };
// 💫 #161 상태이상 그림(정식 status-v1 · 칸 80 × 80 · 6칸 × 8줄 = 속성) · 몬스터 → 용사 속성 이펙트(정식 pfx 띠 재사용 · pixelfx MIT) · 속성 소리
export const STATUS = { src: 'art/status-v1.webp', w: 80, h: 80, cols: 6, ms: 600, kinds: ['stun', 'freeze', 'bind', 'burn', 'poison', 'shock', 'confuse', 'sleep'] as const };
export const ELEM_FX: Record<string, { src: string; w: number; h: number; n: number; fps: number; sfx: string }> = {
  stun: { src: 'art/pfx/fx-bash-v1.webp', w: 91, h: 81, n: 14, fps: 15, sfx: 'smash' },
  // 🌪 바람 공격 = 👍 받은 용사 스킬 🌬 질풍 띠 (📜 2026-11-13 밤 「바람이면 플레이어 스킬 중에 바람 스킬 하나 가져다 써」) · Scene 이 atkId 'wind' 일 때
  gale: { src: 'art/pfx/fx-gale-v1.webp', w: 152, h: 89, n: 17, fps: 15, sfx: 'wind' },
  freeze: { src: 'art/pfx/fx-frost-v1.webp', w: 126, h: 115, n: 19, fps: 15, sfx: 'frost' },
  bind: { src: 'art/pfx/fx-bind-v1.webp', w: 138, h: 81, n: 20, fps: 15, sfx: 'block' },
  burn: { src: 'art/pfx/fx-flame-v1.webp', w: 199, h: 165, n: 16, fps: 15, sfx: 'fire' },
  poison: { src: 'art/pfx/fx-void-v1.webp', w: 162, h: 130, n: 22, fps: 15, sfx: 'magic' },
  shock: { src: 'art/pfx/fx-spark-v1.webp', w: 129, h: 104, n: 14, fps: 15, sfx: 'spark' },
  confuse: { src: 'art/pfx/fx-vortex-v1.webp', w: 150, h: 114, n: 22, fps: 15, sfx: 'wind' },
  sleep: { src: 'art/pfx/fx-twinkle-v1.webp', w: 110, h: 110, n: 16, fps: 15, sfx: 'magic' },
};
export const SFX: Record<string, string> = { swing: 'sfx/swing-v2.mp3', launch: 'sfx/launch-v2.mp3', cut: 'sfx/cut-v2.mp3', sweep: 'sfx/sweep-v2.mp3', star: 'sfx/star-v2.mp3', special: 'sfx/special-v2.mp3', finish: 'sfx/finish-v2.mp3', finish2: 'sfx/finish-v2b.mp3', holy: 'sfx/holy-v2.mp3', correct: 'sfx/correct-v2.mp3', smash: 'sfx/smash-v2.mp3', frost: 'sfx/frost-v2.mp3', block: 'sfx/block-v2.mp3', blockB: 'sfx/block-wood-b-v1.mp3', blockC: 'sfx/block-wood-c-v1.mp3', fire: 'sfx/fire-v2.mp3', magic: 'sfx/magic-v2.mp3', spark: 'sfx/spark-v2.mp3', wind: 'sfx/wind-v2.mp3', hurt: 'sfx/hurt-v2.mp3', click: 'sfx/click-v2.mp3' , /* 🔊 효과음 2차 (📜 2026-11-14 선생님 「효과음 평가 끝」 · 42종 1위 · 정식 hero-v2 docs/handoff/sfx/round2) */ 'board': 'sfx/r2/board-v1.mp3', 'castle-open': 'sfx/r2/castle-open-v1.mp3', 'chain-break': 'sfx/r2/chain-break-v1.mp3', 'chain-lock': 'sfx/r2/chain-lock-v1.mp3', 'class-start': 'sfx/r2/class-start-v1.mp3', 'combo': 'sfx/r2/combo-v1.mp3', 'countdown': 'sfx/r2/countdown-v1.mp3', 'dizzy': 'sfx/r2/dizzy-v1.mp3', 'door-close': 'sfx/r2/door-close-v1.mp3', 'dummy-hit': 'sfx/r2/dummy-hit-v1.mp3', 'energy-card': 'sfx/r2/energy-card-v1.mp3', 'enh-fail': 'sfx/r2/enh-fail-v1.mp3', 'enh-great': 'sfx/r2/enh-great-v1.mp3', 'enh-ok': 'sfx/r2/enh-ok-v1.mp3', 'fire-out': 'sfx/r2/fire-out-v1.mp3', 'focus': 'sfx/r2/focus-v1.mp3', 'fog-clear': 'sfx/r2/fog-clear-v1.mp3', 'game-no': 'sfx/r2/game-no-v1.mp3', 'game-ok': 'sfx/r2/game-ok-v1.mp3', 'glitch': 'sfx/r2/glitch-v1.mp3', 'heart-break': 'sfx/r2/heart-break-v1.mp3', 'heart-up': 'sfx/r2/heart-up-v1.mp3', 'hero-pick': 'sfx/r2/hero-pick-v1.mp3', 'holy-on': 'sfx/r2/holy-on-v1.mp3', 'ice-crack': 'sfx/r2/ice-crack-v1.mp3', 'ice-shatter': 'sfx/r2/ice-shatter-v1.mp3', 'ink': 'sfx/r2/ink-v1.mp3', 'lock': 'sfx/r2/lock-v1.mp3', 'mail': 'sfx/r2/mail-v1.mp3', ach1: 'sfx/r2/ach-1-v1.mp3', ach2: 'sfx/r2/ach-2-v1.mp3', ach3: 'sfx/r2/ach-3-v1.mp3', 'mon-appear': 'sfx/r2/mon-appear-v1.mp3', 'mon-appear-boss': 'sfx/r2/mon-appear-boss-v1.mp3', 'plus5': 'sfx/r2/plus5-v1.mp3', 'poison': 'sfx/r2/poison-v1.mp3', 'portal': 'sfx/r2/portal-v1.mp3', 'raise-hand': 'sfx/r2/raise-hand-v1.mp3', 'retry-start': 'sfx/r2/retry-start-v1.mp3', 'scout-start': 'sfx/r2/scout-start-v1.mp3', 'scroll': 'sfx/r2/scroll-v1.mp3', 'skill-unlock': 'sfx/r2/skill-unlock-v1.mp3', 'star-bonus': 'sfx/r2/star-bonus-v1.mp3', 'true-ult': 'sfx/r2/true-ult-v1.mp3', /* ⚡ #83 B1 각성 컷인 = 「금빛 합창」 a (📜 11/20) */ 'awaken-cutin': 'sfx/awk/awaken-cutin-a-v1.mp3', 'wake': 'sfx/r2/wake-v1.mp3', 'yawn': 'sfx/r2/yawn-v1.mp3' };
// 📕 오답노트 아이콘 (정식 manifest note · note-icons-v1 · 칸 128 · 8칸 = 틀림 · 안 풂 · 맞힘 · 보충 · 도전 별 · 알림 배지 · 노트 완성 · 책) · 🎯 허수아비 칸마다
export const NOTE_ICON = { src: artUrl('art/note-icons-v1.webp'), n: 8, idx: { x: 0, '-': 1, n: 1, a: 1, o: 2, f: 2, p: 3, star: 4, c: 4, badge: 5, done: 6, book: 7 } as Record<string, number> };
/** 🎒 오늘의 전리품 상자 (📜 2026-11-17 #7 = 옛 정식 assets/art/thrill-chest-v1.webp · 3칸 128×128: ① 닫힘 ② 흔들림(반짝 선) ③ 열림 + 금빛) */
export const CHEST = { src: `${import.meta.env.BASE_URL}art/thrill/thrill-chest-v1.webp`, frames: 3 };

// 👹 몬스터 맞는 그림 10종 (🔨 #26 · 📜 2026-11-20 선생님 「초안 그대로 넣기」 · 머리 hv2 3137ef2)
//   시트 = 6칸 256 × 256 가로 · 투명 · 칸 순서 = 시작 → 큰 타격 → 사라짐 · 0.42초 · 오른쪽 → 왼쪽 그대로 · 보스 = 1.5배
//   짝 = 과목 팩 SUBJ.monsterHit (subjects/…/mhit-map.json · 「시트줄|몬스터 이름」 → 종류 · 130마리) · 없는 몬스터 = smash · 레이드 · 게시판 던전이 이 함수 하나만 씀
export type MhitKind = 'claw' | 'bite' | 'smash' | 'ram' | 'lash' | 'fire' | 'ice' | 'bolt' | 'poison' | 'beam';
export const MHIT_KINDS: MhitKind[] = ['claw', 'bite', 'smash', 'ram', 'lash', 'fire', 'ice', 'bolt', 'poison', 'beam'];
/** 빛 그림(검은 바탕에서 뽑은 것) = 더하기 섞기 */
export const MHIT_LIGHT: ReadonlySet<MhitKind> = new Set(['fire', 'ice', 'bolt', 'poison', 'beam']);
export const MHIT = { frames: 6, cell: 256, ms: 420, boss: 1.5 } as const;
export const mhitUrl = (k: MhitKind) => `${import.meta.env.BASE_URL}art/mhit/mhit-${k}-v1.webp`;
const MH = SUBJ.monsterHit ?? {};
const MH_NAME: Record<string, MhitKind> = {};
for (const [key, v] of Object.entries(MH)) { const nm = key.split('|')[1]; if (nm && !(nm in MH_NAME)) MH_NAME[nm] = v as MhitKind; }
/** 몬스터 그림 ref(예 'extra:4' · 'd01:2' · 'bg1:0') → 맞는 그림 종류 */
export function mhitOf(ref: string | undefined | null): MhitKind {
  if (!ref) return 'smash';
  try {
    const sp = spriteOf(ref), nm = sp.sheet.names[sp.row] ?? '';
    const [k0 = '', i0 = '0'] = ref.replace(/@.*$/, '').split(':');
    const hit = MH[`${k0}${i0}|${nm}`] ?? MH[`${k0}|${nm}`] ?? MH_NAME[nm];
    return (MHIT_KINDS as string[]).includes(hit ?? '') ? (hit as MhitKind) : 'smash';
  } catch { return 'smash'; }
}
/** 👹 공격 종류 → 맞는 그림 (📜 게시판 던전 요청 #40 ①) · 표에 없는 종류(기본 · 광역 · 저울 · 수면 · 혼란 · 물결) = 그 보스 짝(mhitOf) 그대로 · 레이드(#26)는 공격 종류가 따로 없어 지금 그대로 */
export const ATK_HIT: Readonly<Record<string, MhitKind>> = { smash: 'smash', poison: 'poison', fire: 'fire', fire13: 'fire', ice: 'ice', frost: 'ice', tail: 'lash', tongue: 'lash', bind: 'lash', dark: 'beam', darkHit: 'beam', mirror: 'beam' };
export const atkHitOf = (atk: string | undefined, ref: string | undefined | null): MhitKind => (atk && ATK_HIT[atk]) || mhitOf(ref);
