// 📝 학생 설문 (v0.9.8.2 · 2026-11-04 사용자 확정): 7~8차시 마무리 때 반마다 교사가 연다 → 학생은 익명으로 3분 응답 → 대시보드 📝 탭
//   저장 (이름 · 번호 · 시각 없음):
//     survey/{반}          = { open: true, no: 차시 }          ← 교사만 씀 (리모컨 마무리 · 대시보드)
//     surveyA/{반}/{무작위} = { no, r: [[전, 지금] × 7], pick: [i, i], cmp, say, want }  ← 열려 있을 때만 새로 쓰기 · 교사만 읽기
//     surveyDone/{반}/{번호} = true                              ← 응답했는지만 (한 번만 · +5 EXP · 💎+10) · 응답과 이어지는 값 없음
//   응답 키는 무작위(시각이 들어가는 push id 를 쓰지 않음) → EXP 기록 시각과 이어 맞출 수 없다
window.DS = window.DS || {};

DS.Survey = (function () {
  const ck = (c) => String(c).replace(/[.#$/[\]]/g, '_');
  // A. 회고 비교 (중간고사 전 · 지금 각각 1~5)
  const PAIR = [
    '문제를 끝까지 풀어 보려고 했다',
    '틀린 문제를 다시 풀어 봤다',
    '모르면 친구에게 풀이를 묻거나 알려 줬다',
    '답을 보고 옮겨 적지 않고 내가 직접 풀었다',
    '내 답이 맞았는지 바로 알 수 있었다',
    '점수(수행평가)가 아니어도 풀고 싶었다',
    '수학 시간이 기다려졌다',
  ];
  const WHEN = ['2학기 중간고사 전', '지금']; // 2026-11-10 미래교육상 근거: 1학기로 헷갈리지 않게 (문항 · 저장 · 1~5 점수는 그대로)
  const SCALE = ['전혀 아니다', '아니다', '보통', '그렇다', '매우 그렇다'];
  // B. 지금 수업만
  const PICKS = ['재도전', '친구 힐', '보스전', '오답노트', '쉼터 놀이', 'OX 타임'];
  const CMP = ['지금이 더 좋다', '비슷하다', '예전이 더 좋다'];
  const MAXT = 100;

  // 응답 고르기 (화면 · 규칙과 같은 모양) → 틀리면 오류 문장
  function check(a) {
    if (!a || !Array.isArray(a.r) || a.r.length !== PAIR.length) return '모든 문장에 답해 주세요.';
    for (let i = 0; i < PAIR.length; i++) {
      const p = a.r[i];
      if (!Array.isArray(p) || p.length !== 2 || !p.every((v) => Number.isInteger(v) && v >= 1 && v <= 5)) return `${i + 1}번 문장의 「${!p || !p[0] ? WHEN[0] : WHEN[1]}」을 골라 주세요.`;
    }
    if (!Array.isArray(a.pick) || a.pick.length < 1 || a.pick.length > 2 || !a.pick.every((v) => Number.isInteger(v) && v >= 0 && v < PICKS.length) || new Set(a.pick).size !== a.pick.length) return '8번: 도움이 된 것을 1~2개 골라 주세요.';
    if (!Number.isInteger(a.cmp) || a.cmp < 0 || a.cmp >= CMP.length) return '9번을 골라 주세요.';
    return '';
  }
  function clean(a, no) {
    const t = (s) => (DS.Words ? DS.Words.clean(String(s || ''), MAXT) : { text: String(s || '').slice(0, MAXT) }).text.trim();
    return { no: Number(no) || 0, r: a.r.map((p) => [p[0], p[1]]), pick: a.pick.slice(0, 2), cmp: a.cmp, say: t(a.say), want: t(a.want) };
  }
  const rid = () => Array.from({ length: 16 }, () => 'abcdefghijkmnpqrstuvwxyz23456789'[Math.floor(Math.random() * 32)]).join('');

  // ── 집계 (대시보드) ────────────────────────────────
  const avg = (xs) => (xs.length ? Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 100) / 100 : null);
  function summary(list) {
    const L = (list || []).filter((a) => a && Array.isArray(a.r));
    const pairs = PAIR.map((q, i) => {
      const pre = L.map((a) => (a.r[i] || [])[0]).filter(Number.isFinite), now = L.map((a) => (a.r[i] || [])[1]).filter(Number.isFinite);
      const up = L.filter((a) => a.r[i] && a.r[i][1] > a.r[i][0]).length, down = L.filter((a) => a.r[i] && a.r[i][1] < a.r[i][0]).length;
      const a0 = avg(pre), a1 = avg(now);
      return { q, pre: a0, now: a1, diff: a0 == null || a1 == null ? null : Math.round((a1 - a0) * 100) / 100, up, same: L.length - up - down, down };
    });
    const picks = PICKS.map((t, i) => ({ t, n: L.filter((a) => (a.pick || []).includes(i)).length }));
    const cmp = CMP.map((t, i) => ({ t, n: L.filter((a) => a.cmp === i).length }));
    const texts = (k) => L.map((a) => a[k]).filter((s) => s && String(s).trim());
    return { n: L.length, pairs, picks, cmp, say: texts('say'), want: texts('want') };
  }
  function csvRows(byCls) { // { 반: [응답] } → 2차원 표 (한 줄 = 응답 하나 · 이름 없음)
    const head = ['반', '차시', ...PAIR.flatMap((q, i) => [`${i + 1} 전`, `${i + 1} 지금`]), '도움1', '도움2', '쉼터 vs 5분퀴즈', '달라진 점', '바꿨으면'];
    const rows = [];
    Object.keys(byCls).sort().forEach((c) => (byCls[c] || []).forEach((a) => rows.push([c, a.no || '', ...PAIR.flatMap((q, i) => (a.r[i] || ['', ''])), PICKS[(a.pick || [])[0]] || '', PICKS[(a.pick || [])[1]] || '', CMP[a.cmp] || '', a.say || '', a.want || ''])));
    return [head, ...rows];
  }

  // ── 서버 ─────────────────────────────────────────
  const N = () => DS.Net;
  const setOpen = (c, open, no) => N().set(`survey/${ck(c)}`, open ? { open: true, no: Number(no) || 0 } : null);
  const state = (c) => N().get(`survey/${ck(c)}`).catch(() => null);
  // 서버에서 배열이 {0:…,1:…} 로 돌아올 때가 있다 → 배열로 되돌림
  const arr = (v) => (Array.isArray(v) ? v : v && typeof v === 'object' ? Object.keys(v).sort((x, y) => x - y).map((k) => v[k]) : []);
  const norm = (a) => (a ? Object.assign({}, a, { r: arr(a.r).map(arr), pick: arr(a.pick) }) : null);
  async function answers(c) { const v = (await N().get(`surveyA/${ck(c)}`).catch(() => null)) || {}; return Object.values(v).filter(Boolean).map(norm); }
  async function doneCount(c) { const v = (await N().get(`surveyDone/${ck(c)}`).catch(() => null)) || {}; return Object.keys(v).length; }
  const doneKey = (m) => `citadel-survey-${ck(m.c)}-${m.n}`;
  async function isDone(m) {
    try { if (localStorage.getItem(doneKey(m))) return true; } catch (e) { /* 무시 */ }
    return (await N().get(`surveyDone/${ck(m.c)}/${m.n}`).catch(() => null)) === true;
  }
  async function submit(m, a, no) {
    const err = check(a); if (err) throw Object.assign(new Error(err), { user: true });
    if (await isDone(m)) throw Object.assign(new Error('이미 응답했어요. 고마워요!'), { user: true });
    const tst = (await N().get(`tester/${ck(m.c)}/${m.n}`).catch(() => null)) === true; // 🧪 #67 시험 계정 = 응답 집계에 넣지 않음 (응답 표시 · 보상은 학생과 같음)
    if (!tst) await N().set(`surveyA/${ck(m.c)}/${rid()}`, clean(a, no));
    await N().set(`surveyDone/${ck(m.c)}/${m.n}`, true);
    try { localStorage.setItem(doneKey(m), '1'); } catch (e) { /* 무시 */ }
    if (DS.Grow) DS.Grow.add(m, { survey: 1 }, 'survey').catch(() => {});
    if (DS.Gem) await DS.Gem.add(m, DS.Gem.G.survey || 10, 'survey', '수업 설문', { free: true }).catch(() => 0); // 💎 10 (2026-11-06 사용자 · 하루 한도 밖 · 한 번만)
  }

  // ── 학생: 지켜보기 · 버튼 · 설문 창 ───────────────────
  //   watch(m, cb): 우리 반 설문이 열려 있고 아직 안 했으면 cb(차시 번호) · 아니면 cb(0)
  let wStop = null, wKey = '', pend = 0, subs = new Set();
  function watch(m, cb) {
    if (cb) subs.add(cb);
    if (!m || m.c == null || !m.n || m.test) { if (cb) cb(0); return () => subs.delete(cb); }
    const key = `${ck(m.c)}|${m.n}`;
    if (key !== wKey) {
      if (wStop) wStop(); wKey = key; pend = 0;
      wStop = N().watch(`survey/${ck(m.c)}`, async (v) => { pend = v && v.open && !(await isDone(m)) ? Number(v.no) || 1 : 0; subs.forEach((f) => f(pend)); });
    } else if (cb) cb(pend);
    return () => subs.delete(cb);
  }
  const pending = () => pend;
  const btnHtml = (id = 'sv-open') => (pend ? `<button class="btn primary sv-btn" id="${id}">📝 수업 설문 (3분 · 이름 없이) <small>+5 EXP · 💎+10</small></button>` : '');

  function open(m, done) {
    const no = pend; if (!no) return;
    const a = { r: PAIR.map(() => [0, 0]), pick: [], cmp: -1, say: '', want: '' };
    const el = document.createElement('div'); el.className = 'modal sv-modal';
    const scale = (i, w) => `<div class="sv-scale" data-i="${i}" data-w="${w}"><span class="sv-when ${w ? 'now' : 'pre'}">${WHEN[w]}</span>${SCALE.map((s, k) => `<button type="button" class="sv-o" data-v="${k + 1}" title="${s}">${k + 1}</button>`).join('')}</div>`;
    el.innerHTML = `<div class="quiz-box framed sv-box">
      <p class="gold">📝 우리 반 수업 설문 <span class="muted small">· ${no}차시</span></p>
      <p class="sv-anon">🔒 이름 · 번호가 저장되지 않아요. <b>선생님도 누가 뭐라고 답했는지 볼 수 없어요.</b> 점수와도 상관없으니 솔직하게!</p>
      <p class="sv-h">A. 『<b class="sv-pre-em">2학기 중간고사 전</b>』 수학 시간과 『<b class="sv-now-em">지금</b>』 던전 수업을 각각 골라요 · <b class="sv-not1">1학기가 아니에요!</b></p>
      <p class="sv-pre-big">🕰 2학기 중간고사 전 <small>(게임 없이 하던 수업)</small></p>
      <label class="sv-ack" id="sv-ack"><input type="checkbox" id="sv-ack-c"><span>네, <b>2학기 중간고사 전</b>(게임 없이 하던 수업)과 <b>지금</b>을 비교한다는 걸 알았어요</span></label>
      <div class="sv-a sv-lock">
      <p class="sv-legend muted small">1 전혀 아니다 · 2 아니다 · 3 보통 · 4 그렇다 · 5 매우 그렇다</p>
      ${PAIR.map((q, i) => `<div class="sv-q"><p><b>${i + 1}.</b> ${q}</p>${scale(i, 0)}${scale(i, 1)}</div>`).join('')}</div>
      <p class="sv-h">B. 지금 던전 수업</p>
      <div class="sv-q"><p><b>8.</b> 가장 도움이 된 것 <span class="muted small">(2개까지)</span></p><div class="chips sv-picks">${PICKS.map((t, i) => `<button type="button" class="chip" data-pick="${i}">${t}</button>`).join('')}</div></div>
      <div class="sv-q"><p><b>9.</b> 쉼터 놀이를 예전 5분 퀴즈와 비교하면</p><div class="chips sv-cmp">${CMP.map((t, i) => `<button type="button" class="chip" data-cmp="${i}">${t}</button>`).join('')}</div></div>
      <div class="sv-q"><p><b>10.</b> 던전 수업에서 내가 달라진 점 한 가지 <span class="muted small">(안 써도 돼요)</span></p><textarea id="sv-say" maxlength="${MAXT}" rows="2"></textarea></div>
      <div class="sv-q"><p><b>11.</b> 바꿨으면 하는 점 <span class="muted small">(안 써도 돼요)</span></p><textarea id="sv-want" maxlength="${MAXT}" rows="2"></textarea></div>
      <div class="sv-foot"><button class="btn" id="sv-x">나중에</button><button class="btn primary" id="sv-send">📝 보내기</button></div></div>`;
    document.body.appendChild(el);
    let ack = false; const ackB = el.querySelector('#sv-ack'), boxA = el.querySelector('.sv-a');
    const ackC = el.querySelector('#sv-ack-c'); ackC.onchange = () => { ack = ackC.checked; ackB.classList.toggle('on', ack); boxA.classList.toggle('sv-lock', !ack); if (ack && DS.Sound && DS.Sound.clank) DS.Sound.clank(); }; // ☑ 체크 = 동의 · 풀면 다시 잠금
    boxA.addEventListener('click', (e) => { if (!ack) { e.preventDefault(); e.stopPropagation(); ackB.classList.remove('nope'); void ackB.offsetWidth; ackB.classList.add('nope'); DS.UI.toast('먼저 위의 「☐ 네, 2학기 중간고사 전과 … 알았어요」에 체크해 주세요', 2600); } }, true);
    el.querySelectorAll('.sv-scale').forEach((row) => row.querySelectorAll('.sv-o').forEach((b) => (b.onclick = () => {
      a.r[Number(row.dataset.i)][Number(row.dataset.w)] = Number(b.dataset.v);
      row.querySelectorAll('.sv-o').forEach((x) => x.classList.toggle('on', x === b));
    })));
    el.querySelectorAll('[data-pick]').forEach((b) => (b.onclick = () => {
      const v = Number(b.dataset.pick), i = a.pick.indexOf(v);
      if (i >= 0) a.pick.splice(i, 1); else { if (a.pick.length >= 2) a.pick.shift(); a.pick.push(v); }
      el.querySelectorAll('[data-pick]').forEach((x) => x.classList.toggle('on', a.pick.includes(Number(x.dataset.pick))));
    }));
    el.querySelectorAll('[data-cmp]').forEach((b) => (b.onclick = () => { a.cmp = Number(b.dataset.cmp); el.querySelectorAll('[data-cmp]').forEach((x) => x.classList.toggle('on', x === b)); }));
    el.querySelector('#sv-x').onclick = () => el.remove();
    el.querySelector('#sv-send').onclick = () => DS.Control.run(async () => {
      a.say = el.querySelector('#sv-say').value; a.want = el.querySelector('#sv-want').value;
      if (!ack) { ackB.scrollIntoView({ block: 'center', behavior: 'smooth' }); ackB.classList.remove('nope'); void ackB.offsetWidth; ackB.classList.add('nope'); DS.UI.toast('먼저 「☐ 네, 2학기 중간고사 전과 … 알았어요」에 체크해 주세요', 2600); return; }
      const err = check(a);
      if (err) { const i = a.r.findIndex((p) => !p[0] || !p[1]); const q = el.querySelectorAll('.sv-q')[i >= 0 ? i : a.pick.length ? 8 : 7]; if (q) { q.scrollIntoView({ block: 'center', behavior: 'smooth' }); q.classList.remove('nope'); void q.offsetWidth; q.classList.add('nope'); } throw Object.assign(new Error(err), { user: true }); }
      const btn = el.querySelector('#sv-send'); btn.disabled = true;
      try { await submit(m, a, no); } catch (e) { btn.disabled = false; throw e; }
      el.remove(); pend = 0; subs.forEach((f) => f(0));
      if (DS.Sound) DS.Sound.correct();
      DS.UI.toast('📝 고마워요! 설문이 전달됐어요 (+5 EXP · 💎+10)', 3200);
      if (done) done();
    });
  }

  // ── 교사: 수동 열기 (2026-11-06 사용자 「설문 10차시에 열거야 · 안 바뀌네 · 내가 수동으로」) ──
  //   차시 번호는 선생님이 고름 (이 기기 기억 · 기본 10) — 게임 차시 파일이 없는 차시도 OK · 리모컨 마무리 · 교사 메뉴 「📝 설문」 어디서나 같은 번호
  const NOKEY = 'citadel-survey-no';
  const pickNo = () => { try { return Number(localStorage.getItem(NOKEY)) || 10; } catch (e) { return 10; } };
  const keepNo = (v) => { try { localStorage.setItem(NOKEY, String(v)); } catch (e) { /* 이 기기만 */ } };
  const noInput = (id) => `<label class="sv-noin">차시 <input id="${id}" type="number" min="1" max="30" value="${pickNo()}" class="sv-no"></label>`;
  const readNo = (el, id) => { const v = Math.max(1, Math.min(30, Number((el.querySelector('#' + id) || {}).value) || pickNo())); keepNo(v); return v; };
  const ctlHtml = (R, st) => (R && R.meta && R.meta.cls ? `<div class="sv-ctl"><span>📝 설문 <span class="muted small">(${R.meta.cls}반)</span></span>${st && st.open ? `<b class="gold small">열림 · ${DS.Lessons.noText(st.no)}차시</b><button class="btn small" data-sv="close">✕ 닫기</button>` : `${noInput('sv-cno')}<button class="btn small" data-sv="open">열기</button>`}</div>` : '');
  function bindCtl(el, R, L, after) {
    el.querySelectorAll('[data-sv]').forEach((b) => (b.onclick = () => DS.Control.run(async () => {
      const on = b.dataset.sv === 'open', no = on ? readNo(el, 'sv-cno') : 0;
      if (on && !confirm(`${R.meta.cls}반 설문을 ${no}차시로 열까요? (학생 폰 대기실 · 캠프에 📝 버튼)`)) return;
      await setOpen(R.meta.cls, on, no); DS.UI.toast(on ? `📝 ${no}차시 설문을 열었어요` : '📝 설문을 닫았어요'); if (after) after();
    })));
  }
  // 교사 메뉴 「📝 설문」 창: 반마다 · 전체 열기/닫기 · 응답 수
  async function panel() {
    const esc = DS.UI.esc;
    const el = document.createElement('div'); el.className = 'modal fb-modal sv-modal'; document.body.appendChild(el);
    const draw = async () => {
      const cs = Object.keys((await N().get('roster').catch(() => null)) || {}).sort();
      const rows = await Promise.all(cs.map(async (c) => ({ c, st: await state(c).catch(() => null), done: await doneCount(c).catch(() => 0), size: Object.keys((await N().get(`roster/${c}`).catch(() => null)) || {}).length })));
      el.innerHTML = `<div class="quiz-box framed fb-box"><div class="set-head"><h2>📝 수업 설문</h2><button class="btn" data-x>✕ 닫기</button></div>
        <p class="muted small">열면 그 반 학생 폰(대기실 · 캠프)에 📝 버튼이 떠요 · 이름 없이 3분 · 결과는 📊 대시보드 「📝 설문」</p>
        <div class="row">${noInput('sv-pno')}<button class="btn primary" id="sv-all1">모든 반 열기</button><button class="btn" id="sv-all0">모든 반 닫기</button></div>
        <table class="r-table sv-ctlt"><tr><th>반</th><th>상태</th><th>응답</th><th></th></tr>${rows.map((p) => `<tr><td>${esc(p.c)}반</td><td>${p.st && p.st.open ? `<b class="gold">열림 · ${DS.Lessons.noText(p.st.no)}차시</b>` : '<span class="muted">닫힘</span>'}</td><td>${p.done}/${p.size}명</td><td>${p.st && p.st.open ? `<button class="btn small" data-c="${esc(p.c)}" data-on="0">✕ 닫기</button>` : `<button class="btn small primary" data-c="${esc(p.c)}" data-on="1">열기</button>`}</td></tr>`).join('') || '<tr><td colspan="4" class="muted">명단이 없어요</td></tr>'}</table></div>`;
      el.querySelector('[data-x]').onclick = () => el.remove();
      el.querySelector('#sv-pno').onchange = () => readNo(el, 'sv-pno');
      const set = async (list, on) => { const no = readNo(el, 'sv-pno'); for (const c of list) await setOpen(c, on, no); DS.UI.toast(on ? `📝 ${no}차시 설문을 열었어요` : '📝 설문을 닫았어요'); await draw(); };
      el.querySelectorAll('[data-c]').forEach((b) => (b.onclick = () => DS.Control.run(() => set([b.dataset.c], b.dataset.on === '1'))));
      el.querySelector('#sv-all1').onclick = () => DS.Control.run(async () => { if (confirm(`모든 반(${cs.length}개) 설문을 ${readNo(el, 'sv-pno')}차시로 열까요?`)) await set(cs, true); });
      el.querySelector('#sv-all0').onclick = () => DS.Control.run(async () => { if (confirm('모든 반 설문을 닫을까요?')) await set(cs, false); });
    };
    await draw();
  }

  return { norm, PAIR, WHEN, SCALE, PICKS, CMP, MAXT, check, clean, summary, csvRows, setOpen, state, answers, doneCount, isDone, submit, watch, pending, btnHtml, open, ctlHtml, bindCtl, panel, pickNo, keepNo };
})();
