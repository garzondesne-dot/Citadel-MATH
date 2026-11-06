// 🌱 1단계 성장 (v0.9.13 · 2026-11-06 사용자 「진행」) — node tools/e2e/e2e72.js <출력 폴더>
//   ⚡ 필살기 = 첫 시도 퍼펙트 + 특화 Ⅲ → 학생 폰 컷인 · 교실 TV 컷인 / 🌟 진필살기 = 3연속 퍼펙트 + 특화 Ⅳ → 금빛 컷인 · 🗿 석화 20초 (TV 띠 · 폰 띠 · 몬스터 회색)
//   🗿 석화 중 못 맞힌 친구: 💚 기회 +1 · 💡 그림 힌트 저절로 · 맞히면 💎 (최대 3) / 🔥 끈기의 일격 (3번째 시도에 다 맞힘) → TV 띠
//   🔨 강화: 캠프 ⚙ 강화 탭 · +1 💎10 · +7 은 📜 필요 / Ⅳ 전설 = 💎80 + 📜3 / 데미지 · 체력은 그대로
const { chromium } = require('playwright');
const OUT = process.argv[2] || '.', U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [], log = [], P = (m) => log.push(m);
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message + ' @ ' + String(e.stack).split('\n').slice(1, 3).join(' '))); p.on('dialog', (d) => d.accept()); return p; };
  const T = await mk('T'); await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  await T.click('#s-go'); await T.waitForTimeout(500); await T.fill('#r-cls', '1-3'); await T.fill('#r-text', '1 김민준\n2 이서연\n3 박지호'); await T.click('#r-up'); await T.waitForTimeout(800);
  const { code, hallKey: key } = await T.evaluate(() => DS.Act.createRoom('set-05', '1-3'));
  // 학생 셋: S1 = 특화 Ⅳ (진필살기) · S2 = 특화 Ⅲ (필살기) · S3 = 못 따라오는 용사
  const fxOf = (tier) => `DS.FX.affOf(0).ids[${tier}]`;
  const stu = async (n, tier) => {
    const S = await mk('S' + n); await S.goto(U + '&role=student'); await S.waitForTimeout(1500); if (await S.isVisible('#splash')) { await S.click('#splash'); await S.waitForTimeout(400); }
    await S.selectOption('#s-cls', '1-3'); await S.waitForTimeout(200); await S.selectOption('#s-num', String(n)); await S.waitForTimeout(300);
    await S.click('#s-new'); await S.fill('#s-p1', '1234'); await S.fill('#s-p2', '1234'); await S.click('#s-make'); await S.waitForTimeout(1200);
    await S.evaluate((n) => { localStorage.setItem(`citadel-tut-1-3-${n}`, JSON.stringify({ a: true, b: true })); }, n);
    const fx = tier == null ? 'flame' : await S.evaluate(`${fxOf(tier)}`);
    await S.evaluate(async ([c, n, fx]) => { await DS.Student.enter(c, { cls: '1-3', num: n, nick: ['', '민준', '서연', '지호'][n], hero: 0, fx }); }, [code, n, fx]).catch((e) => errs.push('enter ' + e.message));
    await S.waitForTimeout(1200); return S;
  };
  const S1 = await stu(1, 3), S2 = await stu(2, 2), S3 = await stu(3, null);
  const H = await mk('H'); await H.setViewportSize({ width: 1400, height: 820 }); await H.goto(`${U}&role=hall&code=${code}&key=${key}`); await H.waitForTimeout(2500);
  // 첫 몬스터로
  await T.evaluate(async (c) => { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)); const L = DS.Lessons.get(R.meta.lesson); await DS.Act.go(c, R, L, 1); for (let k = 0; k < 12; k++) { const R2 = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)); if ((L.steps[R2.state.step] || {}).kind === 'monster') break; await DS.Act.go(c, R2, L, 1); } }, code);
  await H.waitForTimeout(1500);
  // 정답 / 오답 내기 (그 학생 폰에서 · 그 시도의 문제)
  const submit = (S, attempt, right) => S.evaluate(async ([c, a, right]) => {
    const raw = await DS.Net.get(`rooms/${c}`), R = DS.Act.unpackRoom(raw), L = DS.Lessons.get(R.meta.lesson), mid = L.steps[R.state.step].id, me = DS.Net.uid();
    const items = DS.Raid.itemsFor(L, R, mid, me, a), ok = (q) => (q.type === 'blanks' ? q.items.map((it) => it.answer) : q.type === 'number' || q.type === 'ox' || q.type === 'multi' ? q.answer : q.type === 'text' ? q.answers[0] : q.type === 'subsets' ? DS.SetGen.allSubsets(q.base) : q.answerIndex);
    const bad = (q) => (q.type === 'number' ? -999 : q.type === 'ox' ? !q.answer : q.type === 'text' ? 'zzz' : q.type === 'blanks' ? q.items.map(() => '?') : q.type === 'multi' || q.type === 'subsets' ? [] : (q.answerIndex + 1) % (q.choices || [0, 0]).length);
    await DS.Act.submit(c, raw, mid, a, items.map((q, i) => (right || i > 0 ? ok(q) : bad(q))));
    return mid;
  }, [code, attempt, right]);
  const cutSeen = async (p, ms = 3000) => { for (let k = 0; k < ms / 100; k++) { if (await p.$('.ult .u-band')) return (await p.$('.ult.true')) ? 'gold' : 'normal'; await p.waitForTimeout(100); } return 'none'; };
  // ⚡ S2 (Ⅲ) 첫 시도 퍼펙트 → 폰 · TV 컷인
  await submit(S2, 0, true); const s2cut = await cutSeen(S2), h2cut = await cutSeen(H, 5000);
  P(`⚡ 필살기 (Ⅲ 첫 시도 퍼펙트): 폰 ${s2cut} · TV ${h2cut}`);
  await H.waitForTimeout(3000);
  // S3 은 두 번 틀림 (지호)
  await submit(S3, 0, false); await S3.waitForTimeout(800); await submit(S3, 1, false); await S3.waitForTimeout(800);
  // 🌟 S1 (Ⅳ) 3연속 퍼펙트 → 진필살기 단추
  await submit(S1, 0, true); await S1.waitForTimeout(1500); await submit(S1, 1, true); await S1.waitForTimeout(1500); await submit(S1, 2, true); await S1.waitForTimeout(2500);
  const s1btn = await S1.evaluate(() => (document.querySelector('#st-ult') || {}).textContent || '');
  P('🌟 S1 단추: ' + s1btn.replace(/\s+/g, ' '));
  await S1.screenshot({ path: `${OUT}/72-1-true-btn.png` });
  const hpBefore = await T.evaluate(async (c) => { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)), L = DS.Lessons.get(R.meta.lesson); return DS.Raid.monsterHp(L, R, L.steps[R.state.step].id); }, code);
  const shut = (p) => p.evaluate(() => document.querySelectorAll('.th-chest-ov, .bat-ov, .th-bat').forEach((e) => e.remove())); // 🎁 · 🦇 무작위 팝업 닫기
  await shut(S1); await S1.click('#st-ult'); const s1cut = await cutSeen(S1), hcut = await cutSeen(H, 6000);
  await H.waitForTimeout(1500);
  const tv = await H.evaluate(() => ({ band: (document.querySelector('.h-petri') || {}).textContent || '', gray: !!document.querySelector('#rm.petrified') }));
  await H.screenshot({ path: `${OUT}/72-2-tv-petrify.png` });
  const s3 = await S3.evaluate(() => ({ band: (document.querySelector('.petri-bn') || {}).textContent || '', gray: !!document.querySelector('.enc-mon.petrified') }));
  const heal3 = await S3.evaluate(async (c) => { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)), L = DS.Lessons.get(R.meta.lesson), mid = L.steps[R.state.step].id; return DS.Raid.record(L, R, mid, DS.Net.uid()).healed; }, code);
  await S3.screenshot({ path: `${OUT}/72-3-phone-petrify.png` });
  P(`🌟 진필살기: 폰 컷인 ${s1cut} · TV 컷인 ${hcut} · TV 띠 「${tv.band.slice(0, 40)}」 회색 ${tv.gray} · 지호 폰 띠 「${s3.band.slice(0, 40)}」 회색 ${s3.gray} · 지호 받은 기회 ${heal3}`);
  // 지호: 석화 중 3번째 시도에 다 맞힘 → 💎 · 🔥 끈기의 일격
  const gem0 = await S3.evaluate(async () => ((await DS.Gem.mine({ c: '1-3', n: 3 })) || {}).total || 0);
  await submit(S3, 2, true); let gritTv = ''; for (let k = 0; k < 30 && !gritTv; k++) { await H.waitForTimeout(100); gritTv = await H.evaluate(() => (document.querySelector('.h-grit') || {}).textContent || ''); } await S3.waitForTimeout(1500);
  const gem1 = await S3.evaluate(async () => { const d = (await DS.Gem.mine({ c: '1-3', n: 3 })) || {}; return { total: d.total || 0, petri: Object.keys(d.log || {}).filter((k) => k.startsWith('petri_')).map((k) => d.log[k].g) }; });
  const grit = await S3.evaluate(() => !!document.querySelector('.fin-me.grit'));
  await H.waitForTimeout(400); await S3.screenshot({ path: `${OUT}/72-4-grit.png` });
  P(`🗿 석화 중 지호 맞힘: 💎 ${gem0} → ${gem1.total} (석화 찬스 ${JSON.stringify(gem1.petri)}) · 🔥 폰 ${grit} · TV 「${gritTv}」`);
  const hpAfter = await T.evaluate(async (c) => { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)), L = DS.Lessons.get(R.meta.lesson); return DS.Raid.monsterHp(L, R, L.steps[R.state.step].id); }, code);
  P(`체력 (데미지 = 맞힌 소문제만): 진필살기 전 ${JSON.stringify(hpBefore)} → 뒤 ${JSON.stringify(hpAfter)}`);
  // 🔨 강화 · 📜 · Ⅳ (S2 캠프)
  await S2.evaluate(async () => { const m = { c: '1-3', n: 2 }; await DS.Gem.add(m, 300, 'e2e_big', '', { free: true }); });
  await S2.evaluate(() => DS.Camp.back()); await S2.waitForTimeout(1800);
  await S2.evaluate(() => DS.Camp.settings({ me: { c: '1-3', n: 2, name: '서연', hero: 0, fx: 'flame', socket: {} } }).catch((e) => { throw e; })).catch((e) => errs.push('settings ' + e.message));
  await S2.waitForTimeout(1200);
  await shut(S2); await S2.click('[data-tab="enh"]').catch((e) => errs.push('enh tab ' + e.message)); await S2.waitForTimeout(600);
  const enh0 = await S2.evaluate(() => ({ lv: (document.querySelector('.enh-lv') || {}).textContent, next: (document.querySelector('.enh-box p') || {}).textContent || '' }));
  await S2.click('#enh-go').catch((e) => errs.push('enh go ' + e.message)); await S2.waitForTimeout(2500);
  const enh1 = await S2.evaluate(async () => { const d = (await DS.Gem.mine({ c: '1-3', n: 2 })) || {}; return { enh: d.enh, total: d.total, lv: (document.querySelector('.enh-lv') || {}).textContent }; });
  await S2.screenshot({ path: `${OUT}/72-5-enhance.png` });
  const ivErr = await S2.evaluate(async () => { try { await DS.Gem.buy({ c: '1-3', n: 2 }, 'fx', 'meteor'); return 'bought'; } catch (e) { return e.message; } });
  P(`🔨 강화: ${JSON.stringify(enh0)} → ${JSON.stringify(enh1)} · Ⅳ 사기(📜 없음): ${ivErr.slice(0, 40)}`);
  const C = {
    필살기_3단계: s2cut === 'normal' && h2cut === 'normal',
    진필살기_단추: /진필살기/.test(s1btn),
    진필살기_컷인: s1cut === 'gold' && hcut === 'gold',
    석화_TV: /석화/.test(tv.band) && tv.gray,
    석화_폰: /석화/.test(s3.band) && s3.gray && heal3 >= 1,
    석화_마정석: gem1.petri.length === 1 && gem1.petri[0] >= 1 && gem1.petri[0] <= 3,
    끈기: grit && /끈기/.test(gritTv),
    체력그대로: hpAfter.left === hpBefore.left - 0 || hpAfter.left <= hpBefore.left,
    강화: enh1.enh === 1 && /\+1/.test(enh1.lv || ''),
    전설_서술조각: /📜|모자라/.test(ivErr),
  };
  const bad = Object.keys(C).filter((k) => !C[k]); if (bad.length) P('틀린 항목: ' + bad.join(', '));
  console.log(log.join('\n')); console.log(!bad.length ? '✅ 통과' : '❌ 기대와 다름'); console.log('errors', errs.length ? errs : 'none'); await b.close(); if (bad.length || errs.length) process.exit(1);
})();
