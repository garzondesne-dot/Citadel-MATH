// 공통 도구: 글자 이스케이프 · 분수 표시 · 토스트 · 시드 난수 · 화면 전환
window.DS = window.DS || {};

DS.UI = {
  esc(s) {
    return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  },
  // '1/2' 같은 분수를 세로 분수로, 줄바꿈은 <br>
  pretty(s) {
    return DS.UI.esc(s).replace(/((?:\d*√)?\d+)\/(\d+)/g, '<span class="fr"><span>$1</span><span>$2</span></span>').replace(/ᶜ/g, '<sup class="cpl">C</sup>').replace(/\n/g, '<br>'); // ᶜ (여집합) = 보이는 것만 위첨자 C (글꼴에 ᶜ 가 없어서 · 채점은 원래 글자, 2026-11-07)
  },
  // 벤 다이어그램 그림 (이름, 원소 글자)
  venn(name, elems) {
    const e = DS.UI.esc;
    return `<svg class="venn" viewBox="0 0 160 70" aria-label="벤 다이어그램 ${e(name)}: ${e(elems)}"><ellipse cx="80" cy="38" rx="72" ry="28" fill="none" stroke="currentColor" stroke-width="2"/><text x="80" y="11" font-size="11" text-anchor="middle" fill="currentColor" font-style="italic">${e(name)}</text><text x="80" y="44" font-size="15" text-anchor="middle" fill="currentColor">${e(elems)}</text></svg>`;
  },
  // v0.9.3 긴급: 화면 꺼짐 방지 (교사 폰 리모컨 · 유튜브처럼) — Screen Wake Lock. 안드로이드 크롬 · 삼성 인터넷 · iOS 16.4+ 사파리
  //   다른 앱을 보다 돌아오면 다시 켠다 (브라우저가 화면이 가려지면 자동으로 풀기 때문)
  wake: {
    lock: null, want: false,
    async on() {
      DS.UI.wake.want = true;
      try { if (typeof navigator !== 'undefined' && navigator.wakeLock && !DS.UI.wake.lock && document.visibilityState === 'visible') { DS.UI.wake.lock = await navigator.wakeLock.request('screen'); DS.UI.wake.lock.addEventListener('release', () => { DS.UI.wake.lock = null; }); } } catch (e) { /* 지원 안 함 · 배터리 절약 모드 */ }
    },
    off() { DS.UI.wake.want = false; if (DS.UI.wake.lock) DS.UI.wake.lock.release().catch(() => {}); DS.UI.wake.lock = null; },
  },
  // v0.9.3 ⛶ 전체 화면 (사용자 결정 ③B): 주소창 · 탭을 숨긴다. 버튼을 눌러야만 켜진다 (브라우저 정책). 아이폰 사파리는 지원 안 함 → 버튼 숨김
  fs: {
    can() { return typeof document !== 'undefined' && !!(document.fullscreenEnabled || document.webkitFullscreenEnabled); },
    on() { return !!(document.fullscreenElement || document.webkitFullscreenElement); },
    toggle() {
      const d = document, el = d.documentElement;
      if (DS.UI.fs.on()) return (d.exitFullscreen || d.webkitExitFullscreen).call(d);
      const req = el.requestFullscreen || el.webkitRequestFullscreen; return req ? Promise.resolve(req.call(el, { navigationUI: 'hide' })).catch(() => DS.UI.toast('전체 화면을 켤 수 없어요 (브라우저에서 F11)')) : null;
    },
    btn(id) { return DS.UI.fs.can() ? `<button class="btn small fs-btn" id="${id}">${DS.UI.fs.on() ? '⛶ 전체 화면 끄기' : '⛶ 전체 화면'}</button>` : ''; },
    bind(id) { const b = document.getElementById(id); if (!b) return; b.onclick = () => DS.UI.fs.toggle(); },
  },
  // v0.9.3 색칠한 벤 다이어그램 (보기 'vshade:영역') — 영역: A-B (A 만) · B-A (B 만) · AnB (겹친 곳) · AuB (합친 곳) · Ac (A 바깥)
  vshade(reg) {
    const id = `vs${(DS.UI._vs = (DS.UI._vs || 0) + 1)}`, A = '<circle cx="62" cy="50" r="30"/>', B = '<circle cx="98" cy="50" r="30"/>', U = '<rect x="6" y="8" width="148" height="84" rx="8"/>';
    const fill = { 'A-B': `<mask id="${id}"><rect width="160" height="100" fill="#000"/><g fill="#fff">${A}</g><g fill="#000">${B}</g></mask><rect width="160" height="100" fill="#ff4fa3" fill-opacity="0.55" mask="url(#${id})"/>`,
      'B-A': `<mask id="${id}"><rect width="160" height="100" fill="#000"/><g fill="#fff">${B}</g><g fill="#000">${A}</g></mask><rect width="160" height="100" fill="#ff4fa3" fill-opacity="0.55" mask="url(#${id})"/>`,
      AnB: `<mask id="${id}"><rect width="160" height="100" fill="#000"/><g fill="#fff">${A}</g></mask><g fill="#ff4fa3" fill-opacity="0.55" mask="url(#${id})">${B}</g>`,
      AuB: `<g fill="#ff4fa3" fill-opacity="0.55">${A}${B}</g>`,
      Ac: `<mask id="${id}"><rect width="160" height="100" fill="#000"/><g fill="#fff">${U}</g><g fill="#000">${A}</g></mask><rect width="160" height="100" fill="#ff4fa3" fill-opacity="0.55" mask="url(#${id})"/>` }[reg] || '';
    return `<svg class="venn vshade" viewBox="0 0 160 100" aria-label="벤 다이어그램 색칠 ${DS.UI.esc(reg)}">${fill}<g fill="none" stroke="currentColor" stroke-width="2">${U}${A}${B}</g><text x="44" y="24" font-size="13" font-style="italic" fill="currentColor">A</text><text x="110" y="24" font-size="13" font-style="italic" fill="currentColor">B</text><text x="140" y="24" font-size="11" font-style="italic" fill="currentColor">U</text></svg>`;
  },
  // 보기 한 칸: 'vshade:영역' 은 색칠한 그림, 'venn:이름|원소' 는 벤 다이어그램, 나머지는 글
  opt(o) {
    const s = String(o), v = /^vshade:(.+)$/.exec(s), m = /^venn:([^|]*)\|(.*)$/.exec(s);
    return v ? DS.UI.vshade(v[1]) : m ? DS.UI.venn(m[1], m[2]) : `<span class="math">${DS.UI.pretty(s)}</span>`;
  },
  // 문제 글: pretty + [[venn:이름|원소]] 를 그림으로 (학습지 그림 문항을 앱에서도 보이게)
  rich(s) {
    return String(s).split(/(\[\[venn:[^|\]]*\|[^\]]*\]\])/).map((part) => {
      const m = /^\[\[venn:([^|\]]*)\|([^\]]*)\]\]$/.exec(part);
      return m ? `<div class="venn-q">${DS.UI.venn(m[1], m[2])}</div>` : DS.UI.pretty(part);
    }).join('');
  },
  // 글로만 보여 줄 때 (결과 목록 등): 그림 표시를 짧은 글로
  plain(s) { return String(s).replace(/^vshade:(.+)$/, (_, r) => `[그림: ${({ 'A-B': 'A 만', 'B-A': 'B 만', AnB: 'A ∩ B', AuB: 'A ∪ B', Ac: 'A 바깥' })[r] || r} 색칠]`).replace(/\[\[venn:([^|\]]*)\|([^\]]*)\]\]/g, '[벤 다이어그램 $1: $2] '); },
  // 🔣 알림 문구 기호 (2026-11-07 이모지 사전): 기호 없이 시작하는 알림만 종류별 하나 — ⚠ 주의 · 🔒 막힘 · ⏰ 시간 · ✅ 성공 · 💡 안내
  toastMark(msg) {
    const s = String(msg == null ? '' : msg);
    if (!s || !/^[0-9A-Za-z가-힣「(]/.test(s)) return s;
    const k = /달라요|모자라|못 했|못했|안 돼|안돼|실패|한 번 더 누르면|틀렸/.test(s) ? '⚠' : /로그인한|해야 해요|만 할 수|만 보낼|만 쓸|잠겨|열려야|먼저 /.test(s) ? '🔒' : /시간이|분 남|초 남|끝났어요/.test(s) ? '⏰' : /했어요|됐어요|바꿨어요|보냈어요|저장|완료|열었어요|복사/.test(s) ? '✅' : /아직|없어요|해 보세요|해요$/.test(s) ? '💡' : '';
    return k ? `${k} ${s}` : s;
  },
  toast(msg, ms = 2200) {
    if (typeof document === 'undefined') return;
    const t = document.querySelector('#toast');
    if (!t) return;
    t.textContent = DS.UI.toastMark(msg);
    t.classList.add('show');
    clearTimeout(DS.UI._tt);
    DS.UI._tt = setTimeout(() => t.classList.remove('show'), ms);
  },
  show(id) {
    document.querySelectorAll('.screen').forEach((s) => s.classList.toggle('active', s.id === id));
    window.scrollTo(0, 0);
  },
};

