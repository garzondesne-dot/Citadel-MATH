// 📷 서술형 사진 채점 (v0.9.12 · 2026-11-06) — node tools/e2e/e2e70.js <출력 폴더> [풀이 사진.jpg]
//   교사 「📷 사진 채점」 주소 · 켜기 · 기준표 올리기 → 학생 성채: 1층 07 · 11 열림 · 2층 07 은 잠김(기준표 꺼짐)
//   07: 숫자 답 → 📷 단계(아직 처치 아님 · ans 기록) → 찍기 · 자르기 → (가짜 중계소) 재도전 1/4 → 🙋 이의 신청 → ⏳ 선생님 확인 중
//   교사 대시보드 「📷 서술형」 → ✔ 처치 인정 → 학생이 성채에 다시 들어오면 처치
//   11: 숫자 답 2개 → 📷 → 「하루 3장 다 씀」 안내 → 다시 보내기 → 통과 → 🎉 처치
//   중계소(Apps Script)는 page.route 로 가짜 응답 · 보낸 사진이 JPEG · 긴 변 1024 이하인지 확인
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const OUT = process.argv[2] || '.', U = 'http://localhost:8765/index.html?local', URL_GS = 'https://script.google.com/macros/s/E2E_TEST/exec';
// 풀이 사진: 인자로 받거나 없으면 가로로 긴 그림을 만들어 씀 (긴 변 2400 → 1024 로 줄었는지 확인)
async function photoFile(b) {
  if (process.argv[3]) return process.argv[3];
  const p = await b.newPage({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 2 });
  await p.setContent('<body style="margin:0;background:#f6f4ec;font:bold 46px sans-serif;color:#1e2a5a;padding:40px">07번<br>B∪X=B 이므로 X⊂B<br>A∩X=∅ 이므로 3, 6 은 X에 없다<br>X⊂{9,12,15,18} → 2⁴ = 16</body>');
  const f = path.join(OUT, '70-solution.jpg'); await p.screenshot({ path: f, type: 'jpeg', quality: 85 }); await p.close(); return f;
}
const jpegSize = (buf) => { let i = 2; while (i < buf.length) { if (buf[i] !== 0xff) return null; const m = buf[i + 1], len = buf.readUInt16BE(i + 2); if (m >= 0xc0 && m <= 0xc3) return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) }; i += 2 + len; } return null; };

