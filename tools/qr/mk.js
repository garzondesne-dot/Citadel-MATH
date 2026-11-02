const { chromium } = require('playwright');
(async () => { const d = process.argv[2]; const b = await chromium.launch(); const p = await b.newPage(); await p.goto('file://' + d + '/class-qr.html'); await p.waitForTimeout(1200);
  await p.pdf({ path: d + '/수학수업_입장QR_김찬우선생님_A4.pdf', format: 'A4', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
  await b.close(); })();
