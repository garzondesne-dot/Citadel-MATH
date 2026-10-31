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
        try { uid = sessionStorage.getItem(UIDKEY); } catch (e) { uid = null; }
        if (!uid) { uid = 'u' + Math.random().toString(36).slice(2, 10); try { sessionStorage.setItem(UIDKEY, uid); } catch (e) { /* 무시 */ } }
        return uid;
      },
      uid: () => uid,
      setUid(u) { uid = u; }, // 체험판 가상 학생용
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
        const cred = await firebase.auth().signInAnonymously();
        uid = cred.user.uid;
        db = firebase.database();
        db.ref('.info/serverTimeOffset').on('value', (s) => { offset = s.val() || 0; });
        return uid;
      },
      uid: () => uid,
      now: () => Date.now() + offset,
      async get(p) { return (await db.ref(p).get()).val(); },
      set: (p, v) => db.ref(p).set(sv(v)),
      update: (p, obj) => db.ref(p).update(Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, sv(v)]))),
      remove: (p) => db.ref(p).remove(),
      watch(path, cb) { const r = db.ref(path), f = (s) => cb(s.val()); r.on('value', f); return () => r.off('value', f); },
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
    now: () => api.impl.now(),
    get: (p) => api.impl.get(p),
    set: (p, v) => api.impl.set(p, v),
    update: (p, o) => api.impl.update(p, o),
    remove: (p) => api.impl.remove(p),
    watch: (p, cb) => api.impl.watch(p, cb),
    LocalNet,
  };
  return api;
})();