// 시드 난수 (같은 시드 → 같은 문제). 학생 기기와 교사 기기가 같은 문제를 각자 만든다
DS.Rng = function (seed) {
  let n = (typeof seed === 'string' ? DS.Rng.hash(seed) : seed) >>> 0;
  const next = () => { n = (Math.imul(1664525, n) + 1013904223) >>> 0; return n / 4294967296; };
  next.int = (a, b) => a + Math.floor(next() * (b - a + 1));
  next.pick = (arr) => arr[Math.floor(next() * arr.length)];
  next.shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(next() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  return next;
};
DS.Rng.hash = function (str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h >>> 0;
};
// setgen.js 가 쓰는 섞기 (시드가 필요 없는 곳)
DS.MathGen = DS.MathGen || { shuffle: (a) => DS.Rng(Math.floor(Math.random() * 1e9)).shuffle(a) };
// ⛶ 전체 화면 버튼 글자: 켜고 끌 때(Esc · 안드로이드 뒤로 가기 포함) 바로 바꾼다
if (typeof document !== 'undefined') ['fullscreenchange', 'webkitfullscreenchange'].forEach((ev) => document.addEventListener(ev, () => document.querySelectorAll('.fs-btn').forEach((b) => { b.textContent = DS.UI.fs.on() ? '⛶ 전체 화면 끄기' : '⛶ 전체 화면'; })));
// 화면 꺼짐 방지: 다른 앱 · 탭에서 돌아오면 다시 켠다
if (typeof document !== 'undefined') document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && DS.UI.wake.want) DS.UI.wake.on(); });
// 🔢 숫자 다이얼 (v0.9.6.16): ▲▼ 를 누르면 바로 한 칸 · 꾹 누르고 있으면 계속 올라감/내려감
//   화면 전체를 다시 그리지 않고 다이얼 숫자만 바꾼다 (꾹 누르는 동안 버튼이 바뀌지 않게) · 두 번 탭 확대는 CSS touch-action 으로 막음
//   root 안의 [data-dial="문항|증감"] 버튼 · get(i) → 지금 값 · set(i, v) 값 저장 (0~99)
DS.UI.dial = function (root, get, set) {
  const step = (b) => {
    if (!b.isConnected) return false; // 화면이 다시 그려져 버튼이 사라졌으면 멈춤
    const [i, d] = b.dataset.dial.split('|').map(Number), v = Math.max(0, Math.min(99, Number(get(i)) + d));
    if (v === Number(get(i))) return false;
    set(i, v);
    const box = b.closest('.dial'); if (box) { const bs = box.querySelectorAll('.wheel b'); if (bs[0]) bs[0].textContent = Math.floor(v / 10); if (bs[1]) bs[1].textContent = v % 10; const t = box.querySelector('.dial-val'); if (t) t.textContent = `= ${v}`; }
    if (DS.Sound) DS.Sound.clank();
    return true;
  };
  root.querySelectorAll('[data-dial]').forEach((b) => {
    let t1 = 0, n = 0;
    const stop = () => { clearTimeout(t1); t1 = 0; };
    const rep = () => { n++; if (step(b)) t1 = setTimeout(rep, n > 8 ? 60 : 120); else stop(); }; // 오래 누를수록 빨라짐
    b.addEventListener('pointerdown', (e) => {
      if (e.button) return; e.preventDefault(); stop(); n = 0; step(b);
      try { b.setPointerCapture(e.pointerId); } catch (x) { /* 없음 */ }
      t1 = setTimeout(rep, 380);
    });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((ev) => b.addEventListener(ev, stop));
    b.addEventListener('click', (e) => { if (e.detail === 0) step(b); }); // 키보드(Enter · Space)
    b.addEventListener('contextmenu', (e) => e.preventDefault()); // 꾹 누를 때 메뉴 안 뜨게
  });
};
// 🪟 창 공통 틀 (2026-11-04 사용자 확정 「경험 통일」): 위에 뜨는 창은 모두 같은 모양으로 고친다
//   ① 제목 줄(.ui-head)은 창 위에 붙어 있고(스크롤해도 ✕ 가 사라지지 않음) 오른쪽에 같은 크기의 ✕ 하나
//   ② 해야 할 일 버튼 줄(주 버튼이 있는 마지막 .row)은 창 아래에 고정(.ui-foot) · 가운데 내용만 스크롤
//   ③ 창 바깥을 누르면 닫힘 (원래 닫기 버튼을 눌러 준 것과 같음 · 문제 창 #quiz 는 제외)
DS.UI.frame = function (modal) {
  if (!modal || modal.id === 'quiz') return;
  const box = modal.querySelector(':scope > .quiz-box, :scope > .framed'); if (!box || box.querySelector(':scope > .ui-head .ui-x')) return; // 창 안이 다시 그려지면 다시 씌움
  const isClose = (b) => /^(✕\s*)?닫기$|^✕$/.test((b.textContent || '').trim()) || b.hasAttribute('data-x') || /-x$/.test(b.id || '');
  const closeBtn = [...box.querySelectorAll('button')].find(isClose);
  let head = box.querySelector(':scope > .quiz-head, :scope > .set-head');
  if (!head) { const h = box.querySelector(':scope > h2'); if (h) { head = document.createElement('div'); head.className = 'quiz-head'; h.replaceWith(head); head.appendChild(h); } }
  if (!head) return;
  head.classList.add('ui-head');
  const x = document.createElement('button'); x.type = 'button'; x.className = 'ui-x'; x.setAttribute('aria-label', '닫기'); x.textContent = '✕';
  x.onclick = () => (closeBtn ? closeBtn.click() : modal.remove());
  head.appendChild(x);
  if (closeBtn) closeBtn.classList.add('ui-x-src'); // 원래 닫기 버튼은 숨김 (✕ 가 대신 누름)
  const rows = [...box.querySelectorAll(':scope > .row')], foot = rows.reverse().find((r) => r.querySelector('.primary'));
  if (foot) foot.classList.add('ui-foot');
  const prim = head.querySelector('.btn.primary'); // 제목 줄의 「저장」 같은 할 일 버튼 → 아래 고정 줄로
  if (prim && !foot) { const f = document.createElement('div'); f.className = 'row ui-foot'; box.appendChild(f); f.appendChild(prim); }
  if (!modal.dataset.uiFrame) { modal.dataset.uiFrame = '1'; modal.addEventListener('click', (e) => { if (e.target === modal) { const xx = modal.querySelector('.ui-x'); if (xx) xx.click(); } }); }
};
// 🖥 가운데 본 화면에 맞추기 (2026-11-06 사용자 「종합실 설정 · 시연 창이 너무 커 · 메인 가운데 화면에 맞춰」): 큰 화면(가로 1000px 이상)의
//   종합실 레이드 칸(#h-arena) · 교사 캠프 무대(.tc-stage) 자리에 창을 딱 맞춤 (폰은 그대로)
DS.UI.centerRect = function () {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !(window.innerWidth >= 1000)) return null;
  const s = document.querySelector('.screen.active'); const el = s && s.querySelector('#h-arena, .tc-hallmode .tc-stage, .tc-stage');
  if (!el) return null; const r = el.getBoundingClientRect(); return r.width > 300 && r.height > 300 ? r : null;
};
DS.UI.fitCenter = function (ov) {
  const r = DS.UI.centerRect(); if (!ov || !r) return false;
  ov.style.padding = `${Math.max(0, r.top)}px ${Math.max(0, window.innerWidth - r.right)}px ${Math.max(0, window.innerHeight - r.bottom)}px ${Math.max(0, r.left)}px`;
  ov.classList.add('fit-center'); return true;
};
if (typeof window !== 'undefined' && typeof window.addEventListener === 'function' && typeof document !== 'undefined') window.addEventListener('resize', () => document.querySelectorAll('.fit-center').forEach((o) => DS.UI.fitCenter(o))); // 시험(node)에는 window 가 빈 객체
if (typeof document !== 'undefined' && typeof MutationObserver !== 'undefined') {
  const scan = (n) => { if (n.nodeType !== 1) return; const m = n.classList.contains('modal') ? n : n.closest && n.closest('.modal'); if (m) { DS.UI.frame(m); if (m.classList.contains('camp-modal') && !m.classList.contains('fit-center')) DS.UI.fitCenter(m); } n.querySelectorAll && n.querySelectorAll('.modal').forEach((mm) => DS.UI.frame(mm)); };
  const start = () => new MutationObserver((ms) => ms.forEach((m) => m.addedNodes.forEach(scan))).observe(document.body, { childList: true, subtree: true });
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
}
// 🤏 두 손가락 확대 막기 (2026-11-07 사용자 「두 손가락으로 당기면 줌이 당겨지기 시작했네?」): 게임 화면은 확대하지 않음 · 학습지 그림(.t-sheet · .bn-sheet) · 그림 자르기 · 사진 칸에서만 허용
//   iOS 사파리 = gesturestart · 안드로이드 크롬 = 두 손가락 touchmove 를 막음 (viewport user-scalable=no 는 iOS 가 무시해서)
if (typeof document !== 'undefined') {
  const ZOOM_OK = '.t-sheet, .bn-sheet, .crop-page, .ph-stage, .zoom-ok';
  const okAt = (t) => !!(t && t.closest && t.closest(ZOOM_OK));
  document.addEventListener('touchmove', (e) => { if (e.touches && e.touches.length > 1 && !okAt(e.target)) e.preventDefault(); }, { passive: false });
  ['gesturestart', 'gesturechange'].forEach((ev) => document.addEventListener(ev, (e) => { if (!okAt(e.target)) e.preventDefault(); }, { passive: false }));
}
