// 🌱 경험치(EXP) · 레벨 · 칭호 (v0.8.0): 성적이 아니라 "얼마나 시도하고 고치고 참여했나"를 쌓는다. 순위 · 큰 화면 표시는 하지 않는다 (본인 폰 · 교사 학생 관리에서만)
// 맞힌 개수보다 시도 · 고치기 · 참여에 더 많이 준다. 같은 수업은 한 번만 쌓인다 (log 키 = 수업 코드).
// 저장: xp/{반}/{번호} = { total, log: { 키: { xp, at, why } } }
window.DS = window.DS || {};

DS.Grow = (function () {
  const N = () => DS.Net;
  const ck = (c) => String(c).replace(/[.#$/[\]]/g, '_');
  // 얻는 방법 → EXP
  const XP = { first: 1, join: 10, submit: 2, correct: 1, fixed: 3, bossWin: 10, perfect: 5, words: 2, bonusClear: 5, seal: 10, card: 3 };
  const WHY = { first: '🎁 첫 출정 축하', join: '레이드 참여', submit: '몬스터에 제출', correct: '맞힌 소문제', fixed: '재도전으로 고친 소문제', bossWin: '보스 처치 참여', perfect: '형성평가 만점', words: '마지막 한마디', bonusClear: '보강던전 처치', seal: '보강 인장', card: '모루 첫 카드' };
  const TITLES = ['견습 용사', '풋내기 용사', '용사', '숙련 용사', '기사', '정예 기사', '기사단장', '수호자', '영웅', '전설의 용사'];
  // Lv.L → L+1 에 필요한 EXP = 40 + 20 × (L − 1) — 수업 한 번(약 50~80)에 처음엔 자주, 갈수록 천천히
  const need = (lv) => 40 + 20 * (lv - 1);
  function level(total) {
    let lv = 1, rest = Math.max(0, Number(total) || 0);
    while (rest >= need(lv) && lv < 99) { rest -= need(lv); lv++; }
    const title = lv <= TITLES.length ? TITLES[lv - 1] : `${TITLES[TITLES.length - 1]} ★${lv - TITLES.length}`;
    return { lv, title, into: rest, next: need(lv), total: Number(total) || 0 };
  }
  const sum = (parts) => Object.entries(parts || {}).reduce((a, [k, v]) => a + (XP[k] || 0) * (Number(v) || 0), 0);
  const lines = (parts) => Object.entries(parts || {}).filter(([k, v]) => XP[k] && v).map(([k, v]) => ({ why: WHY[k], n: k === 'first' ? 1 : v, xp: XP[k] * v }));
  const path = (m) => `xp/${ck(m.c)}/${m.n}`;
  // 쌓기 (key 가 있으면 같은 key 는 한 번만) → { before, after, gained }
  async function add(m, parts, key) {
    if (!m || m.c == null || !m.n) return null;
    const gained = Math.min(300, sum(parts));
    const k = String(key || `${Date.now()}`).replace(/[.#$/[\]]/g, '_');
    if (key && (await N().get(`${path(m)}/log/${k}`).catch(() => null))) return null;
    const total0 = Number((await N().get(`${path(m)}/total`).catch(() => 0)) || 0);
    if (!gained) return { before: level(total0), after: level(total0), gained: 0 };
    await N().set(`${path(m)}/log/${k}`, { xp: gained, at: N().TS, why: lines(parts).map((l) => l.why).join(' · ').slice(0, 120) });
    await N().set(`${path(m)}/total`, total0 + gained);
    return { before: level(total0), after: level(total0 + gained), gained };
  }
  async function mine(m) { return level(Number((await N().get(`${path(m)}/total`).catch(() => 0)) || 0)); }
  return { XP, WHY, TITLES, need, level, sum, lines, add, mine };
})();
