// 🏰 5분 타워 디펜스 (v0.9.14 · 2026-11-07 사용자 「진행」 · 설계 = docs/DECISIONS.md 2026-11-07)
//   쉼터 놀이 하나 (fun.kind = 'td') · 학생 한 명 = 타워 · 자리 고르기 40초(선착순 · 한 번) → 웨이브 5 → 결과
//   여기서만 레벨 · 강화 · 스킬이 진짜 힘 (레이드 공정 규칙의 예외 공간) · 보상은 모두 같게
//   계산(시뮬레이션)과 그림은 교실 TV(종합상황실) 한 대 · 학생 폰은 자리 · 판 안 업그레이드 · 기술만 보냄
//   이 파일 위쪽 = 순수 계산 (node 시험 tests/td.test.js) · 아래쪽 = 화면
window.DS = window.DS || {};

DS.TD = (function () {
  const M = () => DS.TDMaps;
  // ── 숫자 (확정안) ──────────────────────────────────────
  const PICK_MS = 40000, DT = 0.05, WAVE_AT = [0, 36, 72, 108, 144], LIMIT = 225, LIFE = 30, WALK = 26, DENSE = 1.7; // 🌊 2026-11-09 선생님 「줄지어 · 속도는 늦어도 물량이 밀어닥치게」: 수 × 1.7 · 한 마리 체력 ÷ 1.7 · 걷기 22 → 26초 (난이도는 판마다 calibrate 가 맞춤) // 보통 몬스터가 길을 다 걷는 시간(초)
  const STARS_AT = [5, 14, 26, 43], /* 수 × 1.7 → 업그레이드 속도 그대로 (옛 3 · 8 · 15 · 25) */ TERRAIN = 1.2, RESO = 1.1, MELEE = { range: 1.6, dmg: 1.3 }, RANGED = { range: 3, dmg: 1 };
  const UP = { a: { atk: 0.25 }, b: { rate: 0.2 }, c: { tier: 1 } }; // ⚔ 공격 · ⚡ 속도 · ✨ 특기 (한 판 하고 끝)
  // 🏰 개편 A (2026-11-08): 몬스터 떼 = 한 마리 체력 ↓ · 수 3배 · t = 🪨 골렘(단단 · 근접이 막으면 2칸 차지) · v = 🦇 박쥐(날아다님 = 원거리만 때림 · 근접이 못 막음)
  const TYPES = { n: { hp: 0.21, sp: 1, leak: 1, star: 1 }, f: { hp: 0.13, sp: 1.6, leak: 1, star: 1 }, t: { hp: 0.82, sp: 0.55, leak: 2, star: 2, heavy: true }, v: { hp: 0.15, sp: 1.25, leak: 1, star: 1, fly: true }, /* 한 마리 체력 ÷ 1.7 (옛 0.35 · 0.22 · 1.4 · 0.25) */ m: { hp: 3, sp: 0.7, leak: 3, star: 5, boss: true, heavy: true }, b: { hp: 10, sp: 0.5, leak: 5, star: 10, boss: true, heavy: true } };
  const WAVES = [['n', 30], ['n', 30, 'f', 10, 'v', 6], ['n', 26, 't', 8, 'v', 8], ['n', 20, 'f', 10, 't', 8, 'v', 8, 'm', 2], ['b', 1, 'n', 18, 'f', 8, 't', 8, 'v', 8]];
  const BLOCK = { r: 0.75, cap: 3 }; // ⛔ 근접 용사: 몸에 닿은(0.75칸) 땅 몬스터를 3칸만큼 붙잡음 (골렘 · 보스 = 2칸)
  // 계열 특기 (단계 0~4 = Ⅰ Ⅱ Ⅲ Ⅳ + ✨ 업그레이드 한 칸)
  const FAM = {
    cut: { dmg: [0.2, 0.3, 0.4, 0.5, 0.6] }, smash: { stun: [0.2, 0.35, 0.5, 0.7, 0.9] }, sweep: { splash: [0.5, 0.7, 0.9, 1.1, 1.3] },
    wind: { knock: [0.3, 0.5, 0.7, 0.9, 1.1] }, fire: { burn: [0.15, 0.2, 0.25, 0.3, 0.35] }, spark: { chain: [1, 2, 3, 4, 5] },
    frost: { slow: [0.15, 0.25, 0.35, 0.45, 0.55] }, star: { crit: [0.1, 0.15, 0.2, 0.25, 0.3] }, magic: { boss: [0.2, 0.3, 0.4, 0.5, 0.6] },
    math: { proof: [0.1, 0.13, 0.16, 0.2, 0.24] }, // 📐 증명: 같은 몬스터를 연달아 맞힐 때마다 +% (3번까지 쌓임 · 2026-11-07)
  };
  const HP_K = 0.42; // 몬스터 체력 계수 (tests/td.test.js 로 이길 확률 ≈ 70% 에 맞춤)
  // ── 시드 무작위 ────────────────────────────────────────
  const rng = (seed) => { let a = 0; for (const ch of String(seed)) a = (Math.imul(a ^ ch.charCodeAt(0), 2654435761) >>> 0); return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  // ── 타워 능력치 (내 성장) ───────────────────────────────
  // p = { lv, enh, hero, fx } · ranged = 원거리 용사 · map = 지형 보너스 계열
  function towerOf(p, map, ranged) {
    const fam = (DS.FX && DS.FX.famOf(p.fx)) || null, famId = fam ? fam.id : 'cut', t0 = DS.FX ? DS.FX.tierOf(p.fx) : 0, tier = typeof t0 === 'number' && t0 >= 0 ? t0 : 3;
    const reso = !!(DS.FX && DS.FX.resonates && DS.FX.resonates(Number(p.hero) || 0, p.fx)), K = ranged ? RANGED : MELEE;
    return { atk: 10 + 2 * (Number(p.lv) || 1), rate: 0.8 + 0.08 * Math.min(10, Number(p.enh) || 0), range: K.range, dmgK: K.dmg * (reso ? RESO : 1), reso, fam: famId, tier, terr: map && map.tile === famId ? TERRAIN : 1, ranged: !!ranged };
  }
  const dps = (T) => T.atk * T.dmgK * T.rate;
  // ── 판 만들기 ──────────────────────────────────────────
  // opt = { map, seed, towers: [{ uid, slot, p:{lv,enh,hero,fx}, ranged, teacher }] }
  function create(opt) {
    const map = opt.map, paths = map.paths, plen = paths.map((p) => M().pathLen(p)), avgLen = plen.reduce((a, b) => a + b, 0) / plen.length;
    const slots = M().slots(map), endP = M().end(map), sp = avgLen / WALK;
    const towers = opt.towers.map((t) => { const s = t.teacher ? { x: endP[0] - 0.9 * Math.sign(endP[0] - 8 || 1), y: endP[1] + (endP[1] > 4.5 ? -1 : 1) } : slots[(t.slot || 1) - 1] || slots[0];
      const T = towerOf(t.p || {}, map, t.ranged); return Object.assign(T, { uid: t.uid, slot: t.slot, x: s.x, y: s.y, teacher: !!t.teacher, cover: M().cover(map, s.x, s.y, T.range), cd: 0, hits: 0, kills: 0, stars: 0, dmg: 0, blocks: 0, shotAt: -9, ups: [], upGot: 0, awake: false }); });
    // 몬스터 체력 = 반 타워들이 혼자 걷는 몬스터 한 마리에 줄 수 있는 피해 × 계수 (인원 · 레벨 · 강화 · 자리 · 지형이 모두 들어감)
    const power = towers.reduce((a, T) => a + dps(T) * (1 + 0.15 * T.tier) * T.terr * Math.min(T.cover, avgLen) / sp, 0);
    const students = towers.filter((T) => !T.teacher).length, few = Math.max(0.45, Math.min(1, students / 12));
    const hp0 = opt.hp0 || Math.max(30, HP_K * power / Math.max(0.6, few * 1.4)); // 실제로는 calibrate() 로 정함
    const R = rng(opt.seed || 1), spawns = [];
    WAVES.forEach((w, wi) => { const list = []; for (let i = 0; i < w.length; i += 2) for (let k = 0; k < Math.max(w[i] === 'b' || w[i] === 'm' ? w[i + 1] : 1, Math.round(w[i + 1] * few * (w[i] === 'b' || w[i] === 'm' ? 1 : 1 + (DENSE - 1) * few))); k++) list.push(w[i]); { const head = w[0] === 'b' ? list.shift() : null; list.sort(() => R() - 0.5); if (head) list.unshift(head); } // 👑 보스는 마지막 웨이브 맨 앞 (느려서 · 시간 안에 끝나게)
      { const G = 6, ng = Math.ceil(list.length / G), gap = 26 / Math.max(3, ng); list.forEach((ty, i) => { const gi = Math.floor(i / G); spawns.push({ at: WAVE_AT[wi] + 1 + gi * gap + (i % G) * 0.3, ty, wave: wi + 1, path: gi % paths.length }); }); } }); // 🚂 줄지어 (2026-11-09): 6마리씩 바짝 붙어 한 줄로 → 다음 줄 · 줄마다 길을 번갈아
    return { map, paths, plen, sp, hp0, towers, spawns, si: 0, mons: [], t: 0, life: LIFE, wave: 1, shield: 0, cheerUntil: 0, petriUntil: 0, nid: 0, fx: [], done: false, win: false, leaks: 0, R, log: [] };
  }
  const posAt = (S, path, d) => { const p = S.paths[path]; let r = d; for (let i = 1; i < p.length; i++) { const L = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); if (r <= L) { const k = r / (L || 1); return [p[i - 1][0] + k * (p[i][0] - p[i - 1][0]), p[i - 1][1] + k * (p[i][1] - p[i - 1][1])]; } r -= L; } return p[p.length - 1]; };
  // ── 행동 (폰 · 교사) ───────────────────────────────────
  function upgrade(S, uid, k) { const T = S.towers.find((x) => x.uid === uid); if (!T || T.ups.length >= T.upGot || !UP[k]) return false; T.ups.push(k); if (k === 'a') T.atk *= 1 + UP.a.atk; if (k === 'b') T.rate *= 1 + UP.b.rate; if (k === 'c') T.tier = Math.min(4, T.tier + 1); if (T.ups.length === 4 && T.ups.slice(0, 3).every((x) => x === T.ups[0])) { T.awake = true; T.range += 1; } return true; }
  const pending = (T) => T.upGot - T.ups.length;
  function skill(S, uid) { // 학생 한 판 1번: 주변 2칸 광역 × 3 · Ⅲ↑ × 5 (필살기) · 특화 Ⅳ = 모든 몬스터 3초 석화
    const T = S.towers.find((x) => x.uid === uid); if (!T || T.used) return null; T.used = true;
    const big = T.tier >= 2, tru = T.tier >= 3 && T.reso;
    S.mons.forEach((m) => { if (!m.dead && Math.hypot(m.x - T.x, m.y - T.y) <= 2.2) hit(S, T, m, T.atk * (big ? 5 : 3), true); });
    if (tru) S.petriUntil = S.t + 3;
    S.fx.push({ k: tru ? 'true' : big ? 'ult' : 'skill', x: T.x, y: T.y, t: S.t, uid });
    return tru ? 'true' : big ? 'ult' : 'skill';
  }
  const shieldOn = (S) => { if (S.shieldUsed) return false; S.shieldUsed = true; S.shield = 3; S.fx.push({ k: 'shield', t: S.t }); return true; };
  const cheer = (S) => { if ((S.cheered || {})[S.wave]) return false; (S.cheered = S.cheered || {})[S.wave] = true; S.cheerUntil = S.t + 5; S.fx.push({ k: 'cheer', t: S.t }); return true; };
  // ── 한 걸음 (DT 초) ────────────────────────────────────
  function hit(S, T, m, dmg, noFx) {
    if (m.dead) return;
    const F = FAM[T.fam] || {}, ti = Math.min(4, T.tier), tk = T.terr;
    if (F.dmg) dmg *= 1 + F.dmg[ti] * tk;
    if (F.boss && TYPES[m.ty].boss) dmg *= 1 + F.boss[ti] * tk;
    if (F.proof && !noFx) { T.stk = T.last === m ? Math.min(3, (T.stk || 0) + 1) : 0; T.last = m; dmg *= 1 + F.proof[ti] * tk * T.stk; }
    if (F.crit && S.R() < F.crit[ti] * tk) { dmg *= 2; if (!noFx) S.fx.push({ k: 'crit', x: m.x, y: m.y, t: S.t }); }
    m.hp -= dmg; T.dmg += dmg;
    if (!noFx) S.fx.push({ k: 'dmg', x: m.x, y: m.y, v: Math.max(1, Math.round(dmg)), t: S.t }); // 💥 데미지 숫자 (2026-11-09 선생님)
    if (F.slow) { m.slow = Math.max(m.slow || 0, F.slow[ti] * tk); m.slowUntil = S.t + 1.5; }
    if (F.burn) { m.burn = Math.max(m.burn || 0, T.atk * F.burn[ti] * tk); m.burnUntil = S.t + 2; m.burnBy = T; }
    if (F.stun && T.hits % 3 === 0) m.stunUntil = S.t + F.stun[ti] * tk;
    if (F.knock && T.hits % 2 === 0) m.d = Math.max(0, m.d - F.knock[ti] * tk * (TYPES[m.ty].boss ? 0.5 : 1));
    if (m.hp <= 0) { m.dead = true; T.kills++; T.stars += TYPES[m.ty].star; while (T.upGot < STARS_AT.length && T.stars >= STARS_AT[T.upGot]) T.upGot++; }
  }
  function step(S) {
    if (S.done) return S;
    S.t += DT;
    while (S.si < S.spawns.length && S.spawns[S.si].at <= S.t) { const s = S.spawns[S.si++], ty = TYPES[s.ty]; const [x, y] = posAt(S, s.path, 0); S.mons.push({ id: ++S.nid, ty: s.ty, hp: S.hp0 * ty.hp, max: S.hp0 * ty.hp, d: 0, path: s.path, x, y, wave: s.wave }); S.wave = Math.max(S.wave, s.wave); }
    const petri = S.t < S.petriUntil;
    S.mons.forEach((m) => {
      if (m.dead) return;
      if (m.burnUntil > S.t && m.burn) { m.hp -= m.burn * DT; if (m.burnBy) m.burnBy.dmg += m.burn * DT; if (m.hp <= 0) { m.dead = true; const T = m.burnBy; if (T) { T.kills++; T.stars += TYPES[m.ty].star; while (T.upGot < STARS_AT.length && T.stars >= STARS_AT[T.upGot]) T.upGot++; } return; } }
      if (petri || m.stunUntil > S.t) return;
      if (m.blockBy) { const B = m.blockBy; if (Math.hypot(m.x - B.x, m.y - B.y) <= BLOCK.r + 0.15) return; m.blockBy = null; } // ⛔ 막힌 몬스터는 멈춤
      const v = S.sp * TYPES[m.ty].sp * (m.slowUntil > S.t ? 1 - (m.slow || 0) : 1);
      m.d += v * DT; const [x, y] = posAt(S, m.path, m.d); m.x = x; m.y = y;
      if (m.d >= S.plen[m.path]) { m.dead = true; m.leaked = true; if (S.shield > 0) { S.shield--; S.fx.push({ k: 'block', t: S.t }); } else { S.life -= TYPES[m.ty].leak; S.leaks++; } }
    });
    // ⛔ 근접 용사가 닿은 땅 몬스터를 붙잡음 (앞선 몬스터부터 · 용사마다 3칸)
    const held = new Map(); S.mons.forEach((m) => { if (!m.dead && m.blockBy) held.set(m.blockBy, (held.get(m.blockBy) || 0) + (TYPES[m.ty].heavy ? 2 : 1)); });
    S.mons.filter((m) => !m.dead && !m.blockBy && !TYPES[m.ty].fly).sort((a, b) => b.d - a.d).forEach((m) => {
      const w = TYPES[m.ty].heavy ? 2 : 1, T = S.towers.find((T) => !T.ranged && (held.get(T) || 0) + w <= BLOCK.cap && Math.hypot(m.x - T.x, m.y - T.y) <= BLOCK.r);
      if (T) { m.blockBy = T; held.set(T, (held.get(T) || 0) + w); T.blocks++; }
    });
    S.mons.forEach((m) => { if (m.dead && m.blockBy) m.blockBy = null; });
    const cheerK = S.t < S.cheerUntil ? 1.2 : 1;
    S.towers.forEach((T) => {
      T.cd -= DT * cheerK; if (T.cd > 0) return;
      let best = null; S.mons.forEach((m) => { if (!m.dead && (T.ranged || !TYPES[m.ty].fly) && Math.hypot(m.x - T.x, m.y - T.y) <= T.range && (!best || (best.blockBy === T) < (m.blockBy === T) || ((best.blockBy === T) === (m.blockBy === T) && m.d > best.d))) best = m; }); // 근접 = 박쥐 못 때림 · 내가 막은 몬스터 먼저
      if (!best) return;
      T.cd = 1 / T.rate; T.hits++; T.shotAt = S.t; T.tx = best.x; // ↔ 마지막으로 친 몬스터 쪽을 봄
      const F = FAM[T.fam] || {}, ti = Math.min(4, T.tier), dmg = T.atk * T.dmgK;
      hit(S, T, best, dmg);
      if (F.splash) S.mons.forEach((m) => { if (m !== best && !m.dead && (T.ranged || !TYPES[m.ty].fly) && Math.hypot(m.x - best.x, m.y - best.y) <= F.splash[ti] * T.terr) hit(S, T, m, dmg * 0.5, true); });
      if (F.chain) { let from = best, left = Math.round(F.chain[ti] * T.terr), d2 = dmg; const seen = new Set([best]); while (left-- > 0) { d2 *= 0.7; let nx = null; S.mons.forEach((m) => { if (!m.dead && !seen.has(m) && Math.hypot(m.x - from.x, m.y - from.y) <= 1.5 && (!nx || m.d > nx.d)) nx = m; }); if (!nx) break; seen.add(nx); hit(S, T, nx, d2, true); from = nx; } }
      S.fx.push({ k: 'shot', fam: T.fam, x0: T.x, y0: T.y, x1: best.x, y1: best.y, t: S.t, uid: T.uid, r: T.ranged ? 1 : 0 });
    });
    if (S.fx.length > 200) S.fx.splice(0, S.fx.length - 200);
    S.mons = S.mons.filter((m) => !m.dead || S.t - (m.deadAt || (m.deadAt = S.t)) < 0.6);
    const allOut = S.si >= S.spawns.length && S.mons.every((m) => m.dead);
    const leftHp = () => S.mons.reduce((a, m) => a + (m.dead ? 0 : Math.max(0, m.hp) / S.hp0), 0) + S.spawns.slice(S.si).reduce((a, s) => a + TYPES[s.ty].hp, 0); // 남은 몬스터 체력 (한 마리 = 1)
    if (S.life <= 0) { S.left = leftHp(); S.done = true; S.win = false; S.life = 0; }
    else if (allOut) { S.done = true; S.win = true; }
    else if (S.t >= LIMIT) { S.left = leftHp(); S.mons.forEach((m) => { if (!m.dead) { m.dead = true; S.life -= TYPES[m.ty].leak; } }); S.done = true; S.win = S.life > 0; S.life = Math.max(0, S.life); }
    return S;
  }
  function run(S, onTick) { while (!S.done) { step(S); if (onTick) onTick(S); } return S; }
  // 🎯 난이도 맞추기 (판 시작 때 TV 가 0.3초쯤): 이 반 · 이 지도로 기술 · 선생님 없이 미리 돌려 보고 몬스터 체력을 고름
  //   점수 = 이기면 남은 생명 · 지면 −(남은 몬스터 체력 / 한 마리 체력) → 점수가 TARGET 이 되는 체력 (이분 탐색)
  //   → 실제 판은 기술 · 선생님 방패 · 응원 · 업그레이드 고르기에 따라 이기고 짐 (tests/td.test.js 로 ≈ 70%)
  //   경계 = 미리 돌린 판(기술 · 선생님 없음)이 아슬아슬하게 이기는 가장 센 체력 → × FACTOR (지도마다 · tests/td.test.js 로 ≈ 70%)
  const FACTOR = { forest: 1.10, volcano: 1.12, ice: 1.09, desert: 1.12, crypt: 1.14 }; // 2026-11-08 개편 A(몬스터 떼 · 막기) 뒤 다시 맞춤 · 2026-11-09 줄지어 물량(× 1.7 · 6마리 줄) 뒤 다시 맞춤 (옛 1.12 · 1.12 · 1.08 · 1.10 · 1.13)
  function score(opt, hp0) { const S = create(Object.assign({}, opt, { hp0 })), R = rng('cal' + (opt.seed || 1)); run(S, (S) => S.towers.forEach((T) => { while (pending(T) > 0) upgrade(S, T.uid, auto(T, R)); })); return S.win ? S.life : -(S.left || 0) - 0.01; }
  function calibrate(opt, f) { let lo = 5, hi = 5000; for (let i = 0; i < 14; i++) { const mid = Math.sqrt(lo * hi); if (score(opt, mid) > 0) lo = mid; else hi = mid; } return Math.round(lo * (f != null ? f : FACTOR[opt.map.id] || 1.2)); }
  const auto = (T, R) => (T.fam === 'fire' || T.fam === 'frost' || T.fam === 'spark' ? 'c' : R() < 0.5 ? 'a' : 'b'); // 안 고르면 저절로 (12초)

  const api = { calibrate, score, FACTOR, PICK_MS, DT, WAVE_AT, LIMIT, LIFE, STARS_AT, UP, TYPES, WAVES, BLOCK, FAM, HP_K, rng, towerOf, dps, create, step, run, upgrade, pending, skill, shieldOn, cheer, auto, posAt };

  // ══════════════ 화면 · 네트워크 (교실 TV = 계산 · 그림 / 학생 폰 / 교사 폰) ══════════════
  //   rooms/{코드}/fun = { kind:'td', g, map, phase: pick|play|end, to, t0, hp0, tw:[타워], sh, ch:{웨이브}, res, endAt, drv }
  //   tdp/{g}/{자리} = uid (선착순) · tdm/{g}/{uid} = { lv, enh, hero, fx } (자리 고르기 동안 · 용사 바꾸면 다시) · tdu/{g}/{uid}/{k} = a|b|c · tdt/{g}/{uid} = 시각 · tdl/{g} = TV 가 1초마다 (웨이브 · 생명 · 처치 · ⭐ · 업그레이드)
  const N = () => DS.Net, P = (code, x) => `rooms/${code}/${x}`;
  const esc = (x) => String(x == null ? '' : x).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const ck = (c) => String(c).replace(/[.#$/[\]]/g, '_');
  const studentsIn = (R) => Object.keys(R.players || {}).filter((u) => !R.players[u].teacher && (R.active || {})[u]);
  const kst = () => { const d = new Date(Date.now() + 9 * 3600e3); return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`; };
  const ranged = (h) => !!(DS.Attack && DS.Attack.isRanged && DS.Attack.isRanged(Number(h) || 0));
  const FAMC = { cut: '#e8eef8', smash: '#ffb14a', sweep: '#7dffa8', wind: '#9ef0ff', fire: '#ff7a1a', spark: '#ffe14a', frost: '#7fd3ff', star: '#fff3a0', magic: '#c08aff', math: '#ffd25a' };
  const FAMN = { cut: '⚔ 베기 · 한 마리에 강하게', smash: '🔨 강타 · 기절', sweep: '🌪 연격 · 주변도 함께', wind: '🌬 바람 · 뒤로 밀기', fire: '🔥 불 · 불태우기', spark: '⚡ 번개 · 옆으로 튐', frost: '❄ 얼음 · 느리게', star: '✨ 별 · 치명타', magic: '🔮 마법 · 보스에게 강함', math: '📐 수식 · 같은 적을 연달아 맞히면 점점 강하게' };
  const UPN = { a: '⚔ 공격 +25%', b: '⚡ 속도 +20%', c: '✨ 특기 한 단계' };
  const TIERN = ['Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ', 'Ⅴ'];
  const mapOf = (f) => M().get(f.map) || M().MAPS[0];
  const twOf = (f) => (Array.isArray(f.tw) ? f.tw : Object.values(f.tw || {})).filter(Boolean);
  const arr = (x) => (Array.isArray(x) ? x : x && typeof x === 'object' ? Object.values(x) : []);

  // ── 교사: 시작 · 방패 · 응원 · 끝 ──
  async function start(code, R, opt = {}) { // opt (🧪 테스트 모드 · 2026-11-07): noHost = 이 기기 작은 TV 창이 계산 · map = 지도 고르기
    if (!opt.noHost && !Object.keys(R.hosts || {}).length) throw Object.assign(new Error('🏰 타워 디펜스는 종합상황실(교실 TV)을 켜야 시작돼요 — TV 가 계산과 그림을 맡아요'), { user: true });
    const n = studentsIn(R).length; if (n < 1) throw Object.assign(new Error('입장한 학생이 없어요'), { user: true });
    const cls = (R.meta || {}).cls, idx = cls ? Number(await N().get(`funUsed/${ck(cls)}/td`).catch(() => 0)) || 0 : 0, map = M().get(opt.map) || M().MAPS[idx % M().MAPS.length];
    if (cls && !opt.map) await N().set(`funUsed/${ck(cls)}/td`, idx + 1).catch(() => {}); // 지도 차례대로 (반마다)
    const now = N().now();
    await N().set(P(code, 'fun'), { kind: 'td', g: now, map: map.id, phase: 'pick', to: now + ((typeof window !== 'undefined' && window.DS_TD && window.DS_TD.pick) || PICK_MS), total: n });
  }
  const ctlHtml = (R) => { const f = R.fun || {}, L = R.tdl ? (R.tdl[f.g] || {}) : {}, w = L.wave || 1;
    return `<div class="fun-ctl td-ctl"><span>🏰 ${esc(mapOf(f).name)} · ${f.phase === 'pick' ? '자리 고르는 중' : f.phase === 'play' ? `웨이브 ${w}/5 · ❤ ${L.life != null ? L.life : LIFE}` : f.res && f.res.win ? '🏆 승리!' : '💥 패배'}</span>
      ${f.phase === 'play' ? `<button class="btn small" data-td="sh"${f.sh ? ' disabled' : ''}>🛡 수호 방패${f.sh ? ' (씀)' : ''}</button><button class="btn small" data-td="ch"${(f.ch || {})[w] ? ' disabled' : ''}>✨ 응원 마법${(f.ch || {})[w] ? ' (이번 웨이브 씀)' : ''}</button>` : ''}
      <button class="btn small" data-fun="stop">⏹ 게임 끝</button>${f.phase === 'end' ? '<button class="btn small" data-fun="again">🔄 새 게임</button>' : ''}</div>`; };
  function bindCtl(el, code, R) {
    el.querySelectorAll('[data-td]').forEach((b) => (b.onclick = () => DS.Control.run(async () => { const f = R.fun || {}, L = (R.tdl || {})[f.g] || {}, k = b.dataset.td;
      if (k === 'sh') { await N().set(P(code, 'fun/sh'), N().now()); DS.UI.toast('🛡 수호 방패! 성에 닿는 몬스터 3마리를 막아요'); }
      if (k === 'ch') { await N().set(P(code, `fun/ch/${L.wave || 1}`), N().now()); DS.UI.toast('✨ 응원 마법! 5초 동안 모든 타워 공격 속도 +20%'); } })));
  }

  // ── 교실 TV: 계산(이 기기 하나가 맡음) + 그림 ──
  let H = null;
  function hall(el, R) {
    const f = R.fun; if (!f) return;
    if (!H || H.g !== f.g || !el.contains(H.root)) H = setup(el, R, f);
    H.R = R; H.f = f;
    if (f.phase === 'pick') { pickHall(); if (N().now() >= f.to && !H.starting) begin(); }
    if (f.phase === 'play' && !H.S) simInit();
    if (f.phase === 'end') endHall();
  }
  function setup(el, R, f) {
    if (H && H.raf) cancelAnimationFrame(H.raf);
    const map = mapOf(f);
    el.innerHTML = `<div class="td-wrap"><div class="td-stage"><canvas class="td-bg"></canvas><div class="td-dom"></div><canvas class="td-fx"></canvas><div class="td-hud"></div><div class="td-big"></div></div></div>`;
    const h = { g: f.g, root: el.querySelector('.td-wrap'), map, el, R, f, mons: new Map(), tw: new Map(), cut: [], cutBusy: false };
    h.stage = h.root.querySelector('.td-stage'); if (artOf(map)) h.stage.classList.add('td-art'); h.bg = h.root.querySelector('.td-bg'); h.fx = h.root.querySelector('.td-fx'); h.dom = h.root.querySelector('.td-dom'); h.hud = h.root.querySelector('.td-hud'); h.big = h.root.querySelector('.td-big');
    const fit = () => { const W = el.clientWidth || 1280, Hh = el.clientHeight || 720, w = Math.min(W, Hh * 16 / 9); h.U = w / 16; h.stage.style.setProperty('--u', `${h.U}px`); h.stage.style.width = `${w}px`; h.stage.style.height = `${w * 9 / 16}px`; [h.bg, h.fx].forEach((c) => { c.width = Math.round(w); c.height = Math.round(w * 9 / 16); }); drawMap(h);
      // 🐞 #59 (2026-11-10 7차시): 전체 화면을 켜고 끄면(창 크기 바뀜) 놀이 중 용사 · 처치 수가 사라지던 것 → 놀이 중이면 지우지 않고 새 크기로 자리만 옮김 (몬스터는 매 프레임 새 크기로 그림)
      if (h.S) h.S.towers.forEach((T) => { const d = h.tw.get(T.uid); if (!d) return; d.style.left = `${T.x * h.U}px`; d.style.top = `${T.y * h.U}px`; const rg = d.querySelector('.td-rg'); if (rg) { rg.style.width = rg.style.height = `${T.range * 2 * h.U}px`; } });
      else { h.tw.clear(); h.dom.innerHTML = ''; h.mons.clear(); } };
    h.fit = fit; fit(); window.addEventListener('resize', () => { if (H === h) fit(); });
    return h;
  }
  // 지도 그림 (2026-11-06 · assets/manifest.js td): 있으면 그림 위에 자리만 · 없으면 단색 + 이모지
  const artOf = (m) => { const A = (typeof DS !== 'undefined' && DS.ASSETS) || {}, src = (A.td || {})[m.id]; return src ? (A.base || '') + src : null; };
  const IMG = {};
  function artImg(m, onload) {
    const u = artOf(m); if (!u || typeof Image === 'undefined') return null;
    let im = IMG[u]; if (!im) { im = IMG[u] = new Image(); im.src = u; }
    if (!im.complete || !im.naturalWidth) { im.addEventListener('load', onload, { once: true }); return null; }
    return im;
  }
  function drawMap(h, slotsOn = h.slotsOn != null ? h.slotsOn : true) {
    h.slotsOn = slotsOn;
    const g = h.bg.getContext('2d'), U = h.U, m = h.map, th = m.theme, W = h.bg.width, Hh = h.bg.height;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    const im = artImg(m, () => { if (H === h) drawMap(h, h.slotsOn); });
    if (im) { g.imageSmoothingEnabled = true; g.drawImage(im, 0, 0, W, Hh); } else drawPlain(h, g, U, m, th, W, Hh);
    if (slotsOn) M().slots(m).forEach((p) => { g.beginPath(); g.arc(p.x * U, p.y * U, U * (p.star ? 0.36 : 0.3), 0, 7); g.fillStyle = '#0008'; g.fill(); g.strokeStyle = p.star ? '#ffd25a' : '#ffffff88'; g.lineWidth = U * (p.star ? 0.06 : 0.035); g.stroke(); g.fillStyle = p.star ? '#ffd25a' : '#fff'; g.font = `bold ${U * 0.26}px sans-serif`; g.fillText(p.star ? `★${p.no}` : p.no, p.x * U, p.y * U + 1); });
  }
  function drawPlain(h, g, U, m, th, W, Hh) {
    const gr = g.createLinearGradient(0, 0, W, Hh); gr.addColorStop(0, th.bg[0]); gr.addColorStop(1, th.bg[1]); g.fillStyle = gr; g.fillRect(0, 0, W, Hh);
    const R = rng(m.id);
    for (let i = 0; i < 60; i++) { const x = R() * 16, y = R() * 9; if (M().dPath(m, x, y) < 1.4 || M().slots(m).some((p) => Math.hypot(p.x - x, p.y - y) < 0.8)) continue; g.font = `${U * (0.35 + R() * 0.25)}px serif`; g.globalAlpha = 0.8; g.fillText(i % 3 ? th.deco : th.deco2, x * U, y * U); }
    g.globalAlpha = 1; g.lineJoin = 'round'; g.lineCap = 'round';
    m.paths.forEach((p) => { g.beginPath(); p.forEach(([x, y], i) => (i ? g.lineTo(x * U, y * U) : g.moveTo(x * U, y * U))); g.strokeStyle = th.edge; g.lineWidth = U * 0.86; g.stroke(); g.strokeStyle = th.path; g.lineWidth = U * 0.7; g.stroke(); });
    M().starts(m).forEach(([x, y]) => { const cx = Math.max(0.5, Math.min(15.5, x)) * U, cy = Math.max(0.5, Math.min(8.5, y)) * U; g.fillStyle = '#000c'; g.beginPath(); g.arc(cx, cy, U * 0.45, 0, 7); g.fill(); g.strokeStyle = '#a020f0'; g.lineWidth = U * 0.07; g.stroke(); g.font = `${U * 0.5}px serif`; g.fillText('🌀', cx, cy); });
    const [ex, ey] = M().end(m); g.font = `${U * 1.05}px serif`; g.fillText('🏰', ex * U, ey * U - U * 0.15);
  }
  const pos = (h, x, y) => `left:${x * h.U}px;top:${y * h.U}px`;
  function pickHall() {
    const h = H, f = h.f, R = h.R, picks = ((R.tdp || {})[f.g]) || {}, left = Math.max(0, Math.ceil((f.to - N().now()) / 1000)), studs = studentsIn(R), got = new Set(Object.values(picks));
    h.hud.innerHTML = `<div class="td-top"><b>🏰 ${esc(h.map.name)}</b> <span>자리 고르기 <b class="td-sec">${left}</b>초</span> <span>고른 사람 ${studs.filter((u) => got.has(u)).length} / ${studs.length}</span> <span class="td-tile">지형 보너스: ${esc(FAMN[h.map.tile].split(' · ')[0])} +20%</span></div><p class="td-desc">${esc(h.map.desc)} · 폰에서 칸을 눌러 자리를 잡아요 (선착순 · 한 번) · ★ = 명당</p>`;
    h.dom.innerHTML = Object.entries(picks).map(([no, u]) => { const s = M().slots(h.map)[Number(no) - 1], p = R.players[u] || {}; return s ? `<div class="td-pk" style="${pos(h, s.x, s.y)}">${DS.Art.hero(p.hero || 0, 'idle', 'small')}<b>${esc(p.nick || '')}</b></div>` : ''; }).join('');
    // 🔁 자리 교환 (2026-11-09 선생님 「1:1 교환 신청」): 둘이 서로 신청(tdm/…/sw) = TV 가 두 자리를 맞바꿈 (학생은 남의 자리에 못 쓰므로 TV 가)
    { const st = ((R.tdm || {})[f.g]) || {}, slotOf = (u) => Object.keys(picks).find((k) => picks[k] === u); h.swDone = h.swDone || {};
      Object.keys(st).forEach((a) => { const b = (st[a] || {}).sw; if (!b || a >= b || (st[b] || {}).sw !== a) return; const sa = slotOf(a), sb = slotOf(b), key = `${a}|${b}|${sa}|${sb}`; if (!sa || !sb || h.swDone[key] || !codeOf()) return; h.swDone[key] = 1;
        N().update(`rooms/${codeOf()}`, { [`tdp/${f.g}/${sa}`]: b, [`tdp/${f.g}/${sb}`]: a, [`tdm/${f.g}/${a}/sw`]: null, [`tdm/${f.g}/${b}/sw`]: null, [`tdm/${f.g}/${a}/swd`]: N().now(), [`tdm/${f.g}/${b}/swd`]: N().now() }).catch(() => { delete h.swDone[key]; }); }); }
    clearTimeout(h.pickT); h.pickT = setTimeout(() => { if (H === h && h.f.phase === 'pick') hall(h.el, h.R); }, 500);
  }
  // 자리 고르기 끝 → 자리 정리 · 난이도 맞추기 → 놀이 시작 (TV 하나가)
  async function begin() {
    const h = H, f = h.f, R = h.R, me = N().uid(); if (f.drv && f.drv.u !== me && N().now() - (f.drv.at || 0) < 4000) return; h.starting = true;
    try {
      const studs = studentsIn(R), picks = ((R.tdp || {})[f.g]) || {}, stats = ((R.tdm || {})[f.g]) || {}, as = {}, all = M().slots(h.map).map((s) => s.no);
      Object.keys(picks).map(Number).sort((a, b) => a - b).forEach((no) => { const u = picks[no]; if (studs.includes(u) && !as[u]) as[u] = no; });
      const free = all.filter((no) => !Object.values(as).includes(no)), Rr = rng(f.g); studs.filter((u) => !as[u]).forEach((u) => { if (!free.length) return; as[u] = free.splice(Math.floor(Rr() * free.length), 1)[0]; });
      const tw = studs.filter((u) => as[u]).map((u) => { const p = R.players[u] || {}, s = stats[u] || {}; const hero = s.hero != null ? s.hero : p.hero || 0; return { u, s: as[u], lv: Number(s.lv) || 3, enh: Number(s.enh != null ? s.enh : p.enh) || 0, hero, fx: s.fx || p.fx || 'flame', r: ranged(hero) ? 1 : 0 }; });
      const avg = tw.length ? Math.round(tw.reduce((a, t) => a + t.lv, 0) / tw.length) : 5, tl = (R.state || {}).tlook || {}, th = DS.Art.teacherHero ? DS.Art.teacherHero(R) : 17;
      tw.push({ u: 'T', T: 1, lv: avg, enh: 0, hero: th, fx: tl.fx || 'twinkle', r: ranged(th) ? 1 : 0 });
      const towers = toTowers(tw), hp0 = calibrate({ map: h.map, seed: f.g, towers });
      await N().update(P(h.R.meta && h.R.meta.code ? h.R.meta.code : codeOf(), 'fun'), { phase: 'play', t0: N().now() + 3000, tw, hp0, drv: { u: me, at: N().now() } });
    } catch (e) { console.error(e); h.starting = false; }
  }
  let code0 = null; const codeOf = () => code0;
  const toTowers = (tw) => tw.map((t) => ({ uid: t.u, slot: t.s, teacher: !!t.T, ranged: !!t.r, p: { lv: t.lv, enh: t.enh, hero: t.hero, fx: t.fx } }));
  function simInit() {
    const h = H, f = h.f; h.S = create({ map: h.map, seed: f.g, towers: toTowers(twOf(f)), hp0: f.hp0 }); h.applied = { u: {}, t: {}, sh: false, ch: {} }; h.pend = {}; h.liveAt = 0;
    drawMap(h, false); h.dom.innerHTML = ''; h.tw.clear(); h.mons.clear();
    const L = DS.Lessons && DS.Lessons.get(((h.R.meta || {}).lesson)) || null, ms = L ? Object.values(L.monsters || {}).map((x) => x.sprite).filter(Boolean) : [];
    h.spr = { n: ms[0] || 0, f: ms[1] || ms[0] || 0, t: 1, v: 'mirror:0', m: ms[3] || ms[1] || 0, b: (L && L.boss && L.boss.sprite) || ms[0] || 0 }; // 🪨 골렘 = 기본 시트 바위 골렘 · 🦇 박쥐 = 거울 박쥐 (새 그림은 나중에)
    h.S.towers.forEach((T) => { const p = T.teacher ? { nick: '선생님', hero: twOf(f).find((t) => t.T).hero } : h.R.players[T.uid] || {}, tw = twOf(f).find((t) => t.u === T.uid) || {};
      const d = document.createElement('div'); d.className = `td-tw ${T.ranged ? 'ranged' : 'melee'}${T.teacher ? ' teacher' : ''}${tw.enh && DS.Gem && DS.Gem.auraCls ? ` ${DS.Gem.auraCls(tw.enh)}` : ''}`; // ✨ 강화 오라 · 🔴 근접 / 🔵 원거리 받침 (2026-11-08 디펜스 개편 A)
      d.style.cssText = pos(h, T.x, T.y); d.dataset.hero = Number(tw.hero) || 0; d.dataset.pose = 'idle';
      d.innerHTML = `<i class="td-rg" style="width:${T.range * 2 * h.U}px;height:${T.range * 2 * h.U}px"></i><i class="td-base"></i><span class="td-art">${DS.Art.hero(Number(tw.hero) || 0, 'idle', 'small')}</span><em class="td-k">⚔ 0</em><em class="td-blk">⛔ 막는 중</em><b>${T.teacher ? '🧙' : esc(p.num != null ? p.num : '')}</b><em class="td-up"></em>`;
      h.dom.appendChild(d); h.tw.set(T.uid, d); });
    loop();
  }
  function loop() {
    const h = H; if (!h || !h.S) return;
    if (!h.root.isConnected) { if (H === h) H = null; return; } // ⏹ 게임 끝 · 다른 놀이 · 쉼터 끝으로 화면이 바뀌면 계산도 멈춤 (2026-11-07: 안 보이는 판이 끝나며 새 놀이를 덮어쓰던 것)
    const f = h.f, now = N().now(), sp = (typeof window !== 'undefined' && window.DS_TD && window.DS_TD.speed) || 1, S = h.S, R = h.R; // DS_TD.speed = 화면 시험 · 🧪 테스트 모드 ⏩ 빨리 감기
    if (!h.clk || h.clk.sp !== sp) h.clk = { sp, real: now, sim: h.clk ? h.clk.sim + ((now - h.clk.real) / 1000) * h.clk.sp : ((now - f.t0) / 1000) * sp }; // 속도가 바뀌면 그 순간부터 (건너뛰지 않음)
    const tgt = Math.max(0, h.clk.sim + ((now - h.clk.real) / 1000) * sp);
    // 입력: 판 안 업그레이드 · 기술 · 선생님
    const U = ((R.tdu || {})[f.g]) || {}, Tt = ((R.tdt || {})[f.g]) || {};
    let n = 0; while (S.t < tgt && !S.done && n++ < 400) {
      S.towers.forEach((T) => { const mine = arr(U[T.uid]); while (T.ups.length < mine.length && pending(T) > 0) upgrade(S, T.uid, mine[T.ups.length]); if (pending(T) > 0) { h.pend[T.uid] = h.pend[T.uid] || S.t; if (S.t - h.pend[T.uid] > 12) { upgrade(S, T.uid, auto(T, S.R)); h.pend[T.uid] = 0; } } else h.pend[T.uid] = 0;
        if (Tt[T.uid] && !h.applied.t[T.uid] && S.t >= Math.max(0, (Tt[T.uid] - f.t0) / 1000)) { h.applied.t[T.uid] = 1; const k = skill(S, T.uid); if (k === 'ult' || k === 'true') queueCut(T, k); } });
      if (f.sh && !h.applied.sh) { h.applied.sh = true; shieldOn(S); banner('🛡 선생님의 수호 방패! 성에 닿는 몬스터 3마리를 막아요'); }
      const ch = f.ch || {}; if (ch[S.wave] && !h.applied.ch[S.wave]) { h.applied.ch[S.wave] = 1; cheer(S); banner('✨ 선생님의 응원! 5초 동안 공격 속도 +20%'); }
      const w0 = S.wave; step(S); if (S.wave !== w0) banner(S.wave === 5 ? '👑 마지막 웨이브 — 보스 등장!' : `🌊 웨이브 ${S.wave}`);
    }
    render(h, now);
    if (amDrv(h) && (now - h.liveAt > 1000 || S.done)) { h.liveAt = now; writeLive(h); }
    if (S.done && !h.ended) { h.ended = true; if (amDrv(h)) finish(h); }
    if (!S.done || now - (h.doneAt || (h.doneAt = now)) < 3000) h.raf = requestAnimationFrame(loop);
  }
  const amDrv = (h) => { const d = h.f.drv; return !d || d.u === N().uid() || N().now() - (d.at || 0) > 4000; };
  function writeLive(h) {
    const S = h.S, o = { t: Math.round(S.t), wave: S.wave, life: S.life, shield: S.shield, kills: {}, stars: {}, got: {}, ups: {}, used: {} };
    S.towers.forEach((T) => { if (T.teacher) return; o.kills[T.uid] = T.kills; o.stars[T.uid] = T.stars; o.got[T.uid] = T.upGot; o.ups[T.uid] = T.ups.join(''); if (T.used) o.used[T.uid] = 1; });
    N().set(P(codeOf(), `tdl/${h.f.g}`), o).catch(() => {}); N().set(P(codeOf(), 'fun/drv'), { u: N().uid(), at: N().now() }).catch(() => {});
  }
  function finish(h) {
    const S = h.S, top = S.towers.filter((T) => !T.teacher).sort((a, b) => b.kills - a.kills).slice(0, 3).map((T) => [T.uid, T.kills]);
    const at = P(codeOf(), 'fun');
    N().get(`${at}/g`).then((g) => { if (g === h.g) return N().update(at, { phase: 'end', endAt: N().now(), res: { win: S.win, life: S.life, top, t: Math.round(S.t) } }); }).catch(() => {}); // 같은 판일 때만
  }
  function banner(t) { const h = H; if (!h) return; const b = document.createElement('div'); b.className = 'td-banner'; b.textContent = t; h.stage.appendChild(b); setTimeout(() => b.remove(), 2600); }
  function queueCut(T, k) { const h = H; if (!DS.Attack || h.cut.length > 2) return; h.cut.push([T, k]); if (!h.cutBusy) nextCut(); }
  function nextCut() { const h = H, it = h && h.cut.shift(); if (!it) { if (h) h.cutBusy = false; return; } h.cutBusy = true; const [T, k] = it, tw = twOf(h.f).find((t) => t.u === T.uid) || {};
    DS.Attack.cutin(Number(tw.hero) || 0, tw.fx, { gold: k === 'true' }).catch(() => {}).finally(() => setTimeout(nextCut, 400)); }
  const ago = (S, t) => S.t - t;
  function render(h, now) {
    const S = h.S, U = h.U, f = h.f;
    // 몬스터 (DOM · 그림 재사용)
    const seen = new Set();
    S.mons.forEach((m) => { seen.add(m.id); let d = h.mons.get(m.id);
      if (!d) { d = document.createElement('div'); d.className = `td-mon t-${m.ty}`; d.innerHTML = `<i class="td-sh"></i>${DS.Art.monster(h.spr[m.ty] || 0, 'idle', '')}<i class="td-hp"><i></i></i>`; /* 👣 발밑 그림자 */ h.dom.appendChild(d); h.mons.set(m.id, d); }
      d.style.transform = `translate(${m.x * U}px, ${m.y * U}px)`; const hp = d.querySelector('.td-hp i'); if (hp) hp.style.width = `${Math.max(0, (100 * m.hp) / m.max)}%`;
      d.classList.toggle('dead', !!m.dead); d.classList.toggle('slow', m.slowUntil > S.t); d.classList.toggle('burn', m.burnUntil > S.t); d.classList.toggle('stun', m.stunUntil > S.t || S.t < S.petriUntil); });
    h.mons.forEach((d, id) => { if (!seen.has(id)) { d.remove(); h.mons.delete(id); } });
    // 타워: ⬆ 업그레이드 · 각성
    const blk = new Set(); S.mons.forEach((m) => { if (!m.dead && m.blockBy) blk.add(m.blockBy); });
    S.towers.forEach((T) => { const d = h.tw.get(T.uid); if (!d) return;
      const pose = S.t - T.shotAt < 0.45 ? 'attack' : 'idle'; if (d.dataset.pose !== pose) { d.dataset.pose = pose; d.querySelector('.td-art').innerHTML = DS.Art.hero(Number(d.dataset.hero) || 0, pose, 'small'); }
      const k = d.querySelector('.td-k'), kt = `⚔ ${T.kills}`; if (k.textContent !== kt) k.textContent = kt; d.classList.toggle('blocking', blk.has(T)); d.classList.toggle('flip', T.tx != null && T.tx < T.x - 0.05); }); /* ↔ 왼쪽에서 오는 적 = 뒤집어 그쪽을 보고 공격 (2026-11-09 선생님) */
    S.towers.forEach((T) => { const d = h.tw.get(T.uid); if (!d) return; const e = d.querySelector('.td-up'), txt = T.ups.map((k) => ({ a: '⚔', b: '⚡', c: '✨' })[k]).join(''); if (e.textContent !== txt) e.textContent = txt; d.classList.toggle('awake', T.awake); d.classList.toggle('pending', pending(T) > 0); });
    // 🔊 타격음 (2026-11-09 선생님 「공격할 때 이펙트 타격음」): 새 공격마다 · 여럿이면 0.09초에 한 번
    { let nNew = 0, ranged = 0; S.fx.forEach((e) => { if (e.k === 'shot' && e.t > (h.sndT || 0)) { nNew++; if (e.r) ranged++; } }); h.sndT = S.t;
      const Snd = DS.Sound; if (nNew && Snd && now - (h.sndAt || 0) > 90) { h.sndAt = now; try { if (ranged === nNew && Snd.slash) Snd.slash(); else if (Snd.hit) Snd.hit(); } catch (e) { /* 소리 없음 */ } } }
    // 효과 (캔버스)
    const g = h.fx.getContext('2d'); g.clearRect(0, 0, h.fx.width, h.fx.height); g.lineCap = 'round';
    S.fx.forEach((e) => { const a = ago(S, e.t);
      if (e.k === 'shot' && !e.r && a < 0.18) { g.strokeStyle = FAMC[e.fam] || '#fff'; g.globalAlpha = 1 - a / 0.18; g.lineWidth = U * 0.09; const ang = Math.atan2(e.y1 - e.y0, e.x1 - e.x0); g.beginPath(); g.arc(e.x1 * U, e.y1 * U, U * 0.32, ang - 1.9 + a * 8, ang - 0.4 + a * 8); g.stroke(); } // ⚔ 근접 = 베기
      else if (e.k === 'shot' && e.r && a < 0.22) { const k = Math.min(1, a / 0.16), x = e.x0 + (e.x1 - e.x0) * k, y = e.y0 + (e.y1 - e.y0) * k; g.globalAlpha = k < 1 ? 1 : 1 - (a - 0.16) / 0.06; g.fillStyle = FAMC[e.fam] || '#fff'; g.beginPath(); g.arc(x * U, y * U, U * (k < 1 ? 0.1 : 0.2), 0, 7); g.fill(); g.strokeStyle = '#fff8'; g.lineWidth = U * 0.03; g.beginPath(); g.moveTo((x - (e.x1 - e.x0) * 0.08) * U, (y - (e.y1 - e.y0) * 0.08) * U); g.lineTo(x * U, y * U); g.stroke(); } // 🏹 원거리 = 날아가는 탄
      else if (e.k === 'shot' && a < 0.15) { g.strokeStyle = FAMC[e.fam] || '#fff'; g.globalAlpha = 1 - a / 0.15; g.lineWidth = U * 0.07; g.beginPath(); g.moveTo(e.x0 * U, e.y0 * U); g.lineTo(e.x1 * U, e.y1 * U); g.stroke(); g.beginPath(); g.arc(e.x1 * U, e.y1 * U, U * 0.16, 0, 7); g.fillStyle = FAMC[e.fam] || '#fff'; g.fill(); }
      else if (e.k === 'dmg' && a < 0.6) { const r = a / 0.6, fs = U * 0.38; g.globalAlpha = r < 0.7 ? 1 : 1 - (r - 0.7) / 0.3; g.font = `bold ${fs}px sans-serif`; g.textAlign = 'center'; g.lineWidth = Math.max(2, fs * 0.18); g.strokeStyle = '#000'; const tx = e.x * U + ((e.v * 7) % 11 - 5) * U * 0.02, ty = (e.y - 0.55 - r * 0.5) * U; g.strokeText(String(e.v), tx, ty); g.fillStyle = '#fff'; g.fillText(String(e.v), tx, ty); g.textAlign = 'start'; } // 💥 데미지 숫자 (떠오르며 사라짐)
      else if (e.k === 'crit' && a < 0.5) { g.globalAlpha = 1 - a / 0.5; g.fillStyle = '#ffd25a'; g.font = `bold ${U * 0.3}px sans-serif`; g.fillText('치명!', e.x * U, (e.y - 0.5 - a) * U); }
      else if ((e.k === 'skill' || e.k === 'ult' || e.k === 'true') && a < 0.8) { g.globalAlpha = 1 - a / 0.8; g.strokeStyle = e.k === 'true' ? '#ffd25a' : e.k === 'ult' ? '#ff7a1a' : '#9ef0ff'; g.lineWidth = U * 0.12; g.beginPath(); g.arc(e.x * U, e.y * U, U * (0.4 + a * 2.4), 0, 7); g.stroke(); } });
    g.globalAlpha = 1;
    if (S.t < S.petriUntil) { g.fillStyle = '#8888'; g.fillRect(0, 0, h.fx.width, h.fx.height); }
    // 머리판
    const left = S.spawns.length - S.si + S.mons.filter((m) => !m.dead).length, cd = Math.ceil((f.t0 - now) / 1000);
    h.hud.innerHTML = `<div class="td-top"><b>🏰 ${esc(h.map.name)}</b> <span>🌊 웨이브 <b>${S.wave}</b> / 5</span> <span class="td-life">❤ <b>${S.life}</b> / ${LIFE}</span>${S.shield ? ` <span>🛡 ${S.shield}</span>` : ''}${S.t < S.cheerUntil ? ' <span class="td-cheer">✨ 응원 중</span>' : ''} <span>남은 몬스터 ${left}</span></div>`;
    h.big.innerHTML = cd > 0 ? `<b>${cd}</b>` : S.done ? `<b class="${S.win ? 'win' : 'lose'}">${S.win ? '🏆 승리!' : '💥 성이 무너졌어요…'}</b>` : '';
  }
  function endHall() {
    const h = H, f = h.f, r = f.res || {}, R = h.R; if (h.raf) cancelAnimationFrame(h.raf);
    if (!h.S) { drawMap(h, false); }
    h.big.innerHTML = `<div class="td-end ${r.win ? 'win' : 'lose'}"><h1>${r.win ? '🏆 승리! 성을 지켜 냈어요' : '💥 아쉽게 성이 무너졌어요'}</h1><p>❤ 남은 생명 ${r.life || 0} · ${r.t || 0}초</p><p class="td-top3">${arr(r.top).map((x, i) => `<span>${['🥇', '🥈', '🥉'][i]} ${esc(((R.players || {})[x[0]] || {}).nick || '')} <b>${x[1]}</b>마리</span>`).join('')}</p><p class="muted">참여한 모두 💎 ${r.win ? 3 : 1} (오늘 첫 판)</p></div>`;
    if (amDrv(h) && N().now() - (f.endAt || 0) > 60000 && DS.Fun) DS.Fun.stop(codeOf()).catch(() => {});
  }

  // ── 학생 폰 ──
  let PH = null;
  function miniMap(map, picks, R, me, mine) {
    const sl = M().slots(map), u = 22, W = 16 * u, Hh = 9 * u;
    const art = artOf(map);
    return `<svg viewBox="0 0 ${W} ${Hh}" class="td-mini"><rect width="${W}" height="${Hh}" fill="${map.theme.bg[0]}"/>${art ? `<image href="${esc(art)}" x="0" y="0" width="${W}" height="${Hh}" preserveAspectRatio="none"/>` : `${map.paths.map((p) => `<polyline points="${p.map(([x, y]) => `${x * u},${y * u}`).join(' ')}" fill="none" stroke="${map.theme.path}" stroke-width="${u * 0.7}" stroke-linejoin="round" stroke-linecap="round"/>`).join('')}
      <text x="${M().end(map)[0] * u}" y="${M().end(map)[1] * u + 6}" font-size="20" text-anchor="middle">🏰</text>`}
      ${sl.map((p) => { const who = picks[p.no], isMe = who === me; return `<g data-slot="${p.no}" class="${who ? 'taken' : 'free'}${isMe ? ' me' : ''}"><circle cx="${p.x * u}" cy="${p.y * u}" r="${p.star ? 10 : 8.5}" fill="${isMe ? '#3c8a5a' : who ? '#444' : '#000a'}" stroke="${p.star ? '#ffd25a' : '#fff9'}" stroke-width="${p.star ? 2.5 : 1.4}"/><text x="${p.x * u}" y="${p.y * u + 3.5}" font-size="9" text-anchor="middle" fill="${p.star ? '#ffd25a' : '#fff'}" font-weight="700">${isMe ? '나' : who ? '✖' : p.no}</text></g>`; }).join('')}</svg>`;
  }
  async function myStats(R, me) { const p = (R.players || {})[me] || {}; let lv = 3; if (DS.Grow && p.cls != null && p.num) { const g = await DS.Grow.mine({ c: p.cls, n: p.num }).catch(() => null); if (g && g.lv) lv = g.lv; } return { lv, enh: Number(p.enh) || 0, hero: Number(p.hero) || 0, fx: p.fx || 'flame' }; }
  function phone(body, R, me, code) {
    code0 = code; const f = R.fun; if (!f) return;
    if (!PH || PH.g !== f.g) PH = { g: f.g, stat: null, wrote: '' };
    if (f.phase === 'pick') return phonePick(body, R, me, code, f);
    if (f.phase === 'play') return phonePlay(body, R, me, code, f);
    return phoneEnd(body, R, me, code, f);
  }
  function statCard(st, map) { const T = towerOf(st, map, ranged(st.hero)), fam = T.fam; return `<div class="td-card">${T.ranged ? '🏹 원거리 (사거리 3칸)' : '🗡 근접 (사거리 1.6칸 · 피해 ×1.3)'}<br>공격력 <b>${T.atk}</b> (Lv${st.lv}) · 속도 <b>${T.rate.toFixed(2)}</b>/초${st.enh ? ` (🔨 +${st.enh})` : ''}<br>${esc(FAMN[fam] || '')} ${TIERN[T.tier] || ''}${T.terr > 1 ? ' · <b class="td-terr">지형 보너스 +20%</b>' : ''}${T.reso ? ' · ★ 공명' : ''}</div>`; }
  function phonePick(body, R, me, code, f) {
    const map = mapOf(f), picks = ((R.tdp || {})[f.g]) || {}, mine = Object.keys(picks).find((k) => picks[k] === me), left = Math.max(0, Math.ceil((f.to - N().now()) / 1000));
    if (!PH.stat || PH.statFor !== `${(R.players[me] || {}).hero}|${(R.players[me] || {}).fx}`) { PH.statFor = `${(R.players[me] || {}).hero}|${(R.players[me] || {}).fx}`; myStats(R, me).then((st) => { PH.stat = st; N().set(P(code, `tdm/${f.g}/${me}`), st).catch(() => {}); if (body.isConnected) phonePick(body, R, me, code, f); }); }
    const st = PH.stat || { lv: 3, enh: 0, hero: (R.players[me] || {}).hero || 0, fx: (R.players[me] || {}).fx || 'flame' };
    // 🔁 자리 교환 (1:1): 내 자리가 있으면 친구 자리를 눌러 신청 · 받은 신청은 수락 / 거절 · 서로 신청이 맞으면 TV 가 맞바꿈
    const SW = ((R.tdm || {})[f.g]) || {}, my = SW[me] || {}, nick = (u) => esc(((R.players || {})[u] || {}).nick || '친구'), slotOf = (u) => Object.keys(picks).find((k) => picks[k] === u);
    const inc = Object.keys(SW).filter((u) => u !== me && (SW[u] || {}).sw === me && my.sw !== u && my.no !== u && slotOf(u));
    if (my.sw && (SW[my.sw] || {}).no === me && PH.swNo !== my.sw) { PH.swNo = my.sw; DS.UI.toast(`🙅 ${nick(my.sw)} 친구가 교환을 거절했어요`); N().set(P(code, `tdm/${f.g}/${me}/sw`), null).catch(() => {}); }
    if (my.swd && PH.swd !== my.swd) { if (PH.swd) DS.UI.toast('🔁 자리를 바꿨어요!'); PH.swd = my.swd; }
    const swHtml = `${my.sw ? `<p class="td-sw">⏳ <b>${nick(my.sw)}</b>(${slotOf(my.sw) || '?'}번)에게 교환 신청 중 <button class="btn small" data-swc="1">취소</button></p>` : '<p class="muted small">🔁 친구 자리를 누르면 1:1 교환 신청 (친구가 수락하면 바뀜)</p>'}${inc.map((u) => `<div class="td-sw in">🔁 <b>${nick(u)}</b>(${slotOf(u)}번)가 내 자리(${mine}번)와 바꾸자고 해요 <button class="btn small primary" data-swy="${esc(u)}">수락</button><button class="btn small" data-swn="${esc(u)}">거절</button></div>`).join('')}`;
    // 🐞 2026-11-10 7차시 「디펜스 화면이 위아래로 흔들림」: 자리 고르기 화면을 1초마다 통째로 다시 그려 스크롤이 튀고 누르던 단추가 사라짐 → 바뀐 게 남은 초뿐이면 그 숫자만 · 다시 그릴 때도 스크롤 그대로
    const pkSig = JSON.stringify([f.g, picks, mine, SW, PH.statFor, !!PH.stat, my.sw || '', my.swd || '']);
    if (body.dataset.tdpk === pkSig && body.querySelector('.td-ph .td-left')) { const lb = body.querySelector('.td-left'); if (lb.textContent !== `${left}초`) lb.textContent = `${left}초`; clearTimeout(PH.t); PH.t = setTimeout(() => { if (body.isConnected && (R.fun || {}).phase === 'pick') phonePick(body, R, me, code, f); }, 1000); return; }
    body.dataset.tdpk = pkSig; const keepY = window.scrollY, keepB = body.scrollTop;
    body.innerHTML = `<div class="panel framed td-ph"><p class="td-ph-h">🏰 자리 고르기 <b class="gold td-left">${left}초</b></p><p class="muted small">${esc(map.name)} · ${esc(map.desc)} · 선착순 · 고른 뒤엔 친구와 1:1 교환 신청 · ★ = 명당</p>
      ${miniMap(map, picks, R, me, mine)}${statCard(st, map)}
      ${mine ? `<p class="okc">✔ <b>${mine}번</b> 자리를 잡았어요! 웨이브를 기다려요</p>${swHtml}` : '<p class="muted small">💡 근접은 길 가까운 칸 · 원거리는 어디든 · 지도에서 빈 칸을 눌러요</p>'}
      <button class="btn small" id="td-set">⚙ 용사 · 스킬 바꾸기 <small>(자리 고르기 동안만)</small></button></div>`;
    if (window.scrollY !== keepY) window.scrollTo(0, keepY); body.scrollTop = keepB;
    body.querySelectorAll('[data-slot]').forEach((g) => (g.onclick = () => DS.Control.run(async () => {
      const no = g.dataset.slot;
      if (mine) { const o = picks[no]; if (!o || o === me) { DS.UI.toast(o ? '내 자리예요' : '이미 자리를 골랐어요 · 친구 자리를 누르면 교환 신청'); return; } if (!SW[me]) { DS.UI.toast('잠깐 뒤 다시 눌러 주세요'); return; }
        await N().set(P(code, `tdm/${f.g}/${me}/sw`), my.sw === o ? null : o); DS.UI.toast(my.sw === o ? '교환 신청을 취소했어요' : `🔁 ${nick(o)}에게 교환 신청!`); return; }
      if (picks[no]) { DS.UI.toast('다른 친구가 먼저 잡았어요!'); return; }
      try { await N().set(P(code, `tdp/${f.g}/${no}`), me); if (DS.Sound && DS.Sound.card) DS.Sound.card(); } catch (e) { DS.UI.toast('다른 친구가 먼저 잡았어요!'); }
    })));
    body.querySelectorAll('[data-swy]').forEach((b) => (b.onclick = () => DS.Control.run(async () => { await N().update(P(code, `tdm/${f.g}/${me}`), { sw: b.dataset.swy, no: null }); DS.UI.toast('🔁 수락! 곧 자리가 바뀌어요'); })));
    body.querySelectorAll('[data-swn]').forEach((b) => (b.onclick = () => DS.Control.run(async () => { await N().set(P(code, `tdm/${f.g}/${me}/no`), b.dataset.swn); })));
    body.querySelectorAll('[data-swc]').forEach((b) => (b.onclick = () => DS.Control.run(async () => { await N().set(P(code, `tdm/${f.g}/${me}/sw`), null); })));
    const sb = body.querySelector('#td-set'); if (sb) sb.onclick = () => { const p = R.players[me] || {}; DS.Camp.settings({ me: { c: p.cls, n: p.num, name: p.nick, hero: p.hero, fx: p.fx, title: p.title, socket: {} }, onSave: async (v) => { await N().update(P(code, `players/${me}`), { hero: v.hero, fx: v.fx }).catch(() => {}); PH.stat = null; } }).catch(() => {}); };
    clearTimeout(PH.t); PH.t = setTimeout(() => { if (body.isConnected && (R.fun || {}).phase === 'pick') phonePick(body, R, me, code, f); }, 1000);
  }
  function phonePlay(body, R, me, code, f) {
    const L = ((R.tdl || {})[f.g]) || {}, tw = twOf(f).find((t) => t.u === me), mine = arr((((R.tdu || {})[f.g]) || {})[me]), cd = Math.ceil((f.t0 - N().now()) / 1000);
    if (!tw) { body.innerHTML = `<div class="panel framed td-ph"><p class="td-ph-h">🏰 ${esc(mapOf(f).name)}</p><p>👀 이번 판은 구경해요 — 다음 판에 함께!</p><p>🌊 웨이브 ${L.wave || 1} / 5 · ❤ ${L.life != null ? L.life : LIFE}</p></div>`; return; }
    const ups = String((L.ups || {})[me] || '') || mine.join(''), got = Number((L.got || {})[me]) || 0, need = got - Math.max(ups.length, mine.length), stars = Number((L.stars || {})[me]) || 0, next = STARS_AT[Math.max(ups.length, mine.length, got)] || null;
    const T = towerOf(tw, mapOf(f), !!tw.r), used = !!(((R.tdt || {})[f.g]) || {})[me] || !!(L.used || {})[me];
    // 단추는 상태가 바뀔 때만 새로 그림 (처치 · ⭐ · 웨이브 숫자는 그 자리에서만 바꿈 → 누르는 중에 단추가 사라지지 않게)
    const dyn = { head: cd > 0 ? `<b class="gold">${cd}</b>초 뒤 시작!` : `🌊 웨이브 <b>${L.wave || 1}</b> / 5 · ❤ <b>${L.life != null ? L.life : LIFE}</b>`, me: `<b>${tw.s}번 자리</b> · 처치 <b>${(L.kills || {})[me] || 0}</b> · ⭐ <b>${stars}</b>${next ? ` <small>(다음 업그레이드 ⭐${next})</small>` : ' <small>(업그레이드 끝)</small>'}${ups ? `<br>업그레이드: ${ups.split('').map((k) => UPN[k].split(' ')[0]).join(' ')}` : ''}` };
    const sig = `${need > 0}|${ups}|${used}|${cd > 0}`;
    if (body.dataset.tdsig === sig && body.querySelector('.td-ph')) { const a1 = body.querySelector('.td-dh'), a2 = body.querySelector('.td-me'); if (a1 && a1.innerHTML !== dyn.head) a1.innerHTML = dyn.head; if (a2 && a2.innerHTML !== dyn.me) a2.innerHTML = dyn.me; return; }
    body.dataset.tdsig = sig; body.dataset.tdpk = ''; const keepY2 = window.scrollY;
    body.innerHTML = `<div class="panel framed td-ph"><p class="td-ph-h">🏰 ${esc(mapOf(f).name)} · <span class="td-dh">${dyn.head}</span></p>
      <div class="td-me">${dyn.me}</div>
      ${need > 0 ? `<p class="okc">⬆ <b>업그레이드!</b> 하나를 골라요 <small>(12초 안에 안 고르면 저절로)</small></p><div class="td-ups">${['a', 'b', 'c'].map((k) => `<button class="btn td-btn" data-up="${k}">${UPN[k]}</button>`).join('')}</div>` : ''}
      ${used ? '<p class="muted small">⚡ 기술은 이번 판에 썼어요</p>' : `<button class="btn primary td-btn td-sk${T.tier >= 2 ? ' td-ult' : ''}" id="td-sk">${T.tier >= 3 && T.reso ? '🌟 진필살기 (모든 몬스터 3초 석화)' : T.tier >= 2 ? '⚡ 필살기 (주변 광역 × 5)' : '💥 기술 (주변 광역 × 3)'}<br><small>한 판에 한 번 · 몬스터가 몰렸을 때!</small></button>`}
      ${statCard(tw, mapOf(f))}</div>`;
    if (window.scrollY !== keepY2) window.scrollTo(0, keepY2);
    body.querySelectorAll('[data-up]').forEach((b) => (b.onclick = () => DS.Control.run(async () => { const k = Math.max(ups.length, mine.length); body.querySelectorAll('[data-up]').forEach((x) => { x.disabled = true; }); await N().set(P(code, `tdu/${f.g}/${me}/${k}`), b.dataset.up).catch(() => {}); if (DS.Sound && DS.Sound.correct) DS.Sound.correct(); })));
    const sk = body.querySelector('#td-sk'); if (sk) sk.onclick = () => DS.Control.run(async () => { sk.disabled = true; await N().set(P(code, `tdt/${f.g}/${me}`), N().now()).catch(() => {}); if (DS.Attack && T.tier >= 2) DS.Attack.cutin(Number(tw.hero) || 0, tw.fx, { gold: T.tier >= 3 && T.reso }).catch(() => {}); });
    clearTimeout(PH.t); if (cd > 0) PH.t = setTimeout(() => { if (body.isConnected) phonePlay(body, R, me, code, f); }, 500);
  }
  const paid = {};
  function phoneEnd(body, R, me, code, f) {
    const r = f.res || {}, L = ((R.tdl || {})[f.g]) || {}, inIt = twOf(f).some((t) => t.u === me), p = (R.players || {})[me] || {};
    if (f.phase !== 'end' || typeof r.win !== 'boolean') { body.innerHTML = '<div class="panel framed td-ph"><p class="td-ph-h">🏰 결과 계산 중…</p></div>'; return; } // 결과(res)가 오기 전엔 보상 · 화면 미룸
    const gem = r.win ? 3 : 1;
    if (inIt && DS.Gem && !paid[f.g] && p.cls != null && p.num) { paid[f.g] = true; const m = { c: p.cls, n: p.num }, key = `td_${kst()}`; let k = 0; const pay = () => DS.Gem.add(m, gem, key, '🏰 타워 디펜스', { free: true, upsert: true }).catch(() => 0).then(async () => { const d = await DS.Gem.mine(m).catch(() => ({})); const ok = (((d.log || {})[key] || {}).g || 0) >= gem; if (++k < 6) setTimeout(ok ? check : pay, 1500 * k); }); const check = () => DS.Gem.mine(m).catch(() => ({})).then((d) => { if ((((d.log || {})[key] || {}).g || 0) < gem) pay(); else if (++k < 6) setTimeout(check, 1500 * k); }); pay(); } // 하루 💎 최대 3 (같은 날 키 · 진 뒤 이긴 판은 3 까지 채움) · 저장됐는지 30초 동안 다시 읽어 확인 (없으면 다시 씀)
    if (inIt && !paid['w' + f.g] && p.cls != null && p.num) { paid['w' + f.g] = true; const kk = Number((L.kills || {})[me]) || 0, wp = `xp/${String(p.cls).replace(/[.#$/[\]]/g, '_')}/${p.num}/ttl/wall`; if (kk > 0) N().get(wp).then((v) => { if (kk > (Number(v) || 0)) return N().set(wp, kk); }).catch(() => {}); } // 🏅 #63 🛡 성벽의 수호자 = 한 판 처치 최고 기록
    body.innerHTML = `<div class="panel framed td-ph td-end ${r.win ? 'win' : 'lose'}"><h2>${r.win ? '🏆 승리! 성을 지켰어요' : '💥 아쉽게 졌어요'}</h2>${inIt ? `<p>내 처치 <b>${(L.kills || {})[me] || 0}</b>마리 · ⭐ ${(L.stars || {})[me] || 0}</p>` : ''}
      <p class="td-top3">${arr(r.top).map((x, i) => `<span>${['🥇', '🥈', '🥉'][i]} ${esc(((R.players || {})[x[0]] || {}).nick || '')} ${x[1]}</span>`).join(' ')}</p><p class="muted small">💎 ${r.win ? 3 : 1} (오늘 첫 판만) · 키운 레벨 · 강화 · 스킬이 곧 타워의 힘!</p></div>`;
  }
  const halt = () => { if (H && H.raf) cancelAnimationFrame(H.raf); H = null; }; // 🧪 테스트 TV 창을 닫을 때
  Object.assign(api, { start, ctlHtml, bindCtl, hall, phone, halt, setCode: (c) => { code0 = c; }, _H: () => H });
  return api;
})();
