// 수업 준비 화면 (PC, 교사 계정만): 차시 기본 설정(기준% · 생각 시간) · 학습지 PDF · 단계별 이미지(평소 접힘) · 영상 링크 · 엑셀 차시
// 학생 명단은 교사 메뉴 「👥 학생 관리」로 옮김 (v0.8.0). 이미지는 Firebase 에만 저장한다 (저장소에는 넣지 않는다).
// 이미지 넣는 방법: ① 칸을 누르고 Ctrl+V (스크린샷 붙여넣기) · 끌어다 놓기 · 파일 고르기
//                  ② 레이드용 학습지 PDF 를 올리면 차시 파일의 crops 위치대로 [개념] 칸마다 잘라 미리 넣는다 → 틀린 칸만 자르는 틀을 끌어 고친 뒤 올린다
window.DS = window.DS || {};

DS.Prep = (function () {
  const $ = (s) => document.querySelector(s);
  const { esc } = DS.UI;
  const A = () => DS.Account;
  let L = null, data = {}, stops = [], opened = new Set();
  let sel = null, pages = [], thumbs = [], draft = {}, editing = null, piece = 0;
  // 이미지 칸: 도입·개념(설명 때 크게) + 문제·보강·형성평가(교사가 「📄 문제 화면」을 누르면 해설용으로 크게)
  const slotSteps = () => L.steps.map((s) => (s.kind === 'boss' ? { ...s, title: s.title || L.boss.title } : s.img ? { ...s, id: s.img, title: `${s.title} (🔁 그림 칸 ${s.img})` } : s)) // #60: 도입 step img = 다른 칸 이름(🔁 전시 확인 review) → 그 이름으로 잘라 저장 (종합실은 step.img 로 찾음)
    .concat((L.bonus || []).map((b) => ({ kind: 'bonus', id: b.id, title: `🟪 중단원던전 ${L.no}층 · ${b.title}` }))); // 4차시부터: 중단원던전 층의 보강 칸 (학생 「📄 학습지 보기」 · 🎬)

  async function enter(lessonId) {
    if (!(await A().isAdmin())) throw Object.assign(new Error('교사 계정으로 로그인해야 해요.'), { user: true });
    L = DS.Lessons.get(lessonId);
    sel = null; pages = []; thumbs = []; draft = {}; editing = null; opened = new Set();
    DS.UI.show('screen-prep');
    document.onpaste = onPaste;
    stops.forEach((f) => f()); stops = [];
    if (!L) { data = {}; return render(); } // 🏫 2026-11-13 학교판 첫날 = 차시 0개 → 수업 준비가 깨지던 것 (Cannot read 'id'): 엑셀로 첫 차시 올리기만 보임
    stops = [
      DS.Net.watch(`prep/${L.id}`, (v) => { data = v || {}; render(); const miss = Object.keys(data.img || {}).filter((k) => !(data.has || {})[k]); if (miss.length) miss.forEach((k) => DS.Net.set(`prep/${L.id}/has/${k}`, true).catch(() => {})); }),
    ];
  }
  function render() {
    if (!L) { // 차시 0개 (학교판 첫날 · 엑셀 차시를 모두 지운 뒤)
      $('#p-body').innerHTML = `<div class="panel framed"><h2>📋 수업 준비</h2><p class="gold">아직 차시가 없어요 · 아래 「📊 엑셀로 차시 만들기」에서 양식을 받아 첫 차시를 올려 주세요.</p><p class="muted small">차시를 저장하면 그 차시의 이미지 · 기준% 칸이 이 화면에 나와요.</p></div>${sheetPanel()}`;
      const sp = $('#p-sheet'); if (sp) sp.open = true;
      bindSheet(); return;
    }
    const slots = slotSteps();
    const sheetOpen = !!document.querySelector('#p-sheet[open]');
    $('#p-body').innerHTML = `<div class="panel framed"><h2>📋 수업 준비</h2><p class="muted small">이미지·영상 링크는 Firebase 에만 저장돼요 (저장소에는 올라가지 않아요). 학생 명단은 교사 메뉴 「👥 학생 관리」에서 관리해요.</p></div>
      <div class="panel framed"><h2>${esc(L.unit)} ${esc(L.title)}</h2>
        <p class="muted small">학습지: ${esc(L.sheet || '')} · 이미지는 종합상황실 화면 절반에 떠요.</p>
        <div class="pct-row"><span>몬스터 체력 기준% 기본값</span><input id="p-pct" type="number" min="10" max="100" step="5" value="${data.pct || L.defaultPct || 90}"><button class="btn" id="p-pct-save">💾 저장</button><span class="muted small">수업 중에는 교사 폰에서 몬스터마다 바꿔요</span></div>
        <div class="pct-row"><span>🤔 생각 시간 (틀린 뒤 재도전까지)</span><select id="p-think">${[0, 5, 10, 15].map((v) => `<option value="${v}"${(data.think != null ? Number(data.think) : 5) === v ? ' selected' : ''}>${v ? `${v}초` : '끄기'}</option>`).join('')}</select><span class="muted small">해설은 읽을 수 있고 「다시 도전」만 잠깐 잠겨요 · 새로 만드는 수업부터</span></div>
        <div class="pct-row"><span>📝 풀이 시간 (중단원 평가 문항 · 입력 잠금)</span><select id="p-solve">${[0, 30, 60, 90, 120, 180].map((v) => `<option value="${v}"${(data.solve != null ? Number(data.solve) : 60) === v ? ' selected' : ''}>${v ? `${v}초` : '끄기'}</option>`).join('')}</select><span class="muted small">문제가 열리면 ❄ 꽁꽁 묶기 — 학습지에 먼저 풀고 입력 · 수업 중에도 리모컨에서 켜고 끄기 · 새로 만드는 수업부터</span></div></div>
      ${pdfPanel()}
      <div class="panel framed p-slots-top"><h2>🖼 단계별 이미지 <span class="muted small">${slots.filter((s) => (data.img || {})[s.id]).length} / ${slots.length}칸</span></h2>
        <div class="row"><button class="btn small" id="p-open-all">모두 펼치기</button><button class="btn small" id="p-close-all">모두 접기</button></div></div>
      ${slots.map(slotHtml).join('')}
      ${sheetPanel()}
      ${tidyPanel()}`;
    bindTidy();
    if (sheetOpen && $('#p-sheet')) $('#p-sheet').open = true;
    bindSheet();
    $('#p-open-all').onclick = () => { slots.forEach((s) => opened.add(s.id)); render(); };
    $('#p-close-all').onclick = () => { opened = new Set(); editing = null; render(); };
    $('#p-solve').onchange = () => DS.Control.run(async () => { await DS.Net.set(`prep/${L.id}/solve`, Number($('#p-solve').value)); DS.UI.toast('풀이 시간을 저장했어요.'); }); // 📝 2026-11-06
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
    const vid = (data.video || {})[s.id];
    const isOpen = opened.has(s.id) || editing === s.id || sel === s.id;
    if (!isOpen) {
      return `<div class="panel framed p-slot p-fold" data-box="${s.id}" tabindex="0"><div class="p-slot-head"><b>${esc(s.title)}</b>
        <span class="p-state ${img ? 'okc' : d ? 'gold' : 'muted'}">${img ? '✅ 이미지' : d ? (d.miss ? '⚠ 못 찾음 · 직접' : '📝 미리보기') : '⚠ 없음'}</span>${vid ? '<span class="p-state okc">🎬 영상</span>' : ''}
        ${img || d ? `<img class="p-thumb" src="${(d || {}).url || img}" alt="">` : ''}<button class="btn small" data-open="${s.id}">자세히 보기 ▾</button></div></div>`;
    }
    const kind = s.kind === 'intro' || s.kind === 'concept' ? '<span class="p-kind">설명 때 크게</span>' : s.kind === 'bonus' ? '<span class="p-kind q">⚔ 학생 혼자 「📄 학습지 보기」</span>' : '<span class="p-kind q">📄 문제 화면 (교사 해설용)</span>';
    const head = `<div class="p-slot-head"><b>${esc(s.title)}</b>${kind}<label class="btn small">🖼 고르기<input type="file" accept="image/*" data-slot="${s.id}" hidden></label>
      ${pages.length ? `<button class="btn small" data-edit="${s.id}">✏ 자르기 ${d ? '조정' : 'PDF 에서'}</button>` : ''}${img && !d ? `<button class="btn small" data-del="${s.id}">지우기</button>` : ''}</div>`;
    const body = editing === s.id ? editorHtml(s.id)
      : d ? `<img class="p-prev draft" src="${d.url}" alt="${esc(s.title)} 미리보기"><p class="gold small">미리보기 — 아직 안 올렸어요${d.miss ? ' ⚠ 못 찾음 · 직접 맞춰 주세요' : ''}${d.guess && !d.miss ? ' (자를 위치 정보가 없어 대충 잘랐어요. 조정해 주세요)' : ''}</p>
        <div class="row"><button class="btn primary small" data-up="${s.id}">✅ 이 칸 올리기</button><button class="btn small" data-undo="${s.id}">버리기</button></div>`
      : img ? `<img class="p-prev" src="${img}" alt="${esc(s.title)}">`
      : '<p class="muted small">아직 없음 — 이 칸을 누르고 <b>Ctrl+V</b> (스크린샷 붙여넣기) · 이미지 끌어다 놓기 · 🖼 고르기</p>';
    const isFile = vid === 'file';
    const video = `<div class="p-video"><span>🎬 설명 영상</span><input data-vid="${s.id}" placeholder="유튜브 · 구글 드라이브 주소 (없으면 비워 두기)" value="${esc(isFile ? '' : vid || '')}"><button class="btn small" data-vsave="${s.id}">링크 저장</button>
      <label class="btn small">🎞 파일 올리기<input type="file" accept="video/mp4,video/webm,video/*" data-vfile="${s.id}" hidden></label>
      ${isFile ? `<span class="okc small">🎞 올린 영상 파일</span><button class="btn small" data-vplay="${s.id}">▶ 미리보기</button><button class="btn small" data-vdel="${s.id}">지우기</button>`
        : vid ? `<span class="muted small">${DS.Video && DS.Video.kind(vid) ? DS.Video.kind(vid) : '⚠ 알 수 없는 주소'}</span>` : (L.videos || {})[s.id] ? `<span class="okc small">🎬 기본 영상 연결됨 (모션그래픽)</span><button class="btn small" data-vdef="${s.id}">▶ 미리보기</button>` : '<span class="muted small">링크 또는 mp4 파일 (3MB 이하) · 큰 화면 「🎬 설명 영상 틀기」 · 중단원던전에서 재생</span>'}</div>`;
    const v4 = (s.kind === 'monster' && (L.monsters || {})[s.id] && L.items) || (s.kind === 'boss' && L.boss && L.boss.make) ? `<div class="row"><button class="btn small" data-v4="${s.id}">🔢 숫자 4판 보기 (첫 시도 + 재도전 3)</button></div>` : ''; // #65-3
    return `<div class="panel framed p-slot${sel === s.id ? ' sel' : ''}" data-box="${s.id}" tabindex="0">${head.replace('</div>', `<button class="btn small" data-fold="${s.id}">접기 ▴</button></div>`)}${body}${v4}${video}${sel === s.id && editing !== s.id ? '<p class="p-paste small">📋 지금 Ctrl+V 하면 이 칸에 들어가요</p>' : ''}</div>`;
  }
  // 🔢 #65-3 숫자 4판 미리보기: 몬스터 · 형성평가마다 v0(학습지) ~ v3 (예시 · 실제 숫자는 학생마다 달라요)
  function ansOf(q) { const P = DS.UI.pretty;
    if (q.type === 'choice') return DS.UI.opt(q.choices[q.answerIndex]);
    if (q.type === 'multi') { const g = q.groups; if (g && g.length) { let b0 = 0; return g.map((x) => { const a = q.answer.filter((k) => k >= b0 && k < b0 + x.n).map((k) => q.options[k]); b0 += x.n; return `${P(x.label)} {${P(a.filter((o) => !/^∅/.test(o)).join(', '))}}`; }).join(' · '); } const a = q.answer.map((k) => q.options[k]); return a.some((o) => /^∅/.test(o)) ? '∅' : `{${P(a.join(', '))}}`; }
    if (q.type === 'blanks') return esc(q.items.map((it) => it.answer).join(' , '));
    if (q.type === 'ox') return q.answer ? 'O' : 'X';
    if (q.type === 'text') return esc((q.answers || [q.answer]).join(' / '));
    return esc(String(q.answer)); }
  function v4Open(id) {
    const boss = id === 'boss', seed = `미리보기|${L.id}`;
    const chain = !boss && (L.chain || []).includes(id) && typeof L.chainItems === 'function'; // 🪞 #81 소레이드 = 학생과 같은 단계 (졸개 → 대장 · 한 판 더 판)
    const ver = (a) => (boss ? Array.from({ length: L.boss.items || L.boss.sets[1].length }, (_, i) => (a && L.boss.make ? L.boss.make(i, a, DS.Rng(`${seed}|boss|${i}|${a}`)) : a ? (L.boss.sets[2] || L.boss.sets[1])[i] : L.boss.sets[1][i])) : chain ? L.chainItems(id, seed, a) : L.items(id, seed, a));
    const el = document.createElement('div'); el.className = 'modal camp-modal'; document.body.appendChild(el);
    let a = 0;
    const draw = () => { const items = ver(a);
      el.innerHTML = `<div class="quiz-box framed rs-box v4-box"><div class="quiz-head"><b>🔢 ${esc(boss ? L.boss.title : (L.steps.find((x) => x.id === id) || {}).title || id)}</b><button class="btn small" id="v4-x">✕ 닫기</button></div>
        <div class="row v4-tabs">${[0, 1, 2, 3].map((k) => `<button class="btn small${k === a ? ' primary' : ''}" data-va="${k}">${k ? (chain ? `한 판 더 ${k}` : `재도전 ${k}`) : '첫 시도 (학습지)'}</button>`).join('')}</div>
        <p class="muted small">${a ? '예시 숫자예요 — 실제 재도전 숫자는 학생마다 달라요' : '첫 시도 = 학습지 숫자 그대로'}</p>
        <ol class="v4-list">${items.map((q, k) => `<li>${chain ? `<b>${k === items.length - 1 ? '👑 대장' : `졸개 ${'①②③④⑤⑥'[k]}`}</b> ` : ''}<span class="math">${DS.UI.pretty(DS.UI.plain(q.question || ''))}</span>${q.type === 'choice' ? `<br><small class="muted">${q.choices.map((c) => DS.UI.opt(c)).join(' · ')}</small>` : ''}<br><b class="okc">정답: ${ansOf(q)}</b>${chain && q.why ? `<br><small class="muted">💡 근거 줄: ${DS.UI.pretty(q.why.text)}</small>` : ''}</li>`).join('')}</ol></div>`;
      el.querySelector('#v4-x').onclick = () => el.remove();
      el.querySelectorAll('[data-va]').forEach((b) => (b.onclick = () => { a = Number(b.dataset.va); draw(); })); };
    draw();
  }
  const up = (slot, url, msg = '올렸어요!') => DS.Control.run(async () => { await DS.Act.setImage(L.id, slot, url); delete draft[slot]; if (editing === slot) editing = null; DS.UI.toast(msg); render(); }); // 🐞 2026-11-13 학교판 「PDF 자르기가 안먹혀」: 자르기 창을 연 채로 올리면 지운 칸을 그리다 깨졌음
  function bindSlots() {
    document.querySelectorAll('[data-box]').forEach((box) => {
      box.onclick = (e) => { if (editing || e.target.closest('button,label,input')) return; if (sel !== box.dataset.box) { sel = box.dataset.box; opened.add(sel); render(); } };
      box.ondragover = (e) => { e.preventDefault(); box.classList.add('over'); };
      box.ondragleave = () => box.classList.remove('over');
      box.ondrop = (e) => { e.preventDefault(); box.classList.remove('over'); const f = [...(e.dataTransfer.files || [])].find((x) => /^image\//.test(x.type)); if (f) putFile(box.dataset.box, f); else DS.UI.toast('이미지 파일을 끌어다 놓아 주세요.'); };
    });
    document.querySelectorAll('[data-open]').forEach((b) => (b.onclick = () => { opened.add(b.dataset.open); sel = b.dataset.open; render(); }));
    document.querySelectorAll('[data-fold]').forEach((b) => (b.onclick = () => { opened.delete(b.dataset.fold); if (sel === b.dataset.fold) sel = null; if (editing === b.dataset.fold) editing = null; render(); }));
    document.querySelectorAll('[data-v4]').forEach((b) => (b.onclick = (e) => { e.stopPropagation(); v4Open(b.dataset.v4); }));
    document.querySelectorAll('[data-vsave]').forEach((b) => (b.onclick = () => DS.Control.run(async () => {
      const id = b.dataset.vsave, v = document.querySelector(`[data-vid="${id}"]`).value.trim();
      if (v && !(DS.Video && DS.Video.embed(v))) throw Object.assign(new Error('유튜브 또는 구글 드라이브 주소만 넣을 수 있어요.'), { user: true });
      if ((data.video || {})[id] === 'file') await DS.Act.setVideoFile(L.id, id, null); // 링크로 바꾸면 올린 파일은 지움
      await DS.Act.setVideo(L.id, id, v || null); DS.UI.toast(v ? '영상 링크를 저장했어요.' : '영상 링크를 지웠어요.');
    })));
    document.querySelectorAll('[data-vfile]').forEach((inp) => (inp.onchange = () => DS.Control.run(async () => {
      const f = inp.files[0]; if (!f) return;
      if (!/^video\//.test(f.type)) throw Object.assign(new Error('영상 파일(mp4)만 올릴 수 있어요.'), { user: true });
      if (f.size > DS.Video.MAX) throw Object.assign(new Error(`영상이 너무 커요 (${(f.size / 1048576).toFixed(1)}MB). 3MB 이하로 줄여 주세요 — 짧게 자르거나 화질을 720p 이하로.`), { user: true });
      DS.UI.toast('영상을 올리는 중…', 4000);
      const url = await new Promise((res, rej) => { const rd = new FileReader(); rd.onload = () => res(rd.result); rd.onerror = () => rej(new Error('영상을 읽지 못했어요.')); rd.readAsDataURL(f); });
      await DS.Act.setVideoFile(L.id, inp.dataset.vfile, url); DS.UI.toast(`🎞 영상을 올렸어요 (${(f.size / 1048576).toFixed(1)}MB)`);
    })));
    document.querySelectorAll('[data-vdel]').forEach((b) => (b.onclick = () => DS.Control.run(async () => { if (confirm('올린 영상을 지울까요?')) { await DS.Act.setVideoFile(L.id, b.dataset.vdel, null); DS.UI.toast('영상을 지웠어요.'); } })));
    document.querySelectorAll('[data-vdef]').forEach((b) => (b.onclick = () => DS.Video.open(L.videos[b.dataset.vdef], '기본 영상 미리보기')));
    document.querySelectorAll('[data-vplay]').forEach((b) => (b.onclick = () => DS.Video.open('file', '미리보기', { lesson: L.id, slot: b.dataset.vplay })));
    document.querySelectorAll('[data-slot]').forEach((inp) => (inp.onchange = () => { const f = inp.files[0]; if (f) putFile(inp.dataset.slot, f); }));
    document.querySelectorAll('[data-del]').forEach((b) => (b.onclick = () => DS.Control.run(async () => { if (confirm('이 이미지를 지울까요?')) await DS.Act.setImage(L.id, b.dataset.del, null); })));
    document.querySelectorAll('[data-up]').forEach((b) => (b.onclick = () => up(b.dataset.up, draft[b.dataset.up].url)));
    document.querySelectorAll('[data-undo]').forEach((b) => (b.onclick = () => { delete draft[b.dataset.undo]; if (editing === b.dataset.undo) editing = null; render(); }));
    document.querySelectorAll('[data-edit]').forEach((b) => (b.onclick = () => {
      const id = b.dataset.edit; if (!draft[id]) draft[id] = { rects: guessRects(id), guess: !(L.crops || {})[id] };
      editing = id; sel = id; piece = 0; render();
      const on = document.querySelector('.crop-box.on'); if (on) on.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }));
    const pdf = $('#p-pdf'); if (pdf) pdf.onchange = () => { const f = pdf.files[0]; if (f) DS.Control.run(() => fromPdf(f)); };
    const all = $('#p-all'); if (all) all.onclick = () => DS.Control.run(async () => { const ids = Object.keys(draft).filter((id) => draft[id] && draft[id].url); for (const id of ids) await DS.Act.setImage(L.id, id, draft[id].url); draft = {}; editing = null; DS.UI.toast(`${ids.length}칸을 올렸어요!`); render(); }); // 🐞 자르기 창을 연 채로 「전부 올리기」 = 깨지던 것 · 아직 안 자른 칸은 건너뜀
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
    let auto = null, autoMsg = '';
    if (!L.crops) { // ✂ 칸 위치가 없는 차시 = 글자로 찾기
      const lines = await textLines(doc, pages.length).catch(() => []);
      if (!lines.length) autoMsg = '글자를 찾지 못했어요 (스캔 · 사진 PDF) — 칸마다 ✏ 자르기로 직접 맞춰 주세요.';
      else { auto = autoRects(lines, slotSteps()); const miss = Object.values(auto).filter((x) => !x).length; autoMsg = miss ? `✂ 글자로 ${Object.keys(auto).length - miss}칸을 찾아 잘랐어요 · ⚠ ${miss}칸은 못 찾음 — 직접 맞춰 주세요` : `✂ 글자로 ${Object.keys(auto).length}칸을 모두 찾아 잘랐어요 — 눈으로 보고 올려 주세요`; }
    }
    slotSteps().forEach((s) => { const a = auto && auto[s.id], rects = a || guessRects(s.id); draft[s.id] = { rects, url: cut(rects), guess: !a && !(L.crops || {})[s.id], miss: !!auto && !a }; });
    const need = Math.max(0, ...Object.values(L.crops || {}).flat().map((r) => r.p));
    if (autoMsg) { DS.UI.toast(autoMsg, 5200); render(); return; }
    DS.UI.toast(need > pages.length ? `PDF 가 ${pages.length}쪽뿐이에요 (${need}쪽 필요). 레이드용 학습지가 맞는지 확인해 주세요.` : `${Object.keys(draft).length}칸을 잘라 미리 넣었어요. 확인하고 올려 주세요.`, 4200);
    render();
  }

  // ✂ 2026-11-13 선생님 「PDF 넣으면 알아서 잘라서 이미지 추가하기」 → C: 칸 위치(crops)가 없는 차시(📊 엑셀 · 학교판) = PDF 글자 층에서 칸 이름을 찾아 자름
  //   칸마다 ① 「몬스터 n」(GAME 태그 · n번째 문제 단계) ② 단계 제목 앞말(「문제 1」 · 「형성평가」 · 도입 = 「생각 열기」 · 개념 = 「STEP k」 순서) ③ 못 찾으면 기본 틀 + ⚠
  //   자를 곳 = 찾은 줄 바로 위 ~ 같은 단 다음 칸 이름 줄 바로 위(없으면 쪽 아래 여백) · 2단이면 그 단 폭 · 결과는 「미리 넣기」(교사가 눈으로 보고 올림)
  //   lines = [{ p, x0, x1, y, h, s }] (0~1 · y = 줄 위끝) · steps = slotSteps()
  const ANCHOR = /^[^\p{L}\p{N}]*(몬스터\s*\d+|문제\s*\d+|STEP\s*\d+)|형성\s*평가|생각\s*열기/u; // 「문제 n」 등은 줄 맨 앞일 때만 (본문 「교과서 89쪽 문제 3」 은 칸 끝이 아님)
  const AT = (src) => new RegExp(`^[^\\p{L}\\p{N}]*${src}`, 'u');
  function anchorsOf(steps) {
    let mon = 0, con = 0;
    return steps.map((st) => {
      const t = String(st.title || ''), head = t.split(' · ')[0].trim(), out = [];
      if (st.kind === 'monster') { mon += 1; out.push(AT(`몬스터\\s*${mon}(?!\\d)`)); }
      if (st.kind === 'concept') { con += 1; }
      const m = /^(문제|STEP)\s*(\d+)/.exec(head);
      if (m) out.push(AT(`${m[1]}\\s*${m[2]}(?!\\d)`));
      if (st.kind === 'boss') out.push(/형성\s*평가/);
      if (st.kind === 'intro') out.push(/생각\s*열기/);
      if (st.kind === 'concept') out.push(AT(`STEP\\s*${con}(?!\\d)`));
      { const tail = (t.split(' · ')[1] || '').replace(/[^\p{L}\p{N}\s]/gu, '').trim(); if (st.kind === 'intro' && tail.length >= 2) out.push(new RegExp(tail.replace(/\s+/g, '\\s*'))); } // 도입 「🔁 전시 확인」
      if (head && !/^(문제|STEP)\s*\d/.test(head) && head.length >= 2) out.push(new RegExp(`^\\s*${head.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s*')}`)); // 제목 앞말(예: 「보강」) = 줄 맨 앞에서
      return out;
    });
  }
  function autoRects(lines, steps) {
    const sorted = lines.slice().sort((a, b) => a.p - b.p || a.y - b.y || a.x0 - b.x0);
    const twoPg = (pg) => sorted.filter((l) => l.p === pg && l.x0 > 0.5).length >= 3, twoDoc = [...new Set(sorted.map((l) => l.p))].some(twoPg), colOf = () => twoDoc; // 학습지는 쪽마다 같은 꼴 → 한 쪽이라도 2단이면 2단
    const used = new Set(), res = {}, hits = [];
    const all = anchorsOf(steps);
    all.forEach((res0, i) => { let hit = null; for (const re of res0) { hit = sorted.find((l) => !used.has(l) && re.test(l.s)); if (hit) break; } if (hit) used.add(hit); hits[i] = hit; });
    const isEdge = (l, st) => used.has(l) || (ANCHOR.test(l.s) && !(st.kind === 'concept' && /^[^\p{L}\p{N}]*STEP\s*\d/u.test(l.s))); // 개념 칸 = 칸으로 안 쓴 STEP 줄을 넘어 묶음 (STEP 1 · 2 …) · 다른 칸은 STEP 줄에서 끝
    hits.forEach((hit, i) => {
      const st = steps[i];
      if (!hit) { res[st.id] = null; return; }
      const left = hit.x0 < 0.5, two = colOf(hit.p) && (left ? hit.x1 < 0.56 : true);
      const x0 = two ? (left ? 0.02 : 0.5) : 0.02, x1 = two ? (left ? 0.5 : 0.98) : 0.98;
      const inCol = (l) => l.p === hit.p && (two ? (left ? l.x0 < 0.5 : l.x0 >= 0.48) : true);
      const own = all[i], nx = sorted.find((l) => inCol(l) && l !== hit && l.y > hit.y + 0.008 && isEdge(l, st) && !(!used.has(l) && own.some((re) => re.test(l.s))) && !(st.kind === 'boss' && !used.has(l) && /문제\s*\d/.test(l.s)));
      const top = Math.max(0, hit.y - 0.008), lim = nx ? nx.y - 0.006 : 0.965, last = sorted.filter((l) => inCol(l) && l.y >= hit.y && l.y + l.h <= lim + 0.002).reduce((m, l) => Math.max(m, l.y + l.h), hit.y + hit.h);
      const bot = Math.max(top + 0.04, Math.min(lim, last + 0.012)); // 글자가 끝나는 곳 + 여백 (빈 아래쪽은 자름)
      const lone = st.kind === 'intro' && two && left && sorted.some((l) => l.p === hit.p && l.x0 < 0.5 && l.x1 > 0.58 && l.y >= top && l.y < bot); // 칸 안 글줄이 가운데를 넘으면 = 가로 전체 칸 (전시 확인 상자 등)
      if (lone) { res[st.id] = [{ p: hit.p, x: 0.02, y: +top.toFixed(4), w: 0.96, h: +(Math.min(1, bot) - top).toFixed(4) }]; return; }
      res[st.id] = [{ p: hit.p, x: +x0.toFixed(4), y: +top.toFixed(4), w: +(x1 - x0).toFixed(4), h: +(Math.min(1, bot) - top).toFixed(4) }];
    });
    return res;
  }
  async function textLines(doc, n) { // pdf.js 글자 층 → 줄
    const out = [];
    for (let i = 1; i <= n; i++) {
      const pg = await doc.getPage(i), vp = pg.getViewport({ scale: 1 }), tc = await pg.getTextContent();
      const items = tc.items.filter((it) => it.str && it.str.trim()).map((it) => { const x = it.transform[4], y = it.transform[5], h = Math.abs(it.transform[3]) || it.height || 10; return { x0: x / vp.width, x1: (x + (it.width || 0)) / vp.width, yb: 1 - y / vp.height, h: h / vp.height, s: it.str }; });
      items.sort((a, b) => a.yb - b.yb || a.x0 - b.x0);
      const rows = [];
      items.forEach((it) => { const r = rows.find((q) => Math.abs(q.yb - it.yb) < Math.max(q.h, it.h) * 0.5 && (it.x0 - q.x1) < 0.015 && it.x0 >= q.x0); if (r) { r.s += (it.x0 - r.x1 > 0.004 ? ' ' : '') + it.s; r.x1 = Math.max(r.x1, it.x1); r.h = Math.max(r.h, it.h); } else rows.push({ ...it }); });
      rows.forEach((r) => out.push({ p: i, x0: r.x0, x1: r.x1, y: r.yb - r.h, h: r.h, s: r.s }));
    }
    return out;
  }
  const guessRects = (id) => ((L.crops || {})[id] || [{ p: 1, x: 0.05, y: 0.1, w: 0.44, h: 0.3 }]).map((r) => ({ ...r }));
  // v0.9.3 (사용자 결정 ②A): 조각을 위아래로만 붙이면 세로로 길어 큰 화면에서 글자가 작아진다
  //   → 세로로 길면 좌우 단(최대 3단)으로 나란히 놓고, 한 조각이 길면 가운데쯤 빈 줄에서 잘라 옆 단으로 보낸다. 넓으면 그대로
  // plan(조각 크기들, 자르기 함수) → { cols: [[{ pi, y0, h }]], W, H } (조각 좌표 기준 · 순수 계산이라 tests/prep.test.js 가 확인)
  // 고르는 기준 = 종합상황실 칸(가로:세로 ≈ 1.4)에 넣었을 때 글자가 가장 크게 보이는 배치 (단을 늘릴수록 조금 감점)
  function plan(pieces, split, box = 1.4) {
    const gap = 0.04 * Math.max(...pieces.map((q) => q.w));
    let best = null;
    for (let c = 1; c <= 3; c++) {
      let segs = pieces.map((q, pi) => ({ pi, y0: 0, h: q.h, w: q.w }));
      while (segs.length < c) {
        const i = segs.reduce((m, sg, k) => (sg.h > segs[m].h ? k : m), 0), sg = segs[i];
        const y = split(sg); if (!(y > sg.h * 0.2 && y < sg.h * 0.8)) break;
        segs.splice(i, 1, { ...sg, h: y }, { ...sg, y0: sg.y0 + y, h: sg.h - y });
      }
      if (segs.length < c) continue;
      // 순서를 지키며 c 단으로 나누기: 가장 높은 단이 가장 낮아지게 (조각 수가 적어 모든 경우를 본다)
      let cut = null;
      const tryCuts = (start, left, acc) => {
        if (left === 1) { const cols = [...acc, segs.slice(start)]; const hh = Math.max(...cols.map((col) => col.reduce((a, sg) => a + sg.h, 0) + gap * (col.length - 1))); if (!cut || hh < cut.H) cut = { cols, H: hh }; return; }
        for (let e = start + 1; e <= segs.length - left + 1; e++) tryCuts(e, left - 1, [...acc, segs.slice(start, e)]);
      };
      tryCuts(0, c, []);
      const W = cut.cols.reduce((a, col) => a + Math.max(...col.map((sg) => sg.w)), 0) + gap * (c - 1), score = Math.min(box / W, 1 / cut.H) * (1 - 0.06 * (c - 1));
      if (!best || score > best.score) best = { cols: cut.cols, W, H: cut.H, gap, score };
    }
    return best;
  }
  // 빈 줄 찾기: 조각 가운데 30~70% 높이에서 가장 하얀 줄들의 한가운데 (글자를 자르지 않게)
  function whiteRow(part, sg) {
    try {
      const c = document.createElement('canvas'), sc = Math.min(1, 400 / part.sw), w = Math.max(1, Math.round(part.sw * sc)), h = Math.max(1, Math.round(sg.h * sc));
      c.width = w; c.height = h; const g = c.getContext('2d'); g.drawImage(part.pg, part.sx, part.sy + sg.y0, part.sw, sg.h, 0, 0, w, h);
      const d = g.getImageData(0, 0, w, h).data, lum = [];
      for (let y = 0; y < h; y++) { let m = 255; for (let x = 0; x < w; x += 2) { const i = (y * w + x) * 4; m = Math.min(m, (d[i] + d[i + 1] + d[i + 2]) / 3); } lum.push(m); }
      const a = Math.floor(h * 0.3), b = Math.ceil(h * 0.7); let bestRun = null, run = null;
      for (let y = a; y <= b; y++) {
        if (lum[y] >= 235) { run = run ? { s: run.s, e: y } : { s: y, e: y }; } else run = null;
        if (run) { const len = run.e - run.s, mid = (run.s + run.e) / 2, cost = -len + Math.abs(mid - h / 2) * 0.05; if (!bestRun || cost < bestRun.cost) bestRun = { mid, cost }; }
      }
      return (bestRun ? bestRun.mid : h / 2) / sc;
    } catch (e) { return sg.h / 2; }
  }
  function cut(rects) {
    const parts = rects.map((r) => {
      const pg = pages[Math.min(pages.length, Math.max(1, r.p)) - 1];
      return { pg, sx: r.x * pg.width, sy: r.y * pg.height, sw: r.w * pg.width, sh: r.h * pg.height };
    });
    const P = plan(parts.map((q) => ({ w: q.sw, h: q.sh })), (sg) => whiteRow(parts[sg.pi], sg));
    const k = Math.min(1, 1800 / P.W);
    const cv = document.createElement('canvas'); cv.width = Math.round(P.W * k); cv.height = Math.round(P.H * k);
    const g = cv.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, cv.width, cv.height);
    let x = 0;
    P.cols.forEach((col, ci) => {
      let y = 0; const cw = Math.max(...col.map((sg) => sg.w));
      col.forEach((sg) => { const q = parts[sg.pi]; g.drawImage(q.pg, q.sx, q.sy + sg.y0, q.sw, sg.h, x * k, y * k, q.sw * k, sg.h * k); y += sg.h + P.gap; });
      if (ci < P.cols.length - 1) { g.fillStyle = '#d0d4dc'; g.fillRect((x + cw + P.gap / 2) * k - 1, 0, 2, cv.height); g.fillStyle = '#fff'; }
      x += cw + P.gap;
    });
    return toUrl(cv);
  }
  // 서버 부하 줄이기: WebP 품질 0.85 (같은 화질에서 JPEG 보다 30% 안팎 작음). WebP 를 못 만드는 기기면 JPEG
  function toUrl(cv) { const w = cv.toDataURL('image/webp', 0.85); return /^data:image\/webp/.test(w) ? w : cv.toDataURL('image/jpeg', 0.82); }

  // ── 자르기 조정: 쪽 그림 위의 틀을 끌어 옮기고, 모서리로 크기를 바꾼다 ─────────
  function editorHtml(id) {
    const d = draft[id]; if (!d || !d.rects || !d.rects.length) { editing = null; return ''; } // 지운 칸 = 자르기 창 닫음 (깨지지 않게)
    const r = d.rects[Math.min(piece, d.rects.length - 1)];
    return `<div class="crop-ed">
      <div class="row small">${d.rects.length > 1 ? d.rects.map((_, k) => `<button class="btn small${k === piece ? ' primary' : ''}" data-piece="${k}">조각 ${k + 1}</button>`).join('') : ''}
        <button class="btn small" id="ce-prev"${r.p <= 1 ? ' disabled' : ''}>◀ 쪽</button><b>${r.p} / ${pages.length}쪽</b><button class="btn small" id="ce-next"${r.p >= pages.length ? ' disabled' : ''}>쪽 ▶</button>
        <button class="btn small" id="ce-add">+ 조각</button>${d.rects.length > 1 ? '<button class="btn small" id="ce-rm">조각 빼기</button>' : ''}</div>
      <div class="crop-page" id="ce-page"><img src="${thumbs[r.p - 1]}" alt="${r.p}쪽" draggable="false">${d.rects.map((q, k) => (q.p === r.p ? `<div class="crop-box${k === piece ? ' on' : ''}" data-k="${k}" style="left:${q.x * 100}%;top:${q.y * 100}%;width:${q.w * 100}%;height:${q.h * 100}%"><i class="h tl"></i><i class="h br"></i></div>` : '')).join('')}</div>
      <p class="muted small">틀 안을 끌면 옮겨지고, 모서리(■)를 끌면 크기가 바뀌어요. 여러 쪽에 걸친 개념은 + 조각으로 이어 붙여요.</p>
      <div class="row"><button class="btn primary" id="ce-ok">✂ 이대로 자르기</button><button class="btn" id="ce-cancel">✕ 닫기</button></div></div>`;
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

  // ── 📦 지난 차시 정리 (v0.9.6): ① 백업 파일 내려받기(이 차시의 수업 기록 · 학습지 이미지 · 올린 영상) → ② 서버에서 지우기 ──
  //   학생 성장 기록(EXP · 호칭 · 도감 · 개인 결과 · 보강던전)은 지우지 않는다. 지우기는 백업을 받은 뒤에만 열린다
  let tidy = null; // { rooms: [code], backedUp: bool }
  function tidyPanel() {
    return `<details class="panel framed" id="p-tidy"${tidy ? ' open' : ''}><summary><b>📦 지난 차시 정리</b> <span class="muted small">백업 받고 서버에서 지우기 (Firebase 사용량 줄이기)</span></summary>
      <p class="muted small">이 차시의 <b>수업 방 기록 · 학습지 이미지 · 올린 영상</b>을 백업 파일(.json)로 받은 뒤 서버에서 지워요. 학생 EXP · 호칭 · 도감 · 개인 결과 · 중단원던전 기록은 그대로 남아요. 지우면 그 수업의 🏫 학급 결과는 백업 파일로만 볼 수 있어요.</p>
      <div class="row"><button class="btn" id="td-scan">🔍 이 차시 수업 찾기</button>${tidy ? `<span class="muted small">수업 방 ${tidy.rooms.length}개 · 이미지 ${Object.keys(data.img || data.has || {}).length}칸</span>` : ''}</div>
      ${tidy ? `<div class="row"><button class="btn primary" id="td-backup">📥 ① 백업 파일 받기</button><button class="btn danger" id="td-del"${tidy.backedUp ? '' : ' disabled'}>🗑 ② 서버에서 지우기</button></div>` : ''}</details>`;
  }
  function bindTidy() {
    const sc = $('#td-scan'); if (!sc) return;
    sc.onclick = () => DS.Control.run(async () => {
      const all = (await DS.Net.get('rooms').catch(() => null)) || {};
      tidy = { rooms: Object.keys(all).filter((c) => ((all[c] || {}).meta || {}).lesson === L.id && (all[c].state || {}).closed), all, backedUp: false };
      render(); $('#p-tidy').open = true;
      if (!Object.keys(all).length) DS.UI.toast('수업 목록을 읽지 못했어요 (Firebase 규칙을 새로 게시했는지 확인)', 3500);
    });
    const bk = $('#td-backup');
    if (bk) bk.onclick = () => DS.Control.run(async () => {
      const prep = (await DS.Net.get(`prep/${L.id}`).catch(() => null)) || {}, vid = (await DS.Net.get(`prepVideo/${L.id}`).catch(() => null)) || {};
      const out = { kind: 'citadel-backup', version: DS.VERSION, lesson: L.id, at: new Date().toISOString(), rooms: Object.fromEntries(tidy.rooms.map((c) => [c, tidy.all[c]])), prep, prepVideo: vid };
      const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(out)], { type: 'application/json' }));
      a.download = `citadel-backup-${L.id}-${new Date().toISOString().slice(0, 10)}.json`; document.body.appendChild(a); a.click(); a.remove();
      tidy.backedUp = true; render(); $('#p-tidy').open = true; DS.UI.toast('백업 파일을 받았어요. 드라이브에 올려 두면 안전해요.', 3500);
    });
    const dl = $('#td-del');
    if (dl) dl.onclick = () => DS.Control.run(async () => {
      if (!tidy.backedUp || !confirm(`${L.title}\n수업 방 ${tidy.rooms.length}개 · 학습지 이미지 · 올린 영상을 서버에서 지울까요?\n(백업 파일로만 되살릴 수 있어요)`)) return;
      for (const c of tidy.rooms) { await DS.Net.remove(`rooms/${c}`).catch(() => {}); await DS.Net.remove(`secrets/${c}`).catch(() => {}); }
      const keep = { pct: data.pct ?? null, think: data.think ?? null, solve: data.solve ?? null };
      await DS.Net.remove(`prepVideo/${L.id}`).catch(() => {});
      await DS.Net.remove(`prep/${L.id}`).catch(() => {});
      for (const [k, v] of Object.entries(keep)) if (v != null) await DS.Net.set(`prep/${L.id}/${k}`, v).catch(() => {});
      tidy = null; DS.UI.toast('정리했어요. (기준% · 생각 시간 설정은 남겨 두었어요)', 3500);
      await enter(L.id);
    });
  }

  // ── 📊 엑셀로 차시 만들기 (문제 은행) ─────────────────────────
  let sheetDraft = null;
  function sheetPanel() {
    const mine = DS.Lessons.list.filter((l) => l.sheetLesson);
    const d = sheetDraft;
    return `<details class="panel framed" id="p-sheet"${d ? ' open' : ''}><summary><b>📊 엑셀로 차시 만들기</b> <span class="muted small">선생님 본인용 문제 은행</span></summary>
      <p class="muted small">양식에 「차시 · 순서 · 문항」을 채워 올리면 레이드 수업 차시가 돼요. 문항마다 버전 0 = 학습지 원문(첫 시도), 버전 1·2 = 재도전용. <b>저장 전에 미리보기에서 정답을 꼭 확인</b>하세요.</p>
      <div class="row"><a class="btn small" href="assets/templates/${DS.SCHOOL ? 'question-bank-school-v1' : 'question-bank-v1'}.xlsx" download>📥 양식 내려받기 (.xlsx)</a><label class="btn small">📂 엑셀 올리기<input type="file" id="x-file" accept=".xlsx" hidden></label></div>
      ${d ? `<div class="x-prev"><p class="gold">미리보기: ${esc(d.pack.unit)} · ${esc(d.pack.title)} <span class="muted small">(${esc(d.pack.id)})</span></p>
        <table class="r-table"><tr><th>단계</th><th>종류</th><th>제목</th><th>문항</th></tr>${d.summary.map((s) => `<tr><td>${esc(s.id)}</td><td>${({ intro: '도입', concept: '개념', monster: '문제', boss: '형성평가' })[s.kind]}</td><td>${esc(s.title)}</td><td>${s.items || ''}</td></tr>`).join('')}</table>
        ${d.errors.length ? `<div class="x-err"><b>❌ 고칠 것 ${d.errors.length}개</b><br>${d.errors.map(esc).join('<br>')}</div>` : ''}
        ${d.warnings.length ? `<div class="x-warn"><b>⚠ 확인 ${d.warnings.length}개</b><br>${d.warnings.map(esc).join('<br>')}</div>` : ''}
        ${d.errors.length ? '' : `<details><summary>문항 전체 보기 (정답 확인)</summary>${qList(d.pack)}</details>`}
        <div class="row">${d.errors.length ? '' : '<button class="btn primary" id="x-save">💾 이 차시 저장</button>'}<button class="btn small" id="x-drop">버리기</button></div></div>` : ''}
      ${mine.length ? `<p class="shelf-title">저장된 엑셀 차시</p>${mine.map((l) => `<div class="wrow"><span>📊 ${esc(l.unit)} · ${esc(l.title)}</span><button class="btn small" data-xdel="${esc(l.id)}">지우기</button></div>`).join('')}` : ''}</details>`;
  }
  const ansText = (q) => (q.type === 'choice' ? `${q.answerIndex + 1}. ${q.choices[q.answerIndex]}` : q.type === 'ox' ? (q.answer ? 'O' : 'X') : q.type === 'multi' ? q.answer.map((i) => q.options[i]).join(', ') : q.type === 'blanks' ? q.items[0].answer : q.type === 'text' ? q.answers.join(' / ') : String(q.answer));
  const qText0 = (q) => (q.type === 'blanks' ? `${q.question} ${q.items[0].left} □ ${q.items[0].right}` : q.question);
  function qList(pack) {
    const rows = [];
    pack.steps.forEach((s) => {
      const slots = s.kind === 'boss' ? (pack.boss ? pack.boss.sets[1].map((q, i) => [q, pack.boss.sets[2][i]]) : []) : pack.monsters[s.id] ? pack.monsters[s.id].slots : [];
      slots.forEach((vs, k) => vs.forEach((q, v) => rows.push(`<tr><td>${esc(s.id)}-${k + 1}</td><td>${s.kind === 'boss' ? `세트${v + 1}` : `v${v}`}</td><td>${esc(qText0(q))}</td><td class="okc">${esc(ansText(q))}</td></tr>`)));
    });
    return `<table class="r-table"><tr><th>칸</th><th>버전</th><th>문제</th><th>정답</th></tr>${rows.join('')}</table>`;
  }
  function bindSheet() {
    const f = $('#x-file');
    if (f) f.onchange = () => DS.Control.run(async () => {
      const file = f.files[0]; if (!file) return;
      const tabs = await DS.Xlsx.read(await file.arrayBuffer());
      if (!tabs['문항']) throw Object.assign(new Error('「차시 · 순서 · 문항」 탭이 있는 양식 파일인지 확인해 주세요.'), { user: true });
      sheetDraft = DS.SheetLesson.build(tabs); render();
      DS.UI.toast(sheetDraft.errors.length ? `고칠 것 ${sheetDraft.errors.length}개가 있어요` : '읽었어요! 미리보기를 확인하고 저장하세요', 3200);
    });
    const sv = $('#x-save');
    if (sv) sv.onclick = () => DS.Control.run(async () => {
      const p = sheetDraft.pack;
      if (DS.Lessons.get(p.id) && !DS.Lessons.get(p.id).sheetLesson) throw Object.assign(new Error('기존 차시와 이름이 겹쳐요. 「차시」 탭의 제목이나 차시ID를 바꿔 주세요.'), { user: true });
      if (DS.Lessons.get(p.id) && !confirm('같은 이름의 엑셀 차시가 있어요. 새 내용으로 바꿀까요?')) return;
      await DS.Net.set(`sheets/${p.id}`, p);
      DS.SheetLesson.attach(p); DS.App.fillLessons();
      sheetDraft = null; if (!L) { const ps = document.getElementById('p-lesson'); if (ps) ps.value = p.id; await enter(p.id); } else render(); // 첫 차시면 그 차시 준비 화면으로 바로 DS.UI.toast('저장했어요! 교사 메뉴의 차시 목록에 📊 로 나와요. 테스트 모드로 먼저 확인해 보세요.', 4200);
    });
    const dr = $('#x-drop'); if (dr) dr.onclick = () => { sheetDraft = null; render(); };
    document.querySelectorAll('[data-xdel]').forEach((b) => (b.onclick = () => DS.Control.run(async () => {
      if (!confirm('이 엑셀 차시를 지울까요? (진행한 수업 기록은 남아요)')) return;
      await DS.Net.remove(`sheets/${b.dataset.xdel}`);
      const i = DS.Lessons.list.findIndex((l) => l.id === b.dataset.xdel); if (i >= 0) DS.Lessons.list.splice(i, 1);
      DS.App.fillLessons(); if (L && L.id === b.dataset.xdel) { const nx = DS.Lessons.list[0]; await enter(nx ? nx.id : null); } else render();
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
  return { enter, plan, _auto: { autoRects, anchorsOf, textLines } }; // _auto = 시험용
})();
