// 📖 기호 톡 누른 횟수 = 정식 js/engine/symtalk.js 그대로 (📜 2026-11-15 머리 🔨 「대시보드 = 옛 정식 그대로」 기호 톡)
//   xp/{반}/{번호}/st/{차시}/{기호 id} = 누른 횟수 · 로그인한 그 학생 폰만(meBound) · 1.5초 모아서 한 번에 · 기록은 덤(실패해도 화면은 그대로)
//   교사 대시보드 「기호 톡」 = rank() (많이 누른 순 · 차시 거르기) · 벌 · 보상 없음 · 테스트 · 교사 · TV 는 안 셈
import type { Store } from '../model/types';
import { meBound } from '../store/meSync';

let lesson = '';
const pend: Record<string, number> = {};
let timer: ReturnType<typeof setTimeout> | null = null, store: Store | null = null;
const safe = (k: string) => String(k).replace(/[.#$/[\]]/g, '_');
/** 지금 문제의 차시 (문제 화면이 열릴 때 정함) */
export const setSymLesson = (lid: string) => { lesson = lid || ''; };
/** 기호 하나 누름 → 그 학생 칸에 +1 (모아서) */
export function tapSym(id: string) {
  const b = meBound(); if (!b || !lesson || !id) return;
  store = b.S; const p = `xp/${b.cls}/${b.num}/st/${safe(lesson)}/${safe(id)}`;
  pend[p] = (pend[p] || 0) + 1;
  if (timer) clearTimeout(timer); timer = setTimeout(flushSym, 1500);
}
export function flushSym() {
  timer = null; const S = store; if (!S) return;
  for (const p of Object.keys(pend)) { const add = pend[p]!; delete pend[p]; try { S.set(p, (Number(S.get(p)) || 0) + add); } catch { /* 기록은 덤 */ } }
}
/** 대시보드: 학생마다 st → [{ id, n(누른 수), who(누른 학생) }] 많이 누른 순 · lesson = 차시 거르기(없으면 모두) · 사전에 있는 기호만 */
export function rank(stByStud: (Record<string, Record<string, number> | null> | null | undefined)[], known: (id: string) => boolean, lid = '') {
  const agg: Record<string, { n: number; who: number }> = {};
  for (const st of stByStud) {
    const mine: Record<string, number> = {};
    for (const [l, bySym] of Object.entries(st || {})) { if (lid && l !== lid) continue; for (const [id, n] of Object.entries(bySym || {})) mine[id] = (mine[id] || 0) + (Number(n) || 0); }
    for (const [id, n] of Object.entries(mine)) { if (!n) continue; const a = (agg[id] ||= { n: 0, who: 0 }); a.n += n; a.who++; }
  }
  return Object.entries(agg).filter(([id]) => known(id)).map(([id, a]) => ({ id, ...a })).sort((a, b) => b.n - a.n);
}
