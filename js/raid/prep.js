// 수업 준비 화면 (PC, 교사 계정만): 학생 명단 올리기 · 비밀번호 초기화 · 개념 설명 학습지 이미지 · 기준% 기본값
// 명단·이미지는 Firebase 에만 저장한다 (저장소에는 넣지 않는다). 피드백 잠금 목록은 3단계에서 이 화면에 붙는다.
window.DS = window.DS || {};

DS.Prep = (function () {
  const $ = (s) => document.querySelector(s);
  const { esc } = DS.UI;
  const A = () => DS.Account;
  let L = null, data = {}, roster = {}, accounts = {}, stops = [];

  async function enter(lessonId) {
    if (!(await A().isAdmin())) throw Object.assign(new Error('교사 계정으로 로그인해야 해요.'), { user: true });
    L = DS.Lessons.get(lessonId);
    DS.UI.show('screen-prep');
    stops.forEach((f) => f()); stops = [
      DS.Net.watch(`prep/${L.id}`, (v) => { data = v || {}; render(); }),
      DS.Net.watch('roster', (v) => { roster = v || {}; render(); }),
      DS.Net.watch('accounts', (v) => { accounts = v || {}; render(); }),
    ];
  }
  function render() {
    if (!L) return;
    const slots = L.steps.filter((s) => s.kind === 'intro' || s.kind === 'concept');
    const keep = { text: $('#r-text') ? $('#r-text').value : '', cls: $('#r-cls') ? $('#r-cls').value : null };
    $('#p-body').innerHTML = `<div class="panel framed"><h2>📋 수업 준비</h2><p class="muted small">명단·이미지는 Firebase 에만 저장돼요 (저장소에는 올라가지 않아요).</p></div>
      ${rosterPanel()}
      <div class="panel framed"><h2>${esc(L.unit)} ${esc(L.title)}</h2>
        <p class="muted small">학습지: ${esc(L.sheet || '')} · 이미지는 종합상황실 화면 절반에 떠요.</p>
        <div class="pct-row"><span>몬스터 체력 기준% 기본값</span><input id="p-pct" type="number" min="10" max="100" step="5" value="${data.pct || L.defaultPct || 90}"><button class="btn" id="p-pct-save">저장</button><span class="muted small">수업 중에는 교사 폰에서 몬스터마다 바꿔요</span></div></div>
      ${slots.map((s) => {
        const img = (data.img || {})[s.id];
        return `<div class="panel framed p-slot"><div class="p-slot-head"><b>${esc(s.title)}</b><label class="btn small">🖼 이미지 고르기<input type="file" accept="image/*" data-slot="${s.id}" hidden></label>${img ? `<button class="btn small" data-del="${s.id}">지우기</button>` : ''}</div>
          ${img ? `<img class="p-prev" src="${img}" alt="${esc(s.title)}">` : '<p class="muted small">아직 없음 — 학습지에서 이 부분을 캡처해 올려 주세요.</p>'}</div>`;
      }).join('')}`;
    $('#r-text').value = keep.text; if (keep.cls != null) $('#r-cls').value = keep.cls;
    bindRoster();
    $('#p-pct-save').onclick = () => DS.Control.run(async () => { await DS.Act.setDefaultPct(L.id, Math.max(10, Math.min(100, Number($('#p-pct').value) || 90))); DS.UI.toast('기준% 기본값을 저장했어요. 새로 만드는 수업부터 적용돼요.'); });
    document.querySelectorAll('[data-slot]').forEach((inp) => (inp.onchange = () => DS.Control.run(async () => {
      const f = inp.files[0]; if (!f) return;
      DS.UI.toast('이미지를 줄여서 올리는 중…');
      await DS.Act.setImage(L.id, inp.dataset.slot, await shrink(f));
      DS.UI.toast('올렸어요!');
    })));
    document.querySelectorAll('[data-del]').forEach((b) => (b.onclick = () => DS.Control.run(async () => { if (confirm('이 이미지를 지울까요?')) await DS.Act.setImage(L.id, b.dataset.del, null); })));
  }

  // ── 학생 명단 · 초기화 ────────────────────────────────────
  function rosterPanel() {
    const classes = Object.keys(roster).sort();
    const row = (c, n, name) => {
      const a = (accounts[c] || {})[n];
      const st = !a ? '<span class="muted">미가입</span>' : a.reset ? '<span class="gold">초기화됨 (0000)</span>' : '<span class="okc">가입</span>';
      return `<tr><td>${n}</td><td>${esc(name)}</td><td>${st}</td><td>${a && !a.reset ? `<button class="btn small" data-reset="${esc(c)}|${n}">비밀번호 초기화</button>` : ''} <button class="btn small" data-rm="${esc(c)}|${n}">빼기</button></td></tr>`;
    };
    return `<div class="panel framed"><h2>👥 학생 명단</h2>
      <p class="muted small">반 이름(예: 1-3)을 넣고, 한 줄에 "번호 이름" 으로 붙여 넣어요. 시트에서 "반 번호 이름" 세 칸을 복사해 붙여도 돼요. 학생은 반·번호를 고르면 이름이 자동으로 떠요 (로그인 전에는 김*우 처럼 가려서).</p>
      <div class="row2"><label>반 <input id="r-cls" placeholder="1-3" value="${esc(classes[0] || '')}"></label><span></span></div>
      <textarea id="r-text" rows="5" placeholder="1 김민준&#10;2 이서연&#10;3 박도윤"></textarea>
      <button class="btn primary" id="r-up">명단 올리기</button>
      ${classes.map((c) => { const byN = roster[c] || {}; const ns = Object.keys(byN).map(Number).filter(Boolean).sort((a, b) => a - b);
        return `<h3 class="gold">${esc(c)} <span class="muted small">${ns.length}명 · 가입 ${ns.filter((n) => (accounts[c] || {})[n] && !(accounts[c] || {})[n].reset).length}명</span></h3><table class="r-table"><tr><th>번호</th><th>이름</th><th>계정</th><th></th></tr>${ns.map((n) => row(c, n, byN[n])).join('')}</table>`; }).join('')}</div>`;
  }
  function bindRoster() {
    const up = $('#r-up');
    if (up) up.onclick = () => DS.Control.run(async () => {
      const { rows, bad } = A().parseRoster($('#r-text').value, $('#r-cls').value);
      if (!rows.length) throw Object.assign(new Error('올릴 줄이 없어요. "번호 이름" 형식인지 확인해 주세요.'), { user: true });
      await A().uploadRoster(rows);
      $('#r-text').value = bad.join('\n');
      DS.UI.toast(`${rows.length}명을 올렸어요.${bad.length ? ` 읽지 못한 줄 ${bad.length}개는 칸에 남겼어요.` : ''}`, 3600);
    });
    document.querySelectorAll('[data-reset]').forEach((b) => (b.onclick = () => DS.Control.run(async () => {
      const [c, n] = b.dataset.reset.split('|');
      if (!confirm(`${c} ${n}번 비밀번호를 0000 으로 초기화할까요? 학생은 0000 으로 들어가 새 비밀번호를 정해요.`)) return;
      await A().resetAccount(c, Number(n)); DS.UI.toast('초기화했어요. 학생에게 0000 으로 로그인하라고 알려 주세요.', 3600);
    })));
    document.querySelectorAll('[data-rm]').forEach((b) => (b.onclick = () => DS.Control.run(async () => {
      const [c, n] = b.dataset.rm.split('|');
      if (confirm(`${c} ${n}번을 명단에서 뺄까요? (계정 기록은 남아요)`)) await A().removeStudent(c, Number(n));
    })));
  }

  // 가로 최대 1400px · JPEG 0.82 로 줄인다 (Realtime Database 한 칸에 담기 좋게)
  function shrink(file) {
    return new Promise((res, rej) => {
      const rd = new FileReader();
      rd.onerror = () => rej(new Error('이미지를 읽지 못했어요.'));
      rd.onload = () => {
        const img = new Image();
        img.onerror = () => rej(new Error('이미지 파일이 아니에요.'));
        img.onload = () => {
          const k = Math.min(1, 1400 / img.width), cv = document.createElement('canvas');
          cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k);
          const g = cv.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, cv.width, cv.height); g.drawImage(img, 0, 0, cv.width, cv.height);
          res(cv.toDataURL('image/jpeg', 0.82));
        };
        img.src = rd.result;
      };
      rd.readAsDataURL(file);
    });
  }
  return { enter };
})();
