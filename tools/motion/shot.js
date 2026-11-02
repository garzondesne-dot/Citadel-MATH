// 컨택트 시트: node shot.js 11 2,5,8,12,18,24  → out/sheet-11.png
const { chromium } = require('playwright'); const { execSync } = require('child_process');
require('fs').mkdirSync(__dirname + '/out', { recursive: true });
(async () => { const [v, ts] = [process.argv[2], process.argv[3].split(',').map(Number)];
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } }); const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(`file://${__dirname}/index.html?v=${v}`); await p.waitForTimeout(500);
  const files = [];
  for (const t of ts) { await p.evaluate((t) => window.render(t), t); const f = `${__dirname}/out/s${v}-${t}.png`; await p.screenshot({ path: f }); files.push(f); }
  await b.close();
  const n = files.length, cols = 3, rows = Math.ceil(n / cols);
  execSync(`ffmpeg -y -loglevel error ${files.map((f) => `-i ${f}`).join(' ')} -filter_complex "${files.map((_, i) => `[${i}]scale=640:360[s${i}]`).join(';')};${files.map((_, i) => `[s${i}]`).join('')}xstack=inputs=${n}:layout=${files.map((_, i) => `${(i % cols) * 640}_${Math.floor(i / cols) * 360}`).join('|')}:fill=black" ${__dirname}/out/sheet-${v}.png`);
  console.log('sheet ok', errs.length ? errs : '');
})();
