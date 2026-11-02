// 공통 도구: 글자 이스케이프 · 분수 표시 · 토스트 · 시드 난수 · 화면 전환
window.DS = window.DS || {};

DS.UI = {
  esc(s) {
    return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  },
  // '1/2' 같은 분수를 세로 분수로, 줄바꿈은 <br>
  pretty(s) {
    return DS.UI.esc(s).replace(/((?:\d*√)?\d+)\/(\d+)/g, '<span class="fr"><span>$1</span><span>$2</span></span>').replace(/\n/g, '<br>');
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
  toast(msg, ms = 2200) {
    if (typeof document === 'undefined') return;
    const t = document.querySelector('#toast');
    if (!t) return;
    t.textContent = msg;
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
