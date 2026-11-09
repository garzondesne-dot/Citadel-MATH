// ✨ 강화 오라 그림판 (2026-11-09 선생님 「B 날개로 오라랑 같이 진행 · 용사랑 싱크」)
//   .aura.aura-n 안의 v2 용사(.art.hv2) 상자에 직접 붙임 → 용사와 같이 움직이고 같은 크기로 줄고 늚 (1 도트 = 상자 폭 1.55% · cqw)
//   바닥 고리(뒤 + 발 앞 반쪽) · 발밑 색빛 · 도는 입자(앞 반 바퀴 = 용사 앞) · ⭐ 날개는 평소엔 없음 → +10 용사가 몬스터 공격을 막을 때만 크게 (선생님 2026-11-09)
//   새로 그려진 용사는 MutationObserver 가 찾아 붙임 · 종합실(TV)은 입자 2개까지 (용사 20명 기준) · 작은 용사(폭 40px 미만)는 그림 오라 없이 예전 빛
window.DS = window.DS || {};
DS.Aura = (function () {
  const A = () => (DS.ASSETS || {}).aura, base = () => (DS.ASSETS || {}).base || '';
  const lvOf = (el) => { const m = /\baura-(\d+)\b/.exec(el.className || ''); return m ? Number(m[1]) : 0; };
  const nOrb = (lv, tv) => Math.min(tv ? 2 : 4, lv >= 10 ? 4 : lv >= 7 ? 3 : lv >= 4 ? 2 : 1);
  let css = false;
  function style() {
    if (css || !A()) return; css = true;
    const a = A(), u = (f) => `url('${base()}${f}')`, st = [];
    for (let i = 0; i <= 24; i++) { const t = (i / 24) * Math.PI * 2, x = Math.cos(t) * 32, y = Math.sin(t) * 5, f = Math.sin(t) > 0; st.push(`${((i / 24) * 100).toFixed(2)}%{transform:translate(calc(var(--p)*${x.toFixed(1)}),calc(var(--p)*${y.toFixed(1)})) scale(${f ? 1 : 0.7});opacity:${f ? 1 : 0.45};z-index:${f ? 3 : 0}}`); }
    const s = document.createElement('style'); s.id = 'aura-css';
    s.textContent = `.art.hv2.au{container-type:inline-size;--p:1.55cqw}
.au-s{position:absolute;pointer-events:none;image-rendering:pixelated;display:block}
.au-g{left:calc(50% - var(--p)*32);bottom:calc(var(--p)*-4);width:calc(var(--p)*64);height:calc(var(--p)*14);border-radius:50%;background:radial-gradient(closest-side,var(--au) 0%,transparent 100%);opacity:.5;animation:auGl 1.6s ease-in-out infinite alternate;z-index:0}
@keyframes auGl{to{opacity:.28;transform:scaleX(.9)}}
.au-r{left:calc(50% - var(--p)*40);bottom:calc(var(--p)*-4);width:calc(var(--p)*80);height:calc(var(--p)*80);background:${u(a.ring)} 0 var(--ay)/400% 1000% no-repeat;animation:auF .8s steps(4) infinite;filter:drop-shadow(0 0 1px var(--au)) drop-shadow(0 0 calc(var(--p)*2) var(--au));z-index:0}
.au-r.f{clip-path:inset(84% 0 0 0);z-index:2}
.au-w{left:calc(50% - var(--p)*48);bottom:calc(var(--p)*16);width:calc(var(--p)*96);height:calc(var(--p)*48);background:${u(a.wings)} 0 0/400% 100% no-repeat;animation:auF 1.28s steps(4) infinite;filter:drop-shadow(0 0 calc(var(--p)*1.5) #fff3c0aa);z-index:0}
.au-o{left:50%;bottom:calc(var(--p)*20);width:0;height:0;animation:auO var(--d) linear infinite;z-index:3}
.au-o>.au-s{left:calc(var(--p)*-6);top:calc(var(--p)*-6);width:calc(var(--p)*12);height:calc(var(--p)*12);background:${u(a.orbs)} 0 var(--ay)/400% 1000% no-repeat;animation:auF .6s steps(4) infinite;filter:drop-shadow(0 0 2px var(--au))}
.art.hv2.au>b{z-index:1}
@keyframes auF{to{background-position-x:133.333%}}
@keyframes auO{${st.join('')}}
.au-on::after{display:none!important}.au-on .art.hv2.au>b{filter:none!important}.au-on .art.hero.au{animation:none!important}`;
    document.head.appendChild(s);
  }
  function deco(art) {
    if (!A() || art.dataset.au) return;
    const box = art.closest('.aura'); const lv = box ? lvOf(box) : 0; if (!lv) return;
    const w = art.getBoundingClientRect().width; if (w && w < 40) return; // 아주 작은 용사(목록 줄)는 예전 빛
    style(); art.dataset.au = lv; art.classList.add('au'); box.classList.add('au-on');
    const i = lv - 1, ay = `${((i / 9) * 100).toFixed(3)}%`, col = A().colors[i] || '#fff', b = art.querySelector(':scope > b');
    art.style.setProperty('--ay', ay); art.style.setProperty('--au', col);
    const delay = b ? (b.style.animationDelay || getComputedStyle(b).animationDelay || '0s') : '0s'; // ⭐ 날갯짓 = 용사 숨쉬기와 같은 박자 · 같은 시작
    const back = `<span class="au-s au-g"></span><span class="au-s au-r"></span>`;
    const n = nOrb(lv, !!art.closest('#screen-hall')), dur = (3.4 - lv * 0.1).toFixed(2);
    const front = `<span class="au-s au-r f"></span>${Array.from({ length: n }, (_, j) => `<span class="au-s au-o" style="--d:${dur}s;animation-delay:${(-dur * j / n).toFixed(2)}s"><span class="au-s"></span></span>`).join('')}`;
    art.insertAdjacentHTML('afterbegin', back); art.insertAdjacentHTML('beforeend', front);
  }
  const scan = (root) => { if (!root || !root.querySelectorAll) return; if (root.matches && root.matches('.aura .art.hv2')) deco(root); root.querySelectorAll('.aura .art.hv2:not([data-au])').forEach(deco); };
  function start() {
    if (typeof MutationObserver === 'undefined' || !document.body) return;
    scan(document.body);
    new MutationObserver((ms) => ms.forEach((m) => { m.addedNodes.forEach((n) => { if (n.nodeType === 1) scan(n); }); if (m.type === 'attributes' && m.target.classList && m.target.classList.contains('aura')) scan(m.target); })).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  }
  if (typeof document !== 'undefined') { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start(); }
  return { scan, deco };
})();
