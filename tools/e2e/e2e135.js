// 🔄 🙊 2026-11-13 선생님 「역밸런스할때 이름도 크게 · 눈치게임할때 이름 크게」: 종합실(1280) 30명 · 4글자 이름 → 이름 글자 크기 · 겹침 확인 + 캡처 — PORT=8766 node tools/e2e/e2e135.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2] || '.', U = `http://localhost:${process.env.PORT || 8765}/index.html?local`;
const NAMES = ['김민준', '이서연', '박도윤', '최하은', '정시우', '강지유', '조주원', '윤서아', '장하준', '임지안', '한은우', '오수아', '서건우', '신윤서', '권선우', '황채원', '안유준', '송다은', '전이안', '홍소율', '남궁민', '독고영재', '선우현', '제갈공명', '황보은', '사공희', '서문탁', '김하늘별', '이바다', '박구름'];
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [], log = []; let bad = 0;
  const ok = (c, s) => { log.push((c ? '✔ ' : '✘ ') + s); if (!c) bad++; };
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message)); p.on('dialog', (d) => d.accept()); return p; };
  const T = await mk('T'); await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  await T.evaluate(() => DS.Account.uploadRoster([{ c: '1-3', n: 1, name: '가' }])); await T.reload(); await T.waitForTimeout(1500); if (await T.isVisible('#splash')) { await T.click('#splash'); await T.waitForTimeout(400); }
  await T.selectOption('#t-cls', '1-3'); await T.waitForTimeout(400); await T.selectOption('#lesson', 'set-03'); await T.click('#t-new'); await T.waitForTimeout(2500);
  const code = await T.evaluate(() => DS.Teacher.code()), key = (await T.textContent('#t-key')).trim();
  const H = await mk('H'); await H.setViewportSize({ width: 1280, height: 720 }); await H.goto(`${U}&role=hall&code=${code}&key=${key}`); await H.waitForTimeout(2500);
  await T.evaluate(async ([c, names]) => { for (let n = 1; n <= names.length; n++) { await DS.Net.set(`rooms/${c}/players/s${n}`, { num: n, nick: names[n - 1], hero: n % 16, fx: 'flame', cls: '1-3', at: Date.now() }); await DS.Net.set(`rooms/${c}/online/s${n}`, true); await DS.Net.set(`rooms/${c}/active/s${n}`, true); } }, [code, NAMES]);
  const go = () => T.evaluate(async () => { const code = DS.Teacher.code(); const R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${code}`)); await DS.Act.go(code, R, DS.Lessons.get(R.meta.lesson), 1); });
  for (let k = 0; k < 2; k++) { await go(); await T.waitForTimeout(700); }
  const startFun = (kind) => T.evaluate(async (kind) => { const code = DS.Teacher.code(); let R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${code}`)); if (!DS.Raid.restOn(R)) { await DS.Act.setRest(code, true, 10); R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${code}`)); } if (R.fun) { await DS.Fun.stop(code); R = DS.Act.unpackRoom(await DS.Net.get(`rooms/${code}`)); } await DS.Fun.start(code, R, kind); }, kind);
  const overlap = (sel) => H.evaluate((sel) => { const r = [...document.querySelectorAll(sel)].map((e) => e.getBoundingClientRect()).filter((x) => x.width); let n = 0; for (let i = 0; i < r.length; i++) for (let j = i + 1; j < r.length; j++) { const a = r[i], c = r[j]; if (a.left < c.right - 2 && c.left < a.right - 2 && a.top < c.bottom - 2 && c.top < a.bottom - 2) n++; } const fs = r.length ? parseFloat(getComputedStyle(document.querySelector(sel)).fontSize) : 0; return { n: r.length, hit: n, fs, over: r.filter((x) => x.right > innerWidth + 1 || x.left < -1).length }; }, sel);
  // 🔄 반대로
  await startFun('rev'); await H.waitForTimeout(3000);
  const rv = await overlap('#screen-hall .fa-h b.fa-nm');
  await H.screenshot({ path: `${OUT}/135-rev.png` });
  ok(rv.n >= 28 && rv.fs >= 16 && rv.over === 0 && rv.hit === 0, `🔄 반대로 TV: 번호표 + 이름 ${rv.n}명 · 글자 ${rv.fs}px · 화면 밖 ${rv.over} · 겹침 ${rv.hit}`);
  // 🙊 눈치
  await startFun('nun'); await H.waitForTimeout(5000);
  const nn = await overlap('#screen-hall .nn-name');
  await H.screenshot({ path: `${OUT}/135-nun.png` });
  ok(nn.n >= 28 && nn.fs >= 14 && nn.over <= 1, `🙊 눈치 TV: 이름 ${nn.n}명 · 글자 ${nn.fs}px · 겹침 ${nn.hit} · 화면 밖 ${nn.over}`);
  console.log(log.join('\n')); console.log(bad ? `❌ ${bad}` : '✅ 통과'); console.log('errors', errs.length ? errs : 'none'); await b.close(); if (bad || errs.length) process.exit(1);
})();
