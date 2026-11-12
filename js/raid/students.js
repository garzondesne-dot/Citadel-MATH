// 👥 학생 관리 (교사 계정만 · 교사 메뉴 「테스트 모드」 위): 반별 명단 · 한 명 추가 · 이름 고치기 · 빼기 · 비밀번호 0000 초기화
// 학생을 누르면 개인 기록(레벨 · 도감 · 보강 인장 · 차시별 결과와 복습 추천)을 본다. 기록은 성적이 아니라 참여 지표다.
// 명단은 Firebase 에만 저장한다 (저장소에는 넣지 않는다).
window.DS = window.DS || {};

DS.Students = (function () {
  const $ = (s) => document.querySelector(s);
  const { esc } = DS.UI;
  const A = () => DS.Account;
  let roster = {}, accounts = {}, testers = {}, cls = '', stops = [], extra = {};

  async function enter() {
    if (!(await A().isAdmin())) throw Object.assign(new Error('교사 계정으로 로그인해야 해요.'), { user: true });
    DS.UI.show('screen-students');
    DS.Scene.save({ role: 'students' });
    stops.forEach((f) => f()); stops = [
      DS.Net.watch('roster', (v) => { roster = v || {}; if (!cls || !roster[cls]) cls = Object.keys(roster).sort()[0] || ''; render(); loadExtra(); }),
      DS.Net.watch('accounts', (v) => { accounts = v || {}; render(); }),
      DS.Net.watch('tester', (v) => { testers = v || {}; render(); }), // 🧪 #67 시험 계정
    ];
  }
  // 반마다: 레벨(xp) · 도감(cards) · 보강 인장(bonus) — 표에 함께 보여 준다
  async function loadExtra() {
    if (!cls) return;
    const k = A().classKey(cls);
    const [xp, cards, bonus] = await Promise.all(['xp', 'cards', 'bonus'].map((p) => DS.Net.get(`${p}/${k}`).catch(() => null)));
    extra = { xp: xp || {}, cards: cards || {}, bonus: bonus || {} };
    render();
  }
  function cells(n) {
    const xp = Number(((extra.xp || {})[n] || {}).total || 0);
    const lv = DS.Grow ? DS.Grow.level(xp) : null;
    const cards = Object.keys((extra.cards || {})[n] || {}).length;
    const seals = DS.Bonus ? DS.Bonus.seals((extra.bonus || {})[n]).length : 0;
    return `<td>${lv ? `Lv.${lv.lv} <span class="muted small">${esc(lv.title)}</span>` : '-'}</td><td>${cards}</td><td>${seals}</td>`;
  }
  function render() {
    const el = $('#sm-body'); if (!el) return;
    const classes = Object.keys(roster).sort();
    const byN = roster[cls] || {}, ns = Object.keys(byN).map(Number).filter(Boolean).sort((a, b) => a - b);
    const acc = accounts[cls] || {};
    const keep = { text: $('#r-text') ? $('#r-text').value : '', newc: $('#r-cls') ? $('#r-cls').value : '' };
    const row = (n) => {
      const a = acc[n];
      const st = !a ? '<span class="muted">미가입</span>' : a.reset ? '<span class="gold">초기화됨 (0000)</span>' : '<span class="okc">가입</span>';
      const tst = !!((testers[A().classKey(cls)] || {})[n]);
      return `<tr${tst ? ' class="st-tester"' : ''}><td>${n}</td><td><button class="linkish" data-who="${n}">${esc(byN[n])}</button>${tst ? ' <b class="tst-ic" title="시험 계정 · 통계에서 빠짐">🧪</b>' : ''}</td><td>${st}</td>${cells(n)}
        <td class="st-act"><button class="btn small" data-ren="${n}">이름 고치기</button>${a && !a.reset ? `<button class="btn small" data-reset="${n}">비밀번호 초기화</button>` : ''}<button class="btn small${tst ? ' primary' : ''}" data-tst="${n}">${tst ? '🧪 시험 계정 끄기' : '🧪 시험 계정'}</button><button class="btn small" data-rm="${n}">빼기</button></td></tr>`;
    };
    el.innerHTML = `<div class="panel framed"><h2>👥 학생 관리</h2><p class="muted small">명단은 Firebase 에만 저장돼요 (저장소에는 올라가지 않아요). 학생 이름을 누르면 개인 기록을 볼 수 있어요 — 성적이 아니라 참여 기록이에요.</p>
        <div class="tabs st-cls">${classes.map((c) => `<button class="tab${c === cls ? ' on' : ''}" data-cls="${esc(c)}">${A().isBetaOf(testers, c) ? '🧪 ' : ''}${esc(c)} <span class="muted small">${Object.keys(roster[c] || {}).length}</span></button>`).join('') || '<span class="muted">아직 반이 없어요 — 아래에서 새 반 명단을 붙여 넣어요.</span>'}</div></div>
      ${cls ? `<div class="panel framed"><h3 class="gold">${A().isBetaOf(testers, cls) ? '🧪 ' : ''}${esc(cls)} <span class="muted small">${ns.length}명 · 가입 ${ns.filter((n) => acc[n] && !acc[n].reset).length}명</span></h3>
        <div class="st-beta${A().isBetaOf(testers, cls) ? ' on' : ''}"><button class="btn small${A().isBetaOf(testers, cls) ? ' primary' : ''}" data-beta>${A().isBetaOf(testers, cls) ? '🧪 베타 반 끄기' : '🧪 이 반을 베타 반으로'}</button><span class="muted small">${A().isBetaOf(testers, cls) ? '베타 반 — 학생은 그대로 수업 · 「전체」 · 반 비교 · 설문 집계 · 다른 반 대항전에서 빠져요' : '반 전체를 시험용으로 — 게임 · 보상은 그대로, 통계에서만 빠져요'}</span></div>
        <div class="st-add"><label>번호 <input id="a-n" type="number" min="1" max="40" inputmode="numeric"></label><label>이름 <input id="a-name" maxlength="8"></label><button class="btn primary" id="a-go">＋ 한 명 추가</button></div>
        <div class="st-scroll"><table class="r-table"><tr><th>번호</th><th>이름</th><th>계정</th><th>레벨</th><th>도감</th><th>업적</th><th></th></tr>${ns.map(row).join('')}</table></div></div>` : ''}
      <details class="panel framed"${classes.length ? '' : ' open'}><summary><b>📋 명단 한꺼번에 붙여넣기</b> <span class="muted small">새 반 · 여러 명</span></summary>
        <p class="muted small">반 이름(예: 1-3)을 넣고, 한 줄에 "번호 이름" 으로 붙여 넣어요. 시트에서 "반 번호 이름" 세 칸을 복사해 붙여도 돼요. 같은 번호가 있으면 이름을 새로 바꿔요.</p>
        <div class="row2"><label>반 <input id="r-cls" placeholder="1-3" value="${esc(keep.newc || cls)}"></label><span></span></div>
        <textarea id="r-text" rows="5" placeholder="1 김민준&#10;2 이서연&#10;3 박도윤"></textarea>
        <button class="btn primary" id="r-up">명단 올리기</button></details>`;
    if ($('#r-text')) $('#r-text').value = keep.text;
    bind(byN);
  }
  function bind(byN) {
    document.querySelectorAll('[data-cls]').forEach((b) => (b.onclick = () => { cls = b.dataset.cls; extra = {}; render(); loadExtra(); }));
    const add = $('#a-go');
    if (add) add.onclick = () => DS.Control.run(async () => {
      const n = Number($('#a-n').value), name = $('#a-name').value.trim();
      if (!(n >= 1 && n <= 40) || !name || name.length > 8) throw Object.assign(new Error('번호(1~40)와 이름(8자 이내)을 넣어 주세요.'), { user: true });
      if (byN[n] && !confirm(`${n}번은 이미 ${byN[n]} 이에요. 이름을 ${name} 으로 바꿀까요?`)) return;
      await A().uploadRoster([{ c: A().classKey(cls), n, name }]);
      DS.UI.toast(`${cls} ${n}번 ${name} 을(를) 넣었어요.`);
    });
    document.querySelectorAll('[data-ren]').forEach((b) => (b.onclick = () => DS.Control.run(async () => {
      const n = Number(b.dataset.ren), name = (prompt(`${cls} ${n}번 새 이름 (8자 이내)`, byN[n]) || '').trim();
      if (!name || name === byN[n]) return;
      if (name.length > 8) throw Object.assign(new Error('이름은 8자 이내로 넣어 주세요.'), { user: true });
      await A().uploadRoster([{ c: A().classKey(cls), n, name }]); DS.UI.toast('이름을 고쳤어요.');
    })));
    document.querySelectorAll('[data-tst]').forEach((b) => (b.onclick = () => DS.Control.run(async () => { // 🧪 #67: 켜면 지난 기록까지 통계 · 랭킹 · 체력 머릿수에서 빠짐 (기록은 지우지 않음)
      const n = Number(b.dataset.tst), k = A().classKey(cls), on = !((testers[k] || {})[n]);
      if (!confirm(on ? `${cls} ${n}번을 🧪 시험 계정으로 할까요?\n학생과 똑같이 하지만 랭킹 · 반 통계 · 몬스터 체력 계산 · 설문 집계에서 빠져요 (지난 기록 포함 · 지우지는 않음).` : `${cls} ${n}번 🧪 시험 계정을 끌까요? 다시 통계에 들어가요.`)) return;
      await DS.Net.set(`tester/${k}/${n}`, on ? true : null); DS.UI.toast(on ? '🧪 시험 계정으로 했어요' : '🧪 시험 계정을 껐어요');
    })));
    { const bb = document.querySelector('[data-beta]'); if (bb) bb.onclick = () => DS.Control.run(async () => { // 🧪 #122 베타 반 (2026-11-12)
      const k = A().classKey(cls), on = !A().isBetaOf(testers, cls);
      if (!confirm(on ? `${cls} 반을 🧪 베타 반으로 할까요?\n학생은 똑같이 수업하지만 대시보드 「전체」 · 반 비교 · 설문 집계 · 다른 반 대항전에서 빠져요 (지난 기록 포함 · 지우지는 않음).` : `${cls} 🧪 베타 반을 끌까요? 다시 통계에 들어가요.`)) return;
      await DS.Net.set(`tester/${k}/${A().BETA}`, on ? true : null); DS.UI.toast(on ? `🧪 ${cls} = 베타 반` : `🧪 ${cls} 베타 반을 껐어요`);
    }); }
    document.querySelectorAll('[data-reset]').forEach((b) => (b.onclick = () => DS.Control.run(async () => {
      const n = Number(b.dataset.reset);
      if (!confirm(`${cls} ${n}번 비밀번호를 0000 으로 초기화할까요? 학생은 0000 으로 들어가 새 비밀번호를 정해요.`)) return;
      await A().resetAccount(cls, n); DS.UI.toast('초기화했어요. 학생에게 0000 으로 로그인하라고 알려 주세요.', 3600);
    })));
    document.querySelectorAll('[data-rm]').forEach((b) => (b.onclick = () => DS.Control.run(async () => {
      const n = Number(b.dataset.rm);
      if (confirm(`${cls} ${n}번을 명단에서 뺄까요? (계정 · 기록은 남아요)`)) await A().removeStudent(cls, n);
    })));
    document.querySelectorAll('[data-who]').forEach((b) => (b.onclick = () => DS.Control.run(() => detail(Number(b.dataset.who), byN[b.dataset.who]))));
    const up = $('#r-up');
    if (up) up.onclick = () => DS.Control.run(async () => {
      const { rows, bad } = A().parseRoster($('#r-text').value, $('#r-cls').value);
      if (!rows.length) throw Object.assign(new Error('올릴 줄이 없어요. "번호 이름" 형식인지 확인해 주세요.'), { user: true });
      await A().uploadRoster(rows);
      $('#r-text').value = bad.join('\n'); cls = rows[0].c;
      DS.UI.toast(`${rows.length}명을 올렸어요.${bad.length ? ` 읽지 못한 줄 ${bad.length}개는 칸에 남겼어요.` : ''}`, 3600);
    });
  }
  // 개인 기록: 레벨 · 도감 · 보강 인장 · 차시별 결과(개념별 · 복습 추천)
  async function detail(n, name) {
    const k = A().classKey(cls);
    const [rec, xp] = await Promise.all([DS.Net.get(`records/${k}/${n}`).catch(() => null), DS.Net.get(`xp/${k}/${n}`).catch(() => null)]);
    const total = Number((xp || {}).total || 0), lv = DS.Grow ? DS.Grow.level(total) : null;
    const seals = DS.Bonus ? DS.Bonus.seals((extra.bonus || {})[n]) : [];
    const el = document.createElement('div'); el.className = 'modal camp-modal';
    el.innerHTML = `<div class="quiz-box framed st-detail"><h2>${esc(cls)} ${n}번 ${esc(name)}</h2>
      <p>${lv ? `<b class="gold">Lv.${lv.lv} ${esc(lv.title)}</b> · EXP ${total}` : `EXP ${total}`} · 도감 ${Object.keys((extra.cards || {})[n] || {}).length}장 · 업적 ${seals.length}개</p>
      ${DS.Result ? DS.Result.history(rec || {}) : '<p class="muted">아직 기록이 없어요.</p>'}
      <div class="row"><button class="btn" id="sd-x">✕ 닫기</button></div></div>`;
    document.body.appendChild(el);
    el.querySelector('#sd-x').onclick = () => el.remove();
  }
  return { enter };
})();
