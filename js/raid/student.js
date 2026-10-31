// 학생 화면 (스마트폰): 입장 → 대기 → 연성 → 필드 → 전투(카드 + 답 제출) → 결과 → 보스(형성평가) → 트로피
window.DS = window.DS || {};

DS.Student = (function () {
  const $ = (s) => document.querySelector(s);
  const { esc, pretty } = DS.UI;
  let code = null, L = null, R = null, raw = null, me = null, forge = null, stop = null, timer = 0;
  let answer = null, chosen = null, lastPhase = '', lastRound = '', lastStage = -1;

  async function enter(c, info) {
    await DS.Act.join(c, info);
    code = c;
    me = DS.Net.uid();
    try { localStorage.setItem('citadel-student', JSON.stringify({ code: c, ...info })); } catch (e) { /* 무시 */ }
    DS.UI.show('screen-student');
    if (stop) stop();
    stop = DS.Net.watch(`rooms/${code}`, (v) => {
      if (!v) return;
      raw = v; R = DS.Act.unpackRoom(v);
      L = DS.Lessons.get(R.meta.lesson);
      render();
    });
  }
  const owned = () => new Set(Object.keys(((R.cards || {})[me]) || {}));
  const myP = () => (R.players || {})[me] || {};

  function header() {
    const p = myP(), st = L.stages[R.state.stage] || {};
    const won = Object.keys((R.credits || {})[me] || {}).length;
    $('#st-head').innerHTML = `${DS.Art.hero(p.hero || 0, R.state.phase === 'result' ? (R.state.result && R.state.result.success ? 'attack' : 'fall') : 'idle', 'me')}
      <div><b>${p.num}번 ${esc(p.nick || '')}</b><br><span class="muted small">수업 ${code} · ${esc(L.title)}</span></div>
      <div class="st-badge">${R.state.phase === 'boss' || R.state.phase === 'victory' ? '보스' : esc(st.step || '')}<br><small>처치 ${won}</small></div>`;
  }

  function render() {
    if (!R.players || !R.players[me]) { $('#st-body').innerHTML = '<div class="panel"><p>입장 정보가 없어요. 처음 화면에서 다시 입장해 주세요.</p></div>'; return; }
    header();
    const ph = R.state.phase, body = $('#st-body');
    const rd = R.state.round;
    if (ph !== lastPhase || R.state.stage !== lastStage || (rd && rd.id !== lastRound)) { answer = null; chosen = null; forge = null; }
    lastPhase = ph; lastRound = rd ? rd.id : ''; lastStage = R.state.stage;
    clearInterval(timer);
    const helpBtn = `<button class="btn small help${(R.help || {})[me] ? ' on' : ''}" id="st-help">${(R.help || {})[me] ? '🙋 도움 요청 중 (누르면 취소)' : '🙋 도움 요청'}</button>`;
    const active = !!(R.active || {})[me];
    if (ph === 'lobby') { body.innerHTML = `<div class="panel framed center"><h2>입장 완료!</h2><p>선생님이 수업을 시작할 때까지 기다려요.</p>${DS.Art.hero(myP().hero, 'walk', 'big')}</div>`; return; }
    if (!active && ph !== 'victory') { body.innerHTML = '<div class="panel framed center"><p>이번 전투 참여 명단에 없어요. 선생님께 말씀드려요.</p></div>'; return; }
    if (ph === 'forge') {
      const st = L.stages[R.state.stage];
      if (!forge) {
        body.innerHTML = `<div class="panel framed"><p class="stage-name">⚒ ${esc(st.step)} · ${esc(st.name)}</p><p class="intro">${pretty(st.intro)}</p><div id="st-forge"></div>${helpBtn}</div>`;
        forge = DS.Forge.mount($('#st-forge'), { lesson: L, stage: () => R.state.stage, owned, seed: me, onCraft: (id) => DS.Act.craft(code, me, id) });
        bindHelp();
      } else forge.redraw();
      return;
    }
    if (ph === 'field') {
      body.innerHTML = `<div class="panel framed center"><h2>몬스터가 다가온다…</h2><p>선생님 신호를 기다려요. 내 카드:</p><div class="mycards">${cardsHtml(false)}</div>${helpBtn}</div>`;
      bindHelp(); return;
    }
    if (ph === 'battle') return battle(body, helpBtn);
    if (ph === 'result') return result(body);
    if (ph === 'boss') return bossView(body);
    if (ph === 'victory') return victoryView(body);
  }
  function bindHelp() { const b = $('#st-help'); if (b) b.onclick = () => DS.Act.help(code, !(R.help || {})[me]); }
  function cardsHtml(pick) {
    const have = [...owned()].filter((c) => L.cards[c]);
    if (!have.length) return '<p class="muted">아직 카드가 없어요.</p>';
    return have.map((c) => `<button class="gcard${chosen === c ? ' on' : ''}" data-c="${c}"${pick ? '' : ' disabled'}>${DS.Art.card(L.cards[c].art)}<b>${esc(L.cards[c].name)}</b><span class="math">${pretty(L.cards[c].formula)}</span><small>⚔ 100</small></button>`).join('');
  }

  // ── 전투: 문제 보기(공격력 110 → 100 시작) → 답 → 카드 고르기 → 공격 ──
  function battle(body, helpBtn) {
    const rd = R.state.round, sub = (((R.subs || {})[rd.id]) || {})[me];
    const total = DS.Raid.activeIds(R).length, done = DS.Raid.activeIds(R).filter((u) => (((R.subs || {})[rd.id]) || {})[u]).length;
    const mon = DS.Art.monster(L.stages[R.state.stage].monster, 'idle', 'mid');
    if (sub) {
      body.innerHTML = `<div class="panel framed center">${mon}<h2>제출 완료!</h2><p>다른 용사들을 기다려요 <b>${done}/${total}</b></p><p class="muted">정답은 공동 공격이 끝난 뒤에 공개돼요.</p></div>`;
      return;
    }
    const q = DS.Raid.questionFor(L, R, me);
    const seenAt = (((R.seen || {})[rd.id]) || {})[me];
    body.innerHTML = `<div class="panel framed">
      <div class="battle-top">${mon}<div><b>${esc(L.typeNames[rd.type] || '')}</b>${rd.attempt > 1 ? ` <span class="retry">재도전 ${rd.attempt}</span>` : ''}<br><span class="muted small">제출 ${done}/${total}</span></div><div class="power" id="st-power">⚔ 110</div></div>
      <div class="q-box"><p class="math">${pretty(q.question)}</p>
        ${answer ? `<p class="ans-ok">✔ 답을 골랐어요 <button class="btn small" id="st-re">다시 풀기</button></p>` : `<button class="btn primary big" id="st-open">📜 문제 풀기</button>`}</div>
      <p class="shelf-title">공격 카드 고르기 <span class="muted small">이 문제에 맞는 카드를!</span></p>
      <div class="mycards">${cardsHtml(true)}</div>
      <button class="btn primary big" id="st-go"${answer && chosen ? '' : ' disabled'}>⚔ 공격!</button>
      ${helpBtn}</div>`;
    bindHelp();
    const open = async () => {
      await DS.Act.seen(code, raw);
      const r = await DS.Quiz.ask({ name: L.typeNames[rd.type] || '문제', formula: '' }, q, { collect: true, tag: '⚔ 전투' });
      answer = r;
      render();
    };
    const ob = $('#st-open'); if (ob) ob.onclick = open;
    const rb = $('#st-re'); if (rb) rb.onclick = open;
    body.querySelectorAll('.gcard').forEach((b) => b.addEventListener('click', () => { chosen = b.dataset.c; DS.Sound.clank(); render(); }));
    $('#st-go').onclick = async () => {
      if (!answer || !chosen) return;
      try { await DS.Act.submit(code, raw, chosen, answer.given); DS.Sound.slash(); } catch (e) { DS.UI.toast(e.message); }
    };
    // 준비 공격력: 문제를 본 시각부터 1초에 1씩 (최저 100)
    const tick = () => { const el = $('#st-power'); if (!el) return; const s = (((R.seen || {})[rd.id]) || {})[me]; el.textContent = `⚔ ${s ? DS.Raid.points(DS.Net.now() - s) : 110}`; };
    tick(); timer = setInterval(tick, 500);
    if (!seenAt && !answer) { /* 문제는 버튼을 눌러야 열림 */ }
  }

  function result(body) {
    const res = R.state.result || {}, rd = R.state.round;
    const j = DS.Raid.judge(L, R, me), q = DS.Raid.questionFor(L, R, me);
    const credit = (((R.credits || {})[me]) || {})[`m${R.state.monster}`];
    const ansText = q.type === 'blanks' ? q.items.map((i) => `${i.left} ${i.answer} ${i.right}`).join(', ') : q.type === 'ox' ? (q.answer ? 'O' : 'X') : q.type === 'choice' ? q.choices[q.answerIndex] : q.type === 'subsets' ? DS.SetGen.allSubsets(q.base).map(DS.SetGen.setStr).join(', ') : String(q.answer);
    body.innerHTML = `<div class="panel framed center ${res.success ? 'win' : 'lose'}">
      <h2>${res.success ? '⚔ 공동 공격 성공!' : '💥 공동 공격 실패…'}</h2>
      <div class="party">${DS.Art.monster(L.stages[R.state.stage].monster, res.success ? 'down' : 'attack', 'mid')}</div>
      <p>내 답: <b class="${j.correct ? 'okc' : 'ngc'}">${j.correct ? '정답' : !j.answerOk ? '오답' : '카드가 맞지 않음'}</b>${credit ? ` · 획득 ⚔ ${credit}` : ''}</p>
      <div class="sol"><b>정답</b> <span class="math">${pretty(ansText)}</span><br><span class="math">${pretty(q.solution || '')}</span>${!j.cardOk && j.submitted ? `<br>이 문제에 맞는 카드: ${q.cards.map((c) => esc(L.cards[c].name)).join(', ')}` : ''}</div>
      <p class="muted">${res.success ? '다음 신호를 기다려요.' : '선생님 설명을 듣고, 숫자를 바꿔 다시 도전해요.'}</p></div>`;
  }

  // ── 보스: 형성평가 1~6번 (세트1 → 못 맞힌 문항은 세트2 로 재도전) ──
  let bossSet = 1;
  function bossView(body) {
    const m = DS.Raid.mastery(L, R, me), ans = ((R.bossAns || {})[me]) || {};
    const hp = DS.Raid.bossHp(L, R);
    const items = L.boss.sets[bossSet];
    const mine = (ans[bossSet] || []).slice();
    body.innerHTML = `<div class="panel framed">
      <div class="battle-top">${DS.Art.monster(L.boss.monster, 'idle', 'mid')}<div><b>${esc(L.boss.title)}</b><br><span class="muted small">보스 체력 ${hp.hp} / ${hp.max}</span></div></div>
      <div class="hpbar"><i style="width:${hp.max ? (100 * hp.hp) / hp.max : 0}%"></i></div>
      <div class="tabs"><button class="tab${bossSet === 1 ? ' on' : ''}" data-s="1">세트 1</button><button class="tab${bossSet === 2 ? ' on' : ''}" data-s="2">세트 2 (재도전)</button></div>
      <div class="boss-items">${items.map((p, i) => `<button class="bitem${m[i] ? ' ok' : mine[i] != null ? ' tried' : ''}" data-i="${i}"><b>${i + 1}번</b> ${m[i] ? '✔ 도달' : mine[i] != null ? '✘ 다시' : '풀기'}</button>`).join('')}</div>
      <p class="muted">맞힌 문항마다 보스에게 100의 피해! 두 세트 중 한 번이라도 맞히면 도달이에요. 학습지에도 풀이를 적어요.</p></div>`;
    body.querySelectorAll('.tab').forEach((b) => b.addEventListener('click', () => { bossSet = Number(b.dataset.s); render(); }));
    body.querySelectorAll('.bitem').forEach((b) => b.addEventListener('click', async () => {
      const i = Number(b.dataset.i);
      if (m[i]) { DS.UI.toast('이미 도달한 문항이에요.'); return; }
      const r = await DS.Quiz.ask({ name: `형성평가 ${i + 1}번`, formula: `세트 ${bossSet}` }, items[i], { collect: true, tag: '👑 보스' });
      const next = (ans[bossSet] || Array(L.boss.items).fill(null)).slice();
      next[i] = r.given;
      await DS.Act.bossAnswer(code, bossSet, next);
      const ok = DS.Quiz.grade(items[i], r.given);
      DS.UI.toast(ok ? `✔ ${i + 1}번 도달! 보스에게 100의 피해` : `✘ ${i + 1}번은 아직… 해설을 떠올리며 ${bossSet === 1 ? '세트 2 로' : '다시'} 도전!`, 2600);
      if (ok) DS.Sound.correct(); else DS.Sound.wrong();
    }));
  }
  function victoryView(body) {
    const w = R.state.winner;
    body.innerHTML = `<div class="panel framed center win"><h2>🏆 성채 탈환!</h2><p>모두에게 트로피를 드립니다.</p><div class="trophy">🏆</div>${DS.Art.hero(myP().hero, 'attack', 'big')}
      ${w ? `<p>최고 용사: <b>${w.num}번 ${esc(w.nick)}</b>${w.uid === me ? ' — 바로 당신!' : ''}</p>` : ''}<p class="muted">게임 기록은 수학 성적이 아니에요. 오늘 배운 것을 학습지에 정리해요.</p></div>`;
  }
  return { enter };
})();
