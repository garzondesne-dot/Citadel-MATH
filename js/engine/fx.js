// ⚔ 공격 이펙트 v2 (2026-11-06 · 사용자 확정): pixelfx(MIT)로 구운 도트 띠 그림을 CSS steps 로 재생한다 (tools/pfx · assets/manifest.js fx2).
//   계열 6 × 단계 4 (Ⅰ 기본 · Ⅱ 숙련 · Ⅲ 화려 · Ⅳ 전설) + 🪶 특별 2. Ⅰ · Ⅲ 은 예전 이름 그대로라 해금 · 상점 기록이 이어진다.
//   play(상자, 종류, { x, y, scale, s, floor, perfect }) → Promise (끝나면) : 상자(position: relative) 위에 띠 그림을 한 번 재생
//   still(캔버스, 종류) : 고르기 화면용 정지 그림 (가장 화려한 칸)
window.DS = window.DS || {};

DS.FX = (function () {
  const FAMS = [
    { id: 'cut', name: '⚔ 베기', ids: ['cut', 'moon', 'slash', 'twin'] },
    { id: 'fire', name: '🔥 불', ids: ['flame', 'ring', 'fire', 'pillar'] },
    { id: 'spark', name: '⚡ 번개', ids: ['spark', 'chain', 'lightning', 'thunder'] },
    { id: 'frost', name: '❄ 얼음', ids: ['frost', 'spikes', 'ice', 'nova'] },
    { id: 'star', name: '✨ 별', ids: ['twinkle', 'mana', 'stars', 'meteor'] },
    { id: 'magic', name: '🔮 마법', ids: ['orb', 'crit', 'vortex', 'void'] },
  ];
  const TIER_NAMES = ['Ⅰ 기본', 'Ⅱ 숙련', 'Ⅲ 화려', 'Ⅳ 전설'];
  const TIER_SCALE = [1, 1.15, 1.3, 1.5];                                    // Ⅰ → Ⅳ 크기 배율
  const BASE = FAMS.map((f) => f.ids[0]);                                     // Ⅰ 기본 (열림)
  const SKILL = FAMS.map((f) => f.ids[1]);                                    // Ⅱ 숙련 (💎)
  const FANCY = ['fire', 'lightning', 'ice', 'stars', 'slash', 'vortex'];    // Ⅲ 화려 — 순서 = 인장 1 · 2 · 4 · 6 · 8 · 10 (바꾸지 않음)
  const LEGEND = FAMS.map((f) => f.ids[3]);                                   // Ⅳ 전설 (💎 · 같은 계열 Ⅲ 필요)
  const ACHV = ['wings', 'smite'];                                            // 🪶 특별 (업적)
  const KINDS = BASE.concat(SKILL, FANCY, LEGEND, ACHV);
  const NAMES = {
    cut: '⚔ 베기', moon: '⚔ 달빛 베기', slash: '⚔ 삼연 참격', twin: '⚔ 쌍월 참',
    flame: '🔥 불꽃', ring: '🔥 불꽃 고리', fire: '🔥 화염 폭발', pillar: '🔥 화염 기둥',
    spark: '⚡ 번개', chain: '⚡ 연쇄 번개', lightning: '⚡ 천둥 낙뢰', thunder: '⚡ 뇌명',
    frost: '❄ 얼음', spikes: '❄ 얼음 가시', ice: '❄ 얼음 파쇄', nova: '❄ 서리 폭발',
    twinkle: '✨ 별', mana: '✨ 마나 폭발', stars: '✨ 별빛 폭죽', meteor: '✨ 유성우',
    orb: '🔮 마법탄', crit: '🔮 치명 섬광', vortex: '🌀 차원 소용돌이', void: '🌀 블랙홀',
    wings: '🪶 황금 날개', smite: '☀ 심판의 빛',
  };
  const famOf = (k) => FAMS.find((f) => f.ids.includes(k)) || null;
  const tierOf = (k) => { const f = famOf(k); return f ? f.ids.indexOf(k) : ACHV.includes(k) ? 's' : -1; };
  // 잠긴 이펙트를 가진 계정은 같은 계열 Ⅰ 로 (해금되면 그대로 씀)
  const BASE_OF = Object.fromEntries(KINDS.map((k) => [k, (famOf(k) || { ids: ['twinkle'] }).ids[0]]));
  const usable = (k, unlocked = {}) => (BASE.includes(k) || (KINDS.includes(k) && unlocked[k]) ? k : BASE_OF[k] || 'flame');
  const A = () => DS.ASSETS || {};
  const spec = (k) => ((A().fx2 || {}).fx || {})[k] || null;
  const url = (sp) => `${A().base || 'assets/art/'}${sp.src}`;
  const imgs = {};
  const load = (sp) => { const u = url(sp); if (!imgs[u]) { const im = new Image(); im.src = u; imgs[u] = im; } return imgs[u]; };
  const preload = (ks) => [].concat(ks || []).forEach((k) => { const sp = spec(k) || ((A().fx2 || {}).proj || {})[k]; if (sp) load(sp); });
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // 띠 그림 하나를 상자 위에 (x, y = 맞는 점). sp = 칸 정보, s = 화면 배율. 돌려주는 값: 요소 (끝나면 저절로 지워짐)
  function strip(box, sp, x, y, s, opt = {}) {
    const el = document.createElement('i'); el.className = 'fx-spr' + (opt.loop ? ' loop' : '');
    const W = sp.w * s, H = sp.h * s, dur = sp.n / sp.fps;
    el.style.cssText = `left:${(x - sp.px * s).toFixed(1)}px;top:${(y - sp.py * s).toFixed(1)}px;width:${W.toFixed(1)}px;height:${H.toFixed(1)}px;background-image:url('${url(sp)}');background-size:${(W * sp.n).toFixed(1)}px ${H.toFixed(1)}px;--fx-end:${(-W * sp.n).toFixed(1)}px;animation-duration:${dur.toFixed(3)}s;animation-timing-function:steps(${sp.n});${opt.z ? `z-index:${opt.z};` : ''}`;
    load(sp); box.appendChild(el);
    if (!opt.loop) setTimeout(() => el.remove(), dur * 1000 + 80);
    return el;
  }
  // 이펙트 한 번: 손에서 쏘는 것(tx)은 맞는 곳이 x 에 오도록 왼쪽으로, 바닥에 서는 것은 floor 에
  function play(box, kind, opt = {}) {
    if (!box) return Promise.resolve();
    if (!KINDS.includes(kind)) kind = 'flame';
    const sp = spec(kind); if (!sp) return Promise.resolve();
    const r = box.getBoundingClientRect();
    if (getComputedStyle(box).position === 'static') box.style.position = 'relative';
    const x = opt.x ?? r.width / 2, y = opt.y ?? r.height / 2;
    // 예전 scale(캔버스 배율, 0.18 ~ 1.5) → 도트 배율 (0.6 ~ 3)
    let s = opt.s || clamp((opt.scale || Math.min(r.width, r.height) / 520) / 0.3, 0.6, 3);
    if (opt.perfect) s *= 1.2;
    if (!opt.flat) { const t = tierOf(kind); s *= t === 's' ? TIER_SCALE[3] : TIER_SCALE[t] || 1; } // 단계가 높을수록 크게 (2026-11-06 사용자)
    const floor = opt.floor ?? y + 22 * s, ground = !sp.tx && sp.py / sp.h > 0.7;
    const el = strip(box, sp, sp.tx ? x - sp.tx * s : x, sp.tx || ground ? floor : y, s, { z: 20 });
    return new Promise((res) => setTimeout(() => res(el), (sp.n / sp.fps) * 1000));
  }
  function still(cv, kind) {
    const sp = spec(kind); if (!sp || !cv) return;
    const g = cv.getContext('2d'), im = load(sp), i = sp.pk ?? Math.min(sp.n - 1, Math.floor(sp.n * 0.38));
    const drawIt = () => { g.clearRect(0, 0, cv.width, cv.height); g.imageSmoothingEnabled = false; const k = Math.min(cv.width / sp.w, cv.height / sp.h); g.drawImage(im, i * sp.w, 0, sp.w, sp.h, (cv.width - sp.w * k) / 2, (cv.height - sp.h * k) / 2, sp.w * k, sp.h * k); };
    if (im.complete && im.naturalWidth) drawIt(); else im.addEventListener('load', drawIt, { once: true });
  }
  return { FAMS, TIER_NAMES, TIER_SCALE, KINDS, BASE, SKILL, FANCY, LEGEND, ACHV, NAMES, BASE_OF, famOf, tierOf, usable, spec, strip, play, still, preload, load };
})();
