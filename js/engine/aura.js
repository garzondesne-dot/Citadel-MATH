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
.au-h{left:calc(50% - var(--p)*41);bottom:calc(var(--p)*-1);width:calc(var(--p)*82);height:calc(var(--p)*82);background:${u(a.halo)} 0 0/400% 100% no-repeat;animation:auF 1s steps(4) infinite;z-index:0}
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
    const i = lv >= 10 ? 6 : lv - 1, ay = `${((i / 9) * 100).toFixed(3)}%`, col = A().colors[lv - 1] || '#fff', b = art.querySelector(':scope > b');
    art.style.setProperty('--ay', ay); art.style.setProperty('--au', col);
    const delay = b ? (b.style.animationDelay || getComputedStyle(b).animationDelay || '0s') : '0s'; // ⭐ 날갯짓 = 용사 숨쉬기와 같은 박자 · 같은 시작
    const holy = lv >= 10 && A().halo; // ✨ 10단계 = 머리 뒤 홀리 후광만 (2026-11-09 선생님 「7단계는 빼봐」 → 황금 고리 · 빛기둥 · 입자 없음 · 발밑 은은한 금빛만)
    const back = holy ? '<span class="au-s au-g"></span><span class="au-s au-h"></span>' : `<span class="au-s au-g"></span><span class="au-s au-r"></span>`;
    const n = nOrb(lv, !!art.closest('#screen-hall')), dur = (3.4 - lv * 0.1).toFixed(2);
    const front = holy ? '' : `<span class="au-s au-r f"></span>${Array.from({ length: n }, (_, j) => `<span class="au-s au-o" style="--d:${dur}s;animation-delay:${(-dur * j / n).toFixed(2)}s"><span class="au-s"></span></span>`).join('')}`;
    art.insertAdjacentHTML('afterbegin', back); art.insertAdjacentHTML('beforeend', front);
  }
  const scan = (root) => { if (!root || !root.querySelectorAll) return; if (root.matches && root.matches('.aura .art.hv2')) deco(root); root.querySelectorAll('.aura .art.hv2:not([data-au])').forEach(deco); };
  function start() {
    if (typeof MutationObserver === 'undefined' || !document.body) return;
    scan(document.body);
    new MutationObserver((ms) => ms.forEach((m) => { m.addedNodes.forEach((n) => { if (n.nodeType === 1) scan(n); }); if (m.type === 'attributes' && m.target.classList && m.target.classList.contains('aura')) scan(m.target); })).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  }
  if (typeof document !== 'undefined') { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start(); }
  // ⭐ +10 각성 「첫 공격 막기」 연출 (2026-11-09 선생님 그림 · 시안 guard-holy.mp4)
  //   날개(6칸): ① 빛 소용돌이 ② 용사를 감쌈(용사 앞) → ③~⑥ 한 번에 쫙 (용사 뒤 · 좌우로 용사 폭 2배씩) · 용사 살짝 떠오름
  //   방패(6칸 · 용사 키 약 3배): 빛 모임 → 생김 → 완성 → 💥 맞음(섬광) → 금 감 → 부서져 사라짐 · 옆 용사를 가려도 됨
  //   host = 용사를 담은 칸(.fh2 · .enc-hero) · 그 안 .art 의 크기로 1 도트(p)를 잼 → 폰 · TV 어디서나 같은 비율
  //   onHit = 몬스터 공격이 방패에 닿는 순간(방패 ④) 부름
  function guard(host, onHit) { // 반환 = 방패에 맞는 순간(ms) · 0 = 그림 없음
    const a = A(); if (!host || !a || !a.guardWings) return 0;
    const art = host.querySelector('.art'); if (!art) return 0;
    const hr = host.getBoundingClientRect(), ar = art.getBoundingClientRect(); if (!ar.width) return 0;
    const fit = host.closest('.scene'), fh = fit ? fit.getBoundingClientRect().height : 0; // 📱 폰 전투 장면 = 방패가 장면 높이 안에 (위 상태줄을 덮지 않게)
    const p = fh ? Math.min(ar.width * 0.0155, (fh * 1.05) / 170) : ar.width * 0.0155, cx = ar.left - hr.left + ar.width / 2, by = hr.bottom - ar.bottom; // 날개 · 방패 중심 = 용사 머리 가운데 = 상자 가운데 (art.js 가 머리를 상자 가운데에 둠)
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    const old = host.querySelector('.gd-fx'); if (old) old.remove();
    const u = (f) => `url('${base()}${f}')`, mk = (f, w, h, bot, z) => { const e = document.createElement('span'); e.className = 'gd-fx'; e.style.cssText = `position:absolute;pointer-events:none;image-rendering:pixelated;left:${cx - (w * p) / 2}px;bottom:${by + bot * p}px;width:${w * p}px;height:${h * p}px;background:${u(f)} 0 0/600% 100% no-repeat;opacity:0;z-index:${z}`; host.appendChild(e); return e; };
    const W = mk(a.guardWings, 206, 103, -14.8, 3), S = mk(a.guardShield, 340, 170, -10.8, 6);
    W.style.filter = 'drop-shadow(0 0 4px #fff3c0aa)';
    const fr = (el, f, o) => { el.style.transition = 'none'; el.style.opacity = o; el.style.backgroundPositionX = `${f * 20}%`; };
    const z0 = host.style.zIndex, lift = (on) => { art.style.transition = 'transform .25s ease-out'; art.style.transform = on ? `translateY(${-6 * p}px)` : ''; };
    host.style.zIndex = 30; host.classList.add('gd-on');
    const T = [], at = (ms, fn) => T.push(setTimeout(fn, ms));
    // 날개: 감쌈(앞) → 쫙(뒤)
    at(0, () => { lift(true); W.style.zIndex = 5; fr(W, 1, 1); });
    at(150, () => fr(W, 2, 1));
    at(450, () => { W.style.zIndex = 0; fr(W, 3, 1); });
    at(510, () => fr(W, 4, 1));
    at(570, () => fr(W, 5, 1));
    // 방패
    at(620, () => fr(S, 0, 0.9)); at(710, () => fr(S, 1, 0.9)); at(800, () => fr(S, 2, 0.9));
    at(1120, () => { fr(S, 3, 1); if (onHit) onHit(); });
    at(1320, () => fr(S, 4, 0.95)); at(1560, () => fr(S, 5, 0.9));
    at(1860, () => { S.style.transition = 'opacity .35s'; S.style.opacity = 0; });
    at(2070, () => { W.style.transition = 'opacity .45s'; W.style.opacity = 0; lift(false); });
    at(2600, () => { W.remove(); S.remove(); art.style.transform = ''; host.style.zIndex = z0; host.classList.remove('gd-on'); });
    return 1120; // 방패에 맞는 순간(ms)
  }
  return { scan, deco, guard, HIT_MS: 1120 };
})();
