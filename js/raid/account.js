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
  const masks = () => N().get('rosterMask');
  const accountOf = (c, n) => N().get(`accounts/${c}/${n}`);
  async function signUp(c, n, pin, hero, fx) {
    if (!validPin(pin)) fail('비밀번호는 숫자 4자리예요.');
    const m = await N().get(`rosterMask/${c}/${n}`);
    if (!m) fail('명단에 없는 번호예요. 선생님께 말씀드려요.');
    const acc = await accountOf(c, n);
    if (acc && !acc.reset) fail('이미 가입한 번호예요. 로그인해 주세요. (비밀번호를 잊었으면 선생님께 초기화를 부탁해요)');
    const gen = acc ? (acc.gen || 0) + 1 : 0;
    try { await N().signUp(email(c, n, gen), pw(pin)); } catch (e) {
      if (e.code === 'auth/email-already-in-use') fail('이미 가입한 번호예요. 로그인해 주세요.');
      rethrow(e);
    }
    try { await N().set(`accounts/${c}/${n}`, { uid: N().uid(), gen, hero: hero != null ? Number(hero) : (acc && acc.hero) || 0, fx: fx || (acc && acc.fx) || 'flame', at: N().TS }); } catch (e) { await N().signOut(); fail('이미 가입한 번호예요. 로그인해 주세요.'); }
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
    const all = (await N().get('accounts')) || {};
    for (const [c, byN] of Object.entries(all)) for (const [n, a] of Object.entries(byN || {})) {
      if (a && a.uid === uid) { const name = await N().get(`roster/${c}/${n}`); cache = { uid, c, n: Number(n), name: name || '', title: a.title || 'dawn', hero: a.hero || 0, fx: DS.FX ? (DS.FX.KINDS.includes(a.fx) ? a.fx : 'flame') : a.fx || 'flame' }; return cache; }
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
  async function setTitle(id) {
    const m = await me(); if (!m) return;
    if (id !== 'none') { const d = await DS.Titles.data(m); if (!DS.Titles.earned(d).some((t) => t.id === id)) fail('아직 얻지 못한 호칭이에요.'); }
    await N().update(`accounts/${m.c}/${m.n}`, { title: String(id) }); m.title = String(id);
  }
  // 고를 수 있는 용사 · 이펙트 목록 (잠금 · 해금 조건)
  // 기본 용사 0~6 · 기본 이펙트 6종 = 열림. 추가 용사 8번 = 1~3차시 도감 15장 완성 보상, 9~15번 · 화려한 이펙트 = 추후 공개
  async function looks(m) {
    m = m || (await me());
    const owned = (m && (await N().get(`cards/${String(m.c).replace(/[.#$/[\]]/g, '_')}/${m.n}`).catch(() => null))) || {};
    const need = DS.Unit ? DS.Unit.CARDS.filter((c) => c.no <= 3) : [];
    const got = need.filter((c) => owned[c.id]).length;
    const rec = (m && (await N().get(`records/${String(m.c).replace(/[.#$/[\]]/g, '_')}/${m.n}`).catch(() => null))) || {};
    const raided = Object.keys(rec).length > 0; // 🎁 첫 레이드 특전: 추가 용사 두 번째
    const heroes = Array.from({ length: 7 }, (_, i) => ({ id: i, open: true }))
      .concat(Array.from({ length: 8 }, (_, i) => ({ id: 8 + i, open: (i === 0 && need.length > 0 && got === need.length) || (i === 1 && raided), cond: i === 0 ? `1~3차시 도감 ${got} / ${need.length}장 모으면 열려요` : i === 1 ? '🎁 첫 레이드를 마치면 열려요' : '해금 조건은 추후 공개' })));
    // 화려한 이펙트 = 📘 보강던전 인장 1 · 2 · 4 · 6 · 8 · 10개에서 하나씩 (v0.8.0)
    const bonus = (m && DS.Bonus && (await N().get(`bonus/${String(m.c).replace(/[.#$/[\]]/g, '_')}/${m.n}`).catch(() => null))) || {};
    const fo = DS.Bonus ? DS.Bonus.fxOpen(bonus) : {}, seals = DS.Bonus ? DS.Bonus.seals(bonus).length : 0;
    const fx = DS.FX.BASE.map((k) => ({ id: k, open: true })).concat(DS.FX.FANCY.map((k, i) => ({ id: k, open: !!fo[k], cond: DS.Bonus ? DS.Bonus.fxCond(i) : '해금 조건은 추후 공개' })));
    return { heroes, fx, got, need: need.length, seals };
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

  return { classKey, email, teacherEmail, pw, validPin, mask, parseRoster, uploadRoster, removeStudent, resetAccount, masks, accountOf, signUp, login, me, setHero, setFx, setLook, setTitle, looks, logout, adminExists, isAdmin, teacherCreate, teacherLogin, endStaleTeacher };
})();
