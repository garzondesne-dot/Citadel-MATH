// 교사 폰 (리모컨): 수업 중에는 ◀ 뒤로 / 앞으로 ▶ 두 버튼 + 도움이 필요한 학생 + 기준% 조절만.
// 학생별 정답·도움 요청은 이 화면에만 보인다 (종합상황실에는 정답 글자를 띄우지 않는다).
window.DS = window.DS || {};

DS.Teacher = (function () {
  const $ = (s) => document.querySelector(s);
  const { esc } = DS.UI;
  const C = () => DS.Control, Raid = () => DS.Raid;
  let wasClosed = null, curKey = '';
  let code = null, L = null, R = null, raw = null, stop = null, tick = 0, showKey = 0, videos = {}, vStop = null, vLesson = '';
  let svSt = null, svStop = null, svCls = ''; // 📝 이 반 설문 열림 상태 (v0.9.8.2)
  // 교사 폰에서는 종합상황실 키를 바로 보여 준다 (종합상황실 입력칸만 **** 로 가림 — 사용자 결정 v0.5.0)
  const keyHtml = () => `<b>${esc($('#t-key').textContent) || '—'}</b>`;

  async function create(lessonId, cls, opt = {}) {
    // 2026-11-08: 한 반에 던전 하나만 — 이미 열린 던전이 있으면 닫을지 묻는다 (아니오 = 새 던전 안 만듦)
    if (cls) {
      const k = `live/${String(cls).replace(/[.#$/[\]]/g, '_')}`, lv = await DS.Net.get(k).catch(() => null);
      if (lv && lv.open && lv.code && lv.code !== opt.resumeOf) {
        const old = DS.Lessons.get(lv.lesson);
        if (!window.confirm(`⚠ ${cls}반에 이미 열린 던전이 있어요.\n\n${old ? `${old.no ? `${DS.Lessons.noText(old.no)}차시 · ` : ''}${old.title || ''}` : ''} (코드 ${lv.code})\n\n[확인] 기존 던전을 닫고 새 던전을 열어요 (학생은 결과를 보고 내 캠프로)\n[취소] 새 던전을 만들지 않아요`)) return null;
        await DS.Act.endClassAsk(lv.code).catch(() => {});
        await DS.Net.remove(k).catch(() => {});
      }
    }
    const r = await DS.Act.createRoom(lessonId, cls, opt);
    try { localStorage.setItem('citadel-teacher', JSON.stringify({ code: r.code, hallKey: r.hallKey, uid: DS.Net.uid() })); } catch (e) { /* 무시 */ }
    try { const a = JSON.parse(localStorage.getItem('citadel-rooms')) || []; a.unshift({ code: r.code, cls: cls || '', lesson: lessonId, uid: DS.Net.uid(), at: Date.now() }); localStorage.setItem('citadel-rooms', JSON.stringify(a.slice(0, 30))); } catch (e) { /* 무시 */ } // 📋 만든 수업 목록
    return open(r.code, r.hallKey); // v0.9.2: 교사 폰은 리모컨에서 바로 시작 (교사 캠프는 종합상황실 첫 화면 · 수업 끝 뒤 버튼)
  }
  C().onTimeUp('teacher', (now) => { if (!R || !L || !code || !document.getElementById('screen-teacher').classList.contains('active')) return; const d = Raid().deadline(R); if (d && now >= d && !Raid().isClosed(R)) DS.Act.timeUp(code, R, L).catch(() => {}); });
  C().onTimeUp('teacher-bat', () => { if (R && L && code && document.getElementById('screen-teacher').classList.contains('active')) DS.Act.batTick(code, R, L).catch(() => {}); }); // 🦇 황금 박쥐 (v0.9.11)
  async function open(c, hallKey) {
    if (DS.Art.loadTeacherCfg) await DS.Art.loadTeacherCfg(); // 🧙 #32 선생님 설정 = 서버 gcfg/teacher
    const R0 = await DS.Net.get(`rooms/${c}`);
    if (!R0 || !R0.meta) throw Object.assign(new Error('수업을 찾을 수 없어요.'), { user: true });
    if (R0.meta.teacher !== DS.Net.uid()) throw Object.assign(new Error('이 기기에서 만든 수업이 아니에요.'), { user: true });
    code = c; wasClosed = null; curKey = hallKey || '';
    DS.UI.wake.on(); // v0.9.3 긴급: 교사 폰 화면이 저절로 꺼지지 않게
    DS.UI.show('screen-teacher');
    DS.Scene.save({ role: 'teacher', code: c, hallKey: hallKey || '' });
    $('#t-key').textContent = hallKey || '';
    if (stop) stop();
    stop = DS.Net.watch(`rooms/${code}`, (v) => { if (!v) return; raw = v; R = DS.Act.unpackRoom(v); L = DS.Lessons.get(R.meta.lesson);
      if (vLesson !== L.id) { vLesson = L.id; if (vStop) vStop(); vStop = DS.Net.watch(`prep/${L.id}/video`, (x) => { videos = x || {}; if (R) render(); }); }
      if (DS.Survey && R.meta.cls && svCls !== R.meta.cls) { svCls = R.meta.cls; if (svStop) svStop(); svStop = DS.Net.watch(`survey/${String(svCls).replace(/[.#$/[\]]/g, '_')}`, (x) => { svSt = x; if (R) render(); }); }
      render(); DS.Act.admitLate(code, R, L); DS.Act.markBossWin(code, R, L);
      // v0.9.2: 수업이 끝나도 이 화면에 남는다 → 「🏛 교사 캠프 가기」 버튼이 켜짐
      wasClosed = DS.Raid.isClosed(R); });
    clearInterval(tick); tick = setInterval(() => { if (R) render(); }, 15000); // "2분째 미제출" 갱신
  }
  const studentUrl = () => `${location.origin}${location.pathname.replace(/[^/]*$/, '')}index.html?role=student&code=${code}${DS.Net.mode === 'local' ? '&local' : ''}`;

  let moreOpen = false; // ⋯ 더보기 (체력 기준 · 풀이 시간 — 종합실 조작 막대에는 없음 · 리모컨에서만)
  if (typeof window !== 'undefined') window.addEventListener('ds-roster', () => { try { if (R && L) render(); } catch (e) { /* 무시 */ } }); // 🧮 명단 번호를 받으면 다시 그림
  function render() {
    const studs = Object.keys(R.players || {}).filter((u) => !R.players[u].teacher);
    const total = L.steps.length, i = R.state.step ?? -1;
    $('#t-head').innerHTML = `<div><b>수업 ${code}</b> <span class="muted small">${esc(L.title)}</span><br><span class="muted small">종합상황실 키 ${keyHtml()} · 입장 ${studs.length}${Raid().isLobby(R) ? '' : ` · 대기실 인원 ${Raid().headcount(R)}`}</span></div>
      <div class="phase-pill">${i < 0 ? '대기' : Raid().isClosed(R) ? '끝' : i >= total ? '마무리' : `${i + 1}/${total}`}</div>`;
    $('#t-tabs').innerHTML = '';
    const tb = $('#t-tbar'); if (tb) { const sig = `${Raid().deadline(R)}|${Raid().isClosed(R)}|${Raid().bossHp(L, R).won}|${Raid().isLobby(R)}|${(R.state || {}).extend || 0}`; if (tb.dataset.sig !== sig) { tb.dataset.sig = sig; tb.innerHTML = C().tbarHtml(L, R, { mini: true, ext: true }); } C().bindExtend(tb, code, R); } // 2026-11-06 사용자 「교사 폰 타이머가 0으로 줄었다 늘었다」: 방이 바뀔 때마다 막대를 새로 그려 폭 0 → 제자리로 다시 늘어나던 것 → 마감 · 연장 · 승리가 바뀔 때만 다시 그림
    const body = $('#t-body');
    const live = !Raid().isLobby(R) && !Raid().isClosed(R);
    // 2026-11-07 정돈판 ⑥ 비교 14: 위에서부터 [지금 · 제출 · 도움 필요] [⋯ 더보기] [⏸ 수업 끝] [단추 줄 8칸] … [◀ 뒤로 · 앞으로 ▶ 맨 아래]
    const sd = (R.state || {}).sound || { sfx: true, bgm: true }, sndOn = sd.sfx !== false || sd.bgm !== false, sndLv = !sndOn ? 'off' : sd.vol || 'mid'; // 🔉 #24: 보통 → 작게 → 🔇 → 보통
    const more = live ? C().draftHtml(L, R) + C().oldHtml(R) + C().chainHtml(L, R) + (() => { const sh = C().solveHtml(L, R), frozen = /data-sl="now"/.test(sh); /* ❄ 생각 시간 중이면 「지금 풀기」를 서랍 밖에 */ return `${frozen ? sh : ''}<details class="t-more" id="t-more"${moreOpen ? ' open' : ''}><summary>⋯ 더보기 · 체력 기준 · 풀이 시간</summary>${C().pctHtml(L, R)}${frozen ? '' : sh}</details>`; })() : (Raid().isLobby(R) ? C().missingHtml(R) + C().oldHtml(R) : '') + C().pctHtml(L, R);
    const grid8 = () => {
      if (Raid().restOn(R)) return C().restBtn(R);
      const st = Raid().stepOf(L, R), fight = st && (st.kind === 'monster' || st.kind === 'boss');
      const vid = st && DS.Video.ok(DS.Video.pick(L, videos, st.id)), von = vid && Raid().videoOn(R, st.id);
      const t = (attr, ic, cap, on, off) => `<button class="rg-b${on ? ' on' : ''}" ${off ? 'disabled' : attr}><i>${ic}</i><span>${cap}</span></button>`;
      return `<div class="rg rg8">${t('data-rest', '🏕', '쉼터')}${t(vid ? `data-video="${st.id}"` : '', '🎬', von ? '영상 닫기' : '영상', von, !vid)}${t('data-focus', '🔴', Raid().focusOn(R) ? '집중 끄기' : '집중', Raid().focusOn(R))}${t('id="t-gift"', '💎', '선물', false, !(DS.Gem && R.meta.cls))}${t('id="t-snd"', sndLv === 'off' ? '🔇' : sndLv === 'low' ? '🔉' : '🔊', sndLv === 'off' ? '소리 꺼짐' : sndLv === 'low' ? '소리 작게' : '소리 보통', sndLv === 'off')}${t('data-extend', '⏰', '+5분', false, !Raid().deadline(R))}${t('data-sheet', '📄', Raid().sheetOn(R) ? '레이드로' : '문제', Raid().sheetOn(R), !fight)}${t('id="t-demo"', '🎮', '시연', false, true)}</div>`;
    };
    body.innerHTML = `<div class="panel framed t-now">${now()}${!Raid().isLobby(R) && !Raid().isEnd(L, R) ? helpPanel() : ''}</div>
      ${more}${C().saveBtn(R, L)}${live ? grid8() : ''}
      ${Raid().isLobby(R) ? lobby() : Raid().isEnd(L, R) ? `<div class="panel framed">${DS.Survey ? DS.Survey.ctlHtml(R, svSt) : ''}${C().wordsHtml(R)}</div>` : ''}
      ${DS.ShareCard.klassReady(L, R) ? '<button class="btn sc-btn" id="t-news">🏫 학급 결과 · 우리 반 수업 소식</button>' : ''}${DS.Punch && R.meta.cls && L.no && !L.eval && (Raid().isEnd(L, R) || Raid().isClosed(R)) ? `<button class="btn small" id="t-punch">🏁 반대항 경주 ${DS.Act.punchOff(R) ? '꺼짐 → 켜기' : '켜짐 → 끄기'}</button>` : ''}${!live && DS.Gem && R.meta.cls ? '<button class="btn small" id="t-gift">💎 마정석 선물</button>' : ''}${Raid().isClosed(R) ? '<button class="btn primary" id="t-tcamp">🏛 교사 캠프 가기</button>' : ''}
      <div class="t-pad"><button class="btn t-back" id="t-back"${i < 0 ? ' disabled' : ''}>◀<br>뒤로</button><button class="btn primary t-fwd" id="t-fwd"${Raid().isClosed(R) ? ' disabled' : ''}>${Raid().isFinale(L, R) ? '수업 끝 ▶' : '앞으로 ▶'}<small>${esc(C().nextName(L, R))}</small></button></div>`;
    if (Raid().isLobby(R)) drawQR();
    C().bindMissing(body, code); C().bindChain(body, code, R, L); C().bindRest(body, code, R); C().bindPct(body, code, R, L); C().bindFocus(body, code, R); C().bindSheet(body, code, R); C().bindVideo(body, code, R); C().bindWords(body, code, R); C().bindLesson(body, code, R); C().bindSave(body, code, R, L); C().bindSolve(body, code, R, L);
    { const mo = $('#t-more'); if (mo) mo.ontoggle = () => { moreOpen = mo.open; }; } // ⋯ 더보기 서랍: 다시 그려도 열린 채로
    if (DS.Survey) DS.Survey.bindCtl(body, R, L);
    const nb = $('#t-news'); if (nb) nb.onclick = () => C().run(() => DS.ShareCard.klassOpen(L, R, { praise: true }));
    const pb = $('#t-punch'); if (pb) pb.onclick = () => C().run(async () => { const off = !DS.Act.punchOff(R); await DS.Act.setPunchOff(code, off); DS.UI.toast(off ? '🏁 반대항 경주를 껐어요 (다음 수업도 꺼짐)' : '🏁 반대항 경주를 켰어요'); });
    const gb = $('#t-gift'); if (gb) gb.onclick = () => giftModal();
    { const sn = $('#t-snd'); if (sn) sn.onclick = () => C().run(() => { const nx = sndLv === 'mid' ? 'low' : sndLv === 'low' ? 'off' : 'mid'; return DS.Act.setSound(code, { sfx: nx !== 'off', bgm: nx !== 'off', vol: nx === 'off' ? sndLv === 'off' ? 'mid' : 'low' : nx }); }); } // 🔊 종합실 효과음 · 배경음 한꺼번에
    C().bindExtend(body, code, R);
    const cb = $('#t-tcamp'); if (cb) cb.onclick = () => C().run(() => { if (stop) stop(); stop = null; clearInterval(tick); return DS.TCamp.enter({ code, hallKey: curKey }); });
    body.querySelectorAll('[data-help]').forEach((b) => (b.onclick = () => C().run(() => DS.Act.clearHelp(code, b.dataset.help))));
    $('#t-fwd').onclick = () => C().run(() => C().forward(code, R, L));
    $('#t-back').onclick = () => C().run(() => C().back(code, R, L, () => { if (stop) stop(); stop = null; clearInterval(tick); return DS.TCamp.enter({ code, hallKey: curKey }); }));
  }
  // 💎 마정석 선물 (2026-11-06 사용자 · 교사 폰 리모컨에서만): +10 기준 · 5개씩 조정 · 고른 학생 또는 모두에게 (하루 한도 밖)
  function giftModal() {
    const cls = R.meta.cls, studs = Object.keys(R.players || {}).filter((u) => !R.players[u].teacher && R.players[u].num).map((u) => R.players[u]).sort((a, b) => a.num - b.num);
    if (!studs.length) { DS.UI.toast('아직 들어온 학생이 없어요.'); return; }
    let g = 10; const pick = new Set();
    const ov = document.createElement('div'); ov.className = 'modal'; document.body.appendChild(ov);
    const draw = () => {
      ov.innerHTML = `<div class="quiz-box framed gift-box"><div class="set-head"><h2>💎 마정석 선물</h2><button class="btn" id="gf-x">✕ 닫기</button></div>
        <div class="gift-amt"><button class="btn" id="gf-m">− 5</button><b>💎 ${g}</b><button class="btn" id="gf-p">+ 5</button></div>
        <p class="muted small">${esc(cls)}반 · 학생을 눌러 고르세요 (하루 한도와 상관없이 바로 들어가요 · 학생 캠프에 「🎁 선생님 선물」 알림)</p>
        <div class="gift-grid">${studs.map((p) => `<button class="gift-st${pick.has(p.num) ? ' on' : ''}" data-n="${p.num}"><b>${p.num}</b> ${esc(p.nick || '')}</button>`).join('')}</div>
        <div class="gift-go"><button class="btn primary" id="gf-sel"${pick.size ? '' : ' disabled'}>고른 ${pick.size}명에게 💎${g}</button><button class="btn" id="gf-all">모두에게 💎${g} (${studs.length}명)</button></div></div>`;
      ov.querySelector('#gf-x').onclick = () => ov.remove();
      ov.querySelector('#gf-m').onclick = () => { g = Math.max(5, g - 5); draw(); };
      ov.querySelector('#gf-p').onclick = () => { g = Math.min(100, g + 5); draw(); };
      ov.querySelectorAll('[data-n]').forEach((b) => (b.onclick = () => { const n = Number(b.dataset.n); if (pick.has(n)) pick.delete(n); else pick.add(n); draw(); }));
      const send = (list) => C().run(async () => {
        if (!list.length || !confirm(`${list.length}명에게 💎 ${g}개씩 선물할까요?`)) return;
        const tag = Date.now().toString(36);
        for (const n of list) await DS.Gem.gift(cls, n, g, tag);
        DS.Sound.coin && DS.Sound.coin(); DS.UI.toast(`🎁 ${list.length}명에게 💎 ${g}개씩 선물했어요!`, 3000); ov.remove();
      });
      ov.querySelector('#gf-sel').onclick = () => send([...pick]);
      ov.querySelector('#gf-all').onclick = () => send(studs.map((p) => p.num));
    };
    draw();
  }
  function now() {
    const step = Raid().stepOf(L, R);
    const head = `<p class="muted small">지금</p><p class="stage-name">${esc(C().stepName(L, R))}</p>`;
    if (!step) return head;
    if (step.kind === 'monster') {
      const ids = Raid().activeIds(R), sub = ids.filter((u) => Raid().record(L, R, step.id, u).submitted).length;
      return `${head}<p>제출 <b>${sub}/${ids.length}</b>${Raid().cleared(L, R, step.id) ? ' · <span class="okc">격파!</span>' : ''}</p>`;
    }
    if (step.kind === 'boss') { const hp = Raid().bossHp(L, R); return `${head}<p>${hp.won ? '<span class="okc">보스 격파!</span>' : `데미지 ${hp.dmg}/${hp.max}`}</p>`; }
    return `${head}<p class="muted small">종합상황실에 학습지가 떠 있어요. 학생 폰은 집중모드예요. 설명이 끝나면 ▶</p>`;
  }
  function lobby() {
    const studs = Object.entries(R.players || {}).filter(([, p]) => !p.teacher).sort((a, b) => a[1].num - b[1].num);
    return `<div class="panel framed"><p class="stage-name">학생 입장 ${C().lessonBtn(R)}</p><div class="qr-row"><div id="t-qr" class="qr"></div><div><p>수업 코드 <b class="big-code">${code}</b></p><p class="muted small break">${esc(studentUrl())}</p><p class="muted small">종합상황실(PC): 첫 화면 → 종합상황실 → 코드 ${code} · 키는 위쪽 [보기]</p></div></div>
      <div class="chips">${studs.map(([, p]) => `<span class="chip">${DS.Titles.nameHtml(p, { beon: true, size: 14, short: true })}</span>`).join('') || '<span class="muted">아직 아무도 없어요</span>'}</div></div>`;
  }
  function drawQR() {
    const el = $('#t-qr');
    if (el && window.QRCode) { el.innerHTML = ''; new QRCode(el, { text: studentUrl(), width: 132, height: 132 }); }
  }
  function helpPanel() {
    const list = Raid().helpList(L, R, DS.Net.now());
    const why = { 2: 'lv2', 1: 'lv1', 0: 'lv0' };
    const old = DS.Fresh ? DS.Fresh.oldIn(R, Raid().activeIds(R).filter((u) => u !== Raid().teacherUid(R))) : [], oldLine = old.length ? `<p class="t-old">🔄 옛 판 <b>${old.length}</b>명: ${old.map((o) => `${o.num}번`).join(' · ')} <span class="muted small">(새 판으로 바뀌면 저절로 사라져요 · 안 바뀌면 앱을 껐다 켜게)</span></p>` : ''; // 🔄 #55 ④
    return `<div class="panel framed">${oldLine}<p class="t-help-head"><b>도움 필요 <span class="gold">${list.length}</span></b><span class="muted small">해결하면 저절로 사라져요</span></p>
      ${list.map((h) => `<button class="t-help ${why[h.level]}" data-help="${h.uid}"><b>${esc(C().name(R, h.uid))}</b><span>${esc(h.why)}</span></button>`).join('') || '<p class="muted small">지금은 없어요 👍</p>'}</div>`;
  }

  return { create, open, code: () => code, live: () => !!(code && R && document.getElementById('screen-teacher').classList.contains('active') && !Raid().isClosed(R)) };
})();
