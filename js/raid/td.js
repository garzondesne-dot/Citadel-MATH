// 🏰 5분 타워 디펜스 (v0.9.14 · 2026-11-07 사용자 「진행」 · 설계 = docs/DECISIONS.md 2026-11-07)
//   쉼터 놀이 하나 (fun.kind = 'td') · 학생 한 명 = 타워 · 자리 고르기 40초(선착순 · 한 번) → 웨이브 5 → 결과
//   여기서만 레벨 · 강화 · 스킬이 진짜 힘 (레이드 공정 규칙의 예외 공간) · 보상은 모두 같게
//   계산(시뮬레이션)과 그림은 교실 TV(종합상황실) 한 대 · 학생 폰은 자리 · 판 안 업그레이드 · 기술만 보냄
//   이 파일 위쪽 = 순수 계산 (node 시험 tests/td.test.js) · 아래쪽 = 화면
window.DS = window.DS || {};

DS.TD = (function () {
  const M = () => DS.TDMaps;
  // ── 숫자 (확정안) ──────────────────────────────────────
  const PICK_MS = 40000, DT = 0.05, WAVE_AT = [0, 36, 72, 108, 144], LIMIT = 225, LIFE = 20, WALK = 22; // 보통 몬스터가 길을 다 걷는 시간(초)
  const STARS_AT = [3, 8, 15, 25], TERRAIN = 1.2, RESO = 1.1, MELEE = { range: 1.6, dmg: 1.3 }, RANGED = { range: 3, dmg: 1 };
  const UP = { a: { atk: 0.25 }, b: { rate: 0.2 }, c: { tier: 1 } }; // ⚔ 공격 · ⚡ 속도 · ✨ 특기 (한 판 하고 끝)
  const TYPES = { n: { hp: 1, sp: 1, leak: 1, star: 1 }, f: { hp: 0.6, sp: 1.6, leak: 1, star: 1 }, t: { hp: 3, sp: 0.6, leak: 2, star: 2 }, m: { hp: 8, sp: 0.7, leak: 3, star: 5, boss: true }, b: { hp: 25, sp: 0.5, leak: 5, star: 10, boss: true } };
  const WAVES = [['n', 10], ['n', 12, 'f', 4], ['n', 10, 't', 4], ['n', 7, 'f', 4, 't', 3, 'm', 2], ['b', 1, 'n', 6, 'f', 3, 't', 3]];
  // 계열 특기 (단계 0~4 = Ⅰ Ⅱ Ⅲ Ⅳ + ✨ 업그레이드 한 칸)
  const FAM = {
    cut: { dmg: [0.2, 0.3, 0.4, 0.5, 0.6] }, smash: { stun: [0.2, 0.35, 0.5, 0.7, 0.9] }, sweep: { splash: [0.5, 0.7, 0.9, 1.1, 1.3] },
    wind: { knock: [0.3, 0.5, 0.7, 0.9, 1.1] }, fire: { burn: [0.15, 0.2, 0.25, 0.3, 0.35] }, spark: { chain: [1, 2, 3, 4, 5] },
    frost: { slow: [0.15, 0.25, 0.35, 0.45, 0.55] }, star: { crit: [0.1, 0.15, 0.2, 0.25, 0.3] }, magic: { boss: [0.2, 0.3, 0.4, 0.5, 0.6] },
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
      const T = towerOf(t.p || {}, map, t.ranged); return Object.assign(T, { uid: t.uid, slot: t.slot, x: s.x, y: s.y, teacher: !!t.teacher, cover: M().cover(map, s.x, s.y, T.range), cd: 0, hits: 0, kills: 0, stars: 0, dmg: 0, ups: [], upGot: 0, awake: false }); });
    // 몬스터 체력 = 반 타워들이 혼자 걷는 몬스터 한 마리에 줄 수 있는 피해 × 계수 (인원 · 레벨 · 강화 · 자리 · 지형이 모두 들어감)
    const power = towers.reduce((a, T) => a + dps(T) * (1 + 0.15 * T.tier) * T.terr * Math.min(T.cover, avgLen) / sp, 0);
    const students = towers.filter((T) => !T.teacher).length, few = Math.max(0.45, Math.min(1, students / 12));
    const hp0 = opt.hp0 || Math.max(30, HP_K * power / Math.max(0.6, few * 1.4)); // 실제로는 calibrate() 로 정함
    const R = rng(opt.seed || 1), spawns = [];
    WAVES.forEach((w, wi) => { const list = []; for (let i = 0; i < w.length; i += 2) for (let k = 0; k < Math.max(w[i] === 'b' || w[i] === 'm' ? w[i + 1] : 1, Math.round(w[i + 1] * few)); k++) list.push(w[i]); { const head = w[0] === 'b' ? list.shift() : null; list.sort(() => R() - 0.5); if (head) list.unshift(head); } // 👑 보스는 마지막 웨이브 맨 앞 (느려서 · 시간 안에 끝나게)
      list.forEach((ty, i) => spawns.push({ at: WAVE_AT[wi] + 1 + i * (26 / Math.max(8, list.length)), ty, wave: wi + 1, path: i % paths.length })); });
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
    if (F.crit && S.R() < F.crit[ti] * tk) { dmg *= 2; if (!noFx) S.fx.push({ k: 'crit', x: m.x, y: m.y, t: S.t }); }
    m.hp -= dmg; T.dmg += dmg;
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
      const v = S.sp * TYPES[m.ty].sp * (m.slowUntil > S.t ? 1 - (m.slow || 0) : 1);
      m.d += v * DT; const [x, y] = posAt(S, m.path, m.d); m.x = x; m.y = y;
      if (m.d >= S.plen[m.path]) { m.dead = true; m.leaked = true; if (S.shield > 0) { S.shield--; S.fx.push({ k: 'block', t: S.t }); } else { S.life -= TYPES[m.ty].leak; S.leaks++; } }
    });
    const cheerK = S.t < S.cheerUntil ? 1.2 : 1;
    S.towers.forEach((T) => {
      T.cd -= DT * cheerK; if (T.cd > 0) return;
      let best = null; S.mons.forEach((m) => { if (!m.dead && Math.hypot(m.x - T.x, m.y - T.y) <= T.range && (!best || m.d > best.d)) best = m; });
      if (!best) return;
      T.cd = 1 / T.rate; T.hits++;
      const F = FAM[T.fam] || {}, ti = Math.min(4, T.tier), dmg = T.atk * T.dmgK;
      hit(S, T, best, dmg);
      if (F.splash) S.mons.forEach((m) => { if (m !== best && !m.dead && Math.hypot(m.x - best.x, m.y - best.y) <= F.splash[ti] * T.terr) hit(S, T, m, dmg * 0.5, true); });
      if (F.chain) { let from = best, left = Math.round(F.chain[ti] * T.terr), d2 = dmg; const seen = new Set([best]); while (left-- > 0) { d2 *= 0.7; let nx = null; S.mons.forEach((m) => { if (!m.dead && !seen.has(m) && Math.hypot(m.x - from.x, m.y - from.y) <= 1.5 && (!nx || m.d > nx.d)) nx = m; }); if (!nx) break; seen.add(nx); hit(S, T, nx, d2, true); from = nx; } }
      S.fx.push({ k: 'shot', fam: T.fam, x0: T.x, y0: T.y, x1: best.x, y1: best.y, t: S.t, uid: T.uid });
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
  const FACTOR = { forest: 1.19, volcano: 1.18, ice: 1.13, desert: 1.19, crypt: 1.18 };
  function score(opt, hp0) { const S = create(Object.assign({}, opt, { hp0 })), R = rng('cal' + (opt.seed || 1)); run(S, (S) => S.towers.forEach((T) => { while (pending(T) > 0) upgrade(S, T.uid, auto(T, R)); })); return S.win ? S.life : -(S.left || 0) - 0.01; }
  function calibrate(opt, f) { let lo = 5, hi = 5000; for (let i = 0; i < 14; i++) { const mid = Math.sqrt(lo * hi); if (score(opt, mid) > 0) lo = mid; else hi = mid; } return Math.round(lo * (f != null ? f : FACTOR[opt.map.id] || 1.2)); }
  const auto = (T, R) => (T.fam === 'fire' || T.fam === 'frost' || T.fam === 'spark' ? 'c' : R() < 0.5 ? 'a' : 'b'); // 안 고르면 저절로 (12초)

  const api = { calibrate, score, FACTOR, PICK_MS, DT, WAVE_AT, LIMIT, LIFE, STARS_AT, UP, TYPES, WAVES, FAM, HP_K, rng, towerOf, dps, create, step, run, upgrade, pending, skill, shieldOn, cheer, auto, posAt };
  return api;
})();
