// 🌈 #74-3 새 속성 스킬 16개 (2026-11-11): 근접 용사(발도르 8 ☀) · 원거리 용사(루멘 4 ☀ · 호버 30 ⚙)로 공격 → 띠 그림이 몬스터 위에 나옴 · Ⅲ · Ⅳ 근접 = 맞힌 수만큼 연타 · 오류 없음 · 맞는 순간 캡처 한 장(4 × 4)
//   python3 -m http.server 8765 (저장소 폴더) 뒤 node tools/e2e/e2e111.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2], U = 'http://localhost:8765/index.html?local';
const IDS = ['radiant', 'bulwark', 'holysword', 'skylance', 'shade', 'claw', 'phantom', 'eclipse', 'wrench', 'cog', 'piston', 'drill', 'aqua', 'wave', 'anchor', 'tsunami'];
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 900, height: 600 } })).newPage(); const errs = []; let ok = 0, fail = 0;
  const check = (c, m) => { if (c) ok++; else { fail++; console.log('FAIL:', m); } };
  p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(U); await p.waitForTimeout(1500);
  await p.evaluate(() => { const sc = document.createElement('div'); sc.id = 'tsc'; sc.style.cssText = 'position:fixed;left:0;top:0;width:900px;height:600px;background:#223;z-index:99999';
    sc.innerHTML = `<div class="enc-hero" style="position:absolute;left:80px;top:300px;width:120px;height:120px">${DS.Art.hero(8, 'idle')}</div><div class="enc-mon" style="position:absolute;left:520px;top:180px;width:260px;height:260px">${DS.Art.monster('mirror:1', 'idle')}</div>`; document.body.appendChild(sc); });
  await p.waitForTimeout(800);
  const fams = await p.evaluate(() => ['sun', 'dark', 'gear', 'water'].map((id) => (DS.FX.FAMS.find((f) => f.id === id) || {}).ids || []));
  check(fams.flat().join() === IDS.join(), `새 속성 4 갈래 (${fams.flat()})`);
  const run = (fx, hits, hero) => p.evaluate(async ([fx, hits, hero]) => { const sc = document.getElementById('tsc'); const seen = { spr: 0, dmg: 0, hit: 0 }; const mo = new MutationObserver((ms) => ms.forEach((m) => m.addedNodes.forEach((n) => { if (!n.classList) return; if (n.classList.contains('fx-spr')) seen.spr++; if (/−1|-1/.test(n.textContent || '') && n.classList.length) seen.dmg++; }))); mo.observe(sc, { childList: true, subtree: true });
    const t0 = performance.now(); await DS.Attack.play(sc, { heroBox: sc.querySelector('.enc-hero'), monBox: sc.querySelector('.enc-mon'), hero, fx, hits, onHit: () => seen.hit++ }); mo.disconnect(); seen.ms = Math.round(performance.now() - t0); return seen; }, [fx, hits, hero]);
  for (const [i, fx] of IDS.entries()) { const hits = i % 4 >= 2 ? 3 : 1; const r = await run(fx, hits, 8); check(r.spr >= 1 && r.hit === hits && r.ms < 3000, `${fx} 근접 ${hits}타 (${JSON.stringify(r)})`); }
  for (const fx of ['radiant', 'skylance', 'cog', 'tsunami']) { const r = await run(fx, 1, fx === 'cog' ? 30 : 4); check(r.spr >= 1 && r.hit === 1, `${fx} 원거리 (${JSON.stringify(r)})`); }
  // 맞는 순간 캡처 (각 그림의 pk 칸 근처)
  for (const fx of IDS) {
    p.evaluate((fx) => { const sc = document.getElementById('tsc'); DS.Attack.play(sc, { heroBox: sc.querySelector('.enc-hero'), monBox: sc.querySelector('.enc-mon'), hero: 8, fx, hits: 1 }); }, fx);
    const wait = await p.evaluate((fx) => { const sp = DS.FX.spec(fx); return Math.round(((sp.pk || 0) + 1) / sp.fps * 1000) + 420; }, fx);
    await p.waitForTimeout(wait); await p.screenshot({ path: `${OUT}/111-${fx}.png`, clip: { x: 380, y: 60, width: 520, height: 440 } }); await p.waitForTimeout(2600);
  }
  console.log(`e2e111: 확인 ${ok} · 실패 ${fail}`, 'errors:', errs.length ? errs : 'none');
  await b.close(); if (fail || errs.length) process.exit(1);
})();