(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const errs = [], log = [], P = (m) => log.push(m);
  const mk = async (t) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(t + ': ' + e.message + ' @ ' + String(e.stack).split('\n').slice(1, 3).join(' '))); p.on('dialog', (d) => d.accept()); return p; };
  const IMG = await photoFile(b);
  // 가짜 중계소: 차례로 꺼내 씀 · 받은 요청 기록
  const queue = [], got = [];
  await ctx.route('https://script.google.com/**', async (route) => {
    const req = route.request();
    if (req.method() === 'GET') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, alive: true, on: true }) });
    const body = JSON.parse(req.postData() || '{}'); got.push({ ...body, image: body.image ? body.image.length : 0, size: body.image ? jpegSize(Buffer.from(body.image, 'base64')) : null, ctype: req.headers()['content-type'] });
    const r = queue.shift() || { ok: false, err: 'api' };
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(r) });
  });

  // ── 교사: 명단 · 사진 채점 설정 ──
  const T = await mk('T'); await T.goto(U + '&role=teacher'); await T.waitForTimeout(1200);
  await T.fill('#f-teacher .t-id', 'e2e-teacher'); await T.fill('#f-teacher .t-pw', '909090'); await T.click('#f-teacher .t-login'); await T.waitForTimeout(1000);
  await T.click('#s-go'); await T.waitForTimeout(500); await T.fill('#r-cls', '1-3'); await T.fill('#r-text', '1 김민준\n2 이서연'); await T.click('#r-up'); await T.waitForTimeout(800);
  const toMenu = async () => { await T.evaluate(() => { try { DS.Scene.clear(); } catch (e) { /* */ } }); await T.goto(U + '&role=teacher'); await T.waitForTimeout(2200); if (await T.isVisible('#splash')) { await T.click('#splash'); await T.waitForTimeout(400); } if (!(await T.isVisible('#ph-go'))) { await T.click('.role[data-role=teacher]').catch(() => {}); await T.waitForTimeout(800); } };
  await toMenu();
  P('교사 단추: ' + ((await T.textContent('#ph-go').catch(() => '없음')) || '').trim());
  await T.click('#ph-go'); await T.waitForTimeout(800);
  await T.fill('#ph-url', URL_GS); await T.check('#ph-on'); await T.click('#ph-save'); await T.waitForTimeout(800);
  await T.click('#ph-ping'); await T.waitForTimeout(800);
  await T.click('#ph-up'); await T.waitForTimeout(1200);
  const set = await T.evaluate(async () => ({ cfg: await DS.Net.get('gcfg/photo'), on: Object.entries((await DS.Net.get('photo_rubric')) || {}).flatMap(([l, rs]) => Object.entries(rs).filter(([, r]) => r.on).map(([r]) => `${l}/${r}`)), rows: document.querySelectorAll('.ph-rub tr').length - 1 }));
  P('설정: ' + JSON.stringify(set));
  await T.screenshot({ path: `${OUT}/70-1-teacher-settings.png` });
  await T.evaluate(() => document.querySelectorAll('.ph-modal').forEach((e) => e.remove()));

  // ── 학생 가입 · 진도 6 ──
  const S = await mk('S'); await S.goto(U + '&role=student'); await S.waitForTimeout(1500); if (await S.isVisible('#splash')) { await S.click('#splash'); await S.waitForTimeout(500); }
  await S.selectOption('#s-cls', '1-3'); await S.waitForTimeout(200); await S.selectOption('#s-num', '1'); await S.waitForTimeout(300);
  await S.click('#s-new'); await S.fill('#s-p1', '1234'); await S.fill('#s-p2', '1234'); await S.click('#s-make'); await S.waitForTimeout(1200);
  await S.evaluate(() => { localStorage.setItem('citadel-tut-1-3-1', JSON.stringify({ a: true, b: true })); }); await S.click('#s-go'); await S.waitForTimeout(2000);
  await S.evaluate(async () => { await DS.Net.update('xp/1-3/1/tut', { a: true, b: true }); await DS.Net.set('unlock/1-3', 6); });
  const castle = async (floor = 'eval-1') => { await S.evaluate(() => { document.querySelectorAll('.bn-fight, .modal.ph-modal').forEach((e) => e.remove()); DS.Camp.back(); }); await S.waitForTimeout(1500); await S.click('#camp-castle', { force: true }); await S.waitForTimeout(1800); await S.click(`.cs-portal[data-floor="${floor}"]`); await S.waitForTimeout(500); };
  const tile = (id) => S.evaluate((id) => { const b = document.querySelector(`.cs-room [class]`) && [...document.querySelectorAll('.cs-room')].find((x) => (x.querySelector('.cs-no') || {}).textContent === id); return b ? { open: b.hasAttribute('data-fight'), sub: (b.querySelector('.cs-rs') || {}).textContent || '', lock: b.dataset.lockmsg || '' } : null; }, id);
  await castle('eval-1'); const t07 = await tile('07'), t11 = await tile('11');
  await S.click('.cs-portal[data-floor="eval-2"]'); await S.waitForTimeout(500); const t2_07 = await tile('07');
  P(`방: 1층07 ${JSON.stringify(t07)} · 1층11 ${JSON.stringify(t11)} · 2층07 ${JSON.stringify(t2_07)}`);
  await S.click('.cs-portal[data-floor="eval-1"]'); await S.waitForTimeout(400);
  await S.screenshot({ path: `${OUT}/70-2-castle.png`, fullPage: true });

  // 숫자 문제 맞히기 (DS.Quiz.last 의 답을 키패드로)
  const solve = async () => {
    for (let k = 0; k < 6; k++) {
      await S.waitForTimeout(500);
      const fm = await S.evaluate(() => { const f = DS.Bonus._form; if (!f || !document.querySelector('.bn-fight .bf-paper .item')) return false; f.todo.forEach((i) => { const q = f.items[i]; f.G[i] = q.type === 'choice' ? q.answerIndex : q.type === 'multi' ? q.answer.slice() : q.answer; }); DS.Bonus._form = null; f.submit(); return true; }); // 🧩 A안 한 장 꼴
      if (fm) { for (let w = 0; w < 20 && !(await S.$('#bf-photo')); w++) await S.waitForTimeout(300); continue; }
      const open = await S.evaluate(() => !document.getElementById('quiz').classList.contains('hidden'));
      if (!open) { if (await S.$('#bf-photo')) return true; continue; }
      const ans = String(await S.evaluate(() => DS.Quiz.last.answer));
      for (const ch of ans) await S.click(`#quiz [data-rune="0|${ch === '-' ? 'm' : ch}"]`); // ⌨ #97 룬
      await S.click('#quiz-choices .q-submit'); await S.waitForTimeout(1600);
      for (let w = 0; w < 20 && !(await S.$('#bf-photo')) && (await S.evaluate(() => document.getElementById('quiz').classList.contains('hidden'))); w++) await S.waitForTimeout(300);
    }
    return !!(await S.$('#bf-photo'));
  };
  const shoot = async () => {
    await S.click('#bf-photo'); await S.waitForTimeout(700);
    const [fc] = await Promise.all([S.waitForEvent('filechooser'), S.click('#ph-cam')]); await fc.setFiles(IMG); await S.waitForTimeout(1200);
    const bb = await S.$eval('#ph-cv', (c) => { const r = c.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
    await S.mouse.move(bb.x + bb.w * 0.05, bb.y + bb.h * 0.05); await S.mouse.down(); await S.mouse.move(bb.x + bb.w * 0.95, bb.y + bb.h * 0.9, { steps: 6 }); await S.mouse.up(); await S.waitForTimeout(300);
  };

  // ── 07: 숫자 답 → 📷 → 재도전 → 🙋 이의 신청 ──
  const gift0 = await S.evaluate(() => ({ card: !!document.querySelector('[data-fight="eval-1|q07"] .cs-gift'), heroes: null }));
  gift0.heroes = await S.evaluate(async () => (await DS.Account.looks({ c: '1-3', n: 1 })).heroes.filter((h) => [19, 20].includes(h.id)).map((h) => h.open));
  await S.click('[data-fight="eval-1|q07"]'); await S.waitForTimeout(1500); gift0.screen = await S.evaluate(() => (document.querySelector('.bn-fight .bf-gift') || {}).textContent || ''); await S.click('#bf-go');
  const st07 = await solve(); const rec07 = await S.evaluate(() => DS.Net.get('bonus/1-3/1/eval-1/q07'));
  P(`07 숫자 답 뒤: 사진 단추 ${st07} · 기록 ${JSON.stringify({ clear: !!rec07.clear, ans: !!rec07.ans })}`);
  await S.screenshot({ path: `${OUT}/70-3-photo-stage.png` });
  queue.push({ ok: true, id: 'r1', status: 'retry', cool: 30, roomLeft: 1, score: 1, total: 4, pass: 3, steps: [{ id: 's1', pts: 1, earned: 0, note: 'B ∪ X = B 가 무슨 뜻인지 써 봐요.' }, { id: 's2', pts: 1, earned: 0, note: '' }, { id: 's3', pts: 1, earned: 0, note: '' }, { id: 's4', pts: 1, earned: 1, note: '2⁴ = 16 을 정확히 구했어요 👍' }], feedback: 'B − A 를 바르게 구했어요. X ⊂ B 인 이유를 적어 봐요.', left: 2 });
  await shoot(); await S.screenshot({ path: `${OUT}/70-4-crop.png` });
  await S.click('#ph-send'); await S.waitForTimeout(1500);
  await S.evaluate(() => DS.Net.set('photo/1-3/1/eval-1_q07/r1', { at: Date.now(), status: 'retry', score: 1, total: 4, pass: 3, steps: [{ id: 's1', pts: 1, earned: 0 }, { id: 's2', pts: 1, earned: 0 }, { id: 's3', pts: 1, earned: 0 }, { id: 's4', pts: 1, earned: 1 }], ans: '16', conf: 'high', flags: [], fb: 'B − A 를 바르게 구했어요.', ask: '07 …', right: '16', tok: { in: 3200, out: 800 } })); // 중계소가 쓰는 결과 (가짜)
  const res07 = await S.evaluate(() => { const m = document.querySelector('.ph-modal'); return m ? { steps: [...m.querySelectorAll('.ph-steps li')].map((e) => e.className + ':' + e.textContent.trim()), score: (m.querySelector('.ph-score') || {}).textContent || '', fb: (m.querySelector('.ph-fb') || {}).textContent || '', app: !!m.querySelector('#ph-app'), again: !!m.querySelector('#ph-again'), cool: m.querySelector('#ph-again') ? [m.querySelector('#ph-again').disabled, m.querySelector('#ph-again').textContent] : null } : null; });
  P('07 결과 창: ' + JSON.stringify(res07));
  await S.screenshot({ path: `${OUT}/70-5-retry.png` });
  await S.click('#ph-app'); await S.waitForTimeout(400); await S.fill('#ph-at', '2번째 줄에 X ⊂ B 라고 썼어요'); await S.click('#ph-as'); await S.waitForTimeout(1200);
  const after07 = await S.evaluate(async () => ({ pend: ((await DS.Net.get('bonus/1-3/1/eval-1/q07')) || {}).pend, appeal: ((await DS.Net.get('photo/1-3/1/eval-1_q07/r1')) || {}).appeal, msg: (document.querySelector('.bn-body') || document.querySelector('.bf-body') || {}).textContent || '' }));
  P('07 이의 신청 뒤: ' + JSON.stringify({ pend: after07.pend, appeal: after07.appeal && after07.appeal.t, wait: /선생님이 풀이를 확인/.test(after07.msg) }));
  await castle('eval-1'); const t07b = await tile('07'); P('07 방 표시: ' + t07b.sub);

  // ── 교사: 대시보드 📷 서술형 → ✔ 처치 인정 ──
  await toMenu(); P('교사 단추(확인할 것): ' + ((await T.textContent('#ph-go').catch(() => '')) || '').trim());
  await T.evaluate(() => DS.Dash.enter()); await T.waitForTimeout(1500); await T.click('[data-cls="1-3"]').catch(() => {}); await T.waitForTimeout(800);
  await T.click('[data-tab="photo"]'); await T.waitForTimeout(1500);
  const board = await T.evaluate(() => ({ items: [...document.querySelectorAll('#ph-board .fb-item')].map((e) => e.textContent.replace(/\s+/g, ' ').slice(0, 400)), need: (document.querySelector('[data-pf="need"]') || {}).textContent || '', cost: (document.querySelector('.ph-cost') || {}).textContent || '' }));
  P('대시보드: ' + JSON.stringify(board));
  await T.screenshot({ path: `${OUT}/70-6-dashboard.png`, fullPage: true });
  await T.click('#ph-board [data-ok$="|1"]'); await T.waitForTimeout(800);
  const okv = await T.evaluate(() => DS.Net.get('photo/1-3/1/eval-1_q07/r1/ok'));
  // 학생이 성채에 다시 들어오면 처치
  await castle('eval-1'); const rec07b = await S.evaluate(() => DS.Net.get('bonus/1-3/1/eval-1/q07')), t07c = await tile('07');
  P(`✔ 인정(${okv}) 뒤 07: clear ${!!rec07b.clear} · pend ${rec07b.pend || '-'} · 방 「${t07c.sub}」`);

  // ── 11: 숫자 답 2개 → 📷 → 하루 다 씀 안내 → 다시 → 통과 → 처치 ──
  await S.click('[data-fight="eval-1|q11"]'); await S.waitForTimeout(1500); await S.click('#bf-go');
  const st11 = await solve(); P('11 숫자 답 2개 뒤 사진 단추: ' + st11);
  queue.push({ ok: false, err: 'quota' });
  await shoot(); await S.click('#ph-send'); await S.waitForTimeout(1500);
  const q11err = await S.evaluate(() => (document.querySelector('.ph-modal .ph-err') || {}).textContent || '');
  P('11 하루 다 씀: ' + q11err);
  queue.push({ ok: true, id: 'p1', status: 'pass', score: 4, total: 4, pass: 3, steps: [], feedback: '조건을 차근차근 정리해 최댓값과 최솟값을 모두 구했어요.', left: 1 });
  const [fc2] = await Promise.all([S.waitForEvent('filechooser'), S.click('#ph-cam')]); await fc2.setFiles(IMG); await S.waitForTimeout(1000);
  await S.click('#ph-send'); await S.waitForTimeout(1500);
  await S.screenshot({ path: `${OUT}/70-7-pass.png` });
  await S.click('#ph-ok'); await S.waitForTimeout(2500);
  const sc11 = await S.evaluate(async () => { const d = (await DS.Gem.mine({ c: '1-3', n: 1 })) || {}; return { scroll: d.scroll || 0, photo: ((d.log || {})['photo_eval-1_q11'] || {}).g || 0 }; });
  const rec11 = await S.evaluate(() => DS.Net.get('bonus/1-3/1/eval-1/q11')), win11 = await S.evaluate(() => (document.querySelector('.bn-fight .okc') || {}).textContent || '');
  const gift1 = await S.evaluate(async () => (await DS.Account.looks({ c: '1-3', n: 1 })).heroes.filter((h) => [19, 20].includes(h.id)).map((h) => h.open));
  P(`🧑‍🎓 수식 책사 해금: 통과 전 ${JSON.stringify(gift0)} → 통과 뒤 ${JSON.stringify(gift1)}`);
  P(`11 통과 뒤: 📜 ${sc11.scroll} · 💎 사진 ${sc11.photo} · clear ${!!rec11.clear} · ph ${rec11.ph} · 화면 「${win11.slice(0, 30)}」`);
  await S.screenshot({ path: `${OUT}/70-8-win.png` });

  // ⚠ 사용량 경고 · 하루 장 수 설정
  await T.evaluate(async () => { await DS.Net.set(`photo_q/_all/${DS.Photo.day()}`, 200); });
  await toMenu(); const btnWarn = await T.evaluate(() => { const b = document.querySelector('#ph-go'); return b ? b.textContent.trim() + (b.querySelector('[data-ic="warn"], .mk-bd.warn') ? ' ⚠' : '') : ''; });
  await T.click('#ph-go'); await T.waitForTimeout(1000);
  const warn = await T.evaluate(() => ({ box: (document.querySelector('.ph-use') || {}).className || '', txt: (document.querySelector('.ph-use') || {}).textContent || '', daily: (document.querySelector('#ph-daily') || {}).value }));
  await T.fill('#ph-daily', '4'); await T.click('#ph-save'); await T.waitForTimeout(800); const saved = await T.evaluate(() => DS.Net.get('gcfg/photo'));
  await T.screenshot({ path: `${OUT}/70-9-warn.png` });
  P(`경고: 단추 「${btnWarn}」 · ${JSON.stringify(warn)} · 저장 ${JSON.stringify({ room: saved.room, cool: saved.cool, daily: saved.daily, warnDay: saved.warnDay, url: !!saved.url, on: saved.on })}`);
  // 보낸 요청 확인
  P('요청: ' + JSON.stringify(got.map((g) => ({ c: g.c, n: g.n, room: `${g.lesson}/${g.room}`, tok: !!g.idToken, img: g.image, size: g.size, ask: String(g.ask).slice(0, 40), answer: g.answer, params: g.params, ctype: g.ctype }))));
  const C = {
    설정저장: set.cfg && set.cfg.on && set.cfg.url === URL_GS && set.on.join(',') === 'eval-1/q07,eval-1/q11' && set.rows === 7,
    시범방만열림: t07 && t07.open && t11 && t11.open && t2_07 && !t2_07.open && /사진 채점/.test(t2_07.lock),
    숫자뒤사진단계: st07 && !rec07.clear && !!rec07.ans,
    재도전창: res07 && res07.steps.length === 2 && /^no( stamped)?:.*B ∪ X/.test(res07.steps[0]) && /^ok( stamped)?:.*16/.test(res07.steps[1]) && /1/.test(res07.score) && res07.app && res07.again && res07.cool && res07.cool[0] === true && /초 뒤/.test(res07.cool[1]) && /X ⊂ B/.test(res07.fb),
    이의신청: after07.pend === 'r1' && after07.appeal && /X ⊂ B/.test(after07.appeal.t) && /선생님 확인 중/.test(t07b.sub),
    대시보드: board.items.length === 1 && /이의 신청/.test(board.items[0]) && /확인할 것 1/.test(board.need) && /원/.test(board.cost),
    인정뒤처치: okv === true && rec07b.clear && !rec07b.pend && /처치/.test(t07c.sub),
    하루다씀안내: /다 썼어요/.test(q11err),
    서술조각: sc11.scroll === 3 && sc11.photo === 6, // 💎 G.photo (2026-11-07 +20%: 5 → 6)
    수식책사해금: gift0.card && /수식 책사/.test(gift0.screen) && gift0.heroes.join() === 'false,false' && gift1.join() === 'true,true',
    통과처치: st11 && rec11.clear && rec11.ph === 'p1' && /처치/.test(win11),
    경고: /⚠/.test(btnWarn) && /warn/.test(warn.box) && /200/.test(warn.txt) && warn.daily === '6' && saved.daily === 4 && saved.room === 2 && saved.cool === 30 && saved.warnDay === 150 && saved.url === URL_GS && saved.on === true,
    사진크기: got.length === 3 && got.every((g) => g.size && Math.max(g.size.w, g.size.h) <= 1024 && g.idToken && g.c === '1-3' && g.n === 1 && !/json/.test(g.ctype || '')),
    문제숫자: got[0] && got[0].room === 'q07' && got[0].params && got[0].params.N && got[2] && got[2].params && got[2].params.T != null && /최댓값/.test(got[2].ask) && /\//.test(String(got[2].answer)),
  };
  const bad = Object.keys(C).filter((k) => !C[k]); if (bad.length) P('틀린 항목: ' + bad.join(', '));
  console.log(log.join('\n')); console.log(!bad.length ? '✅ 통과' : '❌ 기대와 다름'); console.log('errors', errs.length ? errs : 'none'); await b.close(); if (bad.length || errs.length) process.exit(1);
})();
