// 교사 폰 (리모컨): 수업 만들기 → 입장 확인 → 단계·소환·재도전·보스·마무리
// 학생별 정답·도움 요청은 이 화면에만 보인다 (종합상황실 큰 화면에는 개인 결과를 띄우지 않는다).
window.DS = window.DS || {};

DS.Teacher = (function () {
  const $ = (s) => document.querySelector(s);
  const { esc } = DS.UI;
  const C = () => DS.Control;
  let code = null, L = null, R = null, raw = null, stop = null, tab = 'run', forge = null, forgeKey = '';

  async function create(lessonId) {
    const r = await DS.Act.createRoom(lessonId);
    try { localStorage.setItem('citadel-teacher', JSON.stringify({ code: r.code, hallKey: r.hallKey, uid: DS.Net.uid() })); } catch (e) { /* 무시 */ }
    return open(r.code, r.hallKey);
  }
  async function open(c, hallKey) {
    const R0 = await DS.Net.get(`rooms/${c}`);
    if (!R0 || !R0.meta) throw Object.assign(new Error('수업을 찾을 수 없어요.'), { user: true });
    if (R0.meta.teacher !== DS.Net.uid()) throw Object.assign(new Error('이 기기에서 만든 수업이 아니에요.'), { user: true });
    code = c;
    DS.UI.show('screen-teacher');
    $('#t-key').textContent = hallKey || '';
    if (stop) stop();
    stop = DS.Net.watch(`rooms/${code}`, (v) => { if (!v) return; raw = v; R = DS.Act.unpackRoom(v); L = DS.Lessons.get(R.meta.lesson); render(); });
  }

  const studentUrl = () => `${location.origin}${location.pathname.replace(/[^/]*$/, '')}index.html?role=student&code=${code}${DS.Net.mode === 'local' ? '&local' : ''}`;
  const hallUrl = () => `${location.origin}${location.pathname.replace(/[^/]*$/, '')}index.html?role=hall&code=${code}${DS.Net.mode === 'local' ? '&local' : ''}`;

  function render() {
    const ph = R.state.phase, ids = DS.Raid.activeIds(R);
    const studs = Object.keys(R.players || {}).filter((u) => !R.players[u].teacher);
    const helpN = Object.keys(R.help || {}).length;
    $('#t-head').innerHTML = `<div><b>수업 ${code}</b> <span class="muted small">${esc(L.title)}</span><br><span class="muted small">종합상황실 키 <b>${esc($('#t-key').textContent)}</b> · 입장 ${studs.length} · 참여 ${ids.length}</span></div>
      <div class="phase-pill">${phaseName(ph)}</div>`;
    $('#t-tabs').innerHTML = [['run', '진행'], ['class', `학생${helpN ? ` 🙋${helpN}` : ''}`], ['forge', '내 카드']].map(([k, n]) => `<button class="tab${tab === k ? ' on' : ''}" data-tab="${k}">${n}</button>`).join('');
    $('#t-tabs').querySelectorAll('.tab').forEach((b) => (b.onclick = () => { tab = b.dataset.tab; forgeKey = ''; render(); }));
    const body = $('#t-body');
    if (tab === 'forge') {
      const key = `${ph}|${R.state.stage}`;
      if (key !== forgeKey || !forge) {
        forgeKey = key;
        body.innerHTML = `<div class="panel framed"><p class="stage-name">⚒ 선생님 연성 · ${esc(L.stages[R.state.stage].name)}</p><p class="muted small">선생님도 카드가 있어야 몬스터를 부를 수 있어요. 종합상황실에서 시범 연성해도 같아요.</p><div id="t-forge"></div></div>`;
        forge = C().teacherForge($('#t-forge'), ctx(), { R: () => R });
      } else forge.redraw();
      return;
    }
    forge = null; forgeKey = '';
    if (tab === 'class') { body.innerHTML = `<div class="panel framed">${grid()}</div>`; bindGrid(body); return; }
    body.innerHTML = `<div class="panel framed">${ph === 'lobby' ? lobby() : summary()}<div id="t-ctrl"></div></div><div id="t-attack-wrap"></div>`;
    C().controls($('#t-ctrl'), ctx());
    if (ph === 'lobby') drawQR();
    if (ph === 'battle') {
      const w = $('#t-attack-wrap');
      w.innerHTML = '<div class="panel framed" id="t-attack"></div>';
      C().teacherAttack($('#t-attack'), ctx(), render);
    }
  }
  const ctx = () => ({ code, R, raw, L });
  const phaseName = (ph) => ({ lobby: '입장 대기', forge: '연성', field: '필드', battle: '전투', result: '결과', boss: '보스전', victory: '종료' })[ph] || ph;

  function lobby() {
    const studs = Object.entries(R.players || {}).filter(([, p]) => !p.teacher).sort((a, b) => a[1].num - b[1].num);
    return `<p class="stage-name">학생 입장</p><div class="qr-row"><div id="t-qr" class="qr"></div><div><p>수업 코드 <b class="big-code">${code}</b></p><p class="muted small break">${esc(studentUrl())}</p><p class="muted small">종합상황실(PC): 첫 화면 → 종합상황실 → 코드 ${code} · 키 ${esc($('#t-key').textContent)}</p></div></div>
      <div class="chips">${studs.map(([, p]) => `<span class="chip">${p.num}번 ${esc(p.nick)}</span>`).join('') || '<span class="muted">아직 아무도 없어요</span>'}</div>`;
  }
  function drawQR() {
    const el = $('#t-qr');
    if (el && window.QRCode) { el.innerHTML = ''; new QRCode(el, { text: studentUrl(), width: 132, height: 132 }); }
  }
  function summary() {
    const ph = R.state.phase, st = L.stages[R.state.stage], ids = DS.Raid.activeIds(R);
    if (ph === 'forge') { const ready = ids.filter((u) => DS.Raid.stageReady(L, R, u)).length; return `<p class="stage-name">⚒ ${esc(st.step)} · ${esc(st.name)}</p><p>단계 카드 완성 <b>${ready}/${ids.length}</b> ${DS.Raid.stageReady(L, R, R.meta.teacher) ? '· 선생님 ✓' : '· <span class="ngc">선생님 카드 아직</span>'}</p>`; }
    if (ph === 'battle') { const s = (R.subs || {})[R.state.round.id] || {}; return `<p class="stage-name">⚔ ${esc(L.typeNames[R.state.round.type])}${R.state.round.attempt > 1 ? ` · 재도전 ${R.state.round.attempt}` : ''}</p><p>학생 제출 <b>${ids.filter((u) => s[u]).length}/${ids.length}</b></p>${notYet(ids.filter((u) => !s[u]))}`; }
    if (ph === 'result') {
      const res = DS.Raid.resolve(L, R);
      const wrong = [...ids, R.meta.teacher].filter((u) => !res.per[u].correct);
      return `<p class="stage-name">${R.state.result.success ? '⚔ 공동 공격 성공' : '💥 공동 공격 실패'}</p>${wrong.length ? `<p>틀린 사람 (교사 폰에만 보임): ${wrong.map((u) => `<b class="ngc">${C().name(R, u)}</b>`).join(' ')}</p><p class="muted small">→ 학생 탭에서 오답 내용 확인 · 설명 후 재도전</p>` : '<p class="okc">모두 정답!</p>'}`;
    }
    if (ph === 'boss') { const hp = DS.Raid.bossHp(L, R); return `<p class="stage-name">👑 ${esc(L.boss.title)}</p><p>보스 체력 <b>${hp.hp}/${hp.max}</b> ${hp.allReached ? '<span class="okc">— 모두 도달!</span>' : ''}</p>`; }
    if (ph === 'victory') { const w = R.state.winner; return `<p class="stage-name">🏆 성채 탈환</p>${w ? `<p>최고 용사: <b>${w.num}번 ${esc(w.nick)}</b> (${w.score}점${w.tie ? ', 동점 추첨' : ''})</p>` : ''}`; }
    return `<p class="stage-name">🚶 필드 · ${esc(st.name)}</p><p class="muted">몬스터를 소환하세요.</p>`;
  }
  const notYet = (us) => (us.length ? `<p class="muted small">아직: ${us.map((u) => `${R.players[u].num}번`).join(', ')}</p>` : '');

  // 학생 한 명씩: 참여 · 카드 · 제출/정답 · 보스 도달 · 도움 요청
  function grid() {
    const ph = R.state.phase, st = L.stages[R.state.stage];
    const studs = Object.entries(R.players || {}).filter(([, p]) => !p.teacher).sort((a, b) => a[1].num - b[1].num);
    const rd = R.state.round, subs = (rd && (R.subs || {})[rd.id]) || {};
    const res = ph === 'result' ? DS.Raid.resolve(L, R) : null;
    const cell = ([u, p]) => {
      const on = !!(R.active || {})[u], help = !!(R.help || {})[u];
      let info = '';
      if (ph === 'forge' || ph === 'field') info = st.cards.map((c) => (DS.Raid.owns(R, u, c) ? '✓' : '·')).join('');
      if (ph === 'battle') info = subs[u] ? '제출' : '…';
      if (ph === 'result' && res.per[u]) info = res.per[u].correct ? '<span class="okc">O</span>' : res.per[u].submitted ? `<span class="ngc">${res.per[u].answerOk ? '카드X' : 'X'}</span>` : '-';
      if (ph === 'boss' || ph === 'victory') info = DS.Raid.mastery(L, R, u).map((m) => (m ? '●' : '○')).join('');
      const pts = Object.values((R.credits || {})[u] || {}).reduce((a, b) => a + b, 0);
      return `<div class="gcell${on ? '' : ' off'}${help ? ' help' : ''}" data-u="${u}">${help ? '<i class="hand">🙋</i>' : ''}<b>${p.num}</b><span class="nick">${esc(p.nick)}</span><span class="info">${info}</span><small>${pts}</small></div>`;
    };
    return `<p class="shelf-title">학생 현황 <span class="muted small">칸을 누르면: 도움 요청 해제 / 참여 끄고 켜기</span></p><div class="tgrid">${studs.map(cell).join('') || '<p class="muted">입장한 학생이 없어요</p>'}</div>
      <p class="muted small">연성: 단계 카드 ✓ · 전투: 제출 · 결과: O / X / 카드X · 보스: 문항 도달 ●</p>`;
  }
  function bindGrid(body) {
    body.querySelectorAll('.gcell').forEach((c) => (c.onclick = () => C().run(async () => {
      const u = c.dataset.u, p = R.players[u];
      if ((R.help || {})[u]) { await DS.Act.clearHelp(code, u); DS.UI.toast(`${p.num}번 도움 요청 해제`); return; }
      const on = !!(R.active || {})[u];
      if (confirm(`${p.num}번 ${p.nick} — 참여를 ${on ? '끌까요? (결석·기기 문제)' : '켤까요?'}`)) await DS.Act.setActive(code, u, !on);
    })));
  }

  return { create, open, hallUrl };
})();
