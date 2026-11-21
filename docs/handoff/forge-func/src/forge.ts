/* eslint-disable @typescript-eslint/no-explicit-any */
// ⚒ 모루 연성법 모양 (#148 · 정식 DS.Unit · cardKit) — 값은 과목 팩이 줌
export interface ForgeCard { id: string; no: number; sec: string; name: string; short?: string; fm: string; mf?: string; desc: string; grade: 1 | 2 | 3; art: number; page: string; op: string; in: string[]; ordered?: boolean; alt?: { op: string; in: string[] }[]; hint: string; ex: any }
export interface ForgeUnit {
  MATS: { id: string; sym: string; tip: string }[]; OPS: { id: string; sym: string; no: number; unary?: boolean }[]; CARDS: ForgeCard[]; MISTAKES: Record<string, string>;
  card(id: string): ForgeCard | undefined; opOf(id: string): { id: string; sym: string; no: number; unary?: boolean } | undefined; opens(no: number): ForgeCard[];
  forge(op: string | null, left: string | null, right: string | null, no: number): { ok: true; card: ForgeCard } | { ok: false; msg: string };
  recipes(c: ForgeCard): { op: string; in: string[]; ordered: boolean }[]; GRADES: Record<number, string>;
}
export interface CardKit { frame: string; w: number; h: number; arts: { src: string; cols: number; rows: number; map: Record<string, number> }; box: Record<'top' | 'art' | 'desc' | 'fm' | 'plate' | 'gem', [number, number, number, number]> }
