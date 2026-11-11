// ⚔ #74-2 근접 3박자 (2026-11-11): Ⅲ · Ⅳ 근접 = 돌진 잔상 → 연타(맞힌 수 · 최대 5) → 마무리 · 새 삼연 참격 · 쌍월 참 그림(가로지르기)
// 사용: python3 -m http.server 8765 (저장소 폴더) 띄운 뒤 node tools/e2e/e2e108.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2], U = 'http://localhost:8765/index.html?local';
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 900, height: 600 } })).newPage(); const errs = []; let ok = 0, fail = 0;
  const check = (c, m) => { if (c) ok++; else { fail++; console.log('FAIL:', m); } };
  p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(U); await p.waitForTimeout(1500);
  await p.evaluate(() => { const sc = document.createElement('div'); sc.id = 'tsc'; sc.style.cssText = 'position:fixed;left:0;top:0;width:900px;height:600px;background:#223;z-index:99999';
    sc.innerHTML = `<div class="enc-hero" style="position:absolute;left:80px;top:300px;width:120px;height:120px">${DS.Art.hero(0, 'idle')}</div><div class="enc-mon" style="position:absolute;left:520px;top:180px;width:260px;height:260px">${DS.Art.monster('mirror:1', 'idle')}</div>`; document.body.appendChild(sc); });
  await p.waitForTimeout(800);
  const run = (fx, hits) => p.evaluate(async ([fx, hits]) => { const sc = document.getElementById('tsc'); const seen = { ghost: 0, spr: 0, dmg: 0, hit: 0 }; const mo = new MutationObserver((ms) => ms.forEach((m) => m.addedNodes.forEach((n) => { if (!n.classList) return; if (n.classList.contains('atk-echo')) seen.ghost++; if (n.classList.contains('fx-spr')) seen.spr++; if (n.classList.contains('atk-dmg')) seen.dmg++; }))); mo.observe(sc, { childList: true, subtree: true });
    const t0 = performance.now(); await DS.Attack.play(sc, { heroBox: sc.querySelector('.enc-hero'), monBox: sc.querySelector('.enc-mon'), hero: 0, fx, hits, onHit: () => seen.hit++ }); mo.disconnect(); seen.ms = Math.round(performance.now() - t0); return seen; }, [fx, hits]);
  const s3 = await run('slash', 3); check(s3.ghost === 3 && s3.spr >= 3 && s3.dmg === 3 && s3.hit === 3, `삼연 참격 3개 맞힘 = 잔상 3 · 3타 · −1 ×3 (${JSON.stringify(s3)})`);
  const s5 = await run('twin', 7); check(s5.dmg === 5 && s5.hit === 5, `쌍월 참 7개 맞힘 = 최대 5타 (${JSON.stringify(s5)})`);
  const s1 = await run('moon', 4); check(s1.ghost === 0 && s1.dmg === 1, `Ⅱ 달빛 베기 = 한 박자 그대로 (${JSON.stringify(s1)})`);
  check(s3.ms < 2600 && s5.ms < 2600, `길이 원거리 Ⅳ 안 (${s3.ms} · ${s5.ms}ms)`);
  // 화면 확인: 쌍월 참 맞는 순간
  p.evaluate(() => { const sc = document.getElementById('tsc'); DS.Attack.play(sc, { heroBox: sc.querySelector('.enc-hero'), monBox: sc.querySelector('.enc-mon'), hero: 0, fx: 'slash', hits: 3 }); });
  await p.waitForTimeout(560); await p.screenshot({ path: `${OUT}/slash.png` });
  await p.waitForTimeout(2600);
  p.evaluate(() => { const sc = document.getElementById('tsc'); DS.Attack.play(sc, { heroBox: sc.querySelector('.enc-hero'), monBox: sc.querySelector('.enc-mon'), hero: 0, fx: 'twin', hits: 1 }); });
  await p.waitForTimeout(820); await p.screenshot({ path: `${OUT}/twin.png` });
  console.log(`e2e108: 확인 ${ok} · 실패 ${fail}`, 'errors:', errs.length ? errs : 'none');
  await b.close(); if (fail || errs.length) process.exit(1);
})();
