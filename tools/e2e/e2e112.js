// ✨ #74-4 (2026-11-11): 근접 용사(로안 0)가 속성 스킬(🔥 ⚡ ❄ 🌬 ✨ 🔮 📐)을 끼우면 몸통 앞에 그 색 빛 호(.atk-trail) → 끝에 그 이펙트 · 근접 계열(⚔ ☀ …)은 궤적 없음
//   🔨 망치 내려치기 · 대지 분쇄 = 용사가 뛰어올라 사라졌다가(투명) 떨어짐 · 원거리 용사는 궤적 없음 · 🔮 마법탄 · ⚡ 연쇄처럼 쏘는 기술은 원래 제자리라 궤적 없음 · 캡처 3장
//   python3 -m http.server 8765 뒤 node tools/e2e/e2e112.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2], U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 900, height: 600 } })).newPage(); const errs = []; let ok = 0, fail = 0;
  const check = (c, m) => { if (c) ok++; else { fail++; console.log('FAIL:', m); } };
  p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(U); await p.waitForTimeout(1500);
  const setup = (hero) => p.evaluate((hero) => { const o = document.getElementById('tsc'); if (o) o.remove(); const sc = document.createElement('div'); sc.id = 'tsc'; sc.style.cssText = 'position:fixed;left:0;top:0;width:900px;height:600px;background:#223;z-index:99999';
    sc.innerHTML = `<div class="enc-hero" style="position:absolute;left:80px;top:300px;width:120px;height:120px">${DS.Art.hero(hero, 'idle')}</div><div class="enc-mon" style="position:absolute;left:520px;top:180px;width:260px;height:260px">${DS.Art.monster('mirror:1', 'idle')}</div>`; document.body.appendChild(sc); }, hero);
  const run = (fx, hero) => p.evaluate(async ([fx, hero]) => { const sc = document.getElementById('tsc'), hb = sc.querySelector('.enc-hero'); const seen = { trail: 0, minOp: 1 }; const mo = new MutationObserver((ms) => ms.forEach((m) => m.addedNodes.forEach((n) => { if (n.classList && n.classList.contains('atk-trail')) seen.trail++; }))); mo.observe(sc, { childList: true, subtree: true });
    const tm = setInterval(() => { seen.minOp = Math.min(seen.minOp, Number(getComputedStyle(hb).opacity)); }, 20);
    await DS.Attack.play(sc, { heroBox: hb, monBox: sc.querySelector('.enc-mon'), hero, fx, hits: 1 }); mo.disconnect(); clearInterval(tm); seen.endOp = Number(getComputedStyle(hb).opacity); return seen; }, [fx, hero]);
  await setup(0); await p.waitForTimeout(600);
  for (const fx of ['flame', 'spark', 'frost', 'gale', 'twinkle', 'crit', 'ruler']) { const r = await run(fx, 0); check(r.trail === 1, `로안 + ${fx} = 색 궤적 (${JSON.stringify(r)})`); }
  for (const fx of ['flamecut', 'boltthrust', 'frostsmash']) { const r = await run(fx, 0); check(r.trail === 1, `🌳 #78 합체 ${fx} = 색 궤적 (${JSON.stringify(r)})`); }
  for (const fx of ['cut', 'radiant', 'bash', 'thrust', 'wave']) { const r = await run(fx, 0); check(r.trail === 0, `로안 + ${fx} = 근접 계열 · 궤적 없음 (${JSON.stringify(r)})`); }
  for (const fx of ['hammer', 'quake']) { const r = await run(fx, 6); check(r.minOp < 0.2 && r.endOp === 1 && r.trail === 0, `${fx} 뛰어올라 사라짐 → 다시 보임 (${JSON.stringify(r)})`); }
  await setup(1); await p.waitForTimeout(600); { const r = await run('flame', 1); check(r.trail === 0, `원거리 누아 + 불 = 궤적 없음 (${JSON.stringify(r)})`); }
  await setup(0); await p.waitForTimeout(600);
  p.evaluate(() => { const sc = document.getElementById('tsc'); DS.Attack.play(sc, { heroBox: sc.querySelector('.enc-hero'), monBox: sc.querySelector('.enc-mon'), hero: 0, fx: 'spark', hits: 1 }); }); await p.waitForTimeout(470); await p.screenshot({ path: `${OUT}/112-trail-spark.png` }); await p.waitForTimeout(1800);
  p.evaluate(() => { const sc = document.getElementById('tsc'); DS.Attack.play(sc, { heroBox: sc.querySelector('.enc-hero'), monBox: sc.querySelector('.enc-mon'), hero: 0, fx: 'flame', hits: 1 }); }); await p.waitForTimeout(470); await p.screenshot({ path: `${OUT}/112-trail-fire.png` }); await p.waitForTimeout(1800);
  await setup(6); await p.waitForTimeout(600);
  p.evaluate(() => { const sc = document.getElementById('tsc'); DS.Attack.play(sc, { heroBox: sc.querySelector('.enc-hero'), monBox: sc.querySelector('.enc-mon'), hero: 6, fx: 'quake', hits: 1 }); }); await p.waitForTimeout(560); await p.screenshot({ path: `${OUT}/112-quake.png` });
  console.log(`e2e112: 확인 ${ok} · 실패 ${fail}`, 'errors:', errs.length ? errs : 'none'); await b.close(); if (fail || errs.length) process.exit(1);
})();
