// ⚔ 공격 연출 (2026-11-06 · 사용자 확정 「근접은 다가가서 · 원거리는 제자리에서 날려서」 · docs/GAME-FEEL.md)
//   근접 10명: 몬스터 앞까지 달려감(잔상) → 공격 자세 → 이펙트 · 멈칫 · 흔들림 · 밀림 → 제자리
//   원거리 8명(assets/manifest.js ranged): 제자리 공격 자세 → 용사별 탄이 곡선으로 날아가 머리를 돌림 → 이펙트
//   틀림: 몬스터가 튕겨냄 · 탄 빗나감 (벌 없음) · 처치: 충격파 + 긴 멈칫 + 크게 밀림
//   연출만 바꾼다 — 데미지 · 체력 · 정답 판정 · 시간과 무관.
//   play(장면, { heroBox, monBox, hero, fx, miss, finish, s, ps, rest }) → Promise (끝나면)
window.DS = window.DS || {};

DS.Attack = (function () {
  const A = () => DS.ASSETS || {};
  const projOf = (hero) => (A().ranged || {})[Number(hero)] || null;
  const isRanged = (hero) => !!projOf(hero);
  const ROUND = { witch: true, priest: true }; // 떠 있는 구슬: 날아가는 방향으로 돌리지 않음
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const rel = (el, box) => { const a = el.getBoundingClientRect(), b = box.getBoundingClientRect(); return { x: a.left - b.left, y: a.top - b.top, w: a.width, h: a.height }; };
  const reduce = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function setPose(heroBox, hero, pose, cls = '') { const a = heroBox && heroBox.querySelector('.art'); if (a && DS.Art) a.outerHTML = DS.Art.hero(hero, pose, cls); }
  function shake(box, amp = 3, ms = 180) {
    if (reduce() || !box) return;
    const t0 = performance.now();
    const f = (t) => { const k = 1 - (t - t0) / ms; if (k <= 0 || !box.isConnected) { box.style.translate = ''; return; } box.style.translate = `${((Math.random() - 0.5) * 2 * amp * k).toFixed(1)}px ${((Math.random() - 0.5) * 2 * amp * k).toFixed(1)}px`; requestAnimationFrame(f); };
    requestAnimationFrame(f);
  }
  const knock = (monBox, d = 12) => { if (monBox && monBox.animate) monBox.animate([{ translate: '0 0', filter: 'brightness(3)' }, { translate: `${d}px 0`, filter: 'brightness(1.2)', offset: 0.35 }, { translate: '0 0', filter: 'brightness(1)' }], { duration: 340, easing: 'ease-out' }); };
  const hitstop = (box, ms) => { box.classList.add('hitstop'); return wait(ms).then(() => box.classList.remove('hitstop')); };
  function dmg(box, x, y, txt = '−1') { const e = document.createElement('b'); e.className = 'atk-dmg'; e.textContent = txt; e.style.left = `${x}px`; e.style.top = `${y}px`; box.appendChild(e); setTimeout(() => e.remove(), 950); }
  function wave(box, x, y) { const e = document.createElement('i'); e.className = 'atk-wave'; e.style.left = `${x}px`; e.style.top = `${y}px`; box.appendChild(e); setTimeout(() => e.remove(), 650); }
  // 맞는 순간: 이펙트 · 멈칫 · 흔들림 · 밀림 · −1 (처치면 충격파 + 크게)
  async function impact(scene, monBox, fx, o = {}) {
    const M = rel(monBox, scene), cx = M.x + M.w * 0.5, cy = M.y + M.h * 0.52, floor = M.y + M.h - 4;
    const sp = DS.FX.spec(DS.FX.KINDS.includes(fx) ? fx : 'flame') || {};
    DS.FX.play(scene, fx, { x: cx, y: cy, floor, s: o.s || 1.2, perfect: o.finish });
    const hit = sp.hit || [0, 0.08, 0.18, 2];
    await wait(Math.min(0.3, hit[0] || 0.06) * 1000);
    if (!scene.isConnected) return;
    knock(monBox, o.finish ? 24 : 12); shake(scene, Math.max(2, hit[3] || 2) * (o.finish ? 2 : 1.2), Math.max(0.14, hit[2] || 0.18) * (o.finish ? 2000 : 1000));
    if (!o.noDmg) dmg(scene, cx, M.y + 6);
    if (o.finish) wave(scene, cx, floor);
    if (DS.Sound) { if (o.finish && DS.Sound.finish) DS.Sound.finish(); else if (DS.Sound.fxHit) DS.Sound.fxHit(fx); else if (DS.Sound.hit) DS.Sound.hit(); }
    await hitstop(scene, (o.finish ? 0.32 : Math.max(0.05, hit[1] || 0.08)) * 1000);
  }
  // 근접 돌진: heroBox 를 dx 만큼 (잔상 남김)
  function dash(scene, heroBox, from, to, ms, ghosts) {
    return new Promise((res) => {
      const t0 = performance.now(); let lastG = 0;
      const f = (t) => {
        const u = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - u, 2), x = from + (to - from) * e;
        heroBox.style.translate = `${x.toFixed(1)}px 0`;
        if (ghosts && t - lastG > 45 && u < 0.95 && !reduce()) {
          lastG = t; const a = heroBox.querySelector('.art');
          if (a) { const r = rel(a, scene), g = document.createElement('div'); g.className = 'atk-ghost'; g.style.cssText += `left:${r.x}px;top:${r.y}px;width:${r.w}px;height:${r.h}px`; g.innerHTML = a.outerHTML; g.firstChild.style.width = '100%'; g.firstChild.style.height = '100%'; scene.appendChild(g); requestAnimationFrame(() => { g.style.opacity = '0'; }); setTimeout(() => g.remove(), 320); }
        }
        if (u < 1 && heroBox.isConnected) requestAnimationFrame(f); else res();
      };
      requestAnimationFrame(f);
    });
  }
  // 원거리 탄: 곡선(2차 베지어)으로 날아가며 머리를 돌림
  function fly(scene, key, from, to, s, miss) {
    const sp = ((A().fx2 || {}).proj || {})[key];
    if (!sp) return wait(200);
    const el = DS.FX.strip(scene, sp, from.x, from.y, s, { loop: true, z: 21 }); el.classList.add('atk-proj');
    el.style.transformOrigin = `${(sp.px * s).toFixed(1)}px ${(sp.py * s).toFixed(1)}px`;
    const dist = Math.hypot(to.x - from.x, to.y - from.y), lift = Math.min(60, dist * 0.22), cx = (from.x + to.x) / 2, cy = Math.min(from.y, to.y) - lift;
    const ms = miss ? 320 : Math.max(260, Math.min(460, dist * 1.4)), t0 = performance.now();
    return new Promise((res) => {
      const f = (t) => {
        const u = Math.min(1, (t - t0) / ms), v = 1 - u;
        const x = v * v * from.x + 2 * v * u * cx + u * u * to.x, y = v * v * from.y + 2 * v * u * cy + u * u * to.y;
        const tx = 2 * v * (cx - from.x) + 2 * u * (to.x - cx), ty = 2 * v * (cy - from.y) + 2 * u * (to.y - cy);
        el.style.left = `${(x - sp.px * s).toFixed(1)}px`; el.style.top = `${(y - sp.py * s).toFixed(1)}px`;
        if (!ROUND[key]) el.style.transform = `rotate(${Math.atan2(ty, tx).toFixed(3)}rad)`;
        if (miss) el.style.opacity = String(1 - Math.max(0, u - 0.5) * 2);
        if (u < 1 && scene.isConnected) requestAnimationFrame(f); else { el.remove(); res(); }
      };
      requestAnimationFrame(f);
    });
  }
  // ⚡ 필살기 컷인 (2026-11-06 사용자 「난무만 안 하게 · 퍼펙트 뜰 때 · Ⅳ 해금」): 화면 전체 위에 1.2초 — Ⅳ 결정석 + 퍼펙트 처치에서만 부른다
  const ULT_COLOR = { cut: ['#9fe0ff', '#0b2a40'], smash: ['#ffb070', '#3a1a06'], sweep: ['#a0ffd0', '#06301e'], fire: ['#ff7a3a', '#3a0d00'], spark: ['#fff27a', '#2a2a00'], frost: ['#b8f0ff', '#062a3a'], star: ['#ffe9a0', '#2a2206'], magic: ['#d8a0ff', '#24063a'] };
  // 눈빛 클로즈업: assets/manifest.js heroFaces (576×432 · 칸 192×72 · 3 × 6 · 번호 = 용사 번호) 가 오면 그 그림 · 없으면 도트 확대 (2026-11-06)
  function faceHtml(hero) {
    const F = A().heroFaces, n = Number(hero) || 0;
    if (F && F.src && n < F.cols * F.rows) { const c = n % F.cols, r = Math.floor(n / F.cols); return `<i class="u-facepic" style="background-image:url('${A().base}${F.src}');background-size:${F.cols * 100}% ${F.rows * 100}%;background-position:${F.cols > 1 ? (c / (F.cols - 1)) * 100 : 0}% ${F.rows > 1 ? (r / (F.rows - 1)) * 100 : 0}%"></i>`; }
    return `<div class="u-face">${DS.Art.hero(hero, 'idle')}</div>`;
  }
  function cutin(hero, fx) {
    if (reduce() || typeof document === 'undefined') return wait(0);
    const fam = (DS.FX.famOf(fx) || { id: 'star' }).id, [c1, c2] = ULT_COLOR[fam] || ULT_COLOR.star;
    const d = document.createElement('div'); d.className = 'ult'; d.style.setProperty('--uc', c1); d.style.setProperty('--uc2', c2);
    const crack = Array.from({ length: 9 }, (_, i) => `${(i * 12.5).toFixed(1)},${(50 + (i % 2 ? -1 : 1) * (6 + Math.random() * 10) + (i - 4) * 4).toFixed(1)}`).join(' ');
    d.innerHTML = `<i class="u-dim"></i><div class="u-band">${faceHtml(hero)}<i class="u-eye" style="left:44%"></i><i class="u-eye" style="left:56%"></i></div><b class="u-name">${String(DS.FX.NAMES[fx] || '').replace(/^\S+\s/, '').replace(/[<>&]/g, '')}!</b><i class="u-flash"></i><div class="u-tear"><svg viewBox="0 0 100 100" preserveAspectRatio="none"><polyline points="${crack}" fill="none" stroke="#fff" stroke-width="1.6" style="filter:drop-shadow(0 0 2px ${c1})"/><polyline points="${crack}" fill="none" stroke="${c1}" stroke-width="0.5"/></svg></div>`;
    document.body.appendChild(d);
    if (DS.Sound) { DS.Sound.sample && DS.Sound.sample('special', 0.9); setTimeout(() => DS.Sound.finish && DS.Sound.finish(), 1000); }
    setTimeout(() => d.remove(), 1500);
    return wait(1050);
  }
  async function play(scene, o = {}) {
    const { heroBox, monBox } = o, hero = Number(o.hero) || 0, fx = o.fx || 'flame', reso = DS.FX && DS.FX.resonates && DS.FX.resonates(hero, fx), s = (o.s || 1.2) * (reso ? 1.15 : 1) * (o.ultimate ? 1.25 : 1);
    if (!scene || !heroBox || !monBox || !DS.FX) { if (DS.FX && !o.miss) DS.FX.play(scene, fx, { s }); return; }
    const H = rel(heroBox, scene), M = rel(monBox, scene), rest = o.rest || 'think';
    if (reso) { heroBox.classList.add('atk-reso'); setTimeout(() => heroBox.classList.remove('atk-reso'), 1400); } // ★ 공명: 친화 결정석
    if (o.ultimate) await cutin(hero, fx);
    if (isRanged(hero)) {
      setPose(heroBox, hero, 'attack');
      await wait(200);
      if (DS.Sound && DS.Sound.launch) DS.Sound.launch();
      const from = { x: H.x + H.w * 0.8, y: H.y + H.h * 0.5 }, to = { x: M.x + M.w * 0.42, y: M.y + M.h * 0.5 };
      await fly(scene, projOf(hero), from, o.miss ? { x: M.x + M.w * 0.3, y: M.y - M.h * 0.35 } : to, o.ps || s * 1.15, o.miss);
      if (!scene.isConnected) return;
      if (o.miss) { if (DS.Sound && DS.Sound.block) DS.Sound.block(); if (monBox.animate) monBox.animate([{ rotate: '0deg' }, { rotate: '-6deg' }, { rotate: '0deg' }], { duration: 300 }); }
      else await impact(scene, monBox, fx, { s, finish: o.finish, noDmg: o.noDmg });
      await wait(120);
    } else {
      const reach = Math.max(0, M.x - (H.x + H.w * 0.55));
      setPose(heroBox, hero, 'walk');
      if (DS.Sound && DS.Sound.swing) DS.Sound.swing();
      await dash(scene, heroBox, 0, reach, 230, true);
      if (!scene.isConnected) return;
      setPose(heroBox, hero, 'attack');
      await wait(110);
      if (o.miss) { if (DS.Sound && DS.Sound.block) DS.Sound.block(); knock(heroBox, -18); if (monBox.animate) monBox.animate([{ scale: '1' }, { scale: '1.08' }, { scale: '1' }], { duration: 260 }); shake(scene, 2, 120); await wait(200); }
      else await impact(scene, monBox, fx, { s, finish: o.finish, noDmg: o.noDmg });
      await wait(140);
      if (!scene.isConnected) return;
      setPose(heroBox, hero, 'walk');
      await dash(scene, heroBox, reach, 0, 220, false);
      heroBox.style.translate = '';
    }
    setPose(heroBox, hero, rest, rest === 'think' ? 'huff' : '');
  }
  const preload = (hero, fx) => { if (!DS.FX) return; DS.FX.preload(fx); const p = projOf(hero); if (p) DS.FX.preload(p); };
  // 필살기 조건: Ⅳ 전설 · 특화 스킬 + 퍼펙트(그 전투 첫 판에 하나도 안 틀리고 모두 맞힘) — 퍼펙트가 완성되는 공격에서 (2026-11-06: 「마지막 일격」 조건은 뺌)
  // 2026-11-06 사용자 「필살기 그리고 특화일 때만」: Ⅳ 전설 + 그 용사의 친화(특화) 계열 스킬일 때만
  const canUlt = (fx, hero) => !!(DS.FX && DS.FX.tierOf(fx) === 3 && DS.FX.resonates(hero, fx));
  return { projOf, isRanged, play, impact, fly, preload, shake, knock, cutin, canUlt };
})();
