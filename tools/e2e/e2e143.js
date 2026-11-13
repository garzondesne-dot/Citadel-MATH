// 🏫 2026-11-13 학교판 로고: 첫 화면 · 메뉴 머리 = 「공통수학2」 띠 없는 로고 · 우리 학교 · 체험판 = 그대로 — PORT=8766 node tools/e2e/e2e143.js <출력 폴더>
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..', '..'), P = require('../school/page.js');
const OUT = process.argv[2] || '.', BASE = `http://localhost:${process.env.PORT || 8765}`;
const code = 'ex7q2', sch = P.list()[code], dir = path.join(ROOT, 's', code);
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'index.html'), P.build(fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'), code, sch));
fs.writeFileSync(path.join(dir, 'manifest.webmanifest'), P.manifest(fs.readFileSync(path.join(ROOT, 'manifest.webmanifest'), 'utf8'), code, sch));
const cleanup = () => { try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) { /* 무시 */ } };
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const errs = [], log = []; let bad = 0;
  const ok = (c, s) => { log.push((c ? '✔ ' : '✘ ') + s); if (!c) bad++; };
  try {
    for (const [nm, url, want] of [['학교판', `/s/${code}/index.html?local`, 'brand-school-logo-v1'], ['정식', '/index.html?local', 'menu-logo-v1'], ['체험판', '/trial/', null]]) {
      const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }); const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(nm + ': ' + e.message));
      await p.goto(BASE + url); await p.waitForTimeout(4200);
      const sp = await p.evaluate(() => ({ logo: (document.querySelector('.sp-logo') || {}).src || '', head: getComputedStyle(document.querySelector('.brand-head') || document.body).backgroundImage }));
      if (want) ok(sp.logo.includes(want), `${nm} 첫 화면 로고 = ${want} (${sp.logo.split('/').pop()})`);
      else ok(!sp.logo.includes('brand-school-logo'), `${nm} = 학교판 로고 안 씀`);
      if (nm !== '체험판') {
        await p.screenshot({ path: `${OUT}/143-${nm}-splash.png` });
        await p.click('#splash').catch(() => {}); await p.waitForTimeout(900);
        const hd = await p.evaluate(() => getComputedStyle(document.querySelector('.brand-head')).backgroundImage);
        ok(hd.includes(want), `${nm} 메뉴 머리 로고 = ${want}`);
        await p.screenshot({ path: `${OUT}/143-${nm}-home.png` });
      }
      await ctx.close();
    }
  } catch (e) { log.push('✘ 오류 ' + String(e.message).split('\n')[0]); bad++; } finally { cleanup(); }
  console.log(log.join('\n')); console.log(bad ? `❌ ${bad}` : '✅ 통과'); console.log('errors', errs.length ? errs : 'none'); await b.close(); if (bad || errs.length) process.exit(1);
})();
