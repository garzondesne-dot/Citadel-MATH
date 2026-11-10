// 계정: 반 + 번호 + 숫자 4자리. 이름은 교사가 올린 명단에서 나온다 (학생이 이름을 입력하지 않음).
// Firebase 이메일 로그인을 쓰되 학생에게는 반·번호·4자리만 보인다 (실제 이메일은 받지 않는다).
//   roster/{반}/{번호}     = 이름 (로그인한 계정만 읽음)          rosterMask/{반}/{번호} = 가운데를 가린 이름 (로그인 전 확인용)
//   accounts/{반}/{번호}   = { uid, gen, hero, reset? }        gen = 초기화할 때마다 1씩 (새 로그인을 기존 데이터에 연결)
//   admins/{uid}           = 교사 계정 (처음 한 번만 만들 수 있음)
// 초기화: 교사가 reset 표시 → 학생이 0000 으로 로그인 → 새 4자리를 정하면 gen+1 로그인을 만들어 연결
window.DS = window.DS || {};

DS.Account = (function () {
  const N = () => DS.Net;
  const fail = (msg) => { const e = new Error(msg); e.user = true; throw e; };
  const DOMAIN = 'citadel.class';
  // Firebase 로그인 오류 → 우리말 안내
  function why(e) {
    const c = (e && e.code) || '';
    if (c === 'auth/operation-not-allowed') return '서버에서 이메일/비밀번호 로그인이 꺼져 있어요. Firebase 콘솔 → Authentication → 로그인 방법(Sign-in method) → 이메일/비밀번호 → 사용 설정 후 다시 해 주세요.';
    if (c === 'auth/network-request-failed') return '인터넷 연결을 확인해 주세요.';
    if (c === 'auth/too-many-requests') return '여러 번 틀려서 잠시 막혔어요. 조금 뒤에 다시 해 주세요.';
    if (c === 'auth/weak-password') return '비밀번호가 너무 짧아요 (교사는 6자 이상).';
    if (c === 'PERMISSION_DENIED' || /permission/i.test(e && e.message)) return '권한이 없어요. Firebase 규칙을 최신으로 게시했는지 확인해 주세요.';
    return null;
  }
  const rethrow = (e) => { const m = why(e); if (m) fail(m); throw e; };

  // ── 순수 도구 (tests/account.test.js) ──────────────────────
  const classKey = (s) => String(s).trim().replace(/\s+/g, '').replace(/[^0-9A-Za-z가-힣-]/g, '-');
  const email = (c, n, gen) => `s_${encodeURIComponent(c).replace(/%/g, '').toLowerCase()}_${Number(n)}_${gen || 0}@${DOMAIN}`;
  const teacherEmail = (id) => `t_${String(id).trim().toLowerCase().replace(/[^0-9a-z._-]/g, '')}@${DOMAIN}`;
  const pw = (pin) => `${pin}#cm`; // Firebase 는 6자 이상이라 4자리 뒤에 앱이 정한 글자를 붙인다
  const validPin = (pin) => /^\d{4}$/.test(String(pin));
  function mask(name) {
    const a = [...String(name).trim()];
    if (a.length <= 1) return '*';
    if (a.length === 2) return a[0] + '*';
    return a[0] + '*'.repeat(a.length - 2) + a[a.length - 1];
  }
  // 명단 붙여 넣기: 한 줄에 "번호 이름" (탭·쉼표·공백 구분). 시트에서 복사한 "반 번호 이름" 도 받는다
  function parseRoster(text, defaultClass) {
    const out = [], bad = [];
    String(text).split(/\r?\n/).map((l) => l.trim()).filter(Boolean).forEach((line) => {
      const p = line.split(/[\t,]+|\s{1,}/).map((x) => x.trim()).filter(Boolean);
      let c = defaultClass, n, name;
      if (p.length >= 3 && /^\d+$/.test(p[1])) [c, n, name] = [p[0], p[1], p.slice(2).join('')];
      else if (p.length >= 2 && /^\d+$/.test(p[0])) [n, name] = [p[0], p.slice(1).join('')];
      if (!c || !n || !name || Number(n) < 1 || Number(n) > 40 || name.length > 8) { bad.push(line); return; }
      out.push({ c: classKey(c), n: Number(n), name });
    });
    return { rows: out, bad };
  }

  // ── 명단 (교사) ──────────────────────────────────────────
  async function uploadRoster(rows) {
    const patch = {};
    rows.forEach(({ c, n, name }) => { patch[`roster/${c}/${n}`] = name; patch[`rosterMask/${c}/${n}`] = mask(name); });
    for (const [k, v] of Object.entries(patch)) await N().set(k, v);
  }
  async function removeStudent(c, n) { await N().remove(`roster/${c}/${n}`); await N().remove(`rosterMask/${c}/${n}`); }
  const resetAccount = (c, n) => N().set(`accounts/${c}/${n}/reset`, true);

  // ── 학생 ────────────────────────────────────────────────
  // 읽기가 Permission denied 면 접속 자격을 새로 받아 한 번 더 (2026-11-05 아이폰 사파리 가입 막힘)
  const rget = (p) => N().get(p).catch(async (e) => { if (!N().denied || !N().denied(e)) throw e; await N().reauth(); return N().get(p); }).catch((e) => { if (N().denied && N().denied(e)) fail('서버 접속이 끊겼어요. 앱(브라우저)을 완전히 닫았다가 다시 열어 주세요. 계속 안 되면 크롬으로 열어 주세요.'); throw e; });
  const masks = () => rget('rosterMask');
  const accountOf = (c, n) => rget(`accounts/${c}/${n}`);
  async function signUp(c, n, pin, hero, fx) {
    if (!validPin(pin)) fail('비밀번호는 숫자 4자리예요.');
    const m = await rget(`rosterMask/${c}/${n}`);
    if (!m) fail('명단에 없는 번호예요. 선생님께 말씀드려요.');
    const acc = await accountOf(c, n);
    if (acc && !acc.reset) fail('이미 가입한 번호예요. 로그인해 주세요. (비밀번호를 잊었으면 선생님께 초기화를 부탁해요)');
    const gen = acc ? (acc.gen || 0) + 1 : 0;
    try { await N().signUp(email(c, n, gen), pw(pin)); } catch (e) {
      if (e.code === 'auth/email-already-in-use') fail('이미 가입한 번호예요. 로그인해 주세요.');
      rethrow(e);
    }
    const rec = { uid: N().uid(), gen, hero: hero != null ? Number(hero) : (acc && acc.hero) || 0, fx: fx || (acc && acc.fx) || 'flame', at: N().TS };
    try { await N().set(`accounts/${c}/${n}`, rec); } catch (e) {
      if (N().denied && N().denied(e)) { try { const was = rec.uid; await N().reauth(); if (N().uid() === was) { await N().set(`accounts/${c}/${n}`, rec); return me(); } } catch (e2) { /* 아래로 */ } } // 같은 계정의 토큰만 새로 받았을 때만 다시 저장
      const now = await N().get(`accounts/${c}/${n}`).catch(() => null);
      await N().signOut();
      if (now && now.uid && !now.reset) fail('이미 가입한 번호예요. 로그인해 주세요.');
      fail(N().denied && N().denied(e) ? '가입 저장이 막혔어요 (권한). 앱을 완전히 닫았다가 다시 열거나 크롬으로 가입해 주세요. 계속 안 되면 선생님께 명단을 확인해 달라고 해요.' : `가입 저장에 실패했어요: ${e.message || e}`);
    }
    return me();
  }
  // 로그인. 초기화된 계정이면 { needNewPin: true } 를 돌려주고, newPin 을 주면 새 로그인을 만들어 연결한다
  // 초기화(0000) 뒤에는 새 비밀번호만 정한다. 용사·이펙트는 그대로 (⚙ 설정에서 언제든 바꿈)
  async function login(c, n, pin, newPin, hero, fx) {
    const acc = await accountOf(c, n);
    if (!acc) fail('아직 가입하지 않은 번호예요. "처음이에요 · 가입" 을 눌러요.');
    if (acc.reset) {
      if (String(pin) !== '0000') fail('선생님이 비밀번호를 초기화했어요. 0000 을 넣어 주세요.');
      if (!newPin) return { needNewPin: true };
      if (newPin === '0000') fail('새 비밀번호는 0000 말고 다른 숫자로 정해요.');
      return signUp(c, n, newPin, hero != null ? hero : acc.hero, fx || acc.fx);
    }
    if (!validPin(pin)) fail('비밀번호는 숫자 4자리예요.');
    try { await N().signIn(email(c, n, acc.gen || 0), pw(pin)); } catch (e) { if (why(e)) rethrow(e); fail('비밀번호가 달라요. 잊었으면 선생님께 초기화를 부탁해요.'); }
    return me();
  }
  // 지금 로그인한 학생 (반·번호·이름·용사)
  let cache = null;
  async function me() {
    if (N().provider() !== 'password') return null;
    const uid = N().uid();
    if (cache && cache.uid === uid) return cache;
    const all = (await rget('accounts')) || {};
    for (const [c, byN] of Object.entries(all)) for (const [n, a] of Object.entries(byN || {})) {
      if (a && a.uid === uid) {
        // 2026-11-03 (저녁): 0번 = 갈색머리 검사 v3 · 16번 = 금발 검사(추가 용사, 중단원던전 인장 3개) — 예전 「16 → 0 옮김」은 없앰
        const name = await N().get(`roster/${c}/${n}`); cache = { uid, c, n: Number(n), name: name || '', title: a.title || 'none', hero: a.hero || 0, fx: DS.FX ? (DS.FX.KINDS.includes(a.fx) ? a.fx : 'flame') : a.fx || 'flame', socket: a.socket || {} }; return cache; }
    }
    return null;
  }
  async function setHero(hero) { const m = await me(); if (!m) return; await N().set(`accounts/${m.c}/${m.n}/hero`, Number(hero)); m.hero = Number(hero); }
  async function setFx(fx) { const m = await me(); if (!m) return; await N().set(`accounts/${m.c}/${m.n}/fx`, String(fx)); m.fx = String(fx); }
  // ⚙ 설정: 용사 · 이펙트 바꾸기. 잠긴 것은 고를 수 없다 (looks() 로 확인)
  async function setLook(hero, fx) {
    const m = await me(); if (!m) return;
    const L = await looks(m);
    if (!L.heroes.find((h) => h.id === Number(hero) && h.open)) fail('아직 잠긴 용사예요.');
    if (!L.fx.find((f) => f.id === fx && f.open)) fail('아직 잠긴 이펙트예요.');
    await N().update(`accounts/${m.c}/${m.n}`, { hero: Number(hero), fx: String(fx) }); m.hero = Number(hero); m.fx = String(fx);
  }
  // 🏅 호칭 고르기 (v0.9.1): 얻은 호칭만 · 'none' = 달지 않음
  // 💎 결정석 칸 저장 (2026-11-06): socket = { 용사 번호: 이펙트 } · 열린 결정석만 · 빈 칸은 지움(회수)
  async function setSocket(sock) {
    const m = await me(); if (!m) return;
    const L = await looks(m), out = {};
    Object.entries(sock || {}).forEach(([h, k]) => { if (k && L.fx.find((f) => f.id === k && f.open)) out[Number(h)] = String(k); });
    await N().set(`accounts/${m.c}/${m.n}/socket`, Object.keys(out).length ? out : null); m.socket = out;
  }
  async function setTitle(id) {
    const m = await me(); if (!m) return;
    if (id !== 'none') { const d = await DS.Titles.data(m); if (!DS.Titles.earned(d).some((t) => t.id === id)) fail('아직 얻지 못한 호칭이에요.'); }
    await N().update(`accounts/${m.c}/${m.n}`, { title: String(id) }); m.title = String(id);
  }
  // 🧙 #73 도전으로 여는 용사 (2026-11-11 머리 방 「추천대로」 · 💎 로 못 삼 · 지난 기록도 셈)
  //   27 주판 술사 = 👑 형성평가 만점 서로 다른 차시 3개 (수업 = 체력 문항 모두 정답 · 🎯 허수아비 재대결 처치 어느 쪽이든)
  //   28 기하 마도사 = 🏰 성채 방 처치 서로 다른 방 10개 (보스 방 포함) · 33 별점술사 = 📕 오답노트 빨간 칸 해결(보충 완료) 누적 15개
  const CHAL = {
    27: { need: 3, cond: '👑 형성평가 만점 3번 (서로 다른 차시 · 수업이나 🎯 재대결)' },
    28: { need: 10, cond: '🏰 성채 방 10개 처치 (보스 방 포함)' },
    33: { need: 15, cond: '🎯 오답노트 빨간 칸 15개 해결' },
  };
  function chalProgress(rec, bonus) {
    rec = rec || {}; bonus = bonus || {};
    const les = DS.Lessons.list.filter((L) => L.no && !L.eval && L.boss);
    const perfect = les.filter((L) => { const r = rec[L.id], hp = L.boss.hpItems || L.boss.items; return (r && Number(r.boss) >= (Number(r.bossN) || hp) && Number(r.boss) > 0) || !!((bonus[L.id] || {}).boss || {}).clear; }).length;
    let rooms = 0; if (DS.Bonus) (DS.Bonus.FLOORS || []).map((f) => DS.Lessons.get(f.id)).filter(Boolean).forEach((CL) => (CL.rooms || []).forEach((r) => { if (DS.Bonus.roomRec(bonus, CL, r.id).clear) rooms++; }));
    let fixed = 0; if (DS.Note) les.filter((L) => rec[L.id]).forEach((L) => { const x = DS.Note.lesson(L, rec[L.id], bonus[L.id]); fixed += x.mons.filter((st) => st === 'p').length + x.boss.slice(0, x.hp).filter((st) => st === 'p').length; });
    return { 27: perfect, 28: rooms, 33: fixed };
  }
  // 고를 수 있는 용사 · 이펙트 목록 (잠금 · 해금 조건)
  // 기본 용사 0~6 · 기본 이펙트 6종 = 열림. 추가 용사 8번 = 1~3차시 도감 15장 · 9번 = 첫 레이드 · 10번 = 4~6차시 도감 · 11번 = 8~11차시 도감, 12~15번 · 화려한 이펙트 = 추후 공개
  async function looks(m) {
    m = m || (await me());
    const owned = (m && (await N().get(`cards/${String(m.c).replace(/[.#$/[\]]/g, '_')}/${m.n}`).catch(() => null))) || {};
    // 도감 특전: 8 성기사 = 1~3차시 처음 15장 (나중에 넣은 「부분집합의 개수」는 빼서 이미 연 학생이 잠기지 않게) · 10 무희 = 4~6차시 · 11 음유시인 = 7~10차시 (2026-11-03)
    const need = DS.Unit ? DS.Unit.CARDS.filter((c) => c.no <= 3 && c.id !== 'subcount') : [];
    const range = (a, b) => (DS.Unit ? DS.Unit.CARDS.filter((c) => c.no >= a && c.no <= b) : []);
    const need46 = range(4, 6), need710 = range(8, 11), got46 = need46.filter((c) => owned[c.id]).length, got710 = need710.filter((c) => owned[c.id]).length;
    const got = need.filter((c) => owned[c.id]).length;
    const rec = (m && (await N().get(`records/${String(m.c).replace(/[.#$/[\]]/g, '_')}/${m.n}`).catch(() => null))) || {};
    const raided = Object.keys(rec).length > 0; // 🎁 첫 레이드 특전: 추가 용사 두 번째
    const heroes = Array.from({ length: 7 }, (_, i) => ({ id: i, open: true }))
      .concat(Array.from({ length: 8 }, (_, i) => ({ id: 8 + i, open: (i === 0 && need.length > 0 && got === need.length) || (i === 1 && raided) || (i === 2 && need46.length > 0 && got46 === need46.length) || (i === 3 && need710.length > 0 && got710 === need710.length),
        cond: i === 0 ? `1~3차시 도감 ${got} / ${need.length}장 모으면 열려요` : i === 1 ? '🎁 첫 레이드를 마치면 열려요' : i === 2 ? `4~6차시 도감 ${got46} / ${need46.length}장 모으면 열려요` : i === 3 ? `8~11차시 도감 ${got710} / ${need710.length}장 모으면 열려요` : '해금 조건은 추후 공개' })))
; // 2026-11-03: 0~15 직업 모두 v2 도트 · 0 = 갈색머리 검사 v3 · 16 = 각성한 로안(로안의 변신 모습 · 고르는 칸 아님 · #73)
    // 화려한 이펙트 = 🟪 중단원던전 인장 1 · 2 · 4 · 6 · 8 · 10개에서 하나씩 (v0.8.0 · 2026-11-03 보강던전 → 중단원던전)
    const bonus = (m && DS.Bonus && (await N().get(`bonus/${String(m.c).replace(/[.#$/[\]]/g, '_')}/${m.n}`).catch(() => null))) || {};
    const fo = DS.Bonus ? DS.Bonus.fxOpen(bonus) : {}, seals = DS.Bonus ? DS.Bonus.seals(bonus).length : 0;
    // 🌟 #73 (2026-11-11): 금발 검사(16) = 따로 고르는 칸이 아님 → 각성한 로안(로안의 변신 모습) · 🏆 업적 3개 = 호칭 「만 번째 베기」
    [18, 19, 20, 21, 22, 23].forEach((id) => heroes.push({ id, open: false, cond: '💎 조각으로 해금' })); // 2026-11-07 새 용사 6 (흑기사 · 메카닉 · 해커 · 용기사 = 💎 상점 · gem.js SHOP)
    [24, 25, 26, 27, 28, 29, 30, 31, 32, 33].forEach((id) => heroes.push({ id, open: false, cond: '💎 조각으로 해금' })); // 2026-11-11 #73 새 용사 10: 💎 30 · 60 (gem.js SHOP) · 27 · 28 · 33 = 도전 (아래 CHAL)
    { const cp = chalProgress(rec, bonus); Object.entries(CHAL).forEach(([id, c]) => { const h = heroes.find((x) => x.id === Number(id)); if (!h) return; const n = cp[id] || 0; h.chal = { n: Math.min(n, c.need), need: c.need }; h.open = n >= c.need; h.cond = `${c.cond} · ${Math.min(n, c.need)} / ${c.need}`; }); }
    // ⚔ 이펙트 v2 (2026-11-06): 계열 6 × 단계 4 — Ⅰ 열림 · Ⅱ 💎 · Ⅲ 인장(또는 💎) · Ⅳ 💎 + 같은 계열 Ⅲ 필요 · 특별(업적)
    const fx = [];
    DS.FX.FAMS.forEach((fam) => fam.ids.forEach((k, t) => {
      const f = { id: k, fam: fam.id, tier: t };
      if (t === 0) f.open = true;
      else if (t === 2 && DS.FX.FANCY.includes(k)) { const i = DS.FX.FANCY.indexOf(k); f.open = !!fo[k]; f.cond = DS.Bonus ? DS.Bonus.fxCond(i) : '해금 조건은 추후 공개'; }
      else if (t === 2) { f.open = false; f.cond = '💎 조각으로 해금'; } // 🔨 강타 · 🌪 연격 Ⅲ = 인장 없이 💎
      else { f.open = false; f.cond = '💎 조각으로 해금'; if (t === 3) f.need = fam.ids[2]; }
      fx.push(f);
    }));
    // 💎 조각 상점 (2026-11-05): 용사 12~15 · 화려한 이펙트 = 조각으로 골라 해금 (인장으로 이미 연 이펙트는 그대로) · 도감 · 첫 레이드 · 인장 3개 용사는 업적 전용
    // 🔁 화폐 전환 (2026-11-07 · 계정마다 한 번 · gem/…/conv 기록) · 📚 도감 특전 용사를 💎 로 연 뒤 카드를 다 모았으면 💎 돌려받기
    if (DS.Gem && DS.Gem.convert && m && !m.test && !m.teacher) {
      await DS.Gem.convert(m, { seals, cards: owned }).catch(() => null);
      const done = { 8: need.length > 0 && got === need.length, 10: need46.length > 0 && got46 === need46.length, 11: need710.length > 0 && got710 === need710.length };
      for (const id of DS.Gem.CARD_HEROES) if (done[id]) await DS.Gem.cardRefund(m, id).catch(() => 0);
    }
    const gem = DS.Gem && m ? await DS.Gem.mine(m) : {};
    if (DS.Gem) {
      const phOk = DS.Gem.photoPassed ? DS.Gem.photoPassed(gem) : false; // 🧑‍🎓 수식 책사 남 · 여 = 📷 서술형 사진 통과 (2026-11-07)
      heroes.forEach((h) => { if (!(DS.Gem.PHOTO_HEROES || []).includes(h.id)) return; h.open = phOk || DS.Gem.owns(gem, 'hero', h.id); h.cond = '📷 성채 서술형 문제를 풀이 사진까지 통과하면 열려요'; h.photo = true; });
      heroes.forEach((h) => { const p = DS.Gem.price('hero', h.id); if (p == null) return; const card = (DS.Gem.CARD_HEROES || []).includes(h.id), byCard = card && h.open; h.shop = { kind: 'hero', id: h.id, price: p, nosell: card }; h.open = h.open || DS.Gem.owns(gem, 'hero', h.id); if (byCard) { h.shop = null; return; } h.cond = card ? `${h.cond.replace(' 모으면 열려요', '')} 모으면 무료 · 💎 ${p} 로 먼저 열면 다 모았을 때 💎 돌려받아요` : `💎 ${p} 조각으로 해금`; });
      fx.forEach((f) => { const p = DS.Gem.price('fx', f.id); if (p == null) return; f.shop = { kind: 'fx', id: f.id, price: p, scroll: DS.Gem.scrollOf ? DS.Gem.scrollOf('fx', f.id) : 0 }; f.open = f.open || DS.Gem.owns(gem, 'fx', f.id); f.cond = f.tier === 2 && DS.FX.FANCY.includes(f.id) ? `🏆${DS.Bonus ? DS.Bonus.UNLOCK[DS.FX.FANCY.indexOf(f.id)] : ''} · 💎${p}` : `💎${p}${f.shop.scroll ? ` · 📜${f.shop.scroll}` : ''}`; });
      fx.forEach((f) => { f.bought = DS.Gem.owns(gem, 'fx', f.id); }); // 💰 되팔기 가능 (상점에서 산 것만)
      // 🔗 단계 순서 (2026-11-06 사용자 「2단계 해금해야 3단계 열리는 거 맞지? · 2단계 잠겨 있는데 3단계가 열려」): Ⅱ → Ⅲ → Ⅳ
      //   상점에서 이미 산 것은 그대로 (산 것을 빼앗지 않음) · 🟪 인장으로 받은 Ⅲ 은 같은 계열 Ⅱ 를 열어야 씀
      const TN = ['Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ'];
      fx.forEach((f) => { if (typeof f.tier !== 'number' || f.tier < 2) return; f.need = DS.FX.FAMS.find((x) => x.id === f.fam).ids[f.tier - 1]; });
      [2, 3].forEach((t) => fx.filter((f) => f.tier === t).forEach((f) => {
        const nd = fx.find((x) => x.id === f.need); if (!nd || nd.open) return;
        if (f.open && f.bought) return; // 예전에 산 것
        const sealGot = f.open && !f.bought; f.open = false;
        f.locked = `먼저 ${TN[t - 1]} 「${DS.FX.NAMES[f.need].replace(/^\S+\s/, '')}」`;
        f.cond = sealGot ? `🏆 받음 · ${TN[t - 1]} 열면 사용` : `💎${f.shop ? f.shop.price : ''} · ${TN[t - 1]}먼저`; f.got = sealGot; // #31 A안: 받은 것 = 금빛 (잠김 아님)
      }));
    }
    // 🪶 황금 날개 (v0.9.11 업적 전용): 🎁 보물 상자에서 황금 깃털 5개
    const fe = DS.Gem ? DS.Gem.rareOf(gem) : 0;
    if (DS.FX.ACHV) fx.push({ id: 'wings', tier: 's', open: fe >= 5, cond: `🏆 🎁 보물 상자 영웅 · 전설 ${Math.min(fe, 5)} / 5번` });
    // ☀ 심판의 빛 (2026-11-06): 🏰 성채 1층 · 2층 👑 보스 방을 모두 처치
    const bossA = !!(((bonus['eval-1'] || {}).q12 || {}).clear), bossB = !!(((bonus['eval-2'] || {}).q11 || {}).clear);
    if (DS.FX.ACHV) fx.push({ id: 'smite', tier: 's', open: bossA && bossB, cond: `🏰 성채 1 · 2층 보스 ${Number(bossA) + Number(bossB)} / 2` });
    // 🎮 한 파일 체험판(DS.DEMO)만 해금 요소 모두 열림 · 🧪 테스트 모드는 잠금 그대로 + 💎 넉넉히 (2026-11-09 선생님 「해금 요소는 전부 잠가 두고」)
    if (m && m.test && DS.DEMO) { heroes.forEach((h) => { h.open = true; }); fx.forEach((f) => { f.open = true; }); }
    return { heroes, fx, got, need: need.length, seals, gem: Number(gem.total) || 0, scroll: Number(gem.scroll) || 0, enh: Number(gem.enh) || 0, medal: gem.medal || {}, feather: fe };
  }
  async function logout() { cache = null; tsess(false); await N().signOut(); }

  // ── 교사 계정 ────────────────────────────────────────────
  // 교사 로그인은 이 탭(앱)이 열려 있는 동안만: 표시를 sessionStorage 에 두고, 앱을 다시 켰을 때 표시가 없으면 로그아웃한다.
  // (새로고침은 sessionStorage 가 남아서 유지된다. 학생 로그인은 계속 유지)
  const TSESS = 'citadel-tsess';
  function tsess(on) { try { if (on) sessionStorage.setItem(TSESS, '1'); else sessionStorage.removeItem(TSESS); } catch (e) { /* 무시 */ } }
  const tsessOn = () => { try { return sessionStorage.getItem(TSESS) === '1'; } catch (e) { return false; } };
  async function endStaleTeacher() {
    if (tsessOn() || !(await isAdmin())) return false;
    await logout();
    return true;
  }
  const adminExists = async () => !!(await N().get('admins'));
  const isAdmin = async () => N().provider() === 'password' && (await N().get(`admins/${N().uid()}`)) === true;
  async function teacherCreate(id, password) {
    if (String(password).length < 6) fail('교사 비밀번호는 6자 이상이에요.');
    if (await adminExists()) fail('교사 계정이 이미 있어요. 로그인해 주세요.');
    try { await N().signUp(teacherEmail(id), password); } catch (e) { if (e.code === 'auth/email-already-in-use') fail('이미 있는 교사 아이디예요. 로그인해 주세요.'); rethrow(e); }
    try { await N().set(`admins/${N().uid()}`, true); } catch (e) { rethrow(e); }
    tsess(true);
  }
  async function teacherLogin(id, password) {
    try { await N().signIn(teacherEmail(id), password); } catch (e) { if (why(e)) rethrow(e); fail('교사 아이디나 비밀번호가 달라요.'); }
    if (!(await isAdmin())) { await N().signOut(); fail('교사 계정이 아니에요.'); }
    tsess(true);
  }

  return { classKey, email, teacherEmail, pw, validPin, mask, parseRoster, uploadRoster, removeStudent, resetAccount, masks, accountOf, signUp, login, me, setHero, setFx, setLook, setSocket, setTitle, looks, CHAL, chalProgress, logout, adminExists, isAdmin, teacherCreate, teacherLogin, endStaleTeacher };
})();
