// 학생 화면 (스마트폰): 모닥불 → 차원문(수업 코드) → 던전 단체 대기실 → [개념 설명(집중모드) → 몬스터와 1:1 대치] … → 보스(형성평가)
//   → 클리어(📮 확인도장 · 🏕 대기실로 이동) → 단체 대기실(마지막 한마디 · 만점이면 ⚒ 모루) → 수업 끝 → 모닥불
// 몬스터: 소문제를 모두 풀고 제출하면 바로 채점 → 공격 성공(내 이펙트) / 부분 성공 / 실패 → 재도전 2번까지(숫자가 모두 바뀜)
// 문제는 언제나 앱에 전부 보인다. 첫 시도(세트1)는 위에 작은 "📄 학습지 문제 n (k)" 꼬리표, 재도전(세트2)은 "🔄 숫자가 바뀌었어요".
// 집중모드(state.focus)가 켜지면 어떤 장면이든 위에 반투명 막 + 빨간 ⚠ WARNING 으로 멈춘다.
window.DS = window.DS || {};

DS.Student = (function () {
  const $ = (s) => document.querySelector(s);
  const { esc, pretty } = DS.UI;
  const Raid = () => DS.Raid;
  let code = null, L = null, R = null, raw = null, me = null, stop = null;
  let form = null;          // 풀고 있는 시도 { key, given: [] }
  let retrying = '';        // '몬스터id|다음 시도' — "다시 도전"을 누른 상태
  let shown = '';           // 결과 연출을 한 번만
  let bossSet = 1, bossThink = 0;
  let drawn = '';           // 지금 그려 둔 화면의 서명 — 다른 학생의 제출로 방 값이 바뀌어도 내 화면은 다시 그리지 않는다 (터치가 씹히지 않게)

  let info0 = null, focusWas = false, cleared0 = false, locked = false;
  let test = null;          // 🧪 테스트 모드: { prep: 학습지 이미지, exit() } — 이 기기 안에서만, 집중모드 대신 학습지 이미지
  async function enter(c, info, opt = {}) {
    test = opt.test || null;
    cleared0 = false; drawn = ''; shown = ''; form = null; retrying = ''; bossSet = 1; othersSeen = {};
    await DS.Act.join(c, info);
    code = c; info0 = info;
    me = DS.Net.uid();
    if (!test) { try { localStorage.setItem('citadel-student', JSON.stringify({ code: c, ...info })); } catch (e) { /* 무시 */ } }
    DS.UI.show('screen-student');
    if (!test) DS.Scene.save({ role: 'student', code: c });
    DS.Act.presence(c).catch(() => {});
    locked = !!(info.cls && (await DS.Net.get(`wordLock/${String(info.cls).replace(/[.#$/[\]]/g, '_')}/${info.num}`).catch(() => null)));
    if (stop) stop();
    stop = DS.Net.watch(`rooms/${code}`, (v) => {
      if (!v) return;
      raw = v; R = DS.Act.unpackRoom(v);
      L = DS.Lessons.get(R.meta.lesson);
      render();
    });
  }
  const acc = () => ({ c: info0.cls, n: info0.num, name: info0.nick, hero: info0.hero, fx: info0.fx });
  // 수업이 끝나면 모닥불로
  function toCamp() { if (stop) stop(); stop = null; focus(false); if (test) { const t = test; test = null; t.exit(); return; } DS.Camp.enter(acc()); }
  const stop0 = () => { if (stop) stop(); stop = null; focus(false); test = null; };
  // 집중모드 막
  function focus(on) {
    const el = $('#focus');
    if (!on) { el.hidden = true; focusWas = false; return; }
    const step = Raid().stepOf(L, R);
    el.hidden = false;
    el.innerHTML = `<div class="focus-top"><b>⚠ WARNING</b><span>선생님에게 주목하세요</span></div>
      <div class="focus-body"><p class="focus-step">${step ? esc(step.title) : ''}</p>${step && step.say ? `<p class="focus-say">${pretty(step.say)}</p>` : ''}<p class="muted small">화면이 잠깐 멈췄어요. 선생님이 풀어 주면 이어서 해요.</p></div>`;
    if (!focusWas) { focusWas = true; DS.Sound.warn(); if (navigator.vibrate) navigator.vibrate([80, 60, 80]); }
  }
  const myP = () => (R.players || {})[me] || {};

  function header() {
    const p = myP(), step = Raid().stepOf(L, R);
    $('#st-head').innerHTML = `${DS.Art.hero(p.hero || 0, 'idle', 'me')}
      <div><b>${p.num}번 ${esc(p.nick || '')}</b><br><span class="muted small">${esc(L.unit)} · ${esc(L.title)}</span></div>
      <div class="st-badge">${Raid().isLobby(R) || myP().lobby ? '대기실' : Raid().isEnd(L, R) ? '마무리' : step.kind === 'boss' ? '보스' : step.kind === 'monster' ? (step.special ? '스페셜' : '전투') : '설명'}</div>`;
  }
  const helpBtn = () => `<button class="btn small help${(R.help || {})[me] ? ' on' : ''}" id="st-help">${(R.help || {})[me] ? '🙋 도움 요청 중 (누르면 취소)' : '🙋 도움 요청'}</button>`;
  function bindHelp() { const b = $('#st-help'); if (b) b.onclick = () => DS.Act.help(code, !(R.help || {})[me]); }

  function render() {
    if (Raid().isClosed(R)) return toCamp();
    if (!R.players || !R.players[me]) { $('#st-body').innerHTML = '<div class="panel"><p>입장 정보가 없어요. 처음 화면에서 다시 입장해 주세요.</p></div>'; return; }
    header();
    focus(!test && Raid().focusOn(R) && !Raid().isLobby(R));
    if (test && test.onRender) test.onRender(L, R);
    const body = $('#st-body');
    const st0 = Raid().stepOf(L, R);
    if (!st0 || st0.kind !== 'monster') drawn = '';
    if (Raid().isLobby(R)) return lobbyView(body, false);
    if (!(R.active || {})[me]) { body.innerHTML = '<div class="panel framed center"><p>이번 수업 참여 명단에 없어요. 선생님께 말씀드려요.</p></div>'; return; }
    if (Raid().canLobby(L, R, me) && !cleared0) { cleared0 = true; DS.Camp.markStamp(); }
    if (myP().lobby) return lobbyView(body, true);
    if (Raid().isEnd(L, R)) return endView(body);
    const step = Raid().stepOf(L, R);
    if (step.kind === 'monster') { monsterView(body, step); if (test || Raid().activeIds(R).length <= 6) othersFx(step, body); return; }
    if (step.kind === 'boss') return bossView(body);
    if (test) { // 테스트 모드: 개념 설명 = 학습지 이미지를 폰에 크게
      const img = (test.prep.img || {})[step.id], sig = `concept|${step.id}|${img ? img.length : 0}`;
      if (drawn === sig && body.querySelector('.t-concept')) return;
      drawn = sig;
      body.innerHTML = `<div class="panel framed t-concept"><p class="attend-tag">📣 ${step.kind === 'intro' ? '도입' : '개념 설명'}</p><h2>${esc(step.title)}</h2>
        ${img ? `<img class="t-sheet" src="${img}" alt="${esc(step.title)} 학습지">` : '<p class="muted small">수업 준비에서 이 단계 학습지 이미지를 넣으면 여기에 보여요.</p>'}
        <p class="intro">${pretty(step.say || '')}</p></div>`;
      return;
    }
    body.innerHTML = `<div class="panel framed center attend"><p class="attend-tag">📣 알림</p><h2>선생님에게 주목하세요</h2><p>${step.kind === 'intro' ? '수업을 시작합니다.' : '개념 설명을 시작합니다.'}</p>
      <p class="stage-name">${esc(step.title)}</p><p class="intro">${pretty(step.say || '')}</p>${DS.Art.hero(myP().hero, 'idle', 'big huff')}<p class="muted small">학습지를 펴고 선생님 설명을 들어요.</p></div>`;
  }
  // 던전 단체 대기실: 수업 전(입장) · 클리어 뒤(마지막 한마디 · 모루)
  const dungeonName = () => { const D = DS.ASSETS.dungeons, i = D.ids.indexOf(L.theme); return i >= 0 ? D.names[i] : '던전'; };
  function lobbyView(body, after) {
    const others = Object.entries(R.players || {}).filter(([u, p]) => !p.teacher && u !== me && (!after || p.lobby)).slice(0, 10);
    const w = (R.words || {})[me], finale = Raid().isFinale(L, R), full = Raid().fullMarks(L, R, me);
    const sig = `lobby|${after}|${others.length}|${JSON.stringify(w || null)}|${finale}|${full}|${(R.hide || {})[me] ? 1 : 0}`;
    if (sig === drawn && body.querySelector('.lobby-scene')) return;
    drawn = sig;
    const crowd = others.map(([, p], k) => `<div class="lb-h${k % 2 ? ' face-l' : ''}" style="left:${12 + ((k * 37) % 76)}%;bottom:${8 + (k % 3) * 9}%">${DS.Art.hero(p.hero, 'idle', `small ${after && finale ? 'pairhop' : 'huff'}`)}<i class="shadow"></i></div>`).join('');
    body.innerHTML = `<div class="panel framed">
      <div class="lobby-scene bg-scene th-${L.theme || ''}"><p class="lb-title">${after ? '🏆 ' : '⚔ '}${esc(dungeonName())} ${after ? '클리어!' : '단체 대기실'}</p>
        <div class="lb-h teacher" style="left:50%;bottom:20%">${DS.Art.hero(DS.ASSETS.heroes.teacher, 'idle', after && finale ? 'pairhop' : 'huff')}<i class="shadow"></i></div>
        ${crowd}<div class="lb-h me" style="left:34%;bottom:12%">${DS.Art.hero(myP().hero, 'idle', after && finale ? 'pairhop' : 'huff')}<i class="shadow"></i>${w && !(R.hide || {})[me] ? `<span class="lb-say">${esc(w.t)}</span>` : ''}</div>
        <p class="lb-greet">${after ? '모두 수고했네! 오늘 배운 것 한마디씩 남기게' : `${L.no ? `${L.no}차시 ` : ''}${esc(L.title.split('·')[0].trim())} 던전에 온 것을 환영하네!`}</p></div>
      ${after ? `<div class="stamp-bar">📮 반드시 학습지 확인도장 받아가세요.</div>${wordsForm(w)}${full ? '<button class="btn forge-btn big" id="st-forge">⚒ 모루로 가기 <span class="small">(형성평가 만점 특전)</span></button>' : '<p class="muted small center">형성평가를 다 맞히면 ⚒ 모루가 열려요 — 세트2 로 다시 도전해 봐요!</p>'}`
        : '<p class="center">선생님이 수업을 시작할 때까지 기다려요. 학습지를 꺼내 두세요!</p>'}</div>`;
    if (after) bindWords();
    const fb = $('#st-forge'); if (fb) fb.onclick = () => DS.Forge.open(acc());
  }
  function wordsForm(w) {
    if (locked) return '<p class="muted small center">💬 한마디는 선생님이 잠가 두었어요.</p>';
    if (w && (w.n || 0) >= 2) return `<p class="center">💬 남긴 한마디: <b>${esc(w.t)}</b></p>`;
    return `<div class="words"><p class="gold">💬 마지막 한마디 <span class="muted small">(${DS.Words.MAX}자 · ${w ? '한 번 고칠 수 있어요' : '오늘 배운 것을 한마디로'})</span></p>
      <input id="st-word" maxlength="${DS.Words.MAX}" value="${esc(w ? w.t : '')}" placeholder="벤 다이어그램 이제 알겠다!">
      <div class="chips">${DS.Words.CHIPS.map((t) => `<button class="chip" data-chip="${esc(t)}">${esc(t)}</button>`).join('')}</div>
      <button class="btn primary" id="st-say">💬 ${w ? '고치기' : '남기기'}</button></div>`;
  }
  function bindWords() {
    document.querySelectorAll('[data-chip]').forEach((b) => (b.onclick = () => { $('#st-word').value = b.dataset.chip; }));
    const sb = $('#st-say'); if (sb) sb.onclick = () => DS.Control.run(async () => { await DS.Act.say(code, R, $('#st-word').value); DS.UI.toast('한마디를 남겼어요!'); drawn = ''; });
  }
  const lobbyBtn = () => (Raid().canLobby(L, R, me) ? '<button class="btn primary big" id="st-lobby">🏕 대기실로 이동</button>' : '<button class="btn big" disabled>🏕 대기실로 이동 (보스를 쓰러뜨리거나 다 맞히면 켜져요)</button>');
  const bindLobby = () => { const b = $('#st-lobby'); if (b) b.onclick = () => DS.Control.run(async () => { await DS.Act.toLobby(code); drawn = ''; }); };

  // ── 몬스터와 1:1 대치 ─────────────────────────────────────
  function sheetModal(step) {
    const img = (test.prep.img || {})[step.id]; if (!img) return;
    const el = document.createElement('div'); el.className = 'modal t-sheet-modal';
    el.innerHTML = `<div class="quiz-box framed"><p class="gold">📄 ${esc(step.title || '형성평가')} · 학습지</p><img class="t-sheet" src="${img}" alt="학습지"><button class="btn primary" id="ts-x">닫기</button></div>`;
    document.body.appendChild(el); el.querySelector('#ts-x').onclick = () => el.remove();
  }
  // 함께 싸우는 친구(테스트 모드의 가상 친구 · 인원이 적을 때)의 공격을 내 대치 화면에도 작게 보여 준다
  let othersSeen = {};
  function othersFx(step, body) {
    const now = {};
    Raid().activeIds(R).forEach((u) => { if (u !== me) now[u] = Raid().record(L, R, step.id, u); });
    const key = step.id;
    const was = othersSeen[key] || {};
    othersSeen[key] = Object.fromEntries(Object.entries(now).map(([u, r]) => [u, { n: r.tries.length, best: r.best }]));
    const sc = body.querySelector('.scene'); if (!sc || !Object.keys(was).length && !test) return;
    Object.entries(now).forEach(([u, r]) => {
      const w = was[u] || { n: 0, best: 0 };
      if (r.tries.length <= w.n) return;
      const p = R.players[u] || {}, dmg = Math.max(0, r.best - w.best);
      if (dmg) DS.FX.play(sc, p.fx || 'flame', { scale: 0.18, x: sc.clientWidth * (0.7 + Math.random() * 0.1), y: sc.clientHeight * 0.55 });
      const t = document.createElement('span'); t.className = 'ally-hit'; t.textContent = dmg ? `${p.nick} −${dmg}` : `${p.nick} 💨`;
      t.style.left = `${55 + Math.random() * 25}%`; sc.appendChild(t); setTimeout(() => t.remove(), 1300);
    });
  }
  // 1:1 대치: 왼쪽 내 용사(머리 위 = 남은 도전 기회 ●●●, 같이 움직임) vs 오른쪽 몬스터(아래 체력 칸)
  // cls: 'hit'(공격 성공 → 용사 돌진) · 'miss'(실패 → 축 처짐, 잠깐)
  function scene(step, rec, hp, cls = '') {
    const segs = Array.from({ length: rec.total }, (_, i) => `<i class="${i < rec.best ? 'gone' : ''}"></i>`).join('');
    const left = Math.max(0, Raid().RETRIES + 1 - rec.tries.length), done = Raid().cleared(L, R, step.id);
    const pips = Array.from({ length: Raid().RETRIES + 1 }, (_, i) => `<i class="${i < left ? 'on' : ''}"></i>`).join('');
    return `<div class="scene enc bg-scene th-${L.theme || ''} ${cls}${step.special ? ' special' : ''}"><div class="scene-bar"><div><b>${step.special ? '⭐ 난입! ' : step.review ? '📖 ' : ''}${esc(step.title)}</b><br><span class="muted small">레이드 체력 ${hp.left} / ${hp.max}</span></div></div>
      ${test ? `<div class="enc-friends">${Raid().activeIds(R).filter((u) => u !== me).slice(0, 4).map((u) => DS.Art.hero((R.players[u] || {}).hero || 0, 'idle', 'huff')).join('')}</div>` : ''}
      <div class="enc-hero"><div class="enc-tries" title="남은 도전 기회">${pips}</div>${DS.Art.hero(myP().hero, done ? 'attack' : 'idle', done ? 'pairhop' : cls === 'miss' ? 'slump' : 'huff')}<i class="shadow"></i></div>
      <div class="enc-mon">${DS.Art.monster(L.monsters[step.id].sprite, done ? 'down' : 'idle', done ? '' : 'float')}<div class="segs" title="내가 맞힌 만큼 칸이 깨져요">${segs}</div></div></div>`;
  }
  // 생각 시간: 틀린 칸이 있으면 해설은 읽을 수 있고 「다시 도전」만 잠깐 잠긴다 (수업 준비에서 0·5·10·15초, 기본 5초)
  const thinkSec = () => { const t = (R.meta || {}).think; return t != null ? Number(t) : 5; };
  const thinkUntil = {};
  function thinkTimer(btn, key, label) {
    const tick = () => {
      const left = Math.ceil(((thinkUntil[key] || 0) - Date.now()) / 1000);
      if (!btn.isConnected) return;
      if (left > 0) { btn.disabled = true; btn.innerHTML = `🤔 생각 시간 ${left}… <span class="small">해설을 읽어 봐요</span>`; setTimeout(tick, 250); }
      else { btn.disabled = false; btn.innerHTML = label; }
    };
    tick();
  }
  function monsterView(body, step) {
    const mid = step.id, rec = Raid().record(L, R, mid, me), hp = Raid().monsterHp(L, R, mid);
    const wantRetry = retrying === `${mid}|${rec.nextAttempt}` && rec.canRetry;
    if (!rec.submitted || wantRetry) return fightForm(body, step, rec, hp);
    const t = rec.last, label = Raid().resultLabel(t);
    const items = Raid().itemsFor(L, R, mid, me, t.attempt);
    const fx = `${mid}|${t.attempt}` !== shown ? (label === 'fail' ? 'miss' : 'hit') : '';
    if (fx && t.correct < t.total && thinkSec() > 0) thinkUntil[`${mid}|${t.attempt}`] = Date.now() + thinkSec() * 1000;
    if (fx) { shown = `${mid}|${t.attempt}`; if (label === 'fail') DS.Sound.squish(); else { DS.Sound.slash(); setTimeout(() => DS.Sound.hit(), 160); setTimeout(() => { const sc = body.querySelector('.scene'); if (sc) DS.FX.play(sc, myP().fx || 'flame', { perfect: label === 'success', scale: label === 'success' ? 0.42 : 0.3 }); }, 60); } }
    const head = { success: '⚔ 공격 성공!', partial: `⚔ 부분 성공 (${t.correct}/${t.total})`, fail: '💨 공격 실패…' }[label];
    const done = Raid().cleared(L, R, mid);
    const sig = `res|${mid}|${t.attempt}|${done}|${rec.canRetry}|${(R.help || {})[me] ? 1 : 0}`;
    if (sig === drawn && body.querySelector('.marks')) { hpText(body, hp); return; }
    drawn = sig;
    body.innerHTML = `<div class="panel framed">${scene(step, rec, hp, fx)}
      <h2 class="res-${label}">${head}</h2>
      <div class="marks">${items.map((q, i) => `<div class="mark ${t.marks[i] ? 'ok' : 'ng'}"><b>${i + 1}</b> ${t.marks[i] ? '✔' : '✘'} <span class="math">${pretty(itemText(q))}</span>${t.marks[i] ? '' : `<br><span class="sol-line math">${pretty(q.solution || '')}</span>`}</div>`).join('')}</div>
      ${done ? '<p class="okc big-msg">🎉 몬스터 격파! 다음 신호를 기다려요.</p>'
        : rec.canRetry ? `<p>다시 해 보겠습니까? <span class="muted small">(남은 기회 ${Raid().RETRIES - rec.tries.length + 1}번 · 숫자가 모두 바뀌어요)</span></p><button class="btn primary big" id="st-retry">↻ 다시 도전</button>`
        : `<p class="muted">${rec.allRight ? '멋져요! 다른 용사들을 기다려요.' : '재도전 기회를 모두 썼어요. 해설을 보며 학습지에 정리해요.'} 데미지 <b>${rec.best}</b></p>`}
      ${test && (test.prep.img || {})[mid] ? '<button class="btn small" id="st-sheet">📄 학습지 보기 (문제 해설)</button>' : ''}
      ${test ? '' : helpBtn()}</div>`;
    bindHelp();
    const sb = $('#st-sheet'); if (sb) sb.onclick = () => sheetModal(step);
    const rb = $('#st-retry');
    if (rb) { thinkTimer(rb, `${mid}|${t.attempt}`, '↻ 다시 도전'); rb.onclick = () => { retrying = `${mid}|${rec.nextAttempt}`; form = null; DS.Sound.clank(); render(); }; }
  }
  // 보기 글자: 'venn:B|1 2 3 6' 은 벤 다이어그램 그림으로
  function optHtml(o) {
    const m = /^venn:([^|]*)\|(.*)$/.exec(o);
    return m ? DS.UI.venn(m[1], m[2]) : `<span class="math">${pretty(o)}</span>`;
  }
  const hpText = (body, hp) => { const t = body.querySelector('.scene-bar .muted'); if (t) t.textContent = `레이드 체력 ${hp.left} / ${hp.max}`; };
  const itemText = (q) => (q.type === 'blanks' ? q.items.map((it) => `${it.left} □ ${it.right}`).join('   ') : DS.UI.plain(q.question));

  function fightForm(body, step, rec, hp) {
    const mid = step.id, attempt = rec.nextAttempt, key = `${mid}|${attempt}`;
    const items = Raid().itemsFor(L, R, mid, me, attempt);
    if (!form || form.key !== key) form = { key, given: items.map((q) => (q.type === 'multi' ? [] : q.type === 'number' ? 0 : null)) };
    const prevWrong = rec.last ? rec.last.marks.map((m) => !m) : [];
    const ready = items.every((q, i) => (q.type === 'multi' ? form.given[i].length > 0 : form.given[i] != null));
    const sig = `form|${key}|${JSON.stringify(form.given)}|${(R.help || {})[me] ? 1 : 0}`;
    if (sig === drawn && body.querySelector('.items')) { hpText(body, hp); return; }
    drawn = sig;
    body.innerHTML = `<div class="panel framed">${scene(step, rec, hp)}
      ${attempt ? `<p class="retry-note">↻ 재도전 ${attempt} — 숫자가 모두 바뀌었어요. 지난번 틀린 칸은 <b class="ngc">✘</b> 표시</p>` : ''}
      ${L.monsters[mid].note ? `<p class="muted small">💡 ${esc(L.monsters[mid].note)}</p>` : ''}
      <div class="items">${items.map((q, i) => itemHtml(q, i, prevWrong[i], attempt ? null : `${step.sheet || step.title} (${i + 1})`)).join('')}</div>
      <button class="btn primary big" id="st-go"${ready ? '' : ' disabled'}>⚔ 공격!</button>
      ${helpBtn()}</div>`;
    bindHelp();
    body.querySelectorAll('[data-pick]').forEach((b) => b.addEventListener('click', () => {
      const [i, v] = b.dataset.pick.split('|'); const k = Number(i);
      const t = items[k].type;
      if (t === 'multi') { const s = new Set(form.given[k]); const n = Number(v); if (s.has(n)) s.delete(n); else s.add(n); form.given[k] = [...s].sort((a, b2) => a - b2); }
      else if (t === 'choice') form.given[k] = Number(v);
      else if (t === 'ox') form.given[k] = v === 'O';
      else form.given[k] = [v];
      DS.Sound.clank(); render();
    }));
    body.querySelectorAll('[data-dial]').forEach((b) => b.addEventListener('click', () => {
      const [i, d] = b.dataset.dial.split('|').map(Number);
      form.given[i] = Math.max(0, Math.min(99, form.given[i] + d));
      DS.Sound.clank(); render();
    }));
    $('#st-go').onclick = async () => {
      const given = items.map((q, i) => (q.type === 'blanks' ? form.given[i] : q.type === 'number' ? Number(form.given[i]) : form.given[i]));
      try { await DS.Act.submit(code, raw, mid, attempt, given); retrying = ''; form = null; } catch (e) { DS.UI.toast(e.message); }
    };
  }
  // ref: 첫 시도면 '문제 1 (2)' 처럼 학습지 문항 이름 → 문제 위에 작은 꼬리표 (같은 문제를 학습지에서 바로 찾게)
  function itemHtml(q, i, wasWrong, ref) {
    const tag = `<span class="item-no">${i + 1}${wasWrong ? ' <b class="ngc">✘</b>' : ''}${ref ? ` <span class="sheet-tag">📄 ${esc(ref)}</span>` : ''}</span>`;
    const qText = (t) => `<div class="item-q">${DS.UI.rich(t)}</div>`;
    if (q.type === 'blanks') {
      const it = q.items[0], v = (form.given[i] || [])[0];
      // 문제 상황(예: A = {1, 3, 5} 일 때 …)을 먼저 보여 주고, 그 아래에 □ 식
      return `<div class="item">${tag}${q.question ? `<div class="item-q bl-q">${DS.UI.rich(q.question)}</div>` : ''}<div class="item-q math">${pretty(it.left)} <b class="bl-box">${v ? esc(v) : '□'}</b> ${pretty(it.right)}</div>
        <div class="item-opts">${q.options.map((o) => `<button class="choice sym${v === o ? ' on' : ''}" data-pick="${i}|${esc(o)}">${esc(o)}</button>`).join('')}</div></div>`;
    }
    if (q.type === 'multi') {
      const on = new Set(form.given[i]);
      return `<div class="item">${tag}${qText(q.question)}
        <div class="item-opts pickset">${q.options.map((o, k) => `<button class="choice chipset${on.has(k) ? ' on' : ''}" data-pick="${i}|${k}"><span class="math">${pretty(o)}</span></button>`).join('')}</div></div>`;
    }
    if (q.type === 'choice') {
      return `<div class="item">${tag}${qText(q.question)}
        <div class="item-opts col">${q.choices.map((o, k) => `<button class="choice opt${form.given[i] === k ? ' on' : ''}" data-pick="${i}|${k}">${optHtml(o)}</button>`).join('')}</div></div>`;
    }
    if (q.type === 'ox') {
      const v = form.given[i];
      return `<div class="item">${tag}${qText(q.question)}
        <div class="item-opts">${['O', 'X'].map((o) => `<button class="choice sym${v === (o === 'O') ? ' on' : ''}" data-pick="${i}|${o}">${o}</button>`).join('')}</div></div>`;
    }
    // number: 다이얼 (십의 자리 · 일의 자리)
    const v = form.given[i], t = Math.floor(v / 10), o = v % 10;
    return `<div class="item">${tag}${qText(q.question)}
      <div class="dial"><div class="wheel"><button data-dial="${i}|10">▲</button><b>${t}</b><button data-dial="${i}|-10">▼</button></div><div class="wheel"><button data-dial="${i}|1">▲</button><b>${o}</b><button data-dial="${i}|-1">▼</button></div><span class="dial-val">= ${v}</span></div></div>`;
  }

  // ── 보스: 형성평가 1~7번 (세트1 → 틀린 문항은 세트2) ──────────────
  function bossView(body) {
    const m = Raid().mastery(L, R, me), ans = ((R.bossAns || {})[me]) || {};
    const hp = Raid().bossHp(L, R);
    const items = L.boss.sets[bossSet];
    const mine = (ans[bossSet] || []).slice();
    body.innerHTML = `<div class="panel framed">
      <div class="scene bg-scene th-${L.theme || ''} boss${hp.won ? '' : ' quake-once'}"><div class="scene-bar"><div><b>👑 ${esc(L.boss.title)}</b><br><span class="muted small">보스 체력 ${hp.left} / ${hp.max}</span></div></div>${DS.Art.monster(L.boss.sprite, hp.won ? 'down' : 'idle', hp.won ? '' : 'float')}
        <div class="hpbar"><i style="width:${hp.max ? (100 * hp.left) / hp.max : 0}%"></i></div></div>
      ${hp.won ? '<h2 class="okc center">🎉 보스 격파! 모두 함께 이겼어요!</h2>' : ''}
      <div class="tabs"><button class="tab${bossSet === 1 ? ' on' : ''}" data-s="1">세트 1</button><button class="tab${bossSet === 2 ? ' on' : ''}" data-s="2">세트 2 (재도전)</button></div>
      <div class="boss-items">${items.map((p, i) => `<button class="bitem${m[i] ? ' ok' : mine[i] != null ? ' tried' : ''}${i >= L.boss.hpItems ? ' bonus' : ''}" data-i="${i}"><b>${i + 1}번${i >= L.boss.hpItems ? ' ⭐' : ''}</b> ${m[i] ? '✔ 도달' : mine[i] != null ? '✘ 다시' : '풀기'}</button>`).join('')}</div>
      <p class="muted small">세트1 = 학습지 형성평가와 같은 문제 · 세트2 = 숫자가 바뀐 문제. 맞힌 문항마다 보스에게 1 데미지!${L.boss.items > L.boss.hpItems ? ` ⭐ ${L.boss.hpItems + 1}번부터는 보너스.` : ''}</p>
      ${Raid().canLobby(L, R, me) ? `<div class="stamp-bar">📮 반드시 학습지 확인도장 받아가세요.</div>${lobbyBtn()}` : ''}</div>`;
    bindLobby();
    body.querySelectorAll('.tab').forEach((b) => b.addEventListener('click', () => { bossSet = Number(b.dataset.s); render(); }));
    body.querySelectorAll('.bitem').forEach((b) => b.addEventListener('click', async () => {
      const i = Number(b.dataset.i);
      if (m[i]) { DS.UI.toast('이미 도달한 문항이에요.'); return; }
      const wait = Math.ceil((bossThink - Date.now()) / 1000);
      if (wait > 0) { DS.UI.toast(`🤔 생각 시간 ${wait}초 — 방금 틀린 문항을 학습지에서 다시 살펴봐요`); return; }
      const r = await DS.Quiz.ask({ name: `형성평가 ${i + 1}번`, formula: bossSet === 1 ? '세트 1' : '세트 2 · 🔄 숫자가 바뀌었어요' }, items[i], { collect: true, tag: '👑 보스', ref: bossSet === 1 ? `학습지 형성평가 ${i + 1}번` : '' });
      const next = (ans[bossSet] || Array(L.boss.items).fill(null)).slice();
      while (next.length < L.boss.items) next.push(null);
      next[i] = r.given;
      await DS.Act.bossAnswer(code, bossSet, next);
      const ok = DS.Quiz.grade(items[i], r.given);
      if (!ok && thinkSec() > 0) bossThink = Date.now() + thinkSec() * 1000;
      DS.UI.toast(ok ? `✔ ${i + 1}번 도달! 보스에게 데미지` : `✘ ${i + 1}번은 아직… 🤔 ${thinkSec()}초 생각하고 ${bossSet === 1 ? '세트 2 로' : '다시'} 도전!`, 2600);
      if (ok) { DS.Sound.slash(); setTimeout(() => DS.Sound.hit(), 160); const sc = document.querySelector('#st-body .scene'); if (sc) DS.FX.play(sc, myP().fx || 'flame', { scale: 0.32 }); } else DS.Sound.squish();
    }));
  }
  function endView(body) {
    const m = Raid().mastery(L, R, me).slice(0, L.boss.hpItems).filter(Boolean).length;
    body.innerHTML = `<div class="panel framed center win"><h2>🏆 오늘의 던전 클리어!</h2><p class="muted small">형성평가 ${m} / ${L.boss.hpItems}${Raid().fullMarks(L, R, me) ? ' 만점!' : ''}</p>${DS.Art.hero(myP().hero, 'attack', 'big pairhop')}
      <div class="stamp-bar">📮 반드시 학습지 확인도장 받아가세요.</div>${lobbyBtn()}
      <p class="muted small">게임 기록은 수학 성적이 아니에요. 오늘 배운 것을 학습지에 정리해요.</p></div>`;
    bindLobby();
  }
  return { enter, stop: stop0 };
})();
