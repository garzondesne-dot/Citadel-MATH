const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('file://' + process.argv[2]);
  const r = await p.evaluate(() => [...document.querySelectorAll('.page')].map((pg) => { const ph = pg.getBoundingClientRect(); return [...pg.querySelectorAll('.col')].map((c) => { const last = c.lastElementChild.getBoundingClientRect(); return Math.round(ph.bottom - last.bottom); }); }));
  console.log('남는 공간(px, 음수=넘침):', JSON.stringify(r));
  await p.pdf({ path: process.argv[3], format: 'A4', printBackground: true, margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' } }); await b.close(); })();
