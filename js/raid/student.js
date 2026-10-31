// 학생 화면 (스마트폰): 입장 → 대기실 → [개념 설명(선생님에게 주목) → 몬스터와 1:1 대치] … → 보스(형성평가) → 끝
// 몬스터: 소문제를 모두 풀고 제출하면 바로 채점 → 공격 성공 / 부분 성공 / 실패 → 재도전 2번까지(숫자가 모두 바뀜)
window.DS = window.DS || {};

DS.Student = (function () {
  const $ = (s) => document.querySelector(s);
  const { esc, pretty } = DS.UI;
  const Raid = () => DS.Raid;
  let code = null, L = null, R = null, raw = null, me = null, stop = null;
  let form = null;          // 풀고 있는 시도 { key, given: [] }
  let retrying = '';        // '몬스터id|다음 시도' — "다시 도전"을 누른 상태
  let shown = '';           // 결과 연출을 한 번만
  let bossSet = 1;
  let drawn = '';           // 지금 그려 둔 화면의 서명 — 다른 학생의 제출로 방 값이 바뀌어도 내 화면은 다시 그리지 않는다 (터치가 씹히지 않게)

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
  const myP = () => (R.players || {})[me] || {};

  function header() {
    const p = myP(), step = Raid().stepOf(L, R);
    $('#st-head').innerHTML = `${DS.Art.hero(p.hero || 0, 'idle', 'me')}
      <div><b>${p.num}번 ${esc(p.nick || '')}</b><br><span class="muted small">${esc(L.unit)} · ${esc(L.title)}</span></div>
      <div class="st-badge">${Raid().isLobby(R) ? '대기실' : Raid().isEnd(L, R) ? '끝' : step.kind === 'boss' ? '보스' : step.kind === 'monster' ? (step.special ? '스페셜' : '전투') : '설명'}</div>`;
  }
  const helpBtn = () => `<button class="btn small help${(R.help || {})[me] ? ' on' : ''}" id="st-help">${(R.help || {})[me] ? '🙋 도움 요청 중 (누르면 취소)' : '🙋 도움 요청'}</button>`;
  function bindHelp() { const b = $('#st-help'); if (b) b.onclick = () => DS.Act.help(code, !(R.help || {})[me]); }

  function render() {
    if (!R.players || !R.players[me]) { $('#st-body').innerHTML = '<div class="panel"><p>입장 정보가 없어요. 처음 화면에서 다시 입장해 주세요.</p></div>'; return; }
    header();
    const body = $('#st-body');
    const st0 = Raid().stepOf(L, R);
    if (!st0 || st0.kind !== 'monster') drawn = '';
    if (Raid().isLobby(R)) { body.innerHTML = `<div class="panel framed center"><h2>입장 완료!</h2><p>선생님이 수업을 시작할 때까지 기다려요.</p>${DS.Art.hero(myP().hero, 'walk', 'big')}</div>`; return; }
    if (!(R.active || {})[me]) { body.innerHTML = '<div class="panel framed center"><p>이번 수업 참여 명단에 없어요. 선생님께 말씀드려요.</p></div>'; return; }
    if (Raid().isEnd(L, R)) return endView(body);
    const step = Raid().stepOf(L, R);
    if (step.kind === 'monster') return monsterView(body, step);
    if (step.kind === 'boss') return bossView(body);
    body.innerHTML = `<div class="panel framed center attend"><p class="attend-tag">📣 알림</p><h2>선생님에게 주목하세요</h2><p>${step.kind === 'intro' ? '수업을 시작합니다.' : '개념 설명을 시작합니다.'}</p>
      <p class="stage-name">${esc(step.title)}</p><p class="intro">${pretty(step.say || '')}</p>${DS.Art.hero(myP().hero, 'idle', 'big')}<p class="muted small">학습지를 펴고 선생님 설명을 들어요.</p></div>`;
  }

  // ── 몬스터와 1:1 대치 ─────────────────────────────────────
  function scene(step, rec, hp, cls = '') {
    const segs = Array.from({ length: rec.total }, (_, i) => `<i class="${i < rec.best ? 'gone' : ''}"></i>`).join('');
    return `<div class="scene bg-scene th-${L.theme || ''} ${cls}${step.special ? ' special' : ''}"><div class="scene-bar"><div><b>${step.special ? '⭐ 난입! ' : step.review ? '📖 ' : ''}${esc(step.title)}</b><br><span class="muted small">레이드 체력 ${hp.left} / ${hp.max}</span></div></div>
      ${DS.Art.monster(L.monsters[step.id].sprite, Raid().cleared(L, R, step.id) ? 'down' : 'idle', Raid().cleared(L, R, step.id) ? '' : 'float')}
      <div class="segs" title="내가 맞힌 만큼 칸이 깨져요">${segs}</div></div>`;
  }
  function monsterView(body, step) {
    const mid = step.id, rec = Raid().record(L, R, mid, me), hp = Raid().monsterHp(L, R, mid);
    const wantRetry = retrying === `${mid}|${rec.nextAttempt}` && rec.canRetry;
    if (!rec.submitted || wantRetry) return fightForm(body, step, rec, hp);
    const t = rec.last, label = Raid().resultLabel(t);
    const items = Raid().itemsFor(L, R, mid, me, t.attempt);
    const fx = `${mid}|${t.attempt}` !== shown ? (label === 'fail' ? 'miss' : 'hit') : '';
    if (fx) { shown = `${mid}|${t.attempt}`; if (label === 'fail') DS.Sound.squish(); else { DS.Sound.slash(); setTimeout(() => DS.Sound.hit(), 160); } }
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
      ${helpBtn()}</div>`;
    bindHelp();
    const rb = $('#st-retry');
    if (rb) rb.onclick = () => { retrying = `${mid}|${rec.nextAttempt}`; form = null; DS.Sound.clank(); render(); };
  }
  // 보기 글자: 'venn:B|1 2 3 6' 은 벤 다이어그램 그림으로
  function optHtml(o) {
    const m = /^venn:([^|]*)\|(.*)$/.exec(o);
    if (!m) return `<span class="math">${pretty(o)}</span>`;
    return `<svg class="venn" viewBox="0 0 160 70" aria-label="벤 다이어그램 ${esc(m[1])}: ${esc(m[2])}"><ellipse cx="80" cy="38" rx="72" ry="28" fill="none" stroke="currentColor" stroke-width="2"/><text x="80" y="11" font-size="11" text-anchor="middle" fill="currentColor" font-style="italic">${esc(m[1])}</text><text x="80" y="44" font-size="15" text-anchor="middle" fill="currentColor">${esc(m[2])}</text></svg>`;
  }
  const hpText = (body, hp) => { const t = body.querySelector('.scene-bar .muted'); if (t) t.textContent = `레이드 체력 ${hp.left} / ${hp.max}`; };
  const itemText = (q) => (q.type === 'blanks' ? q.items.map((it) => `${it.left} □ ${it.right}`).join('   ') : q.question);

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
      <div class="items">${items.map((q, i) => itemHtml(q, i, prevWrong[i])).join('')}</div>
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
  function itemHtml(q, i, wasWrong) {
    const tag = `<span class="item-no">${i + 1}${wasWrong ? ' <b class="ngc">✘</b>' : ''}</span>`;
    if (q.type === 'blanks') {
      const it = q.items[0], v = (form.given[i] || [])[0];
      return `<div class="item">${tag}<div class="item-q math">${pretty(it.left)} <b class="bl-box">${v ? esc(v) : '□'}</b> ${pretty(it.right)}</div>
        <div class="item-opts">${q.options.map((o) => `<button class="choice sym${v === o ? ' on' : ''}" data-pick="${i}|${esc(o)}">${esc(o)}</button>`).join('')}</div></div>`;
    }
    if (q.type === 'multi') {
      const on = new Set(form.given[i]);
      return `<div class="item">${tag}<div class="item-q">${pretty(q.question)}</div>
        <div class="item-opts pickset">${q.options.map((o, k) => `<button class="choice chipset${on.has(k) ? ' on' : ''}" data-pick="${i}|${k}"><span class="math">${pretty(o)}</span></button>`).join('')}</div></div>`;
    }
    if (q.type === 'choice') {
      return `<div class="item">${tag}<div class="item-q">${pretty(q.question)}</div>
        <div class="item-opts col">${q.choices.map((o, k) => `<button class="choice opt${form.given[i] === k ? ' on' : ''}" data-pick="${i}|${k}">${optHtml(o)}</button>`).join('')}</div></div>`;
    }
    if (q.type === 'ox') {
      const v = form.given[i];
      return `<div class="item">${tag}<div class="item-q">${pretty(q.question)}</div>
        <div class="item-opts">${['O', 'X'].map((o) => `<button class="choice sym${v === (o === 'O') ? ' on' : ''}" data-pick="${i}|${o}">${o}</button>`).join('')}</div></div>`;
    }
    // number: 다이얼 (십의 자리 · 일의 자리)
    const v = form.given[i], t = Math.floor(v / 10), o = v % 10;
    return `<div class="item">${tag}<div class="item-q">${pretty(q.question)}</div>
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
      <p class="muted small">맞힌 문항마다 보스에게 1 데미지!${L.boss.items > L.boss.hpItems ? ` ⭐ ${L.boss.hpItems + 1}번부터는 보너스.` : ''} 세트1 에서 틀린 문항은 세트2 로 다시 도전해요.</p></div>`;
    body.querySelectorAll('.tab').forEach((b) => b.addEventListener('click', () => { bossSet = Number(b.dataset.s); render(); }));
    body.querySelectorAll('.bitem').forEach((b) => b.addEventListener('click', async () => {
      const i = Number(b.dataset.i);
      if (m[i]) { DS.UI.toast('이미 도달한 문항이에요.'); return; }
      const r = await DS.Quiz.ask({ name: `형성평가 ${i + 1}번`, formula: `세트 ${bossSet}` }, items[i], { collect: true, tag: '👑 보스' });
      const next = (ans[bossSet] || Array(L.boss.items).fill(null)).slice();
      while (next.length < L.boss.items) next.push(null);
      next[i] = r.given;
      await DS.Act.bossAnswer(code, bossSet, next);
      const ok = DS.Quiz.grade(items[i], r.given);
      DS.UI.toast(ok ? `✔ ${i + 1}번 도달! 보스에게 데미지` : `✘ ${i + 1}번은 아직… ${bossSet === 1 ? '세트 2 로' : '다시'} 도전!`, 2600);
      if (ok) { DS.Sound.slash(); setTimeout(() => DS.Sound.hit(), 160); } else DS.Sound.squish();
    }));
  }
  function endView(body) {
    body.innerHTML = `<div class="panel framed center win"><h2>🏆 오늘의 던전 클리어!</h2>${DS.Art.hero(myP().hero, 'attack', 'big')}
      <p class="muted">게임 기록은 수학 성적이 아니에요. 오늘 배운 것을 학습지에 정리해요.</p></div>`;
  }
  return { enter };
})();
