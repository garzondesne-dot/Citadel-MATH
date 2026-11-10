// 🙊 #57 ⑪ 눈치게임 종합실 화면 (2026-11-10): 캐릭터 = 화면 가운데 두 줄 · 장난스러운 배경 · 판마다 안 누른 학생 💤 관전(#57 ⑫) — node tools/e2e/e2e92.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2] || '.', U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1366, height: 768 } }); const errs = [], log = []; let bad = 0;
  const ok = (c, s) => { log.push((c ? '✔ ' : '✘ ') + s); if (!c) bad++; }; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(U); await p.waitForTimeout(1500);
  const r = await p.evaluate(() => {
    const host = document.createElement('div'); host.id = 'nn-host'; host.style.cssText = 'position:fixed;left:40px;top:40px;width:1100px;height:620px;z-index:9999;background:#000'; document.body.appendChild(host);
    const players = {}, active = {}, alive = {}, said = {}, out = {}; for (let i = 1; i <= 18; i++) { const u = 'u' + i; players[u] = { num: i, nick: '학생' + i, hero: i % 9 }; active[u] = true; alive[u] = 1; if (i <= 4) said[u] = i; if (i === 6) out[u] = 1; }
    const now = DS.Net.now(); const R = { players, active, fun: { kind: 'nun', g: now, round: 1, phase: 'play', to: now, alive, n: 5, said, out, done: {}, ev: [], lastAt: now, at: now } };
    DS.Nunchi.hall(host, R);
    const hs = [...host.querySelectorAll('.nn-h')].map((h) => h.getBoundingClientRect()), hr = host.getBoundingClientRect();
    const ys = [...new Set(hs.map((x) => Math.round(x.top)))];
    const mid = (Math.min(...hs.map((x) => x.top)) + Math.max(...hs.map((x) => x.bottom))) / 2 - hr.top;
    return { n: hs.length, rows: ys.length, mid: Math.round(mid), H: Math.round(hr.height), bottom: Math.round(Math.max(...hs.map((x) => x.bottom)) - hr.top) };
  });
  ok(r.n === 18 && r.rows === 2 && r.mid > r.H * 0.38 && r.mid < r.H * 0.75 && r.bottom < r.H - 8, `18명 = 두 줄 · 가운데쯤 (${JSON.stringify(r)})`);
  await p.screenshot({ path: `${OUT}/92-nunchi.png`, clip: { x: 40, y: 40, width: 1100, height: 620 } });
  console.log(log.join('\n')); if (errs.length) console.log('오류:\n' + errs.join('\n'));
  await b.close(); process.exit(bad || errs.length ? 1 : 0);
})();
