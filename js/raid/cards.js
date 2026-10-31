// 수학 카드 그리기: 공통 금테(cardKit.frame) + 위쪽 무기·마법 그림(한 색으로 차분하게) + 가운데 수학 기호·뜻 + 아래 이름판.
// 등급은 아래 보석 색과 표시로: 일반(흰색) · 매직(파랑) · 레어(보라). html(카드, { w: 화면 폭 px, unknown: 못 만든 카드(??? + 힌트) })
window.DS = window.DS || {};

DS.Card = (function () {
  const K = () => DS.ASSETS.cardKit, base = () => DS.ASSETS.base;
  const { esc, pretty } = DS.UI;
  const GEM = { 1: 'grayscale(1) brightness(1.7)', 2: 'none', 3: 'hue-rotate(62deg) saturate(1.3)' };
  const GN = { 1: '일반', 2: '매직', 3: '레어' };
  const box = (b) => `left:${b[0]}px;top:${b[1]}px;width:${b[2]}px;height:${b[3]}px`;
  function html(c, opt = {}) {
    const k = K(), s = (opt.w || 192) / k.w, B = k.box, un = !!opt.unknown;
    const a = k.arts, art = `background-image:url('${base()}${a.src}');background-size:${a.cols * 100}% 100%;background-position:${(c.art / (a.cols - 1)) * 100}% 0;${c.flip ? 'transform:scaleX(-1);' : ''}`;
    const fmLen = String(c.fm).length;
    return `<div class="mcard g${c.grade}${un ? ' unknown' : ''}" style="width:${k.w * s}px;height:${k.h * s}px" data-card="${c.id}">
      <div class="mcard-in" style="width:${k.w}px;height:${k.h}px;transform:scale(${s})">
        <img class="mc-fr" src="${base()}${k.frame}" alt="">
        <div class="mc-art" style="${box(B.art)};${art}"></div>
        <img class="mc-gem" src="${base()}${k.frame}" alt="" style="clip-path:inset(${B.gem[1]}px ${k.w - B.gem[0] - B.gem[2]}px ${k.h - B.gem[1] - B.gem[3]}px ${B.gem[0]}px);filter:${GEM[c.grade] || 'none'}">
        <div class="mc-body" style="${box(B.body)}">${un ? `<b class="mc-q">???</b><span class="mc-hint">💡 ${esc(c.hint)}</span>`
          : `<span class="mc-tag">${GN[c.grade]}</span><span class="mc-page">${esc(c.page || '')}</span><b class="mc-fm math${fmLen > 12 ? ' long' : fmLen > 7 ? ' mid' : ''}">${pretty(c.fm)}</b><span class="mc-desc">${esc(c.desc)}</span>`}</div>
        <div class="mc-plate" style="${box(B.plate)}"><b class="${(c.short || c.name).length > 7 ? 'long' : ''}">${un ? '? ? ?' : esc(c.short || c.name)}</b></div>
      </div></div>`;
  }
  return { html, GN };
})();
