// 💎 마정석 조각 (v0.9.10 · 2026-11-05 사용자 확정): 노력 · 복습 · 도전으로 모으고, ⚙ 설정에서 원하는 용사 · 이펙트를 직접 골라 해금
//   저장: gem/{반}/{번호} = { total(남은 조각), earned(모은 합), day: { 날짜: 그날 한도 안에서 받은 수 }, log: { 키: { g, at, why } }, buy: { 물건: at }, medal: { 종류: 개수 }, chest: {…}, feather: 🪶 }
//   한도: 하루 30 (반대항 · 연속 참여 · 인장 · 레벨처럼 「꾸준함 · 반 단위」 보상은 한도 밖 free) · 같은 키는 한 번만 (upsert = 늘어난 만큼만)
//   원칙: 처음 맞힘 ≥ 고침 > 포기 · 운 보상은 작게 · 보상은 꾸미기만 (레이드 데미지 · 성적과 무관)
window.DS = window.DS || {};

DS.Gem = (function () {
  const N = () => DS.Net;
  const ck = (c) => String(c).replace(/[.#$/[\]]/g, '_');
  const kk = (k) => String(k).replace(/[.#$/[\]]/g, '_');
  const DAY_CAP = 30;
  const path = (m) => `gem/${ck(m.c)}/${m.n}`;
  const today = () => new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
  // 적립표 (확정안 · 한 곳에서 바꿈)
  const G = {
    join: 3,            // 레이드 참여
    solvedMax: 5,       // 맞힌 소문제 1개당 1 (처음이든 고쳐서든 같음) · 수업당 최대 5
    bossRe: 5,          // 👑 형성평가 재대결 처치 (처음)
    room: 3, roomBoss: 10, // 🏰 성채 방 · 보스 방 처치 (처음)
    review: 1, reviewDay: 3, // 🎯 허수아비에서 틀림 · 안 풂 해결 (하루 3번까지)
    card: 2,            // ⚒ 처음 만든 카드
    seal: 10,           // 🟪 인장 (한도 밖)
    rift: 5,            // ⏳ 이어하기 완주
    clear: 3,           // ⏰ 시간 안 클리어
    note: 3,            // 📕 그 차시 오답노트 완성 (남은 문제 0)
    streak: { 3: 3, 5: 5, 10: 10 }, // 🔁 연속 참여 (한도 밖)
    level5: 5,          // 🆙 레벨 5 · 10 · 15 … (한도 밖)
    first: 3,           // 🏰 성채 첫 방 · 🎯 허수아비 첫 복습 (한 번)
    funJoin: 1, funWin: 3, oxWin: 6, quizAll: 2, // 🎖 쉼터 놀이 · OX 타임
    comboBest: 3,       // 🔥 반 최고 콤보를 깬 사슬에 낀 학생 (한도 밖 · v0.9.11)
    bat: 3,             // 🦇 황금 박쥐 포획 → 반 전체 (v0.9.11)
    punchFirst: 5, punchUp: 3, // 🏁 반대항 1등 반 · 지난 차시보다 +10% (한도 밖)
    teacherMax: 5,      // 👩‍🏫 선생님 지급 1회 최대
  };
  // 상점 (조각으로 해금) · 업적 전용(도감 · 첫 레이드 · 인장 3개 · 놀이 메달)은 여기 없음
  const SHOP = {
    hero: { 12: 30, 13: 30, 14: 60, 15: 60 },
    fx: { fire: 40, lightning: 40, ice: 40, stars: 60, slash: 60, vortex: 80 },
  };
  const itemKey = (kind, id) => `${kind}_${id}`;
  const price = (kind, id) => (SHOP[kind] || {})[id] ?? null;
  async function mine(m) { return (m && m.c != null && m.n && !m.test ? await N().get(path(m)).catch(() => null) : null) || {}; }
  // 받기: n 개 · key 한 번만 (opt.upsert = 같은 key 는 늘어난 만큼만) · opt.free = 하루 한도 밖 → 실제로 받은 수
  async function add(m, n, key, why, opt = {}) {
    n = Math.max(0, Math.floor(Number(n) || 0)); if (!m || m.c == null || !m.n || m.test || !n || !key) return 0;
    const d = await mine(m), k = kk(key), had = ((d.log || {})[k] || {}).g || 0;
    if (had && !opt.upsert) return 0;
    let g = Math.max(0, n - had); if (!g) return 0;
    const day = today(), used = ((d.day || {})[day]) || 0;
    if (!opt.free) g = Math.max(0, Math.min(g, DAY_CAP - used));
    if (!g) return 0;
    await N().update(path(m), {
      total: (Number(d.total) || 0) + g, earned: (Number(d.earned) || 0) + g,
      [`log/${k}`]: { g: had + g, at: N().TS, why: String(why || '').slice(0, 40) },
      ...(opt.free ? {} : { [`day/${day}`]: used + g }),
    });
    pop(g, why);
    return g;
  }
  // 하루 n 번까지만 (허수아비 복습처럼)
  async function addDaily(m, n, base, limit, why) {
    const d = await mine(m), day = today(), keys = Object.keys(d.log || {}).filter((k) => k.startsWith(`${kk(base)}_${day}_`));
    if (keys.length >= limit) return 0;
    return add(m, n, `${base}_${day}_${keys.length}`, why);
  }
  async function medal(m, kind) {
    if (!m || m.c == null || !m.n || m.test) return 0;
    const d = await mine(m), v = (Number(((d.medal || {})[kind])) || 0) + 1;
    await N().set(`${path(m)}/medal/${kk(kind)}`, v); return v;
  }
  async function buy(m, kind, id) {
    const p = price(kind, id); if (p == null) throw Object.assign(new Error('살 수 없는 물건이에요.'), { user: true });
    const d = await mine(m), key = itemKey(kind, id);
    if ((d.buy || {})[key]) throw Object.assign(new Error('이미 해금했어요.'), { user: true });
    if ((Number(d.total) || 0) < p) throw Object.assign(new Error(`💎 조각이 ${p - (Number(d.total) || 0)}개 모자라요.`), { user: true });
    await N().update(path(m), { total: (Number(d.total) || 0) - p, [`buy/${key}`]: N().TS, [`log/buy_${key}`]: { g: -p, at: N().TS, why: '상점 해금' } });
    return true;
  }
  const owns = (d, kind, id) => !!((d || {}).buy || {})[itemKey(kind, id)];
  // 화면: 받는 순간 오른쪽 위에 「💎 +3」
  function pop(g, why) {
    if (typeof document === 'undefined' || !g) return;
    const e = document.createElement('div'); e.className = 'gem-pop'; e.innerHTML = `💎 +${g}${why ? ` <small>${String(why).replace(/[<>&]/g, '')}</small>` : ''}`;
    document.body.appendChild(e); setTimeout(() => e.remove(), 2600);
  }
  // 🔁 연속 참여: 그 반이 게임으로 수업한 차시(held) 를 차시 순서로 · 끝에서부터 연속으로 기록이 있는 수
  function streak(records, held) {
    const ids = DS.Lessons.list.filter((l) => l.no && !l.eval && (held || {})[l.id]).sort((a, b) => a.no - b.no).map((l) => l.id);
    let s = 0; for (let i = ids.length - 1; i >= 0; i--) { if ((records || {})[ids[i]]) s++; else break; }
    return s;
  }
  // 🎁 보물 상자 (v0.9.11): gem/{반}/{번호}/chest = { day: { 날짜: 개수 }, dry(연속 못 받은 수업), cur(지금 수업 코드), got(지금 수업에서 받음), log: { 키: 결과 } } · feather = 🪶 깃털
  //   ctx = { code, mid, uid, streak3, force(🦇 박쥐 = 확정 · 하루 한도 밖) } → { tier, name, gem, feather } | null
  async function chest(m, ctx) {
    if (!m || m.c == null || !m.n || m.test || !DS.Combo) return null;
    const d = await mine(m), c = d.chest || {}, day = today(), k = kk(`${ctx.code}_${ctx.mid}`);
    if ((c.log || {})[k]) return null; // 같은 처치는 한 번만 (새로 고쳐도 다시 안 굴림)
    let dry = Number(c.dry) || 0, cur = c.cur || '', got = !!c.got, firstKill = false;
    if (cur !== ctx.code) { if (cur && !got) dry++; cur = ctx.code; got = false; firstKill = true; }
    const used = Number((c.day || {})[day]) || 0, C = DS.Combo.CHEST;
    const pity = !ctx.force && firstKill && dry >= C.pity;
    const r = !ctx.force && used >= C.day ? null : DS.Combo.chestRoll(`${ctx.code}|${ctx.uid}|${ctx.mid}`, !!ctx.streak3, !!ctx.force || pity);
    const patch = { 'chest/cur': cur, 'chest/got': got || !!r, 'chest/dry': r ? 0 : dry, [`chest/log/${k}`]: r ? r.tier : 'none' };
    if (r && !ctx.force) patch[`chest/day/${day}`] = used + 1;
    if (r && r.feather) patch.feather = (Number(d.feather) || 0) + r.feather;
    await N().update(path(m), patch);
    if (r && r.gem) await add(m, r.gem, `chest_${ctx.code}_${ctx.mid}`, `🎁 ${r.name} 상자`, { free: !!ctx.force });
    return r ? { ...r, pity, feathers: (Number(d.feather) || 0) + (r.feather || 0) } : null;
  }
  const feathers = (d) => Number((d || {}).feather) || 0;
  return { chest, feathers, G, SHOP, DAY_CAP, price, mine, add, addDaily, medal, buy, owns, itemKey, streak, today };
})();
