// 수업 준비 화면 (PC, 교사 계정만): 학생 명단 올리기 · 비밀번호 초기화 · 개념 설명 학습지 이미지 · 기준% 기본값
// 명단·이미지는 Firebase 에만 저장한다 (저장소에는 넣지 않는다). 피드백 잠금 목록은 3단계에서 이 화면에 붙는다.
// 이미지 넣는 방법: ① 칸을 누르고 Ctrl+V (스크린샷 붙여넣기) · 끌어다 놓기 · 파일 고르기
//                  ② 레이드용 학습지 PDF 를 올리면 차시 파일의 crops 위치대로 [개념] 칸마다 잘라 미리 넣는다 → 틀린 칸만 자르는 틀을 끌어 고친 뒤 올린다
window.DS = window.DS || {};

DS.Prep = (function () {
  const $ = (s) => document.querySelector(s);
  const { esc } = DS.UI;
  const A = () => DS.Account;
  let L = null, data = {}, roster = {}, accounts = {}, stops = [];
  let sel = null, pages = [], thumbs = [], draft = {}, editing = null, piece = 0;
  // 이미지 칸: 도입·개념(설명 때 크게) + 문제·보강·형성평가(교사가 「📄 문제 화면」을 누르면 해설용으로 크게)
  const slotSteps = () => L.steps.map((s) => (s.kind === 'boss' ? { ...s, title: s.title || L.boss.title } : s));

  async function enter(lessonId) {
    if (!(await A().isAdmin())) throw Object.assign(new Error('교사 계정으로 로그인해야 해요.'), { user: true });
    L = DS.Lessons.get(lessonId);
    sel = null; pages = []; thumbs = []; draft = {}; editing = null;
    DS.UI.show('screen-prep');
    document.onpaste = onPaste;
    stops.forEach((f) => f()); stops = [
      DS.Net.watch(`prep/${L.id}`, (v) => { data = v || {}; render(); }),
      DS.Net.watch('roster', (v) => { roster = v || {}; render(); }),
      DS.Net.watch('accounts', (v) => { accounts = v || {}; render(); }),
    ];
  }
  function render() {
    if (!L) return;
    const slots = slotSteps();
    const keep = { text: $('#r-text') ? $('#r-text').value : '', cls: $('#r-cls') ? $('#r-cls').value : null };
    $('#p-body').innerHTML = `<div class="panel framed"><h2>📋 수업 준비</h2><p class="muted small">명단·이미지는 Firebase 에만 저장돼요 (저장소에는 올라가지 않아요).</p></div>
      ${rosterPanel()}
      <div class="panel framed"><h2>${esc(L.unit)} ${esc(L.title)}</h2>
        <p class="muted small">학습지: ${esc(L.sheet || '')} · 이미지는 종합상황실 화면 절반에 떠요.</p>
        <div class="pct-row"><span>몬스터 체력 기준% 기본값</span><input id="p-pct" type="number" min="10" max="100" step="5" value="${data.pct || L.defaultPct || 90}"><button class="btn" id="p-pct-save">저장</button><span class="muted small">수업 중에는 교사 폰에서 몬스터마다 바꿔요</span></div>
        <div class="pct-row"><span>🤔 생각 시간 (틀린 뒤 재도전까지)</span><select id="p-think">${[0, 5, 10, 15].map((v) => `<option value="${v}"${(data.think != null ? Number(data.think) : 5) === v ? ' selected' : ''}>${v ? `${v}초` : '끄기'}</option>`).join('')}</select><span class="muted small">해설은 읽을 수 있고 「다시 도전」만 잠깐 잠겨요 · 새로 만드는 수업부터</span></div></div>
      ${pdfPanel()}
      ${slots.map(slotHtml).join('')}`;
    $('#r-text').value = keep.text; if (keep.cls != null) $('#r-cls').value = keep.cls;
    bindRoster();
    $('#p-think').onchange = () => DS.Control.run(async () => { await DS.Act.setThink(L.id, Number($('#p-think').value)); DS.UI.toast('생각 시간을 저장했어요.'); });
    $('#p-pct-save').onclick = () => DS.Control.run(async () => { await DS.Act.setDefaultPct(L.id, Math.max(10, Math.min(100, Number($('#p-pct').value) || 90))); DS.UI.toast('기준% 기본값을 저장했어요. 새로 만드는 수업부터 적용돼요.'); });
    bindSlots();
  }

  // ── 학습지 이미지 칸 ───────────────────────────────────────
  function pdfPanel() {
    const n = Object.keys(draft).length, has = !!L.crops;
    return `<div class="panel framed"><h2>📄 학습지 PDF로 한 번에 넣기</h2>
      <p class="muted small">${has ? `레이드용 학습지(${esc(L.sheet || '')}) PDF 를 올리면 [개념] 칸마다 알맞은 부분을 잘라 미리 넣어요. 틀린 칸만 <b>✏ 자르기 조정</b>으로 고친 뒤 올려요.` : '이 차시는 자를 위치가 아직 없어요. PDF 를 올린 뒤 칸마다 ✏ 자르기 조정으로 직접 골라요.'}</p>
      <div class="row"><label class="btn">📄 PDF 고르기<input type="file" accept="application/pdf,.pdf" id="p-pdf" hidden></label>
      ${n ? `<button class="btn primary" id="p-all">✅ 미리 넣은 ${n}칸 전부 올리기</button><button class="btn small" id="p-drop">미리보기 버리기</button>` : ''}</div></div>`;
  }
  function slotHtml(s) {
    const img = (data.img || {})[s.id], d = draft[s.id];
    const kind = s.kind === 'intro' || s.kind === 'concept' ? '<span class="p-kind">설명 때 크게</span>' : '<span class="p-kind q">📄 문제 화면 (교사 해설용)</span>';
    const head = `<div class="p-slot-head"><b>${esc(s.title)}</b>${kind}<label class="btn small">🖼 고르기<input type="file" accept="image/*" data-slot="${s.id}" hidden></label>
      ${pages.length ? `<button class="btn small" data-edit="${s.id}">✏ 자르기 ${d ? '조정' : 'PDF 에서'}</button>` : ''}${img && !d ? `<button class="btn small" data-del="${s.id}">지우기</button>` : ''}</div>`;
    const body = editing === s.id ? editorHtml(s.id)
      : d ? `<img class="p-prev draft" src="${d.url}" alt="${esc(s.title)} 미리보기"><p class="gold small">미리보기 — 아직 안 올렸어요${d.guess ? ' (자를 위치 정보가 없어 대충 잘랐어요. 조정해 주세요)' : ''}</p>
        <div class="row"><button class="btn primary small" data-up="${s.id}">✅ 이 칸 올리기</button><button class="btn small" data-undo="${s.id}">버리기</button></div>`
      : img ? `<img class="p-prev" src="${img}" alt="${esc(s.title)}">`
      : '<p class="muted small">아직 없음 — 이 칸을 누르고 <b>Ctrl+V</b> (스크린샷 붙여넣기) · 이미지 끌어다 놓기 · 🖼 고르기</p>';
    return `<div class="panel framed p-slot${sel === s.id ? ' sel' : ''}" data-box="${s.id}" tabindex="0">${head}${body}${sel === s.id && editing !== s.id ? '<p class="p-paste small">📋 지금 Ctrl+V 하면 이 칸에 들어가요</p>' : ''}</div>`;
  }
  const up = (slot, url, msg = '올렸어요!') => DS.Control.run(async () => { await DS.Act.setImage(L.id, slot, url); delete draft[slot]; DS.UI.toast(msg); render(); });
  function bindSlots() {
    document.querySelectorAll('[data-box]').forEach((box) => {
      box.onclick = (e) => { if (editing || e.target.closest('button,label,input')) return; if (sel !== box.dataset.box) { sel = box.dataset.box; render(); } };
      box.ondragover = (e) => { e.preventDefault(); box.classList.add('over'); };
      box.ondragleave = () => box.classList.remove('over');
      box.ondrop = (e) => { e.preventDefault(); box.classList.remove('over'); const f = [...(e.dataTransfer.files || [])].find((x) => /^image\//.test(x.type)); if (f) putFile(box.dataset.box, f); else DS.UI.toast('이미지 파일을 끌어다 놓아 주세요.'); };
    });
    document.querySelectorAll('[data-slot]').forEach((inp) => (inp.onchange = () => { const f = inp.files[0]; if (f) putFile(inp.dataset.slot, f); }));
    document.querySelectorAll('[data-del]').forEach((b) => (b.onclick = () => DS.Control.run(async () => { if (confirm('이 이미지를 지울까요?')) await DS.Act.setImage(L.id, b.dataset.del, null); })));
    document.querySelectorAll('[data-up]').forEach((b) => (b.onclick = () => up(b.dataset.up, draft[b.dataset.up].url)));
    document.querySelectorAll('[data-undo]').forEach((b) => (b.onclick = () => { delete draft[b.dataset.undo]; render(); }));
    document.querySelectorAll('[data-edit]').forEach((b) => (b.onclick = () => {
      const id = b.dataset.edit; if (!draft[id]) draft[id] = { rects: guessRects(id), guess: !(L.crops || {})[id] };
      editing = id; sel = id; piece = 0; render();
      const on = document.querySelector('.crop-box.on'); if (on) on.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }));
    const pdf = $('#p-pdf'); if (pdf) pdf.onchange = () => { const f = pdf.files[0]; if (f) DS.Control.run(() => fromPdf(f)); };
    const all = $('#p-all'); if (all) all.onclick = () => DS.Control.run(async () => { const ids = Object.keys(draft); for (const id of ids) await DS.Act.setImage(L.id, id, draft[id].url); draft = {}; DS.UI.toast(`${ids.length}칸을 올렸어요!`); render(); });
    const drop = $('#p-drop'); if (drop) drop.onclick = () => { draft = {}; editing = null; render(); };
    if (editing) bindEditor();
  }
  function putFile(slot, f) { DS.Control.run(async () => { DS.UI.toast('이미지를 줄여서 올리는 중…'); await up(slot, await shrink(f)); }); }
  function onPaste(e) {
    if (!L || !document.getElementById('screen-prep').classList.contains('active')) return;
    if (e.target.closest && e.target.closest('textarea,input')) return; // 명단 붙여넣기는 그대로
    const it = [...((e.clipboardData || {}).items || [])].find((x) => /^image\//.test(x.type));
    if (!it) return;
    e.preventDefault();
    if (!sel) { DS.UI.toast('먼저 이미지를 넣을 칸을 눌러 골라 주세요.'); return; }
    putFile(sel, it.getAsFile());
  }

  // ── PDF → 칸마다 자르기 ───────────────────────────────────
  const PAGE_W = 2400; // 쪽 그림 가로 픽셀 (자른 칸이 1000px 안팎이 되게)
  function pdfjs() {
    if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
    return new Promise((res, rej) => {
      const sc = document.createElement('script');
      sc.src = 'js/vendor/pdfjs/pdf.min.js';
      sc.onload = () => { window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'js/vendor/pdfjs/pdf.worker.min.js'; res(window.pdfjsLib); };
      sc.onerror = () => rej(new Error('PDF 읽기 도구를 불러오지 못했어요. 인터넷 연결을 확인해 주세요.'));
      document.head.appendChild(sc);
    });
  }
  async function fromPdf(file) {
    DS.UI.toast('PDF 를 읽는 중…', 4000);
    const lib = await pdfjs();
    const doc = await lib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
    pages = []; thumbs = [];
    for (let i = 1; i <= Math.min(doc.numPages, 6); i++) {
      const pg = await doc.getPage(i), vp = pg.getViewport({ scale: PAGE_W / pg.getViewport({ scale: 1 }).width });
      const cv = document.createElement('canvas'); cv.width = Math.round(vp.width); cv.height = Math.round(vp.height);
      const g = cv.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, cv.width, cv.height);
      await pg.render({ canvasContext: g, viewport: vp }).promise;
      pages.push(cv);
      const t = document.createElement('canvas'); t.width = 760; t.height = Math.round((cv.height * 760) / cv.width);
      t.getContext('2d').drawImage(cv, 0, 0, t.width, t.height); thumbs.push(t.toDataURL('image/jpeg', 0.75));
    }
    draft = {}; editing = null;
    slotSteps().forEach((s) => { const rects = guessRects(s.id); draft[s.id] = { rects, url: cut(rects), guess: !(L.crops || {})[s.id] }; });
    const need = Math.max(0, ...Object.values(L.crops || {}).flat().map((r) => r.p));
    DS.UI.toast(need > pages.length ? `PDF 가 ${pages.length}쪽뿐이에요 (${need}쪽 필요). 레이드용 학습지가 맞는지 확인해 주세요.` : `${Object.keys(draft).length}칸을 잘라 미리 넣었어요. 확인하고 올려 주세요.`, 4200);
    render();
  }
  const guessRects = (id) => ((L.crops || {})[id] || [{ p: 1, x: 0.05, y: 0.1, w: 0.44, h: 0.3 }]).map((r) => ({ ...r }));
  // 조각들을 위아래로 이어 붙이고 가로 1400px 이하 JPEG 로
  function cut(rects) {
    const parts = rects.map((r) => {
      const pg = pages[Math.min(pages.length, Math.max(1, r.p)) - 1];
      return { pg, sx: r.x * pg.width, sy: r.y * pg.height, sw: r.w * pg.width, sh: r.h * pg.height };
    });
    const W = Math.max(...parts.map((q) => q.sw)), k = Math.min(1, 1280 / W);
    const cv = document.createElement('canvas'); cv.width = Math.round(W * k); cv.height = Math.round(parts.reduce((a, q) => a + q.sh, 0) * k);
    const g = cv.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, cv.width, cv.height);
    let y = 0;
    parts.forEach((q) => { g.drawImage(q.pg, q.sx, q.sy, q.sw, q.sh, 0, y, q.sw * k, q.sh * k); y += q.sh * k; });
    return toUrl(cv);
  }
  // 서버 부하 줄이기: WebP 품질 0.85 (같은 화질에서 JPEG 보다 30% 안팎 작음). WebP 를 못 만드는 기기면 JPEG
  function toUrl(cv) { const w = cv.toDataURL('image/webp', 0.85); return /^data:image\/webp/.test(w) ? w : cv.toDataURL('image/jpeg', 0.82); }

  // ── 자르기 조정: 쪽 그림 위의 틀을 끌어 옮기고, 모서리로 크기를 바꾼다 ─────────
  function editorHtml(id) {
    const d = draft[id], r = d.rects[piece];
    return `<div class="crop-ed">
      <div class="row small">${d.rects.length > 1 ? d.rects.map((_, k) => `<button class="btn small${k === piece ? ' primary' : ''}" data-piece="${k}">조각 ${k + 1}</button>`).join('') : ''}
        <button class="btn small" id="ce-prev"${r.p <= 1 ? ' disabled' : ''}>◀ 쪽</button><b>${r.p} / ${pages.length}쪽</b><button class="btn small" id="ce-next"${r.p >= pages.length ? ' disabled' : ''}>쪽 ▶</button>
        <button class="btn small" id="ce-add">+ 조각</button>${d.rects.length > 1 ? '<button class="btn small" id="ce-rm">조각 빼기</button>' : ''}</div>
      <div class="crop-page" id="ce-page"><img src="${thumbs[r.p - 1]}" alt="${r.p}쪽" draggable="false">${d.rects.map((q, k) => (q.p === r.p ? `<div class="crop-box${k === piece ? ' on' : ''}" data-k="${k}" style="left:${q.x * 100}%;top:${q.y * 100}%;width:${q.w * 100}%;height:${q.h * 100}%"><i class="h tl"></i><i class="h br"></i></div>` : '')).join('')}</div>
      <p class="muted small">틀 안을 끌면 옮겨지고, 모서리(■)를 끌면 크기가 바뀌어요. 여러 쪽에 걸친 개념은 + 조각으로 이어 붙여요.</p>
      <div class="row"><button class="btn primary" id="ce-ok">✂ 이대로 자르기</button><button class="btn" id="ce-cancel">닫기</button></div></div>`;
  }
  function bindEditor() {
    const d = draft[editing], page = $('#ce-page');
    const redo = () => render();
    document.querySelectorAll('[data-piece]').forEach((b) => (b.onclick = () => { piece = Number(b.dataset.piece); redo(); }));
    $('#ce-prev').onclick = () => { d.rects[piece].p--; redo(); };
    $('#ce-next').onclick = () => { d.rects[piece].p++; redo(); };
    $('#ce-add').onclick = () => { const q = d.rects[piece]; d.rects.push({ p: q.p, x: q.x, y: Math.min(0.8, q.y + q.h + 0.02), w: q.w, h: 0.15 }); piece = d.rects.length - 1; redo(); };
    const rm = $('#ce-rm'); if (rm) rm.onclick = () => { d.rects.splice(piece, 1); piece = 0; redo(); };
    $('#ce-ok').onclick = () => { d.url = cut(d.rects); d.guess = false; editing = null; redo(); };
    $('#ce-cancel').onclick = () => { if (!d.url) delete draft[editing]; editing = null; redo(); };
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    page.querySelectorAll('.crop-box').forEach((box) => {
      box.onpointerdown = (e) => {
        e.preventDefault();
        const k = Number(box.dataset.k), q = d.rects[k], R = page.getBoundingClientRect(), start = { ...q }, x0 = e.clientX, y0 = e.clientY;
        const mode = e.target.classList.contains('tl') ? 'tl' : e.target.classList.contains('br') ? 'br' : 'move';
        if (k !== piece) { piece = k; page.querySelectorAll('.crop-box').forEach((b) => b.classList.toggle('on', b === box)); }
        box.setPointerCapture(e.pointerId);
        box.onpointermove = (ev) => {
          const dx = (ev.clientX - x0) / R.width, dy = (ev.clientY - y0) / R.height;
          if (mode === 'move') { q.x = clamp(start.x + dx, 0, 1 - q.w); q.y = clamp(start.y + dy, 0, 1 - q.h); }
          else if (mode === 'br') { q.w = clamp(start.w + dx, 0.03, 1 - q.x); q.h = clamp(start.h + dy, 0.02, 1 - q.y); }
          else { const nx = clamp(start.x + dx, 0, start.x + start.w - 0.03), ny = clamp(start.y + dy, 0, start.y + start.h - 0.02); q.w = start.w + start.x - nx; q.h = start.h + start.y - ny; q.x = nx; q.y = ny; }
          Object.assign(box.style, { left: `${q.x * 100}%`, top: `${q.y * 100}%`, width: `${q.w * 100}%`, height: `${q.h * 100}%` });
        };
        box.onpointerup = () => { box.onpointermove = null; box.onpointerup = null; };
      };
    });
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

  // 가로 최대 1280px · WebP 0.85 로 줄인다 (Realtime Database 한 칸에 담기 좋게)
  function shrink(file) {
    return new Promise((res, rej) => {
      const rd = new FileReader();
      rd.onerror = () => rej(new Error('이미지를 읽지 못했어요.'));
      rd.onload = () => {
        const img = new Image();
        img.onerror = () => rej(new Error('이미지 파일이 아니에요.'));
        img.onload = () => {
          const k = Math.min(1, 1280 / img.width), cv = document.createElement('canvas');
          cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k);
          const g = cv.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, cv.width, cv.height); g.drawImage(img, 0, 0, cv.width, cv.height);
          res(toUrl(cv));
        };
        img.src = rd.result;
      };
      rd.readAsDataURL(file);
    });
  }
  return { enter };
})();
