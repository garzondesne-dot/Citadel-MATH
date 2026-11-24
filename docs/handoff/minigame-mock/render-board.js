// 게시판 출정 시안 찍기: node render-board.js
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch();
  for (const s of ['1-list', '2-empty', '3-many', '4-password']) { const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    await p.goto('file://' + path.join(__dirname, 'board.html') + '?s=' + s); await p.waitForTimeout(500);
    await p.screenshot({ path: path.join(__dirname, 'board-join-' + s + '.png') }); await p.close(); }
  await b.close(); })();
