// 📕 오답노트 (v0.9.7.9 · 사용자 확정 2026-11-04): 문제마다 「틀림 · 안 풂 · 맞힘 · 보충 완료」를 밖에서 보이게
//   기록: records/{반}/{번호}/{차시}.mons = { 몬스터: o | f | x | - | n } · .bossM = 형성평가 문항마다 'oox-n' (⭐ 도전 문항 포함)
//     o 한 번에 · f 재도전으로 고침 · x 끝까지 못 맞힘 · - 나만 안 함(먼저 나감 · 늦게 옴) · n 반 전체가 수업에서 안 함(시간 부족) · 기록 없음 = 불참
//   보충: 🟪 중단원던전 그 층에서 수업 문제(같은 몬스터 · 숫자만 바뀜)를 처치 → bonus/{반}/{번호}/{차시}/{몬스터}.clear · 👑 재대결 처치 → 형성평가 남은 문항 모두 보충
//   아이콘: assets note (사용자 생성 시트 8칸) · 틀림 · 안 풂 칩은 깜빡임
window.DS = window.DS || {};

DS.Note = (function () {
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const OPEN = { x: 1, '-': 1, n: 1 }; // 아직 해결 안 됨
  const WHY = { x: '틀림 (기회를 다 씀)', '-': '안 풂 (먼저 나감 · 늦게 옴)', n: '안 풂 (수업 시간 부족)', a: '안 풂 (불참)', o: '한 번에 맞힘', f: '재도전으로 고침', p: '보충 완료' };
  const monIds = (L) => L.steps.filter((s) => s.kind === 'monster' && L.monsters[s.id]).map((s) => s.id);
  const lessons = (no) => DS.Lessons.list.filter((l) => l.no && !l.eval && l.boss && l.no <= (Number(no) || 0)).sort((a, b) => a.no - b.no);
  // 한 차시: rec = records 의 그 차시 (없으면 불참) · bon = bonus 의 그 차시
  function lesson(L, rec, bon) {
    bon = bon || {};
    const ids = monIds(L), hp = L.boss.hpItems || L.boss.items, nb = L.boss.items;
    let mons, boss;
    if (!rec) { mons = ids.map(() => 'a'); boss = Array.from({ length: nb }, (_, i) => (i < hp ? 'a' : '')); }
    else {
      const miss = Array.isArray(rec.miss) ? rec.miss : Object.values(rec.miss || {}); // DB 는 배열을 객체로 줄 때가 있음
      mons = ids.map((id) => (rec.mons && rec.mons[id]) || (miss.includes(id) ? 'x' : 'o')); // 옛 기록(문제별 칸 없음): 못 맞힌 몬스터만 x
      const bm = rec.bossM || (() => { const k = Math.min(Number(rec.boss) || 0, hp); return Array.from({ length: hp }, (_, i) => (i < k ? 'o' : rec.boss ? 'x' : '-')).join(''); })();
      boss = Array.from({ length: nb }, (_, i) => bm[i] || (i < hp ? '-' : ''));
    }
    const fixd = (st, ok) => (ok && (OPEN[st] || st === 'a') ? 'p' : st);
    mons = mons.map((st, i) => fixd(st, !!(bon[ids[i]] || {}).clear));
    const bossClear = !!(bon.boss || {}).clear;
    boss = boss.map((st, i) => (i < hp ? fixd(st, bossClear) : st === 'o' ? 'star' : '')); // ⭐ 도전 문항: 맞혔을 때만 별
    const open = (st) => !!(OPEN[st] || st === 'a');
    const left = mons.filter(open).length + boss.slice(0, hp).filter(open).length;
    return { L, ids, mons, boss, hp, left, absent: !rec };
  }
  // 전체: records · bonus (그 학생) · unlock (반)
  //   held = held/{반} (그 반이 게임으로 수업한 차시) — 기록도 없고 수업도 안 한 차시는 빼고 (예: 1-2반 2 · 3차시는 게임 전에 함)
  function all(records, bonus, no, held) {
    const list = lessons(no).filter((L) => (records || {})[L.id] || (held || {})[L.id]).map((L) => lesson(L, (records || {})[L.id], (bonus || {})[L.id]));
    return { list, left: list.reduce((a, x) => a + x.left, 0) };
  }
  // ── 그리기 ──
  const A = () => (DS.ASSETS || {}).note;
  const IDX = { x: 0, '-': 1, n: 1, a: 1, o: 2, f: 2, p: 3, star: 4, badge: 5, done: 6, book: 7 };
  function icon(k, cls = '', title = '') {
    const a = A() || { src: '' }, i = IDX[k] ?? 2;
    const vis = ['x', 'none', 'ok', 'fill', 'star', 'badge', 'done', 'book'][i];
    return `<i class="nt-ic nt-k-${vis} ${cls}${OPEN[k] || k === 'a' ? ' nt-blink' : ''}" style="background-image:url('${DS.ASSETS.base}${a.src}');background-position:${(i / 7) * 100}% 0"${title ? ` title="${esc(title)}"` : ''}></i>`;
  }
  const chips = (arr, titles) => arr.map((st, i) => (st ? icon(st, 'chip', `${titles ? titles[i] : `${i + 1}번`} · ${WHY[st] || '⭐ 도전 문항 맞힘'}`) : '')).join('');
  // 층 카드 위 두 줄 (수업 · 형성평가)
  function rows(x) {
    const t = x.ids.map((id) => (x.L.steps.find((s) => s.id === id) || {}).title || id);
    return `<div class="nt-rows${x.left ? ' open' : ''}"><div class="nt-row"><span>수업</span>${chips(x.mons, t)}</div><div class="nt-row"><span>형성평가</span>${chips(x.boss)}</div></div>`;
  }
  // 캠프 배지 (빨간 원 + 숫자 · 0 이면 금색 도장)
  const badge = (n) => (n > 0 ? `<span class="nt-badge">${icon('badge')}<b>${n > 99 ? '99+' : n}</b></span>` : `<span class="nt-badge done">${icon('done')}</span>`);
  return { lesson, all, rows, icon, badge, chips, WHY, OPEN, monIds };
})();
