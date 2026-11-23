// 시안 찍기: node render.js  (playwright · 파일 열기)
const { chromium } = require('playwright'); const path = require('path');
const list = [['alk-tv-start','alk-tv-1-start',1280,720],['alk-tv','alk-tv-2-play',1280,720],['ajae-tv-1','ajae-tv-1',1280,720],['ajae-tv-2','ajae-tv-2',1280,720],['ajae-ph-1','ajae-ph-1',390,844],['ajae-ph-2','ajae-ph-2',390,844],
  ['alk-ph-start','alk-ph-1-start',390,844],['alk-ph-1','alk-ph-2-aim',390,844],['alk-ph-cool','alk-ph-3-cool',390,844],['alk-ph-2','alk-ph-4-all',390,844],['alk-ph-3','alk-ph-5-fall',390,844]];
(async () => { const b = await chromium.launch();
  for (const [s,f,w,h] of list) { const p = await b.newPage({ viewport:{width:w,height:h}, deviceScaleFactor: w>500?1.5:2 });
    await p.goto('file://' + path.join(__dirname, 'mock.html') + '?s=' + s); await p.waitForTimeout(600);
    await p.screenshot({ path: path.join(__dirname, f + '.png') }); await p.close(); }
  await b.close(); })();
