// 실시간 동기화 창구. 두 가지 방식이 같은 모양으로 동작한다.
//  - firebase: Firebase Realtime Database (js/config.js 의 DS.FIREBASE 가 있을 때). 바뀌는 즉시 모든 기기에 밀어 준다
//  - local   : 이 기기 안에서만 (localStorage + BroadcastChannel). 체험판(demo.html)·설정 전 시험용. 탭·창끼리 동기화
// 값은 경로로 다룬다: watch('rooms/123456', cb) · set · update · get · remove
// 주의: Firebase 는 빈 배열을 저장하지 않으므로 학생 답(given)은 JSON 문자열로 저장한다 (DS.Net.pack / unpack)
window.DS = window.DS || {};

DS.Net = (function () {
  const TS = { '.sv': 'timestamp' }; // 서버 시각 자리표시
  let impl = null;
  const split = (p) => String(p).split('/').filter(Boolean);
  const clone = (v) => (v === undefined ? null : JSON.parse(JSON.stringify(v)));

  // ── local ───────────────────────────────────────────────
  function LocalNet() {
    const KEY = 'citadel-local-db';
    const frame = (typeof window !== 'undefined' && window.name) || 'main';
    const UIDKEY = `citadel-uid-${frame}`;
    let uid = null;
    const watchers = [];
    const chan = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('citadel-local') : null;
    const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
    const save = (t) => { try { localStorage.setItem(KEY, JSON.stringify(t)); } catch (e) { /* 무시 */ } };
    const at = (t, p) => split(p).reduce((o, k) => (o && typeof o === 'object' ? o[k] : undefined), t);
    const fill = (v) => (v && typeof v === 'object' ? (v['.sv'] === 'timestamp' ? Date.now() : Object.fromEntries(Object.entries(v).map(([k, x]) => [k, fill(x)]))) : v);
    function put(t, p, v) {
      const ks = split(p);
      let o = t;
      for (let i = 0; i < ks.length - 1; i++) { if (!o[ks[i]] || typeof o[ks[i]] !== 'object') o[ks[i]] = {}; o = o[ks[i]]; }
      const last = ks[ks.length - 1];
      if (v === null || v === undefined) delete o[last]; else o[last] = fill(v);
    }
    function notify() {
      const t = load();
      watchers.forEach((w) => { const v = clone(at(t, w.path)), s = JSON.stringify(v); if (s !== w.last) { w.last = s; w.cb(v); } });
    }
    if (chan) chan.onmessage = notify;
    if (typeof window !== 'undefined') window.addEventListener('storage', (e) => { if (e.key === KEY) notify(); });
    const changed = () => { notify(); if (chan) chan.postMessage(1); };
    return {
      mode: 'local',
      async init() {
        try { const acc = sessionStorage.getItem(`${UIDKEY}-acc`); if (acc) { uid = acc; return uid; } } catch (e) { /* 무시 */ }
        try { uid = sessionStorage.getItem(UIDKEY); } catch (e) { uid = null; }
        if (!uid) { uid = 'u' + Math.random().toString(36).slice(2, 10); try { sessionStorage.setItem(UIDKEY, uid); } catch (e) { /* 무시 */ } }
        return uid;
      },
      uid: () => uid,
      setUid(u) { uid = u; }, // 체험판 가상 학생용
      // 계정 흉내 (체험 모드): _auth/{이메일} = { pw, uid } — 실제 서버의 이메일 로그인과 같은 모양으로 동작
      provider: () => { try { return sessionStorage.getItem(`${UIDKEY}-acc`) ? 'password' : 'anonymous'; } catch (e) { return 'anonymous'; } },
      async signUp(email, pw) {
        const t = load(), k = email.replace(/[.#$/[\]]/g, '_');
        if (at(t, `_auth/${k}`)) { const e = new Error('이미 있는 계정이에요.'); e.code = 'auth/email-already-in-use'; throw e; }
        const u = 'p' + Math.random().toString(36).slice(2, 10);
        put(t, `_auth/${k}`, { pw, uid: u }); save(t);
        return this.useAcc(u);
      },
      async signIn(email, pw) {
        const a = at(load(), `_auth/${email.replace(/[.#$/[\]]/g, '_')}`);
        if (!a || a.pw !== pw) { const e = new Error('번호나 비밀번호가 달라요.'); e.code = 'auth/invalid-credential'; throw e; }
        return this.useAcc(a.uid);
      },
      useAcc(u) { uid = u; try { sessionStorage.setItem(`${UIDKEY}-acc`, u); } catch (e) { /* 무시 */ } return u; },
      async signOut() { try { sessionStorage.removeItem(`${UIDKEY}-acc`); } catch (e) { /* 무시 */ } uid = null; return this.init(); },
      now: () => Date.now(),
      async get(p) { return clone(at(load(), p)); },
      async set(p, v) { const t = load(); put(t, p, v); save(t); changed(); },
      async update(p, obj) { const t = load(); Object.entries(obj).forEach(([k, v]) => put(t, `${p}/${k}`, v)); save(t); changed(); },
      async remove(p) { const t = load(); put(t, p, null); save(t); changed(); },
      watch(path, cb) {
        const w = { path, cb, last: undefined };
        watchers.push(w);
        setTimeout(() => { const v = clone(at(load(), path)); w.last = JSON.stringify(v); cb(v); }, 0);
        return () => { const i = watchers.indexOf(w); if (i >= 0) watchers.splice(i, 1); };
      },
      async presence(p) { await this.set(p, true); if (typeof window !== 'undefined') window.addEventListener('pagehide', () => { const t = load(); put(t, p, null); save(t); if (chan) chan.postMessage(1); }); },
      wipe() { save({}); changed(); },
    };
  }

  // ── firebase ────────────────────────────────────────────
  function FirebaseNet(cfg) {
    let db = null, uid = null, offset = 0;
    const SDK = 'https://www.gstatic.com/firebasejs/10.12.2/';
    const script = (src) => new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('Firebase 를 불러오지 못했어요 (인터넷 확인)')); document.head.appendChild(s); });
    return {
      mode: 'firebase',
      async init() {
        if (!window.firebase) {
          await script(SDK + 'firebase-app-compat.js');
          await Promise.all([script(SDK + 'firebase-auth-compat.js'), script(SDK + 'firebase-database-compat.js')]);
        }
        if (!firebase.apps.length) firebase.initializeApp(cfg);
        // 이 기기에 로그인해 둔 계정이 있으면 그대로, 없으면 익명 로그인
        const prev = await new Promise((res) => { const off = firebase.auth().onAuthStateChanged((u) => { off(); res(u); }); });
        uid = prev ? prev.uid : (await firebase.auth().signInAnonymously()).user.uid;
        db = firebase.database();
        db.ref('.info/serverTimeOffset').on('value', (s) => { offset = s.val() || 0; });
        return uid;
      },
      uid: () => uid,
      provider: () => { const u = firebase.auth().currentUser; return u && !u.isAnonymous ? 'password' : 'anonymous'; },
      async signUp(email, pw) { const c = await firebase.auth().createUserWithEmailAndPassword(email, pw); uid = c.user.uid; return uid; },
      async signIn(email, pw) { const c = await firebase.auth().signInWithEmailAndPassword(email, pw); uid = c.user.uid; return uid; },
      async signOut() { await firebase.auth().signOut(); uid = (await firebase.auth().signInAnonymously()).user.uid; return uid; },
      now: () => Date.now() + offset,
      async get(p) { return (await db.ref(p).get()).val(); },
      set: (p, v) => db.ref(p).set(sv(v)),
      update: (p, obj) => db.ref(p).update(Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, sv(v)]))),
      remove: (p) => db.ref(p).remove(),
      watch(path, cb) { const r = db.ref(path), f = (s) => cb(s.val()); r.on('value', f); return () => r.off('value', f); },
      // 접속 표시: 연결될 때마다 true, 끊기면 서버가 지운다
      async presence(p) {
        const r = db.ref(p);
        db.ref('.info/connected').on('value', (s) => { if (s.val() === true) r.onDisconnect().remove().then(() => r.set(true)); });
      },
    };
    function sv(v) { // 자리표시 → Firebase 서버 시각
      if (v && typeof v === 'object') return v['.sv'] === 'timestamp' ? firebase.database.ServerValue.TIMESTAMP : Object.fromEntries(Object.entries(v).map(([k, x]) => [k, sv(x)]));
      return v;
    }
  }

  function choose() {
    const forceLocal = typeof location !== 'undefined' && /[?&]local\b/.test(location.search);
    return DS.FIREBASE && DS.FIREBASE.apiKey && !forceLocal ? FirebaseNet(DS.FIREBASE) : LocalNet();
  }
  const api = {
    TS,
    pack: (v) => JSON.stringify(v === undefined ? null : v),
    unpack: (s) => { try { return JSON.parse(s); } catch (e) { return null; } },
    use(i) { impl = i; return api; },
    get impl() { if (!impl) impl = choose(); return impl; },
    get mode() { return api.impl.mode; },
    init: () => api.impl.init(),
    uid: () => api.impl.uid(),
    provider: () => api.impl.provider(),
    signUp: (e, p) => api.impl.signUp(e, p),
    signIn: (e, p) => api.impl.signIn(e, p),
    signOut: () => api.impl.signOut(),
    now: () => api.impl.now(),
    get: (p) => api.impl.get(p),
    set: (p, v) => api.impl.set(p, v),
    update: (p, o) => api.impl.update(p, o),
    remove: (p) => api.impl.remove(p),
    watch: (p, cb) => api.impl.watch(p, cb),
    presence: (p) => api.impl.presence(p),
    LocalNet,
  };
  return api;
})();
