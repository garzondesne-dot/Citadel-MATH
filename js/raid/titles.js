// 🏅 호칭 · 메달 (v0.9.1): 이름표 = [메달][호칭] 번호 이름 — 이름 색이 호칭 등급을 따라간다
// 등급: 일반(흰) → 파랑 → 보라 → 주황(메달). 첫 접속 때 모두 보라 [새벽의 개척자]. ⚙ 설정에서 얻은 호칭 중 하나를 달거나(또는 안 달거나) 고른다.
// 얻은 호칭은 기록(records · cards · xp · bonus)에서 그때그때 계산한다 (따로 저장하지 않음). 고른 호칭만 accounts/{반}/{번호}/title 에 저장.
// 메달 그림: 배치표 medals.rank · medals.dungeon (5열 × 2행, 사용자 제공)
window.DS = window.DS || {};

DS.Titles = (function () {
  const { esc } = DS.UI;
  const TIER = { w: { name: '일반', cls: 't-w' }, b: { name: '파랑', cls: 't-b' }, p: { name: '보라', cls: 't-p' }, o: { name: '주황', cls: 't-o' } };
  const ck = (c) => String(c).replace(/[.#$/[\]]/g, '_');
  const recs = (d) => Object.values(d.records || {});
  const cardsOf = (d, g) => (DS.Unit ? DS.Unit.CARDS.filter((c) => (d.cards || {})[c.id] && (!g || c.grade === g)) : []);
  // 호칭 목록: id · 이름 · 등급 · 메달([시트, 칸]) · 얻는 조건(글) · 판정
  const BASE = [
    { id: 'dawn', name: '새벽의 개척자', tier: 'p', medal: ['rank', 4], cond: '첫 접속 (모두)', test: () => true },
    { id: 'first', name: '첫 출정', tier: 'b', medal: ['rank', 0], cond: '첫 레이드 클리어', test: (d) => recs(d).length > 0 },
    { id: 'slayer', name: '보스 토벌자', tier: 'b', medal: ['rank', 7], cond: '보스 격파에 함께하기', test: (d) => recs(d).some((r) => r.won) },
    { id: 'smith', name: '첫 연성', tier: 'b', medal: ['rank', 1], cond: '모루에서 첫 카드 만들기', test: (d) => cardsOf(d).length > 0 },
    { id: 'collector', name: '카드 수집가', tier: 'b', medal: ['rank', 2], cond: '카드 5장 모으기', test: (d) => cardsOf(d).length >= 5 },
    { id: 'magic', name: '매직 연성사', tier: 'p', medal: ['rank', 3], cond: '매직(파랑) 카드 만들기', test: (d) => cardsOf(d, 2).length > 0 },
    { id: 'rare', name: '레어 연성사', tier: 'p', medal: ['rank', 5], cond: '레어(보라) 카드 만들기', test: (d) => cardsOf(d, 3).length > 0 },
    { id: 'grit', name: '끈기의 용사', tier: 'p', medal: ['rank', 6], cond: '재도전으로 고친 문제 모두 10개', test: (d) => recs(d).reduce((a, r) => a + (Number(r.fixed) || 0), 0) >= 10 },
    { id: 'sage', name: '도감 수집가', tier: 'o', medal: ['rank', 8], cond: '1~3차시 연성 도감 15장 완성', test: (d) => { const need = DS.Unit ? DS.Unit.CARDS.filter((c) => c.no <= 3) : []; return need.length > 0 && need.every((c) => (d.cards || {})[c.id]); } },
    { id: 'king', name: '집합의 지배자', tier: 'o', medal: ['rank', 9], cond: '집합 중단원평가 클리어 (추후 공개)', test: () => false },
  ];
  // 던전 정복: 차시마다 그 던전 테마의 메달 (보스 격파 또는 형성평가 만점)
  function dungeonTitles() {
    const D = DS.ASSETS.dungeons;
    return DS.Lessons.list.filter((l) => l.theme && D.ids.includes(l.theme)).map((l) => ({ id: `dg-${l.id}`, name: `${D.names[D.ids.indexOf(l.theme)]} 정복`, tier: 'b', medal: ['dungeon', D.ids.indexOf(l.theme)],
      cond: `${l.no ? `${l.no}차시 ` : ''}${l.title} — 보스 격파 또는 형성평가 만점`, test: (d) => { const r = (d.records || {})[l.id]; return !!r && (r.won || (r.bossN && r.boss >= r.bossN)); } }));
  }
  // 레벨 칭호 (일반): 지금 레벨까지의 칭호
  const levelTitles = () => (DS.Grow ? DS.Grow.TITLES.map((t, i) => ({ id: `lv${i + 1}`, name: t, tier: 'w', medal: null, cond: `Lv.${i + 1}`, test: (d) => DS.Grow.level(d.xp).lv >= i + 1 })) : []);
  const all = () => [...BASE, ...dungeonTitles(), ...levelTitles()];
  const get = (id) => all().find((t) => t.id === id) || null;
  // 한 학생의 기록 모으기 (모닥불 · 설정에서)
  async function data(m) {
    const k = ck(m.c), [records, cards, xp, bonus] = await Promise.all(['records', 'cards', 'xp', 'bonus'].map((p) => DS.Net.get(`${p}/${k}/${m.n}`).catch(() => null)));
    return { records: records || {}, cards: cards || {}, xp: Number((xp || {}).total || 0), bonus: bonus || {} };
  }
  const earned = (d) => all().filter((t) => { try { return t.test(d); } catch (e) { return false; } });
  // 메달 그림 칸
  function medal(t, size = 20) {
    if (!t || !t.medal) return '';
    const s = (DS.ASSETS.medals || {})[t.medal[0]]; if (!s) return '';
    const i = t.medal[1], col = i % s.cols, row = Math.floor(i / s.cols);
    return `<i class="medal" style="width:${size}px;height:${size}px;background-image:url('${DS.ASSETS.base}${s.src}');background-size:${s.cols * 100}% ${s.rows * 100}%;background-position:${(col / (s.cols - 1)) * 100}% ${(row / (s.rows - 1)) * 100}%"></i>`;
  }
  // 이름표: [메달][호칭] 번호 이름 (호칭이 없거나 'none' 이면 이름만)
  function nameHtml(p, opt = {}) {
    const t = p && p.title && p.title !== 'none' ? get(p.title) : null, cls = t ? TIER[t.tier].cls : '';
    const num = p && p.num != null && opt.num !== false ? `${p.num}${opt.beon ? '번' : ''} ` : '';
    return `${t ? `<span class="ttl ${cls}">${medal(t, opt.size || 18)}[${esc(t.name)}]</span> ` : ''}<span class="tname ${cls}">${num}${esc((p && (p.nick || p.name)) || '')}</span>`;
  }
  return { TIER, all, get, data, earned, medal, nameHtml, BASE };
})();
