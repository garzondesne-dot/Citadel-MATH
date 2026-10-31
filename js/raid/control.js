// 교사 기기(교사 폰·종합상황실)가 함께 쓰는 조각: 진행 버튼 · 선생님 연성 · 선생님 마지막 공격
// 화면은 방 값이 바뀔 때마다 다시 그려지므로, 고르는 중인 답·카드는 이 모듈이 라운드별로 기억한다.
window.DS = window.DS || {};

DS.Control = (function () {
  const { esc, pretty } = DS.UI;
  const Act = () => DS.Act, Raid = () => DS.Raid;
  const name = (R, u) => (u === R.meta.teacher ? '선생님' : `${(R.players[u] || {}).num}번`);
  async function run(fn) {
    try { await fn(); } catch (e) { DS.UI.toast(e.message || String(e), 3200); if (!e.user) console.error(e); }
  }

  // ── 진행 버튼 ─────────────────────────────────────────────
  // ctx = { code, R(풀린 방), raw(저장 모양), L }
  function controls(el, ctx) {
    const { code, R, L } = ctx, ph = R.state.phase, si = R.state.stage;
    const btn = (act, label, cls = '', dis = false) => `<button class="btn ${cls}" data-act="${act}"${dis ? ' disabled' : ''}>${label}</button>`;
    let h = '';
    if (ph === 'lobby') h = btn('start', '▶ 수업 시작', 'primary big');
    if (['forge', 'field', 'result'].includes(ph)) {
      const res = R.state.result;
      h += `<p class="shelf-title">단계 (연성)</p><div class="row">${L.stages.map((s, i) => btn(`stage:${i}`, `${i + 1}. ${esc(s.name)}`, i === si && ph === 'forge' ? 'on' : '')).join('')}</div>`;
      h += `<p class="shelf-title">몬스터 소환 <span class="muted small">${esc(L.stages[si].name)}</span></p><div class="row">${L.stages[si].types.map((t) => btn(`summon:${t}`, `👾 ${esc(L.typeNames[t] || t)}`, 'primary')).join('')}</div>`;
      h += '<div class="row">';
      if (ph === 'forge') h += btn('field', '🚶 필드로 (연성 마감)');
      if (ph === 'result' && res && !res.success) h += btn('retry', '↻ 숫자 바꿔 재도전', 'primary');
      h += btn('boss', '👑 보스전 (형성평가)', 'boss') + '</div>';
    }
    if (ph === 'battle') h = `<div class="row">${btn('cancel', '✋ 전투 멈추기 (필드로)')}</div>`;
    if (ph === 'boss') h = `<div class="row">${btn('victory', '🏆 성채 탈환 선언', 'primary big')}</div>`;
    if (ph === 'victory') h = '<p class="muted center">수업이 끝났어요. 수고하셨습니다!</p>';
    el.innerHTML = h;
    el.querySelectorAll('[data-act]').forEach((b) => b.addEventListener('click', () => run(async () => {
      const [a, arg] = b.dataset.act.split(':');
      if (a === 'start') await Act().start(code, R);
      if (a === 'stage') await Act().stage(code, R, Number(arg));
      if (a === 'field') await Act().field(code);
      if (a === 'summon') await Act().summon(code, R, L, arg, false);
      if (a === 'retry') await Act().summon(code, R, L, null, true);
      if (a === 'boss') { if (confirm('보스전(형성평가)을 시작할까요?')) await Act().boss(code, R); }
      if (a === 'cancel') { if (confirm('이 전투를 멈추고 필드로 돌아갈까요? (점수는 주지 않아요)')) await Act().field(code); }
      if (a === 'victory') {
        const hp = Raid().bossHp(L, R);
        if (hp.allReached) await Act().victory(code, R, L, false);
        else if (confirm('아직 1~6번에 모두 도달하지 못한 학생이 있어요. 그래도 마무리할까요?')) await Act().victory(code, R, L, true);
      }
    })));
  }

  // ── 선생님 연성 (선생님도 카드가 있어야 몬스터를 부를 수 있다) ──
  function teacherForge(el, ctx, keep) {
    const { code, L } = ctx, t = ctx.R.meta.teacher;
    const owned = () => new Set(Object.keys(((keep.R().cards || {})[t]) || {}));
    el.innerHTML = '<div class="tf-forge"></div><button class="btn small" data-skip>⏩ 시범 생략: 이 단계 카드 바로 받기</button>';
    const f = DS.Forge.mount(el.querySelector('.tf-forge'), { lesson: L, stage: () => keep.R().state.stage, owned, seed: t, onCraft: (id) => Act().craft(code, t, id) });
    el.querySelector('[data-skip]').onclick = () => run(async () => {
      for (const c of L.stages[keep.R().state.stage].cards) await Act().craft(code, t, c);
      DS.UI.toast('선생님 카드 준비 완료');
    });
    return f;
  }

  // ── 선생님 마지막 공격 (학생 전원 제출 뒤) ───────────────────
  const pick = {}; // roundId → { answer, card }
  function teacherAttack(el, ctx, rerender) {
    const { code, R, raw, L } = ctx, t = R.meta.teacher, rd = R.state.round;
    const s = pick[rd.id] || (pick[rd.id] = { answer: null, card: null });
    const q = Raid().questionFor(L, R, t);
    const all = Raid().allStudentsSubmitted(R);
    const ids = Raid().activeIds(R), subs = (R.subs || {})[rd.id] || {};
    const have = Object.keys((R.cards || {})[t] || {}).filter((c) => L.cards[c]);
    el.innerHTML = `<div class="t-attack">
      <p class="shelf-title">선생님 마지막 공격 ${all ? '<span class="okc">— 학생 전원 제출 완료!</span>' : `<span class="muted small">학생 제출 ${ids.filter((u) => subs[u]).length}/${ids.length} — 모두 낸 뒤에 열려요</span>`}</p>
      <div class="q-box"><p class="math">${pretty(q.question)}</p>${s.answer ? '<p class="ans-ok">✔ 답 고름 <button class="btn small" data-re>다시</button></p>' : '<button class="btn small" data-open>📜 선생님 문제 풀기</button>'}</div>
      <div class="mycards">${have.map((c) => `<button class="gcard${s.card === c ? ' on' : ''}" data-c="${c}">${DS.Art.card(L.cards[c].art)}<b>${esc(L.cards[c].name)}</b></button>`).join('') || '<p class="muted">선생님 카드가 없어요.</p>'}</div>
      <button class="btn primary big" data-go${all && s.answer && s.card ? '' : ' disabled'}>⚔ 마지막 공격!</button></div>`;
    const open = async () => {
      const r = await DS.Quiz.ask({ name: L.typeNames[rd.type] || '문제', formula: '' }, q, { collect: true, tag: '👩‍🏫 선생님' });
      s.answer = r; rerender();
    };
    el.querySelectorAll('[data-open],[data-re]').forEach((b) => (b.onclick = open));
    el.querySelectorAll('.gcard').forEach((b) => (b.onclick = () => { s.card = b.dataset.c; DS.Sound.clank(); rerender(); }));
    el.querySelector('[data-go]').onclick = () => run(async () => {
      const res = await Act().teacherSubmit(code, raw, L, s.card, s.answer.given);
      DS.Sound.slash();
      if (res.success) DS.Sound.correct(); else DS.Sound.wrong();
    });
  }

  return { controls, teacherForge, teacherAttack, run, name };
})();
