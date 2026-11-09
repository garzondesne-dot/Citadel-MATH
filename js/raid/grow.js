// 🌱 경험치(EXP) · 레벨 · 칭호 (v0.8.0): 성적이 아니라 "얼마나 시도하고 고치고 참여했나"를 쌓는다. 순위 · 큰 화면 표시는 하지 않는다 (본인 폰 · 교사 학생 관리에서만)
// 참여 · 시도에 크게 준다. 2026-11-05 원칙 바뀜: 「처음 맞힘 ≥ 고쳐서 맞힘 > 포기」 — 맞힌 소문제는 처음이든 고쳐서든 같은 +2 (correct 는 고친 것도 셈) · fixed 는 기록만(0) → 일부러 틀려서 이득 보는 구멍을 막음. 같은 수업은 한 번만 쌓인다 (log 키 = 수업 코드).
// 저장: xp/{반}/{번호} = { total, log: { 키: { xp, at, why } } }
window.DS = window.DS || {};

DS.Grow = (function () {
  const N = () => DS.Net;
  const ck = (c) => String(c).replace(/[.#$/[\]]/g, '_');
  // 얻는 방법 → EXP
  const XP = { first: 1, join: 10, submit: 2, correct: 2, fixed: 0, bossWin: 10, perfect: 5, words: 2, bonusClear: 5, seal: 10, card: 3, heal: 3, train: 1, ox: 2, survey: 5, rift: 5, chainPrac: 1 };
  const WHY = { ox: '⭕ OX 타임 정답', first: '🎁 첫 출정 축하', join: '레이드 참여', submit: '몬스터에 제출', correct: '맞힌 소문제', fixed: '재도전으로 고친 소문제', bossWin: '보스 처치 참여', perfect: '형성평가 만점', words: '마지막 한마디', bonusClear: '중단원던전 처치', seal: '🏆 업적 달성', card: '모루 첫 카드', heal: '친구에게 힐', train: '허수아비 연습', survey: '📝 수업 설문 참여', rift: '⏳ 이어하기 완주', chainPrac: '🔥 연습 사슬 완성' };
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
  // opt.upsert (v0.9.7.6 · 수업 중 진행 저장): 같은 key 가 있으면 늘어난 만큼만 더함 · before = 이 key 를 받기 전 레벨 (결과 화면 레벨업 연출)
  //   opt.cache (v0.9.8.0 · 저장 줄이기): 이 기기가 이미 쓴 key 의 EXP 를 기억 → 늘어난 게 없으면 서버에 묻지도 쓰지도 않음 · 늘었을 때만 total 을 새로 읽어 더함
  const seen = {};
  async function add0(m, parts, key, opt = {}) {
    if (!m || m.c == null || !m.n) return null;
    const gained = Math.min(300, sum(parts));
    const k = String(key || `${Date.now()}`).replace(/[.#$/[\]]/g, '_'), sk = `${path(m)}|${k}`;
    if (opt.cache && opt.upsert && sk in seen && gained <= seen[sk]) return { before: null, after: null, gained: seen[sk], same: true };
    const had = key ? await N().get(`${path(m)}/log/${k}`).catch(() => null) : null;
    if (had && !opt.upsert) return null;
    if (had) {
      const old = Number(had.xp) || 0, total = Number((await N().get(`${path(m)}/total`).catch(() => 0)) || 0), d = Math.max(0, gained - old);
      if (d) { await N().set(`${path(m)}/log/${k}`, { xp: old + d, at: N().TS, why: lines(parts).map((l) => l.why).join(' · ').slice(0, 120) }); await N().set(`${path(m)}/total`, total + d); }
      if (key) seen[sk] = old + d;
      return { before: level(total - old), after: level(total + d), gained: old + d };
    }
    if (key && opt.upsert) seen[sk] = gained;
    const total0 = Number((await N().get(`${path(m)}/total`).catch(() => 0)) || 0);
    if (!gained) return { before: level(total0), after: level(total0), gained: 0 };
    await N().set(`${path(m)}/log/${k}`, { xp: gained, at: N().TS, why: lines(parts).map((l) => l.why).join(' · ').slice(0, 120) });
    await N().set(`${path(m)}/total`, total0 + gained);
    return { before: level(total0), after: level(total0 + gained), gained };
  }
  // 레벨이 오르면: 🆙 레벨업 알림(ds-levelup · 폰 축하 + 종합상황실) · 💎 레벨 5 · 10 · 15 … 보너스 (2026-11-05)
  async function add(m, parts, key, opt = {}) {
    const r = await add0(m, parts, key, opt);
    if (r && r.before && r.after && r.after.lv > r.before.lv) {
      for (let lv = r.before.lv + 1; lv <= r.after.lv; lv++) if (lv % 5 === 0 && DS.Gem) DS.Gem.add(m, DS.Gem.G.level5, `lv${lv}`, `Lv.${lv} 달성`, { free: true }).catch(() => {});
      if (typeof window !== 'undefined' && window.dispatchEvent && typeof CustomEvent !== 'undefined') window.dispatchEvent(new CustomEvent('ds-levelup', { detail: { m, before: r.before, after: r.after } }));
    }
    return r;
  }
  async function mine(m) { return level(Number((await N().get(`${path(m)}/total`).catch(() => 0)) || 0)); }
  return { XP, WHY, TITLES, need, level, sum, lines, add, mine };
})();
