// 🎵 2026-11-13 선생님 「배경 음악 끄는 기능」: 🔊 소리 탭 = 효과음 · 배경음 두 칸 · 배경음 끄면 바로 멈춤 · 새로 고침 뒤에도 꺼짐 · 둘 다 끄면 🔇 — PORT=8766 node tools/e2e/e2e137.js <출력 폴더>
const { chromium } = require('playwright');
const OUT = process.argv[2] || '.', BASE = `http://localhost:${process.env.PORT || 8765}`;
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [], log = []; let bad = 0;
  const ok = (c, s) => { log.push((c ? '✔ ' : '✘ ') + s); if (!c) bad++; };
  for (const [nm, url] of [['정식', '/index.html?local'], ['체험판', '/trial/']]) {
    const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(nm + ': ' + e.message));
    await p.goto(BASE + url); await p.waitForTimeout(2500);
    await p.evaluate(() => { DS.Sound.setBgm(true); DS.Sound.setSfx(true); });
    // 배경음이 도는 척: 캠프 곡 자리 요청 → 끄면 멈춤(재생 중인 오디오 없음)
    await p.evaluate(() => DS.Sound.bgm && DS.Sound.bgm('camp', 'phone'));
    await p.click('#snd-tab'); await p.waitForTimeout(300);
    const btns = await p.evaluate(() => [...document.querySelectorAll('#snd-pop [data-k]')].map((x) => x.dataset.k + ':' + x.textContent.trim()));
    ok(btns.length === 2 && btns[1].startsWith('bgm'), `${nm}: 소리 탭 = 효과음 · 배경음 두 칸 (${btns.join(' | ')})`);
    await p.screenshot({ path: `${OUT}/137-${nm === '정식' ? 'main' : 'trial'}.png` });
    await p.click('#snd-pop [data-k="bgm"]'); await p.waitForTimeout(1200);
    const st = await p.evaluate(() => ({ bgm: DS.Sound.bgmOn, ls: localStorage.getItem('ds-bgm-off'), txt: document.querySelector('#snd-pop [data-k="bgm"]').textContent, playing: [...document.querySelectorAll('audio')].some((a) => !a.paused), icon: document.getElementById('snd-tab').classList.contains('off') ? 'off' : 'on' }));
    ok(!st.bgm && /꺼짐/.test(st.txt) && st.icon === 'on', `${nm}: 배경음 끔 → 꺼짐 표시 · 효과음 켜짐이라 탭은 켜짐 🔊 (${JSON.stringify(st)})`);
    await p.click('#snd-pop [data-k="sfx"]'); await p.waitForTimeout(300);
    ok(await p.evaluate(() => document.getElementById('snd-tab').classList.contains('off')), `${nm}: 둘 다 끄면 🔇`);
    if (nm === '정식') { await p.reload(); await p.waitForTimeout(2000); ok(await p.evaluate(() => !DS.Sound.bgmOn && !DS.Sound.sfxOn), '정식: 새로 고침 뒤에도 꺼진 채 (이 기기 기억)'); await p.evaluate(() => { DS.Sound.setBgm(true); DS.Sound.setSfx(true); }); }
    await p.close();
  }
  console.log(log.join('\n')); console.log(bad ? `❌ ${bad}` : '✅ 통과'); console.log('errors', errs.length ? errs : 'none'); await b.close(); if (bad || errs.length) process.exit(1);
})();
