// 💎 마정석 조각 (v0.9.10 · 2026-11-05 사용자 확정): 노력 · 복습 · 도전으로 모으고, ⚙ 설정에서 원하는 용사 · 이펙트를 직접 골라 해금
//   저장: gem/{반}/{번호} = { total(남은 조각), earned(모은 합), day: { 날짜: 그날 한도 안에서 받은 수 }, log: { 키: { g, at, why } }, buy: { 물건: at }, medal: { 종류: 개수 }, chest: {…}, feather: 🪶 }
//   한도: 하루 30 (반대항 · 연속 참여 · 인장 · 레벨처럼 「꾸준함 · 반 단위」 보상은 한도 밖 free) · 같은 키는 한 번만 (upsert = 늘어난 만큼만)
//   원칙: 처음 맞힘 ≥ 고침 > 포기 · 운 보상은 작게 · 보상은 꾸미기만 (레이드 데미지 · 성적과 무관)
window.DS = window.DS || {};

DS.Gem = (function () {
  const N = () => DS.Net;
  const ck = (c) => String(c).replace(/[.#$/[\]]/g, '_');
  const kk = (k) => String(k).replace(/[.#$/[\]]/g, '_');
  const DAY_CAP = 100; // 2026-11-06 경제 다시 맞춤: 30 → 50 (수학 풀이 보상을 올려서) · 2026-11-07 → 60 (보상 전체 +20%) · 2026-11-09 #27 → 100 (선생님)
  const path = (m) => `gem/${ck(m.c)}/${m.n}`;
  // 🧪 테스트 모드 (2026-11-09 선생님 「테스트 모드에서 마정석 많이 · 해금은 전부 잠가 두고」): 테스트 저장소(이 기기 안 · Firebase 아님)로 바꿔 낀 동안은 💎 · 📜 · 상점 · 강화가 진짜처럼 돎
  const tst = (m) => !!(m && m.test && !(typeof DS !== 'undefined' && DS.Test && DS.Test.active && DS.Test.active()));
  const today = () => new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
  // 💎 오늘 남은 한도 (2026-11-09 #27): 한도에 걸려 덜 받을 때 학생이 이유를 알게 · 💎 칩 옆에 작게
  const dayLeft = (d) => Math.max(0, DAY_CAP - ((((d || {}).day) || {})[today()] || 0));
  // 2026-11-09 선생님: 칩 옆 「오늘 +n」은 「오늘 n개 준다」로 읽혀서 뺌 → 💎 상점(내 용사 창) 안에 「오늘 받은 💎 a / 100」 · 10개 이하 남으면 팝업 한 번
  function showLeft(d) { if (typeof document === 'undefined') return; const n = dayLeft(d), got = DAY_CAP - n; document.querySelectorAll('#me-day').forEach((e) => { e.innerHTML = `오늘 받은 💎 <b>${got}</b> / ${DAY_CAP} <small>(하루 한도 · ${n > 0 ? `${n}개 더 받을 수 있어요` : '내일 다시 받아요'} · 선생님 선물 · 업적은 따로)</small>`; e.classList.toggle('out', n <= 10); }); }
  function capAlert(m, d) { // 한도가 10개 이하로 남으면 그날 한 번 팝업
    if (typeof document === 'undefined') return; const n = dayLeft(d); if (n > 10) return;
    const k = `ds-gemcap-${m.c}-${m.n}-${today()}-${n <= 0 ? 0 : 10}`; try { if (localStorage.getItem(k)) return; localStorage.setItem(k, '1'); } catch (e) { /* 저장 못 해도 띄움 */ }
    const e = document.createElement('div'); e.className = 'gem-cap-pop'; e.innerHTML = n <= 0 ? `<b>💎 오늘 한도를 다 받았어요!</b><small>하루 ${DAY_CAP}개까지 · 내일 다시 모아요 (선생님 선물 · 업적은 따로)</small>` : `<b>💎 오늘 받을 수 있는 마정석이 ${n}개 남았어요</b><small>하루 ${DAY_CAP}개까지 · 내일 다시 채워져요</small>`;
    document.body.appendChild(e); setTimeout(() => e.classList.add('go'), 3800); setTimeout(() => e.remove(), 4400);
  }
  // 적립표 (확정안 · 한 곳에서 바꿈)
  // 2026-11-07 사용자 「보상 전체 +20%」: 새 용사 6 · 📐 수식 이펙트로 상점이 💎1,580 → 1,980 → 수입도 약 1.2배 (비율은 그대로 · tests/economy.test.js)
  const G = {
    join: 4,            // 레이드 참여
    survey: 10,         // 📝 수업 설문 응답 (한 번 · 하루 한도 밖 · 2026-11-06 사용자)
    solvedMax: 12,      // 맞힌 소문제 1개당 1 (처음이든 고쳐서든 같음) · 수업당 최대 10 (2026-11-06: 5 → 10)
    perfect: 6,         // ⚡ 그 수업에서 첫 시도 퍼펙트 몬스터가 하나라도 (실력)
    bossPerfect: 6,     // 👑 수업 중 형성평가 만점 (실력) — 실력 · 노력 갈래를 비슷하게 (tests/economy.test.js)
    bossRe: 14,          // 👑 형성평가 재대결 처치 (처음)
    room: 8, roomFirst: 6, roomBoss: 24, // 🏰 성채 방 · 첫 판에 틀림 없이 처치 보너스 · 보스 방 (처음 · 2026-11-06: 3 · 10 → 6 · 20)
    photo: 6,           // 📷 서술형 사진 통과 (처음 · 노력)
    review: 3, reviewDay: 6, // 🎯 허수아비에서 틀림 · 안 풂 해결 (하루 3번까지)
    card: 3,            // ⚒ 처음 만든 카드
    seal: 12,           // 🟪 인장 (한도 밖)
    rift: 6,            // ⏳ 이어하기 완주
    clear: 4,           // ⏰ 시간 안 클리어
    note: 7,            // 📕 그 차시 오답노트 완성 (남은 문제 0)
    streak: { 3: 4, 5: 6, 10: 12 }, // 🔁 연속 참여 (한도 밖)
    level5: 6,          // 🆙 레벨 5 · 10 · 15 … (한도 밖)
    first: 4,           // 🏰 성채 첫 방 · 🎯 허수아비 첫 복습 (한 번)
    funJoin: 1, funWin: 4, oxWin: 7, quizAll: 2, // 🎖 쉼터 놀이 · OX 타임
    comboBest: 4,       // 🔥 반 최고 콤보를 깬 사슬에 낀 학생 (한도 밖 · v0.9.11)
    bat: 4,             // 🦇 황금 박쥐 포획 → 반 전체 (v0.9.11)
    punchFirst: 6, punchUp: 4, // 🏁 반대항 1등 반 · 지난 차시보다 +10% (한도 밖)
    teacherMax: 5,      // 👩‍🏫 선생님 지급 1회 최대
  };
  // 상점 (조각으로 해금) · 업적 전용(도감 · 첫 레이드 · 인장 3개 · 놀이 메달)은 여기 없음
  const SHOP = {
    hero: { 8: 60, 10: 60, 11: 60, 12: 30, 13: 30, 14: 60, 15: 60, 21: 30, 22: 30, 18: 60, 23: 60 }, // 2026-11-07 새 용사: 메카닉 · 해커 💎30 · 흑기사 · 용기사 💎60 · 수식 책사 남 · 여(19 · 20)는 📷 서술형 사진 통과로 (PHOTO_HEROES)
    fx: { fire: 40, lightning: 40, ice: 40, stars: 60, slash: 60, vortex: 80, // Ⅲ 화려 (인장으로도)
      moon: 20, ring: 20, chain: 20, spikes: 20, mana: 20, crit: 20, // Ⅱ 숙련 (2026-11-06)
      twin: 80, pillar: 80, thunder: 80, nova: 80, meteor: 80, void: 80, // Ⅳ 전설 = 같은 계열 Ⅲ 이 있어야 (account.js need) · 2026-11-06: 💎120 → 💎80 + 📜3
      upper: 20, sweep: 20, hammer: 60, spin: 60, quake: 80, reap: 80,
      gale: 20, leaf: 60, cyclone: 80, compass: 20, venn: 60, qed: 80 }, // 🌬 바람 (2026-11-06) // 🔨 강타 · 🌪 연격 (2026-11-06 · Ⅲ 은 인장 없이 💎60)
  };
  // 📚 도감 특전 용사 (2026-11-07 사용자 「모루 💎」): 성기사 8 · 무희 10 · 음유시인 11 = 💎 60 으로 먼저 열 수 있음 → 그 도감 카드를 다 모으면 💎 60 돌려받음 · 되팔기 불가
  const CARD_HEROES = [8, 10, 11];
  const itemKey = (kind, id) => `${kind}_${id}`;
  const price = (kind, id) => (SHOP[kind] || {})[id] ?? null;
  // 📜 서술 조각 (2026-11-06): 서술형 사진 채점에서만 · 전설 Ⅳ · 강화 +7~ 에 함께 듦
  const SCROLL_NEED = { fx: { twin: 3, pillar: 3, thunder: 3, nova: 3, meteor: 3, void: 3, quake: 3, reap: 3, cyclone: 3, qed: 3 } };
  // 🧑‍🎓 수식 책사 남 · 여 (2026-11-07 사용자 「서술형 찍어서 정답 처리되면 해금」): 📷 사진 통과 기록(📜 s_ph_… · 하루 💎 한도와 상관없이 남음)이 하나라도 있으면
  const PHOTO_HEROES = [19, 20];
  const photoPassed = (d) => Object.keys((d && d.log) || {}).some((k) => k.startsWith('s_ph_'));
  const scrollOf = (kind, id) => (SCROLL_NEED[kind] || {})[id] || 0;
  // 🔨 강화 +1 ~ +10 (캐릭터 하나 · 실패 없음 · 🌟 대성공 10% = 💎 절반 돌려받기 + 반짝)
  const ENH = [null, { g: 10 }, { g: 15 }, { g: 20 }, { g: 25 }, { g: 30 }, { g: 40 }, { g: 50, s: 1 }, { g: 60, s: 1 }, { g: 80, s: 2 }, { g: 100, s: 2 }];
  const ENH_MAX = 10, GREAT = 0.1;
  // ✨ 강화 오라 1~10 (2026-11-08 사용자 「은은한 오라 · 1단계부터 10단계까지 색깔」): 강화 단계 = 오라 단계 (CSS .aura-1 ~ .aura-10)
  const auraCls = (lv) => { const n = Math.max(0, Math.min(10, Math.floor(Number(lv) || 0))); return n ? ` aura aura-${n}` : ''; };
  const AURA_NAMES = ['', '은은한 흰빛', '새싹 초록', '맑은 하늘', '깊은 바다', '보랏빛 신비', '벚꽃 분홍', '황금 태양', '진홍 불꽃', '별빛 은하', '성스러운 후광'];
  const enhTier = (lv) => (lv >= 10 ? 4 : lv >= 7 ? 3 : lv >= 5 ? 2 : lv >= 3 ? 1 : 0); // 보이는 빛: 은빛(+3) · 금빛(+5) · 오라(+7) · 무지개(+10)
  async function mine(m) { return (m && m.c != null && m.n && !tst(m) ? await N().get(path(m)).catch(() => null) : null) || {}; }
  // 받기: n 개 · key 한 번만 (opt.upsert = 같은 key 는 늘어난 만큼만) · opt.free = 하루 한도 밖 → 실제로 받은 수
  async function add(m, n, key, why, opt = {}) {
    n = Math.max(0, Math.floor(Number(n) || 0)); if (!m || m.c == null || !m.n || tst(m) || !n || !key) return 0;
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
    if (!opt.quiet) pop(g, why); if (!opt.free) capAlert(m, { day: { [day]: used + g } }); // 한도 밖(선물 · 업적)은 알림 없음
    return g;
  }
  // 📜 받기: key 한 번만 (upsert = 늘어난 만큼만) · 하루 한도 없음
  async function addScroll(m, n, key, why, opt = {}) {
    n = Math.max(0, Math.floor(Number(n) || 0)); if (!m || m.c == null || !m.n || tst(m) || !n || !key) return 0;
    const d = await mine(m), k = `s_${kk(key)}`, had = ((d.log || {})[k] || {}).s || 0;
    if (had && !opt.upsert) return 0;
    const g = Math.max(0, n - had); if (!g) return 0;
    await N().update(path(m), { scroll: (Number(d.scroll) || 0) + g, scrollEarned: (Number(d.scrollEarned) || 0) + g, [`log/${k}`]: { s: had + g, at: N().TS, why: String(why || '').slice(0, 40) } });
    if (typeof document !== 'undefined') { const e = document.createElement('div'); e.className = 'gem-pop scroll'; e.innerHTML = `📜 +${g}${why ? ` <small>${String(why).replace(/[<>&]/g, '')}</small>` : ''}`; document.body.appendChild(e); setTimeout(() => e.remove(), 2600); }
    return g;
  }
  // 🔨 강화 한 단계: 실패 없음 · 대성공 10% = 낸 💎 의 절반 돌려받기 → { lv, great, back }
  async function enhance(m, rnd = Math.random) {
    if (!m || m.c == null || !m.n || tst(m)) throw Object.assign(new Error('학생 계정으로 강화할 수 있어요.'), { user: true });
    const d = await mine(m), lv = Number(d.enh) || 0; if (lv >= ENH_MAX) throw Object.assign(new Error('이미 +10 이에요!'), { user: true });
    const c = ENH[lv + 1], tot = Number(d.total) || 0, sc = Number(d.scroll) || 0;
    if (tot < c.g) throw Object.assign(new Error(`💎 조각이 ${c.g - tot}개 모자라요.`), { user: true });
    if (c.s && sc < c.s) throw Object.assign(new Error(`📜 서술 조각이 ${c.s - sc}개 모자라요 — 성채 서술형 방에서 풀이 사진을 통과하면 모여요.`), { user: true });
    const great = rnd() < GREAT, back = great ? Math.floor(c.g / 2) : 0;
    await N().update(path(m), { enh: lv + 1, total: tot - c.g + back, ...(c.s ? { scroll: sc - c.s } : {}), [`log/enh_${lv + 1}`]: { g: -c.g + back, ...(c.s ? { s: -c.s } : {}), at: N().TS, why: `🔨 강화 +${lv + 1}${great ? ' 🌟 대성공' : ''}` } });
    return { lv: lv + 1, great, back };
  }
  // 🎁 선생님 선물 (2026-11-06 · 교사 폰 리모컨에서만): 하루 한도 밖 · 받은 학생 캠프에 알림 (log 키 gift_…)
  async function gift(c, n, g, tag) {
    g = Math.max(1, Math.min(100, Math.floor(Number(g) || 0)));
    const m = { c, n: Number(n) }, d = await mine(m), k = kk(`gift_${tag}_${n}`);
    await N().update(path(m), { total: (Number(d.total) || 0) + g, earned: (Number(d.earned) || 0) + g, [`log/${k}`]: { g, at: N().TS, why: '🎁 선생님 선물', gift: true } });
    return g;
  }
  // 아직 안 본 선물 합계 (학생 캠프 알림용 · seen = 마지막으로 본 시각)
  const giftsSince = (d, seen) => Object.values((d || {}).log || {}).filter((x) => x && x.gift && Number(x.at) > (Number(seen) || 0)).reduce((a, x) => ({ g: a.g + (Number(x.g) || 0), at: Math.max(a.at, Number(x.at) || 0) }), { g: 0, at: 0 });
  // 🎁 선물 알림 어디서나 (2026-11-06 사용자 A: 「선물 줬지? → 안 줬어요 · 우편함에 뭐가?」): 학생 계정 하나당 한 번 지켜봄 → 캠프 · 대기실 · 던전 어디서든 바로 큰 알림
  let giftStop = null, giftFor = '';
  function watchGifts(m) {
    if (!m || m.c == null || !m.n || tst(m) || m.teacher || typeof localStorage === 'undefined') return;
    const who = `${m.c}-${m.n}`; if (giftFor === who) return; giftFor = who; if (giftStop) giftStop();
    const K = `citadel-giftseen-${who}`;
    giftStop = N().watch(path(m), (d) => {
      let seen = 0; try { seen = Number(localStorage.getItem(K)) || 0; } catch (e) { /* 이 기기만 */ }
      const r = giftsSince(d || {}, seen); if (!(r.g > 0)) return;
      try { localStorage.setItem(K, String(r.at)); } catch (e) { /* 다음에 또 */ }
      if (typeof document === 'undefined') return;
      const e = document.createElement('div'); e.className = 'gift-note'; e.innerHTML = `<b>🎁 선생님 선물!</b><span>💎 +${r.g}</span><small>📮 우편함에 기록돼요</small>`;
      document.body.appendChild(e); setTimeout(() => e.remove(), 4200); if (window.DS && DS.Sound && DS.Sound.coin) DS.Sound.coin();
    });
  }
  // 📮 우편함: 받은 선물 목록 (최근 순)
  const giftList = (d) => Object.values((d || {}).log || {}).filter((x) => x && x.gift).sort((a, b) => (Number(b.at) || 0) - (Number(a.at) || 0));
  // 하루 n 번까지만 (허수아비 복습처럼)
  async function addDaily(m, n, base, limit, why) {
    const d = await mine(m), day = today(), keys = Object.keys(d.log || {}).filter((k) => k.startsWith(`${kk(base)}_${day}_`));
    if (keys.length >= limit) return 0;
    return add(m, n, `${base}_${day}_${keys.length}`, why);
  }
  async function medal(m, kind) {
    if (!m || m.c == null || !m.n || tst(m)) return 0;
    const d = await mine(m), v = (Number(((d.medal || {})[kind])) || 0) + 1;
    await N().set(`${path(m)}/medal/${kk(kind)}`, v); return v;
  }
  async function buy(m, kind, id) {
    const p = price(kind, id); if (p == null) throw Object.assign(new Error('살 수 없는 물건이에요.'), { user: true });
    const d = await mine(m), key = itemKey(kind, id);
    if ((d.buy || {})[key]) throw Object.assign(new Error('이미 해금했어요.'), { user: true });
    if ((Number(d.total) || 0) < p) throw Object.assign(new Error(`💎 조각이 ${p - (Number(d.total) || 0)}개 모자라요.`), { user: true });
    const sc = scrollOf(kind, id); if (sc && (Number(d.scroll) || 0) < sc) throw Object.assign(new Error(`📜 서술 조각이 ${sc - (Number(d.scroll) || 0)}개 모자라요 — 성채 서술형 방에서 풀이 사진을 통과하면 모여요.`), { user: true });
    await N().update(path(m), { total: (Number(d.total) || 0) - p, ...(sc ? { scroll: (Number(d.scroll) || 0) - sc } : {}), [`buy/${key}`]: N().TS, [`log/buy_${key}`]: { g: -p, ...(sc ? { s: -sc } : {}), at: N().TS, why: '상점 해금' } });
    return true;
  }
  const owns = (d, kind, id) => !!((d || {}).buy || {})[itemKey(kind, id)];
  // 💰 되팔기 (2026-11-06 사용자 「회수 = (나) 조각 일부 환불 + 약간의 패널티」): 산 값의 70% 를 돌려받고 다시 잠김 · 상점에서 산 스킬만
  const REFUND = 0.7;
  const refundOf = (kind, id, d) => { const paid = -Number(((((d || {}).log || {})[`buy_${itemKey(kind, id)}`]) || {}).g) || price(kind, id); return paid == null ? 0 : Math.floor(paid * REFUND); }; // 산 값 기준 (값이 바뀌어도) · 📜 는 돌려주지 않음
  async function sell(m, kind, id) {
    const p = price(kind, id), d = await mine(m), key = itemKey(kind, id);
    if (kind === 'hero' && CARD_HEROES.includes(Number(id))) throw Object.assign(new Error('도감 특전 용사는 되팔 수 없어요 — 카드를 다 모으면 💎 를 돌려받아요.'), { user: true });
    if (p == null || !(d.buy || {})[key]) throw Object.assign(new Error('상점에서 산 것만 되팔 수 있어요.'), { user: true });
    const back = refundOf(kind, id, d);
    await N().update(path(m), { total: (Number(d.total) || 0) + back, [`buy/${key}`]: null, [`log/sell_${key}_${Date.now()}`]: { g: back, at: N().TS, why: '되팔기 (70%)' } });
    return back;
  }
  // 화면: 받는 순간 오른쪽 위에 「💎 +3」
  // opt.quiet (#68 B 2026-11-11): 부른 쪽이 여러 💎 를 모아 pop 한 번
  function pop(g, why) {
    if (typeof document === 'undefined' || !g) return;
    const e = document.createElement('div'); e.className = 'gem-pop'; e.innerHTML = `💎 +${g}${why ? ` <small>${String(why).replace(/[<>&]/g, '')}</small>` : ''}`;
    document.body.appendChild(e); setTimeout(() => e.remove(), 2600);
    if (window.DS && DS.Sound && DS.Sound.coin) DS.Sound.coin(); // 🔊 2026-11-06
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
    if (!m || m.c == null || !m.n || tst(m) || !DS.Combo) return null;
    const d = await mine(m), c = d.chest || {}, day = today(), k = kk(`${ctx.code}_${ctx.mid}`);
    if ((c.log || {})[k]) return null; // 같은 처치는 한 번만 (새로 고쳐도 다시 안 굴림)
    let dry = Number(c.dry) || 0, cur = c.cur || '', got = !!c.got, firstKill = false;
    if (cur !== ctx.code) { if (cur && !got) dry++; cur = ctx.code; got = false; firstKill = true; }
    const used = Number((c.day || {})[day]) || 0, C = DS.Combo.CHEST;
    const pity = !ctx.force && firstKill && dry >= C.pity;
    const r = !ctx.force && used >= C.day ? null : DS.Combo.chestRoll(`${ctx.code}|${ctx.uid}|${ctx.mid}`, !!ctx.streak3, !!ctx.force || pity);
    const patch = { 'chest/cur': cur, 'chest/got': got || !!r, 'chest/dry': r ? 0 : dry, [`chest/log/${k}`]: r ? r.tier : 'none' };
    if (r && !ctx.force) patch[`chest/day/${day}`] = used + 1;
    if (r && r.rare) patch.rare = (Number(d.rare) || 0) + r.rare;
    await N().update(path(m), patch);
    if (r && r.gem) await add(m, r.gem, `chest_${ctx.code}_${ctx.mid}`, `🎁 ${r.name} 상자`, { free: !!ctx.force || !!r.rare });
    return r ? { ...r, pity, rares: rareOf(d) + (r.rare || 0) } : null;
  }
  // 🌟 황금 날개 업적 = 🎁 영웅 · 전설 상자 5번 (전환 전 🪶 깃털 수 + 전환 뒤 rare)
  const rareOf = (d) => (d && d.conv ? 0 : Number((d || {}).feather) || 0) + (Number((d || {}).rare) || 0);
  const feathers = rareOf; // 예전 이름
  // 🔁 화폐 전환 (2026-11-07 사용자 「1 이번」 + 「전환 전 인장 · 깃털 수를 기록으로 남기기 (누가 몇 개였는지 · 💎로 바뀐 양) → 분석 때 그대로」)
  //   학생 계정마다 한 번 (캠프 · 내 용사 창을 열 때) · gem/{반}/{번호}/conv = 그대로 남는 기록 (옛 feather 값도 지우지 않음)
  //   🪶 깃털 1 = 💎 10 · ⚒ 이미 만든 카드 중 💎 를 못 받은 카드 1장 = 💎 3 → 📮 우편함(선물 기록)으로
  const CONV = { v: '2026-11-07', feather: 10, card: 3 };
  async function convert(m, info = {}) {
    if (!m || m.c == null || !m.n || tst(m) || m.teacher) return null;
    const d = await mine(m); if (d.conv) return null;
    const fe = Number(d.feather) || 0, log = d.log || {};
    const cards = Object.keys(info.cards || {}).filter((id) => (info.cards || {})[id]);
    const unpaid = cards.filter((id) => !log[kk(`card_${id}`)]);
    const fg = fe * CONV.feather, cg = unpaid.length * CONV.card, g = fg + cg, tot = Number(d.total) || 0;
    const rec = { v: CONV.v, at: N().TS, seals: Number(info.seals) || 0, feather: fe, featherGem: fg, cards: cards.length, cardsUnpaid: unpaid.length, cardGem: cg, gemBefore: tot, gemAfter: tot + g };
    const patch = { conv: rec, rare: (Number(d.rare) || 0) + fe };
    if (g) Object.assign(patch, { total: tot + g, earned: (Number(d.earned) || 0) + g });
    if (fg) patch['log/conv_feather'] = { g: fg, at: N().TS, why: `🪶 깃털 ${fe}개 → 💎`, gift: true };
    if (cg) patch['log/conv_card'] = { g: cg, at: N().TS, why: `⚒ 만든 카드 ${unpaid.length}장 💎`, gift: true };
    await N().update(path(m), patch);
    return rec;
  }
  // 📚 도감 특전 용사를 💎 로 먼저 연 뒤 카드를 다 모으면 → 산 값 돌려받기 (한 번 · 📮 우편함)
  async function cardRefund(m, id) {
    if (!m || m.c == null || !m.n || tst(m) || m.teacher) return 0;
    const d = await mine(m), key = itemKey('hero', id), log = d.log || {};
    if (!(d.buy || {})[key] || log[`refund_${key}`]) return 0;
    const back = -Number((log[`buy_${key}`] || {}).g) || price('hero', id) || 0; if (!back) return 0;
    await N().update(path(m), { total: (Number(d.total) || 0) + back, [`log/refund_${key}`]: { g: back, at: N().TS, why: '📚 도감 완성 → 💎 돌려받음', gift: true } });
    return back;
  }
  return { pop, dayLeft, showLeft, capAlert, auraCls, AURA_NAMES, PHOTO_HEROES, photoPassed, SCROLL_NEED, scrollOf, ENH, ENH_MAX, GREAT, enhTier, addScroll, enhance, watchGifts, giftList, chest, feathers, rareOf, convert, CONV, cardRefund, CARD_HEROES, G, SHOP, DAY_CAP, price, mine, add, gift, giftsSince, addDaily, medal, buy, sell, refundOf, REFUND, owns, itemKey, streak, today };
})();
