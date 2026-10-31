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
