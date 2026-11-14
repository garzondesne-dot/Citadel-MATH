// 📱 2026-11-14 선생님 「웹앱이 다크 모드는 적용 안 되게」: 크롬 강제 어둡게(forceDarkMode) + 폰 다크 모드(prefers-color-scheme: dark)로 열어도 화면이 보통 때와 한 점도 다르지 않음 (앱 = only dark · 개인정보 쪽 = only light)
//   PORT=8766 node tools/e2e/e2e157.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2] || '.', B = `http://localhost:${process.env.PORT || 8765}/`;
const shot = async (url, args, scheme, wait) => { const b = await chromium.launch({ args }); const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, colorScheme: scheme })).newPage();
  await p.goto(B + url); await p.waitForTimeout(wait); const buf = await p.screenshot(); await b.close(); return buf; };
(async () => { let bad = 0;
  for (const [u, w] of [['index.html?local&role=student', 2500], ['trial/index.html', 2500], ['privacy.html', 800]]) {
    const a = await shot(u, [], 'light', w), d = await shot(u, ['--blink-settings=forceDarkModeEnabled=true'], 'dark', w);
    const same = a.length === d.length && a.equals(d); if (!same) bad++; console.log(`${same ? '✔' : '✘'} ${u} 강제 어둡게 = 보통 때와 같음`); }
  console.log(bad ? `❌ ${bad}` : '✅ 통과'); if (bad) process.exit(1);
})();
