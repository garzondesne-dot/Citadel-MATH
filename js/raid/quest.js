// ✏ 출제 공방 (2026-11-07 6판 · 텐트 새 용도 · 시안 「복습 · 우편함 · 출제 공방」 확정)
//   틀 문제 먼저: 배운 차시의 수업 문제 틀(lessons/ 의 생성기 · 이미 독립 검산된 것)을 골라 「🎲 숫자 바꾸기」로 숫자만 바꿈 → 정답은 게임이 계산 (틀린 정답이 나갈 수 없음)
//   → 풀이 한 줄 → 보내기 → 선생님 ✅ 출제 / 🔁 고쳐 주세요 + 메모 → 출제되면 친구들 🎯 복습 허수아비에 「○○이 낸 문제」
//   보상: 출제되면 💎 10 + 📜 1 (한 문제 한 번) · 첫 출제 호칭 「출제자」 · 교사 확인 화면에 생기부 문장 초안(활동 사실만 · 선생님이 고쳐 씀)
//   저장: quest/{반}/{id} = { n, name, lesson, mid, seed, note, st: 'draft'|'wait'|'ok'|'fix', memo, at, okAt } · qsolve/{반}/{id}/{번호} = true
window.DS = window.DS || {};
DS.Quest = (() => {
  const { esc } = DS.UI;
  const N = () => DS.Net, ck = (c) => String(c).replace(/[.#$/[\]]/g, '_');
  const REWARD = { gem: 10, scroll: 1 };
  const ST = { draft: ['✏ 쓰는 중', 'draft'], wait: ['⏳ 확인 중', 'wait'], ok: ['✅ 출제됨', 'ok'], fix: ['🔁 고쳐 주세요', 'fix'] };
  const fieldIds = (L) => L.steps.filter((st) => st.kind === 'monster' && L.monsters[st.id] && !st.special).map((st) => st.id);
  const stepTitle = (L, mid) => (L.steps.find((s) => s.id === mid) || {}).title || mid;
  const conceptTitle = (L, mid) => { const i = L.steps.findIndex((s) => s.id === mid); for (let k = i - 1; k >= 0; k--) if (L.steps[k].kind === 'concept') return L.steps[k].title.replace(/^개념 \d+ · /, ''); return ''; };
  const items = (q) => { const L = DS.Lessons.get(q.lesson); return L ? L.items(q.mid, q.seed, 1) : []; };
  const qText = (it) => (it.type === 'blanks' ? it.items.map((x) => `${x.left} □ ${x.right}`).join('   ') : String(it.question || ''));
  function ansText(it) {
    switch (it.type) {
      case 'multi': return (it.answer || []).map((i) => it.options[i]).join(', ') || '없음';
      case 'blanks': return it.items.map((x) => x.answer).join(' · ');
      case 'ox': return it.answer ? 'O' : 'X';
      case 'number': return String(it.answer);
      case 'text': return String((it.answers || [])[0] || '');
      case 'subsets': return `부분집합 ${DS.SetGen.allSubsets(it.base).length}개`;
      default: return '';
    }
  }
  const view = (q) => items(q).map((it, i) => `<div class="qs-it"><p>${DS.UI.pretty(/^\(\d+\)/.test(qText(it)) ? qText(it) : `(${i + 1}) ${qText(it)}`)}</p><p class="qs-ans">게임이 계산한 정답 <b>${esc(ansText(it))}</b></p></div>`).join('');
  async function mine(m) { const v = (await N().get(`quest/${ck(m.c)}`).catch(() => null)) || {}; return Object.entries(v).filter(([, x]) => x && Number(x.n) === Number(m.n)).map(([id, x]) => ({ id, ...x })).sort((a, b) => (b.at || 0) - (a.at || 0)); }
  async function solvedCount(c, id) { return Object.keys((await N().get(`qsolve/${ck(c)}/${id}`).catch(() => null)) || {}).length; }
  // 🎯 친구 허수아비: 우리 반 출제된 문제 (내 것 빼고 · 배운 차시까지)
  async function friends(m, upto) {
    const v = (await N().get(`quest/${ck(m.c)}`).catch(() => null)) || {}, done = {};
    const list = Object.entries(v).filter(([, x]) => x && x.st === 'ok' && Number(x.n) !== Number(m.n) && (!upto || ((DS.Lessons.get(x.lesson) || {}).no || 99) <= upto)).map(([id, x]) => ({ id, ...x }));
    for (const q of list) done[q.id] = !!(await N().get(`qsolve/${ck(m.c)}/${q.id}/${m.n}`).catch(() => null));
    return list.map((q) => ({ ...q, solved: done[q.id] })).sort((a, b) => (a.solved - b.solved) || (b.okAt || 0) - (a.okAt || 0));
  }
  const markSolved = (m, id) => N().set(`qsolve/${ck(m.c)}/${id}/${m.n}`, true).catch(() => {});

  // ── 학생: ⛺ 출제 공방 ─────────────────────────
  async function open(m) {
    if (DS.OFF && DS.OFF('quest')) return; // 🏫 학교판 = 없음
    const el = document.createElement('div'); el.className = 'modal camp-modal'; document.body.appendChild(el);
    const no = m.test ? 99 : Number(await N().get(`unlock/${ck(m.c)}`).catch(() => 0)) || 0;
    const lessons = DS.Lessons.list.filter((l) => l.no && !l.eval && !l.rooms && l.no <= no && fieldIds(l).length).sort((a, b) => b.no - a.no);
    const home = async () => {
      const list = await mine(m), ok = list.filter((q) => q.st === 'ok');
      const cnt = {}; for (const q of ok) cnt[q.id] = await solvedCount(m.c, q.id);
      el.innerHTML = `<div class="quiz-box framed rs-box qs-box"><div class="quiz-head"><b>✏ 출제 공방</b><button class="btn small" id="qs-x">✕ 닫기</button></div>
        <p class="muted small">내가 만든 문제가 친구들 🎯 복습에 나와요 · 출제되면 💎 +${REWARD.gem} · 📜 +${REWARD.scroll} · 첫 출제 호칭 「출제자」</p>
        <p class="mail-sub"><b>내가 만든 문제</b><span class="muted small">출제됨 ${ok.length}</span></p>
        <div class="mine">${list.map((q) => { const L = DS.Lessons.get(q.lesson) || {}; const s = ST[q.st] || ST.draft;
          return `<div class="qs-mine"><span class="tx">${DS.Lessons.noText(L.no)}차시 · ${esc(conceptTitle(L, q.mid) || stepTitle(L, q.mid))}<small>${q.st === 'ok' ? `친구 ${cnt[q.id] || 0}명이 풀었어요` : q.st === 'fix' ? `선생님 메모 「${esc(q.memo || '')}」` : q.st === 'wait' ? '선생님 확인을 기다려요' : '쓰다 멈춤'}</small></span><i class="st ${s[1]}">${s[0]}</i>${q.st === 'fix' || q.st === 'draft' ? `<button class="btn small" data-edit="${q.id}">✏ 고치기</button>` : ''}</div>`; }).join('') || '<p class="muted small">아직 만든 문제가 없어요.</p>'}</div>
        <button class="btn primary big" id="qs-new"${lessons.length ? '' : ' disabled'}>＋ 새 문제 만들기</button>
        <p class="muted small">「고쳐 주세요」는 벌이 아니라 메모예요 · 몇 번이든 다시 보낼 수 있어요</p></div>`;
      el.querySelector('#qs-x').onclick = () => el.remove();
      el.querySelector('#qs-new').onclick = () => edit(null);
      el.querySelectorAll('[data-edit]').forEach((b) => (b.onclick = () => edit(list.find((q) => q.id === b.dataset.edit))));
    };
    // ① 틀 → ② 숫자 → ③ 풀이 → ④ 보내기
    const edit = (q0) => {
      const q = q0 ? { ...q0 } : { lesson: (lessons[0] || {}).id, mid: '', seed: '', note: '' };
      let step = q0 ? 2 : 1;
      const newSeed = () => `${m.c}|${m.n}|${Date.now().toString(36)}|${Math.random().toString(36).slice(2, 6)}`;
      const draw = () => {
        const L = DS.Lessons.get(q.lesson);
        const steps = ['① 틀', '② 숫자', '③ 풀이', '④ 보내기'].map((t, i) => `<i class="${i + 1 < step ? 'd' : i + 1 === step ? 'on' : ''}">${t}</i>`).join('');
        let body = '';
        if (step === 1) body = `<label>차시 <select id="qs-l">${lessons.map((l) => `<option value="${l.id}"${l.id === q.lesson ? ' selected' : ''}>${DS.Lessons.noText(l.no)}차시 · ${esc(l.title)}</option>`).join('')}</select></label>
          <p class="mail-sub"><b>어떤 문제 틀로?</b></p><div class="qs-frames">${fieldIds(L).map((id) => `<button class="btn${q.mid === id ? ' on' : ''}" data-mid="${id}">${esc(stepTitle(L, id))}<small>${esc(conceptTitle(L, id))}</small></button>`).join('')}</div>`;
        else if (step === 2) body = `<p class="mail-sub"><b>내 문제 틀: ${DS.Lessons.noText(L.no)}차시 · ${esc(conceptTitle(L, q.mid) || stepTitle(L, q.mid))}</b></p><div class="paper qs-paper">${view(q)}</div><button class="btn" id="qs-roll">🎲 숫자 바꾸기</button><p class="muted small">숫자만 바꾸는 「틀 문제」 → 정답은 게임이 계산해서 틀린 정답이 나갈 수 없어요</p>`;
        else if (step === 3) body = `<p class="mail-sub"><b>풀이 한 줄</b><span class="muted small">친구가 틀리면 보여 줘요</span></p><textarea id="qs-note" maxlength="120" rows="3" placeholder="예: U 에서 A 를 빼면 홀수만 남는다">${esc(q.note || '')}</textarea>`;
        else body = `<div class="paper qs-paper">${view(q)}<p class="qs-ans">풀이 · ${esc(q.note || '')}</p></div><p class="muted small">보내면 선생님이 확인해요 · ✅ 출제되면 친구들 🎯 복습에 「${esc(m.name || `${m.n}번`)}이 낸 문제」로 나와요</p>`;
        el.innerHTML = `<div class="quiz-box framed rs-box qs-box"><div class="quiz-head"><b>✏ 새 문제</b><button class="btn small" id="qs-back">◀ 출제 공방</button></div><div class="steps qs-steps">${steps}</div>${body}
          <div class="row">${step > 1 ? '<button class="btn" id="qs-prev">◀ 이전</button>' : ''}${step < 4 ? `<button class="btn primary" id="qs-next"${step === 1 && !q.mid ? ' disabled' : ''}>다음 ▶</button>` : '<button class="btn primary" id="qs-send">📤 선생님께 보내기</button>'}</div></div>`;
        el.querySelector('#qs-back').onclick = () => DS.Control.run(async () => { if (step >= 2 && q.mid) await save('draft'); home(); });
        const nt = el.querySelector('#qs-note'); if (nt) nt.oninput = () => { q.note = nt.value; };
        const ls = el.querySelector('#qs-l'); if (ls) ls.onchange = () => { q.lesson = ls.value; q.mid = ''; draw(); };
        el.querySelectorAll('[data-mid]').forEach((b) => (b.onclick = () => { q.mid = b.dataset.mid; draw(); }));
        const rl = el.querySelector('#qs-roll'); if (rl) rl.onclick = () => { q.seed = newSeed(); draw(); };
        const pv = el.querySelector('#qs-prev'); if (pv) pv.onclick = () => { step--; draw(); };
        const nx = el.querySelector('#qs-next'); if (nx) nx.onclick = () => { if (step === 1 && !q.seed) q.seed = newSeed(); if (step === 3 && !String(q.note || '').trim()) { DS.UI.toast('풀이를 한 줄 써 주세요.'); return; } step++; draw(); };
        const sd = el.querySelector('#qs-send'); if (sd) sd.onclick = () => DS.Control.run(async () => { await save('wait'); DS.UI.toast('📤 선생님께 보냈어요!'); home(); });
      };
      const save = async (st) => {
        if (m.test) return;
        const id = q.id || `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`; q.id = id;
        await N().set(`quest/${ck(m.c)}/${id}`, { n: Number(m.n), name: `${m.n}번 ${m.name || ''}`.trim(), lesson: q.lesson, mid: q.mid, seed: q.seed, note: String(q.note || '').slice(0, 120), st, memo: st === 'wait' ? null : q.memo || null, at: N().TS });
      };
      draw();
    };
    await home();
  }

  // ── 교사: ✏ 출제 확인 ───────────────────────────
  async function pendingCount() { const v = (await N().get('quest').catch(() => null)) || {}; return Object.values(v).reduce((a, byId) => a + Object.values(byId || {}).filter((x) => x && x.st === 'wait').length, 0); }
  function saeng(L, mid, nOk, nSolved) { return `집합의 연산 단원에서 ${conceptTitle(L, mid) || stepTitle(L, mid)} 문제를 직접 설계하고 풀이를 서술하여, 학급 친구들의 복습 문제로 출제됨(누적 ${nOk}문항 · 친구 ${nSolved}명 풀이).`; }
  async function approve(c, id, q) {
    await N().update(`quest/${ck(c)}/${id}`, { st: 'ok', okAt: N().TS, memo: null });
    const m = { c, n: Number(q.n) };
    if (DS.Gem) { await DS.Gem.add(m, REWARD.gem, `quest_${id}`, '✏ 출제됨', { free: true }).catch(() => 0); if (DS.Gem.addScroll) await DS.Gem.addScroll(m, REWARD.scroll, `quest_${id}`, '✏ 출제됨').catch(() => 0); }
  }
  async function review() {
    const el = document.createElement('div'); el.className = 'modal camp-modal'; document.body.appendChild(el);
    const draw = async () => {
      const v = (await N().get('quest').catch(() => null)) || {}, all = [];
      Object.entries(v).forEach(([c, byId]) => Object.entries(byId || {}).forEach(([id, x]) => x && all.push({ c, id, ...x })));
      const wait = all.filter((q) => q.st === 'wait').sort((a, b) => (a.at || 0) - (b.at || 0));
      const q = wait[0];
      let html = '<p class="muted">새로 확인할 문제가 없어요.</p>';
      if (q) {
        const L = DS.Lessons.get(q.lesson) || {}, mineOk = all.filter((x) => x.c === q.c && Number(x.n) === Number(q.n) && x.st === 'ok');
        let solved = 0; for (const x of mineOk) solved += await solvedCount(q.c, x.id);
        html = `<p class="mail-sub"><b>${esc(q.c)}반 ${esc(q.name || `${q.n}번`)}</b><span class="muted small">${DS.Lessons.noText(L.no)}차시 · ${esc(conceptTitle(L, q.mid) || stepTitle(L, q.mid))}</span></p>
          <div class="paper qs-paper">${view(q)}<p class="qs-ans">풀이 「${esc(q.note || '')}」</p></div>
          <div class="row"><button class="btn primary" id="qr-ok">✅ 출제</button><button class="btn" id="qr-fix">🔁 고쳐 주세요</button></div>
          <input id="qr-memo" maxlength="80" placeholder="✎ 메모 (고쳐 주세요와 함께 · 예: (2) 답이 둘이 돼요)">
          <details class="mail-old"><summary>📋 생기부 문장 초안 (활동 사실만 · 고쳐 쓰세요)</summary><p class="qs-saeng" id="qr-sg">${esc(saeng(L, q.mid, mineOk.length + 1, solved))}</p><button class="btn small" id="qr-copy">📋 복사</button></details>`;
      }
      el.innerHTML = `<div class="quiz-box framed rs-box qs-box"><div class="quiz-head"><b>✏ 출제 확인</b><span class="muted small">새로 ${wait.length}</span><button class="btn small" id="qr-x">✕ 닫기</button></div>${html}</div>`;
      el.querySelector('#qr-x').onclick = () => el.remove();
      if (!q) return;
      el.querySelector('#qr-ok').onclick = () => DS.Control.run(async () => { await approve(q.c, q.id, q); DS.UI.toast(`✅ 출제했어요 — ${q.name} 💎 +${REWARD.gem} · 📜 +${REWARD.scroll}`); draw(); });
      el.querySelector('#qr-fix').onclick = () => DS.Control.run(async () => { await N().update(`quest/${ck(q.c)}/${q.id}`, { st: 'fix', memo: String(el.querySelector('#qr-memo').value || '').slice(0, 80) || '조금만 고쳐 주세요' }); draw(); });
      el.querySelector('#qr-copy').onclick = () => { try { navigator.clipboard.writeText(el.querySelector('#qr-sg').textContent); DS.UI.toast('📋 복사했어요'); } catch (e) { /* 직접 골라 복사 */ } };
    };
    await draw();
  }
  return { REWARD, ST, items, ansText, mine, friends, markSolved, open, review, approve, pendingCount, saeng };
})();
