// 💎 조각 검증 (v0.9.10): node tests/gem.test.js — 같은 키 한 번 · upsert · 하루 30 · 한도 밖(free) · 하루 n번 · 상점 · 연속 참여
const load = require('./load');
const DS = load(['assets/manifest.js', 'js/engine/ui.js', 'js/engine/setgen.js', 'js/engine/quiz.js', 'js/engine/lessons.js', 'lessons/set-02.js', 'lessons/set-03.js', 'lessons/set-04.js', 'js/raid/gem.js']);
let fail = 0; const check = (c, m) => { if (!c) { fail++; console.error('FAIL:', m); } };
const db = {};
const getP = (p) => p.split('/').reduce((o, k) => (o == null ? undefined : o[k]), db);
const setP = (p, v) => { const ks = p.split('/'); let o = db; ks.slice(0, -1).forEach((k) => { o[k] = o[k] && typeof o[k] === 'object' ? o[k] : {}; o = o[k]; }); o[ks[ks.length - 1]] = v; };
DS.Net = { TS: 1, get: async (p) => JSON.parse(JSON.stringify(getP(p) ?? null)), set: async (p, v) => setP(p, v), update: async (p, obj) => Object.entries(obj).forEach(([k, v]) => setP(`${p}/${k}`, v)) };
const G = DS.Gem, m = { c: '1-3', n: 5 };
(async () => {
  check(await G.add(m, 8, 'raid_A', '레이드', { upsert: true }) === 8 && await G.add(m, 8, 'raid_A', '레이드', { upsert: true }) === 0, '같은 수업은 한 번 (upsert · 늘어난 것만)');
  check(await G.add(m, 10, 'raid_A', '레이드', { upsert: true }) === 2, 'upsert: 늘어난 2 만');
  check(await G.add(m, 3, 'card_x') === 3 && await G.add(m, 3, 'card_x') === 0, '같은 키 두 번 안 줌');
  for (let i = 0; i < Math.ceil(G.DAY_CAP / 5) + 1; i++) await G.add(m, 5, `room_${i}`); // 한도를 넘게 받아 봄
  const d = await G.mine(m), day = G.today();
  check(d.day[day] === G.DAY_CAP && d.total === G.DAY_CAP, `하루 ${G.DAY_CAP} 한도 (${d.day[day]} · ${d.total})`);
  check(await G.add(m, 4, 'more') === 0, '한도 넘으면 0');
  check(await G.add(m, 10, 'seal_x', '인장', { free: true }) === 10 && (await G.mine(m)).total === G.DAY_CAP + 10, '한도 밖(free) 은 들어옴');
  check(G.DAY_CAP === 100, `💎 하루 한도 100 (#27 · ${G.DAY_CAP})`);
  check(G.dayLeft(await G.mine(m)) === 0 && G.dayLeft({}) === 100, '오늘 남은 한도 (다 받음 = 0 · 처음 = 100)');
  check(await G.addScroll(m, 1, 'ult_set-06_u4', '진필살기') === 1 && await G.addScroll(m, 1, 'ult_set-06_u4', '진필살기') === 0, '📜 수업 진필살기 = 문제당 한 번');
  const db2 = {}; Object.assign(db, { gem: { '9-9': { 1: {} } } }); const m2 = { c: '9-9', n: 1 };
  let r = 0; for (let i = 0; i < 5; i++) r += await G.addDaily(m2, 1, 'review', 3);
  check(r === 3, `허수아비 복습은 하루 3번 (${r})`);
  check(G.price('hero', 12) === 30 && G.price('hero', 8) === 60 && G.price('hero', 16) === null && G.price('fx', 'vortex') === 80, '상점: 도감 특전 용사 8 = 💎 60 (돌려받기) · 업적 용사 16 은 못 삼');
  let err = ''; try { await G.buy(m2, 'fx', 'vortex'); } catch (e) { err = e.message; }
  check(/모자라요/.test(err), '조각 모자라면 못 삼');
  await G.add(m2, 60, 't', '', { free: true });
  await G.buy(m2, 'fx', 'stars'); const d2 = await G.mine(m2);
  check(d2.total === 3 && G.owns(d2, 'fx', 'stars'), `사면 줄고 가짐 (${d2.total})`);
  err = ''; try { await G.buy(m2, 'fx', 'stars'); } catch (e) { err = e.message; } check(/이미/.test(err), '두 번 못 삼');
  check(G.streak({ 'set-02': {}, 'set-03': {}, 'set-04': {} }, { 'set-02': true, 'set-03': true, 'set-04': true }) === 3 && G.streak({ 'set-02': {}, 'set-04': {} }, { 'set-02': true, 'set-03': true, 'set-04': true }) === 1, '연속 참여 = 끝에서부터 이어진 수업');
  // 📜 · Ⅳ 전설 · 🔨 강화 (2026-11-06)
  const m3 = { c: '8-8', n: 2 }; db.gem['8-8'] = { 2: {} };
  check(await G.addScroll(m3, 1, 'ph_a') === 1 && await G.addScroll(m3, 1, 'ph_a') === 0 && await G.addScroll(m3, 2, 'ph_a', '', { upsert: true }) === 1, '📜 같은 키 한 번 · upsert');
  await G.add(m3, 500, 'big', '', { free: true });
  check(G.price('fx', 'twin') === 80 && G.scrollOf('fx', 'twin') === 2 && G.scrollOf('fx', 'tsunami') === 2 && G.price('fx', 'skylance') === 80, 'Ⅳ = 💎80 + 📜2 (#74-3 · 새 속성 Ⅳ 도)');
  { const m4 = { c: '8-8', n: 4 }; db.gem['8-8'][4] = {}; await G.add(m4, 500, 'big', '', { free: true }); await G.addScroll(m4, 1, 'one'); await G.buy(m4, 'fx', 'fire');
    err = ''; try { await G.buy(m4, 'fx', 'pillar'); } catch (e) { err = e.message; } check(/📜/.test(err), '📜 모자라면(1 < 2) Ⅳ 못 삼'); }
  await G.addScroll(m3, 9, 'more'); await G.buy(m3, 'fx', 'twin'); let d3 = await G.mine(m3);
  check(d3.total === 420 && d3.scroll === 9 && G.owns(d3, 'fx', 'twin'), `Ⅳ 사면 💎80 · 📜2 줄어듦 (${d3.total} · ${d3.scroll})`);
  check(await G.sell(m3, 'fx', 'twin') === 56 && (await G.mine(m3)).scroll === 9, '되팔기 = 낸 💎 의 70% · 📜 는 안 돌려줌');
  let r1 = await G.enhance(m3, () => 0.5); d3 = await G.mine(m3);
  check(r1.lv === 1 && !r1.great && d3.enh === 1 && d3.total === 476 - 10, `강화 +1 = 💎10 (${d3.total})`);
  const r2 = await G.enhance(m3, () => 0.05); d3 = await G.mine(m3);
  check(r2.great && r2.back === 7 && d3.total === 466 - 15 + 7, `🌟 대성공 = 절반 돌려받기 (${d3.total})`);
  for (let i = 3; i <= 6; i++) await G.enhance(m3, () => 0.5);
  db.gem['8-8'][2].scroll = 0; err = ''; try { await G.enhance(m3, () => 0.5); } catch (e) { err = e.message; } check(/📜/.test(err), '+7 부터는 📜 필요');
  db.gem['8-8'][2].scroll = 6; for (let i = 7; i <= 10; i++) await G.enhance(m3, () => 0.5); d3 = await G.mine(m3);
  check(d3.enh === 10 && d3.scroll === 0, `+10 까지 📜 6 (${d3.enh} · ${d3.scroll})`);
  err = ''; try { await G.enhance(m3); } catch (e) { err = e.message; } check(/\+10/.test(err), '+10 이 끝');
  check(G.enhTier(2) === 0 && G.enhTier(3) === 1 && G.enhTier(5) === 2 && G.enhTier(7) === 3 && G.enhTier(10) === 4, '강화 빛 단계');
  check(await G.medal(m, 'ox') === 1 && await G.medal(m, 'ox') === 2, '메달 개수');
  // 🔁 화폐 전환 (2026-11-07): 깃털 1 = 💎 10 · 💎 못 받은 카드 1장 = 💎 3 · conv 기록 · 한 번만 · 옛 feather 남김
  { const mc = { c: '7-7', n: 3 };
    setP('gem/7-7/3', { total: 50, earned: 80, feather: 2, log: { card_union: { g: 3, at: 1, why: '첫 카드' } } });
    const r = await G.convert(mc, { seals: 4, cards: { union: true, inter: true, comp: true } }), dc = await G.mine(mc);
    check(r && r.feather === 2 && r.featherGem === 20 && r.cards === 3 && r.cardsUnpaid === 2 && r.cardGem === 6 && r.seals === 4 && r.gemBefore === 50 && r.gemAfter === 76, `전환 기록 ${JSON.stringify(r)}`);
    check(dc.total === 76 && dc.feather === 2 && dc.rare === 2 && dc.conv && dc.log.conv_feather.gift && dc.log.conv_card.g === 6 && G.giftList(dc).length === 2, '💎 우편 2통 · 옛 깃털 값 남김 · 날개 셈 = 2');
    check(await G.convert(mc, { seals: 9, cards: {} }) === null && (await G.mine(mc)).total === 76, '전환은 한 번만');
    check(G.rareOf(dc) === 2 && G.rareOf({ feather: 3 }) === 3 && G.rareOf({ feather: 3, rare: 1 }) === 4, '날개 업적 셈 (전환 전 · 뒤)');
    // 📚 도감 특전 용사 💎 60 → 되팔기 불가 · 카드 다 모으면 돌려받기 한 번
    setP('gem/7-7/4', { total: 70 }); const mh = { c: '7-7', n: 4 };
    await G.buy(mh, 'hero', 8); let e2 = ''; try { await G.sell(mh, 'hero', 8); } catch (e) { e2 = e.message; }
    check((await G.mine(mh)).total === 10 && /되팔 수 없/.test(e2), '특전 용사 💎 60 · 되팔기 막음');
    check(await G.cardRefund(mh, 8) === 60 && await G.cardRefund(mh, 8) === 0 && (await G.mine(mh)).total === 70, '도감 완성 → 💎 60 돌려받기 한 번');
    check(await G.cardRefund(mh, 10) === 0, '안 산 용사는 돌려받기 없음');
  }
  console.log(fail ? `❌ ${fail}개 실패` : '✅ 💎 조각 시험 모두 통과'); process.exit(fail ? 1 : 0);
})();
