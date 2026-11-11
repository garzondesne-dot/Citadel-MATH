// ⚔ 공격 이펙트 v2 (2026-11-06 · 사용자 확정): pixelfx(MIT)로 구운 도트 띠 그림을 CSS steps 로 재생한다 (tools/pfx · assets/manifest.js fx2).
//   계열 6 × 단계 4 (Ⅰ 기본 · Ⅱ 숙련 · Ⅲ 화려 · Ⅳ 전설) + 🪶 특별 2. Ⅰ · Ⅲ 은 예전 이름 그대로라 해금 · 상점 기록이 이어진다.
//   play(상자, 종류, { x, y, scale, s, floor, perfect }) → Promise (끝나면) : 상자(position: relative) 위에 띠 그림을 한 번 재생
//   still(캔버스, 종류) : 고르기 화면용 정지 그림 (가장 화려한 칸)
window.DS = window.DS || {};

DS.FX = (function () {
  const FAMS = [
    { id: 'cut', name: '⚔ 베기', ids: ['cut', 'moon', 'slash', 'twin'] },
    { id: 'smash', name: '🔨 강타', ids: ['bash', 'upper', 'hammer', 'quake'] },   // 2026-11-06 근접 계열 추가 (사용자)
    { id: 'sweep', name: '🌪 연격', ids: ['thrust', 'sweep', 'spin', 'reap'] },
    { id: 'wind', name: '🌬 바람', ids: ['wblade', 'gale', 'leaf', 'cyclone'] },  // 2026-11-06 엘프 궁수 특화 (사용자)
    { id: 'fire', name: '🔥 불', ids: ['flame', 'ring', 'fire', 'pillar'] },
    { id: 'spark', name: '⚡ 번개', ids: ['spark', 'chain', 'lightning', 'thunder'] },
    { id: 'frost', name: '❄ 얼음', ids: ['frost', 'spikes', 'ice', 'nova'] },
    { id: 'star', name: '✨ 별', ids: ['twinkle', 'mana', 'stars', 'meteor'] },
    { id: 'magic', name: '🔮 마법', ids: ['orb', 'crit', 'vortex', 'void'] },
    { id: 'math', name: '📐 수식', ids: ['ruler', 'compass', 'venn', 'qed'] },   // 2026-11-07 수식 책사(남 · 여) 특화 (사용자 「수학 도구 · 수식으로 멋지게」) · tools/pfx/custom/math-*.js
    // 🌈 #74-3 새 속성 4개 (2026-11-11 HERO-ATTR 3-4 · tools/pfx/attr_gen.py) — 이 갈래가 생기면 #84 NEXT 의 용사 8명(4 · 8 · 31 ☀ / 18 · 25 🌑 / 21 · 30 ⚙ / 13 🌊)이 저절로 새 속성이 자기 속성 · 기본 스킬
    { id: 'sun', name: '☀ 빛', ids: ['radiant', 'bulwark', 'holysword', 'skylance'] },
    { id: 'dark', name: '🌑 어둠', ids: ['shade', 'claw', 'phantom', 'eclipse'] },
    { id: 'gear', name: '⚙ 기계', ids: ['wrench', 'cog', 'piston', 'drill'] },
    { id: 'water', name: '🌊 물', ids: ['aqua', 'wave', 'anchor', 'tsunami'] },
  ];
  // 🌳 #78 합체 칸 3개 (HERO-ATTR 6 · 4번): 근접 재료 Ⅱ + 속성 재료 Ⅱ 를 다 가지면 💎 없이 열림 · 단계 Ⅱ · 공명 = 근접 재료 속성 · 그림 = 근접 재료 Ⅱ + 속성 색 궤적 + 끝에 속성 Ⅱ (#74-4 장치 ④)
  const COMBO = {
    flamecut: { fam: 'cut', base: 'moon', elem: 'fire', efx: 'ring', mats: ['moon', 'ring'] },
    boltthrust: { fam: 'sweep', base: 'sweep', elem: 'spark', efx: 'chain', mats: ['sweep', 'chain'] },
    frostsmash: { fam: 'smash', base: 'upper', elem: 'frost', efx: 'spikes', mats: ['upper', 'spikes'] },
  };
  const TIER_NAMES = ['Ⅰ 기본', 'Ⅱ 숙련', 'Ⅲ 화려', 'Ⅳ 전설'];
  const TIER_SCALE = [1, 1.15, 1.3, 1.5];                                    // Ⅰ → Ⅳ 크기 배율
  const BASE = FAMS.map((f) => f.ids[0]);                                     // Ⅰ 기본 (열림)
  const SKILL = FAMS.map((f) => f.ids[1]);                                    // Ⅱ 숙련 (💎)
  const FANCY = ['fire', 'lightning', 'ice', 'stars', 'slash', 'vortex'];    // Ⅲ 화려 — 순서 = 인장 1 · 2 · 4 · 6 · 8 · 10 (바꾸지 않음)
  const LEGEND = FAMS.map((f) => f.ids[3]);                                   // Ⅳ 전설 (💎 · 같은 계열 Ⅲ 필요)
  const ACHV = ['wings', 'smite'];                                            // 🪶 특별 (업적)
  const THIRD = FAMS.map((f) => f.ids[2]);                                   // Ⅲ 전부 (FANCY = 그중 인장으로 열리는 6개)
  const KINDS = BASE.concat(SKILL, THIRD, LEGEND, ACHV, Object.keys(COMBO));
  const NAMES = {
    cut: '⚔ 베기', moon: '⚔ 달빛 베기', slash: '⚔ 삼연 참격', twin: '⚔ 쌍월 참',
    bash: '🔨 강타', upper: '🔨 올려치기', hammer: '🔨 망치 내려치기', quake: '🔨 대지 분쇄',
    thrust: '🌪 찌르기', sweep: '🌪 휩쓸기', spin: '🌪 회전 베기', reap: '🌪 사신의 낫',
    wblade: '🌬 바람 칼날', gale: '🌬 질풍', leaf: '🌬 나뭇잎 폭풍', cyclone: '🌬 대선풍',
    flame: '🔥 불꽃', ring: '🔥 불꽃 고리', fire: '🔥 화염 폭발', pillar: '🔥 화염 기둥',
    spark: '⚡ 번개', chain: '⚡ 연쇄 번개', lightning: '⚡ 천둥 낙뢰', thunder: '⚡ 뇌명',
    frost: '❄ 얼음', spikes: '❄ 얼음 가시', ice: '❄ 얼음 파쇄', nova: '❄ 서리 폭발',
    twinkle: '✨ 별', mana: '✨ 마나 폭발', stars: '✨ 별빛 폭죽', meteor: '✨ 유성우',
    orb: '🔮 마법탄', crit: '🔮 치명 섬광', vortex: '🌀 차원 소용돌이', void: '🌀 블랙홀',
    ruler: '📐 눈금 베기', compass: '📐 컴퍼스 원', venn: '📐 벤 다이어그램', qed: '📐 증명 완료 ∎',
    wings: '🪶 황금 날개', smite: '☀ 심판의 빛',
    flamecut: '🔥 불꽃 베기', boltthrust: '⚡ 번개 찌르기', frostsmash: '❄ 얼음 강타', // 🌳 #78 합체
    radiant: '☀ 빛 베기', bulwark: '☀ 방패 강타', holysword: '☀ 성검 낙하', skylance: '☀ 천상의 창',
    shade: '🌑 그림자 베기', claw: '🌑 어둠 손톱', phantom: '🌑 그림자 분신', eclipse: '🌑 월식 참',
    wrench: '⚙ 스패너 치기', cog: '⚙ 톱니 던지기', piston: '⚙ 증기 해머', drill: '⚙ 드릴 돌파',
    aqua: '🌊 물 베기', wave: '🌊 파도 치기', anchor: '🌊 닻 내려찍기', tsunami: '🌊 해일 베기',
  };
  const famOf = (k) => FAMS.find((f) => f.ids.includes(k)) || (COMBO[k] ? FAMS.find((f) => f.id === COMBO[k].fam) : null) || null;
  // 💎 결정석 (2026-11-06 사용자 확정 C): 용사마다 결정석 1칸 · 같은 결정석을 여러 용사에 동시에 · 빼면 보관함으로 (회수, 비용 0)
  //   친화 계열 ★ = 용사마다 1개 — 친화 결정석을 끼우면 「공명」(이펙트 조금 크게 + 용사 빛) · 연출만, 데미지 · 보상 같음
  //   2026-11-06 🌬 바람 = 엘프 궁수 · 닌자 (질풍 닌자)
  //   2026-11-06 (근접 계열 2개 추가): 근접 용사는 근접 계열로 다시 짝지음 — 드워프 · 격투가 = 🔨 강타 · 창술사 · 무희 · 해적 = 🌪 연격 · 연금술사 = 🔥 불 · 성기사 = ✨ 별
  const AFFINITY = { 0: 'cut', 16: 'cut', 3: 'wind', 6: 'smash', 9: 'smash', 5: 'sweep', 10: 'sweep', 13: 'sweep', 2: 'wind', 7: 'fire', 12: 'fire', 11: 'spark', 14: 'frost', 15: 'frost', 4: 'star', 8: 'star', 1: 'magic', 17: 'math', 18: 'cut', 19: 'math', 20: 'math', 21: 'smash', 22: 'spark', 23: 'fire', 24: 'spark', 25: 'magic', 26: 'wind', 27: 'math', 28: 'math', 29: 'star', 30: 'spark', 31: 'sweep', 32: 'fire', 33: 'star' }; // 2026-11-07 새 용사: 흑기사 ⚔ · 수식 책사 남 · 여 📐 · 메카닉 🔨 · 해커 ⚡ · 용기사 🔥
  // 🧙 #84 (2026-11-11 DECISIONS 「속성 이동 = 옛 속성도 공명」): 속성이 바뀌는 용사 11명 = 옛 속성 + 새 속성 + 공통 특화 모두 공명
  //   NEXT = 새 속성(☀ sun · 🌑 dark · ⚙ gear · 🌊 water) — 그 갈래가 FAMS 에 들어오면(#74-3) 저절로 자기 속성 · 기본 스킬이 됨, 그 전에는 옛 속성(AFFINITY)
  const NEXT = { 4: 'sun', 8: 'sun', 31: 'sun', 13: 'water', 18: 'dark', 25: 'dark', 21: 'gear', 30: 'gear' };
  const OLD = { 4: 'star', 8: 'star', 13: 'sweep', 18: 'cut', 21: 'smash', 17: 'magic', 25: 'magic', 27: 'magic', 28: 'frost', 30: 'spark', 31: 'sweep' };
  const famById = (id) => FAMS.find((f) => f.id === id) || null;
  const attrOf = (hero) => { const h = Number(hero); return (NEXT[h] && famById(NEXT[h])) ? NEXT[h] : AFFINITY[h]; }; // 지금 자기 속성(갈래 id)
  const nextOf = (hero) => NEXT[Number(hero)] || null; // 새 속성 (그림이 아직 없으면 attrOf 와 다름)
  const affOf = (hero) => famById(attrOf(hero)) || FAMS[0];
  const crystalOf = (hero, socket) => { const k = (socket || {})[Number(hero)]; return KINDS.includes(k) ? k : affOf(hero).ids[0]; }; // 빈 칸 = 친화 계열 Ⅰ
  // 🤝 #74-1 공통 특화 (2026-11-11 HERO-ATTR 4절): 근접 = ⚔ 베기 · 원거리 = 🔮 마법 — 자기 속성 + 공통 특화 두 가지와 공명 (효과 같음 · 연출만)
  const COMMON = { melee: 'cut', ranged: 'magic' };
  const commonOf = (hero) => ((((window.DS || {}).ASSETS || {}).ranged || {})[Number(hero)] ? COMMON.ranged : COMMON.melee);
  const ownReso = (hero, k) => { const f = famOf(k), h = Number(hero); return !!f && (f.id === attrOf(h) || f.id === AFFINITY[h] || f.id === OLD[h] || f.id === NEXT[h]); }; // #84 옛 · 새 속성 모두
  const commonReso = (hero, k) => { const f = famOf(k); return !!f && f.id === commonOf(hero) && !ownReso(hero, k); };
  const resonates = (hero, k) => ownReso(hero, k) || commonReso(hero, k);
  const tierOf = (k) => { if (COMBO[k]) return 1; const f = famOf(k); return f ? f.ids.indexOf(k) : ACHV.includes(k) ? 's' : -1; };
  // 잠긴 이펙트를 가진 계정은 같은 계열 Ⅰ 로 (해금되면 그대로 씀)
  const BASE_OF = Object.fromEntries(KINDS.map((k) => [k, (famOf(k) || { ids: ['twinkle'] }).ids[0]]));
  const usable = (k, unlocked = {}) => (BASE.includes(k) || (KINDS.includes(k) && unlocked[k]) ? k : BASE_OF[k] || 'flame');
  const A = () => DS.ASSETS || {};
  const spec = (k) => ((A().fx2 || {}).fx || {})[k] || (COMBO[k] ? ((A().fx2 || {}).fx || {})[COMBO[k].base] || null : null);
  const url = (sp) => `${A().base || 'assets/art/'}${sp.src}`;
  const imgs = {};
  const load = (sp) => { const u = url(sp); if (!imgs[u]) { const im = new Image(); im.src = u; imgs[u] = im; } return imgs[u]; };
  const preload = (ks) => [].concat(ks || []).forEach((k) => { const sp = spec(k) || ((A().fx2 || {}).proj || {})[k]; if (sp) load(sp); });
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  // 🔲 #33 도트 패치 (2026-11-09): 배율 = 0.25 단위 · 자리 · 칸 크기 = 정수 픽셀 → 도트가 번지거나 1px 흔들리지 않고 옆 칸이 비치지 않음
  const q4 = (s) => Math.max(0.25, Math.round(s * 4) / 4);
  const px = (v) => Math.round(v);

  // 띠 그림 하나를 상자 위에 (x, y = 맞는 점). sp = 칸 정보, s = 화면 배율. 돌려주는 값: 요소 (끝나면 저절로 지워짐)
  function strip(box, sp, x, y, s, opt = {}) {
    const el = document.createElement('i'); el.className = 'fx-spr' + (opt.loop ? ' loop' : '');
    s = q4(s); const W = px(sp.w * s), H = px(sp.h * s), dur = sp.n / sp.fps;
    el.style.cssText = `left:${px(x - sp.px * s)}px;top:${px(y - sp.py * s)}px;width:${W}px;height:${H}px;background-image:url('${url(sp)}');background-size:${W * sp.n}px ${H}px;--fx-end:${-W * sp.n}px;animation-duration:${dur.toFixed(3)}s;animation-timing-function:steps(${sp.n});${opt.z ? `z-index:${opt.z};` : ''}`;
    load(sp); box.appendChild(el);
    if (!opt.loop) setTimeout(() => el.remove(), dur * 1000 + 80);
    return el;
  }
  // 🎯 자리 잡기 v3 (2026-11-08 사용자 「바닥 기술이 몸통 · 머리에서 터짐 · 묶기가 몸 밖으로 · 마력탄은 손에서」):
  //   그림의 「보이는 부분」(배치표 fxbb · tools/pfx/measure_bb.py) 을 몬스터 「보이는 몸통」(bodies) 에 맞춘다
  //   ground = 보이는 아래끝을 발끝에 · body = 보이는 가운데를 몸통 가운데에 · shot = 손 → 몸통까지 늘이고 기울여 쏨
  const GROUND = ['flame', 'ring', 'fire', 'pillar', 'lightning', 'thunder', 'frost', 'spikes', 'ice', 'nova', 'mana', 'meteor', 'vortex', 'void', 'smite', 'hammer', 'quake', 'cyclone', 'leaf'];
  const SHOT = ['orb', 'chain'];
  const modeOf = (k) => (SHOT.includes(k) ? 'shot' : GROUND.includes(k) ? 'ground' : 'body');
  const bbOf = (k, sp) => ((A().fxbb || {})[k]) || [0, 0, sp.w, sp.h];
  // 상자에 띠 그림 (왼쪽 위 · 가로 · 세로 배율 따로 · 돌림)
  function stripXY(box, sp, left, top, sx, sy, opt = {}) {
    const el = document.createElement('i'); el.className = 'fx-spr';
    const W = px(sp.w * sx), H = px(sp.h * sy), dur = sp.n / sp.fps;
    el.style.cssText = `left:${px(left)}px;top:${px(top)}px;width:${W}px;height:${H}px;background-image:url('${url(sp)}');background-size:${W * sp.n}px ${H}px;--fx-end:${-W * sp.n}px;animation-duration:${dur.toFixed(3)}s;animation-timing-function:steps(${sp.n});z-index:${opt.z || 20};${opt.rot ? `transform-origin:${opt.ox.toFixed(1)}px ${opt.oy.toFixed(1)}px;transform:rotate(${opt.rot.toFixed(3)}rad);` : opt.flip ? 'transform:scaleX(-1);' : ''}`; // flip = 왼쪽으로 가로지르기
    load(sp); box.appendChild(el); setTimeout(() => el.remove(), dur * 1000 + 80);
    return el;
  }
  // place(상자, 종류, { body: {x0,y0,x1,y1} (상자 기준 px), from: {x,y} (shot 손 자리), mult, perfect, flat, mode }) → Promise(끝나면)
  function place(box, kind, o = {}) {
    if (!box) return Promise.resolve();
    if (!KINDS.includes(kind) && !spec(kind)) kind = 'flame';
    const sp = spec(kind), B = o.body; if (!sp || !B) return play(box, kind, o);
    if (getComputedStyle(box).position === 'static') box.style.position = 'relative';
    const bb = bbOf(kind, sp), bw = Math.max(1, bb[2] - bb[0]), bh = Math.max(1, bb[3] - bb[1]), bcx = (bb[0] + bb[2]) / 2, bcy = (bb[1] + bb[3]) / 2;
    const w = B.x1 - B.x0, h = B.y1 - B.y0, cx = (B.x0 + B.x1) / 2, cy = (B.y0 + B.y1) / 2, mode = o.mode || modeOf(kind);
    const t = tierOf(kind), tier = o.flat ? 1 : t === 's' ? TIER_SCALE[3] : TIER_SCALE[t] || 1, mult = (o.mult || 1) * (o.perfect ? 1.15 : 1);
    // 크기: 몸통 폭에 맞춤 (바닥 기술은 조금 넓게) · 키는 몸통의 1.4배(바닥 1.9배)를 넘지 않게
    let s = Math.min((w * (mode === 'ground' ? 1.15 : 1)) / bw, (h * (mode === 'ground' ? 1.9 : 1.4)) / bh);
    s = q4(clamp(s * tier * mult, 0.6, 8)); // #33 0.25 단위
    let el;
    if (mode === 'shot' && o.from) {
      const tx = sp.tx || bb[2], hit = { x: cx - w * 0.12, y: cy }, dx = hit.x - o.from.x, dy = hit.y - o.from.y, L = Math.max(20, Math.hypot(dx, dy));
      const sx = L / Math.max(10, tx - sp.px), sy = q4(clamp(Math.min(s, sx * 1.4), 0.6, 8)); // 길이(sx)는 몸통까지 닿게 그대로
      el = stripXY(box, sp, o.from.x - sp.px * sx, o.from.y - bcy * sy, sx, sy, { z: 21, rot: Math.atan2(dy, dx), ox: sp.px * sx, oy: bcy * sy });
    } else if (!o.mode && (sp.mm === 'cross' || sp.mm === 'cross-wide')) {
      // ⚔ #74-2 가로지르기 (HERO-ATTR 3-2 ②): 용사 쪽에서 몬스터를 지나 뒤까지 긴 선 · 폭 = 몸통 2.4배(장면 90% 까지) · 키 = 몸통 1.2배 (넓게 = 1.9배)
      const R = box.getBoundingClientRect(), dir = o.dir || 1, sx = Math.min(w * 2.4, R.width * 0.9) / bw, sy = q4(clamp(Math.min(sx, (h * (sp.mm === 'cross' ? 1.2 : 1.9)) / bh) * tier * mult, 0.6, 8));
      const left = clamp(cx + dir * w * 0.2 - (bw * sx) / 2 - bb[0] * sx, -bb[0] * sx, R.width - bb[2] * sx);
      el = stripXY(box, sp, left, cy - bcy * sy, sx, sy, { flip: dir < 0 });
    } else if (!o.mode && (sp.mm === 'drop' || sp.mm === 'drop-wide')) { // ⚔ #74-2 내려찍기: 화면 위에서 발끝까지 떨어짐 (띠 아래 = 몬스터 발끝) · 넓게 = 몸통 2.2배
      const sd = q4(clamp(Math.min((w * (sp.mm === 'drop' ? 1.3 : 2.2)) / bw, (B.y1 * 0.95) / Math.max(1, bb[3])) * tier * mult, 0.6, 8));
      el = stripXY(box, sp, cx - bcx * sd, B.y1 - bb[3] * sd, sd, sd);
    } else if (!o.mode && sp.mm === 'wide') { // 넓게: 몸통 폭 2배 · 키 1.9배까지
      const s2 = q4(clamp(Math.min((w * 2) / bw, (h * 1.9) / bh) * tier * mult, 0.6, 8)); el = stripXY(box, sp, cx - bcx * s2, cy - bcy * s2, s2, s2);
    } else if (mode === 'ground') el = stripXY(box, sp, cx - bcx * s, B.y1 + h * 0.03 - bb[3] * s, s, s);
    else el = stripXY(box, sp, cx - bcx * s, cy - bcy * s, s, s);
    return new Promise((res) => setTimeout(() => res(el), (sp.n / sp.fps) * 1000));
  }
  // 이펙트 한 번: 손에서 쏘는 것(tx)은 맞는 곳이 x 에 오도록 왼쪽으로, 바닥에 서는 것은 floor 에
  function play(box, kind, opt = {}) {
    if (!box) return Promise.resolve();
    if (!KINDS.includes(kind) && !spec(kind)) kind = 'flame'; // 스킬 + 배치표에만 있는 연출(⛓ bind · bind2)
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
    const S = A().fxStills, si = S && S.idx ? S.idx[kind] : null; // ⚔ #73-5 정지 그림표 한 장 (큰 띠 그림을 안 받음)
    if (cv && si != null) { const g = cv.getContext('2d'), im = load(S); const drawS = () => { g.clearRect(0, 0, cv.width, cv.height); g.imageSmoothingEnabled = false; const k = Math.min(cv.width / S.w, cv.height / S.h); g.drawImage(im, (si % S.cols) * S.w, Math.floor(si / S.cols) * S.h, S.w, S.h, (cv.width - S.w * k) / 2, (cv.height - S.h * k) / 2, S.w * k, S.h * k); }; if (im.complete && im.naturalWidth) drawS(); else im.addEventListener('load', drawS, { once: true }); return; }
    const sp = spec(kind); if (!sp || !cv) return;
    const g = cv.getContext('2d'), im = load(sp), i = sp.pk ?? Math.min(sp.n - 1, Math.floor(sp.n * 0.38));
    const drawIt = () => { g.clearRect(0, 0, cv.width, cv.height); g.imageSmoothingEnabled = false; const k = Math.min(cv.width / sp.w, cv.height / sp.h); g.drawImage(im, i * sp.w, 0, sp.w, sp.h, (cv.width - sp.w * k) / 2, (cv.height - sp.h * k) / 2, sp.w * k, sp.h * k); };
    if (im.complete && im.naturalWidth) drawIt(); else im.addEventListener('load', drawIt, { once: true });
  }
  return { q4, place, modeOf, GROUND, SHOT, FAMS, TIER_NAMES, TIER_SCALE, AFFINITY, NEXT, OLD, COMBO, attrOf, nextOf, affOf, crystalOf, resonates, ownReso, commonReso, commonOf, COMMON, KINDS, BASE, SKILL, FANCY, LEGEND, ACHV, NAMES, BASE_OF, famOf, tierOf, usable, spec, strip, play, still, preload, load };
})();
