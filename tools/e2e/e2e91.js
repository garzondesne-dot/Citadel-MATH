// 📱 #56 소레이드 학생 폰 배치 (2026-11-10): 아이폰 SE 375×667 · 작은 안드로이드 360×640 — 문제 5 졸개②(보기 5) · 문제 7 졸개④(보기 5) · 한 판 더도 → 보기가 스크롤 없이 모두 보임 · 단추 ≥ 44px · 일반 몬스터 깨지지 않음 — node tools/e2e/e2e91.js <출력 폴더>
const { chromium, devices } = require('playwright');
const OUT = process.argv[2] || '.', U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const VW = (process.env.VW || '375x667').split('x').map(Number); const ctx = await b.newContext({ ...devices['iPhone SE'], viewport: { width: VW[0], height: VW[1] } }); const errs = [], log = []; let bad = 0;
  const ok = (c, s) => { log.push((c ? '✔ ' : '✘ ') + s); if (!c) bad++; };
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message)); p.on('dialog', (d) => d.accept()); return p; };
  const T = await mk('T'); await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.tap('#f-teacher .t-login'); await T.waitForTimeout(1000);
  await T.tap('#s-go'); await T.waitForTimeout(500); await T.fill('#r-cls', '1-3'); await T.fill('#r-text', '1 김민준\n2 이서연'); await T.tap('#r-up'); await T.waitForTimeout(800);
  const S = await mk('S'); await S.goto(U + '&role=student'); await S.waitForTimeout(1500); if (await S.isVisible('#splash')) { await S.tap('#splash'); await S.waitForTimeout(500); }
  await S.selectOption('#s-cls', '1-3'); await S.waitForTimeout(200); await S.selectOption('#s-num', '1'); await S.waitForTimeout(300);
  await S.tap('#s-new'); await S.fill('#s-p1', '1234'); await S.fill('#s-p2', '1234'); await S.tap('#s-make'); await S.waitForTimeout(1200);
  await S.evaluate(() => { localStorage.setItem('citadel-tut-1-3-1', JSON.stringify({ a: true, b: true })); }); await S.tap('#s-go'); await S.waitForTimeout(2000);
  const { code } = await T.evaluate(() => DS.Act.createRoom('set-06', '1-3'));
  await S.evaluate(async (c) => { await DS.Student.enter(c, { cls: '1-3', num: 1, nick: '김민준', hero: 0, fx: 'flame' }); }, code).catch(() => {}); await S.waitForTimeout(1500);
  await T.evaluate(async (c) => { await DS.Net.set(`rooms/${c}/active/friend2`, true); await DS.Net.set(`rooms/${c}/players/friend2`, { num: 2, nick: '이서연', hero: 1 }); }, code);
  const goStep = (id) => T.evaluate(async ([c, id]) => { const L = DS.Lessons.get('set-06'); for (let i = 0; i < 14; i++) { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)); const s = DS.Raid.stepOf(L, R); if (s && s.id === id) break; await DS.Act.go(c, R, L, 1); } const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)); await DS.Act.setSolve(c, R, L, { now: true }); }, [code, id]);
  const clr = () => S.evaluate(() => document.querySelectorAll('.th-chest-ov, .bat-ov, .th-bat').forEach((e) => e.remove()));
  const put = (id, s, p = 0) => S.evaluate(async ([c, id, s, p]) => { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)), L = DS.Lessons.get('set-06'), me = DS.Net.uid(), it = DS.Raid.chainItems(L, R, id, me, p), k = Object.keys((((R.chain || {})[id] || {})[me]) || {}).length; await DS.Net.set(`rooms/${c}/chain/${id}/${me}/${k}`, { s, p, g: DS.Raid.chainAns(it[s]), at: DS.Net.TS }); }, [id, s, p].length ? [code, id, s, p] : []);
  const why = (id, s, p) => S.evaluate(async ([c, id, s, p]) => { const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${c}`)), me = DS.Net.uid(), k = Object.keys((((R.chain || {})[id] || {})[me]) || {}).length; await DS.Net.set(`rooms/${c}/chain/${id}/${me}/${k}`, { s, p, g: 0, w: 1, at: DS.Net.TS }); }, [code, id, s, p]);
  const look = () => S.evaluate(() => { const dock = document.querySelector('.st-dock'), dt = dock ? dock.getBoundingClientRect().top : innerHeight, bs = [...document.querySelectorAll('#st-body [data-pick]')];
    return { n: bs.length, seen: bs.filter((x) => { const r = x.getBoundingClientRect(), pp = x.closest('.paper'), pr = pp ? pp.getBoundingClientRect() : { top: 0, bottom: 1e9 }; return r.top >= Math.max(0, pr.top) - 1 && r.bottom <= Math.min(dt, pr.bottom) + 1; }).length, minH: Math.round(Math.min(...bs.map((x) => x.getBoundingClientRect().height))), sy: Math.round(scrollY), paper: (() => { const p = document.querySelector('#st-body .paper'); return p ? Math.round(p.scrollHeight - p.clientHeight) : -1; })(), sc: Math.round((document.querySelector('#st-body .scene') || { getBoundingClientRect: () => ({ height: 0 }) }).getBoundingClientRect().height) }; });
  const tag = `${VW[0]}x${VW[1]}`;
  async function shot(name) { await S.waitForTimeout(2600); await clr(); await S.evaluate(() => window.scrollTo(0, 0)); await S.waitForTimeout(200); const v = await look(); ok(v.n >= 4 && v.seen === v.n && v.minH >= 44, `${tag} ${name}: 보기 ${v.seen}/${v.n} 보임 · 단추 ${v.minH}px · 장면 ${v.sc}px · 양피지 남은 스크롤 ${v.paper}`); await S.screenshot({ path: `${OUT}/91-${tag}-${name}.png` }); }
  await goStep('m1'); await S.waitForTimeout(3000); await clr(); { const v = await look(); ok(v.n > 0 && v.minH >= 30, `${tag} 일반 몬스터 m1 깨지지 않음(그대로) (보기 ${v.n} · 단추 ${v.minH}px)`); await S.screenshot({ path: `${OUT}/91-${tag}-m1.png` }); }
  await goStep('u5'); await S.waitForTimeout(2500); await put('u5', 0); await shot('u5-졸개2');
  // 한 판 더 (📜 문제 상자 · 나의 풀이 접힘)
  for (let s2 = 1; s2 < 4; s2++) await put('u5', s2); await S.waitForTimeout(2500); await clr(); await S.waitForTimeout(1600);
  await S.evaluate(() => { const b2 = document.querySelector('#cr-prac'); if (b2) b2.click(); }); await S.waitForTimeout(1500); await put('u5', 0, 1); await shot('u5-한판더-졸개2');
  const pb = await S.evaluate(() => { const d = document.querySelector('.cr-prob'), st = document.querySelector('.cr-story'); return { prob: d ? d.open : null, fold: st ? st.classList.contains('cr-fold') : null, shown: st ? [...st.querySelectorAll('li')].filter((l) => l.offsetHeight > 0).length : 0 }; });
  ok(pb.prob === false && pb.fold === true && pb.shown === 1, `${tag} 한 판 더 졸개②: 📜 문제 접힘 · 나의 풀이 한 줄 (${JSON.stringify(pb)})`);
  await goStep('u7'); await S.waitForTimeout(2500); for (let s2 = 0; s2 < 3; s2++) await put('u7', s2);
  await S.waitForTimeout(2000); await shot('u7-졸개4');
  { const f = await S.evaluate(() => { const st = document.querySelector('.cr-story'); return { fold: st && st.classList.contains('cr-fold'), shown: st ? [...st.querySelectorAll('li')].filter((l) => l.offsetHeight > 0).length : 0, all: st ? st.querySelectorAll('li').length : 0, btn: (document.querySelector('.cr-sf') || {}).textContent }; });
    ok(f.fold && f.shown === 1 && f.all >= 3 && /줄 ▼/.test(f.btn || ''), `${tag} 문제 7 졸개④: 나의 풀이 최근 한 줄 · 「${f.btn}」 (${f.all}줄)`);
    const y0 = await S.evaluate(() => scrollY); await S.evaluate(() => document.querySelector('.cr-sf').click()); await S.waitForTimeout(300);
    const pe = await S.evaluate(() => [...document.querySelectorAll('.cr-story li')].filter((l) => l.offsetHeight > 0).length); ok(pe === f.all, `${tag} 「n줄 ▼」 누르면 모두 (${pe}줄)`);
    await S.evaluate(async (c) => { await DS.Net.set(`rooms/${c}/players/${DS.Net.uid()}/x`, Date.now()); }, code); await S.waitForTimeout(1200);
    const keep = await S.evaluate(() => [...document.querySelectorAll('.cr-story li')].filter((l) => l.offsetHeight > 0).length); ok(keep === f.all, `${tag} 다시 그려도 펼침 유지 (${keep}줄)`); void y0; }
  // ② 공격 순간만 장면 크게 → 끝나면 띠
  await S.evaluate(() => { const c = document.querySelector('#st-body [data-pick]'); c.click(); }); await S.waitForTimeout(300);
  const scH = () => S.evaluate(() => Math.round(document.querySelector('#st-body .scene').getBoundingClientRect().height));
  await S.evaluate(() => document.querySelector('#cr-go').click()); await S.waitForTimeout(450); const big = await scH(); await S.screenshot({ path: `${OUT}/91-${tag}-attack.png` });
  await S.waitForTimeout(3000); await clr(); const thin = await scH(); ok(big > 200 && thin < 120, `${tag} ⚔ 공격 순간 장면 ${big}px → 끝나면 띠 ${thin}px`);
  console.log(log.join('\n')); if (errs.length) console.log('오류:\n' + errs.join('\n'));
  await b.close(); process.exit(bad || errs.length ? 1 : 0);
})();
