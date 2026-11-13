// 🔄 옛 판이면 반드시 새 판으로 (2026-11-10 #55 · 선생님 「A 진행」 · 두 반 수업에서 옛 판 학생 = 문제가 달라 혼란)
//   최신 판 = 배포한 사이트의 version.json { v } (배포 때 js/config.js VERSION · sw.js 캐시 이름과 같이 올림 · tests/pwa.test.js 가 확인) · 서비스 워커는 이 파일을 저장하지 않음
//   ① 앱을 켤 때: 옛 판이면 바로 새로 고침 (서비스 워커 갱신 · 로그인 · 기록 · 보던 장면 그대로)
//   ② 수업 방 입장 · 성채 · 허수아비 방: 옛 판이면 입장 잠금 + 「🔄 새 판으로 바꾸는 중…」 → 바뀐 뒤 입장
//   ③ 수업 중 새 판: 지금 몬스터를 푸는 동안은 띠만 · 다음 단계로 넘어가는 순간 저절로 새로 고침 (기록 · 기회 · 나의 풀이는 서버라 그대로 · 다시 그 수업으로 들어옴)
//   ④ 같은 판으로 두 번 새로 고쳐도 그대로면 = 실패 (아이폰 홈 화면 앱 등) → 「앱을 완전히 껐다 다시 켜 주세요」 큰 안내 · 입장 잠금 유지 · 무한 새로 고침 막음
//   리모컨 「🔄 옛 판 n명」 = 학생이 입장 때 적는 players/{나}/ver (DS.Fresh.oldIn)
window.DS = window.DS || {};

DS.Fresh = (function () {
  const KEY = 'ds-fresh', MAX = 2;
  let latest = null, lastAt = 0, busy = false, failed = false, staleStep = null;
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch (e) { return null; } };
  const write = (o) => { try { if (o) localStorage.setItem(KEY, JSON.stringify(o)); else localStorage.removeItem(KEY); } catch (e) { /* 무시 */ } };
  const stale = () => !!(latest && DS.VERSION && latest !== DS.VERSION);

  // 최신 판 묻기 (30초 안에 물었으면 그 값) · 못 물으면(인터넷 · 파일로 열기) = 지금 판으로 봄 (잠그지 않음)
  async function check(force) {
    if (!force && latest && Date.now() - lastAt < 30e3) return stale();
    try {
      const r = await fetch(`./version.json?t=${Date.now()}`, { cache: 'no-store' });
      if (r.ok) { const j = await r.json(); if (j && j.v) { latest = String(j.v); lastAt = Date.now(); } }
    } catch (e) { /* 그대로 */ }
    const rec = read();
    if (rec && rec.to === DS.VERSION) write(null); // 새 판으로 바뀜 = 성공
    if (stale()) { const r2 = read(); failed = !!(r2 && r2.from === DS.VERSION && r2.to === latest && r2.n >= MAX); }
    else failed = false;
    if (failed) showFail();
    return stale();
  }

  // 새 판으로: 서비스 워커 새로 받기 → 바뀌면(또는 10초) 새로 고침 · 같은 판으로 MAX 번 실패하면 ④
  async function update() {
    if (busy) return false;
    const rec = read(), n = rec && rec.from === DS.VERSION && rec.to === latest ? rec.n || 0 : 0;
    if (n >= MAX) { failed = true; showFail(); return false; }
    busy = true; write({ from: DS.VERSION, to: latest, n: n + 1, at: Date.now() });
    cover('🔄 새 판으로 바꾸는 중…', '잠깐만요 · 기록과 로그인은 그대로예요');
    try {
      const sw = navigator.serviceWorker, reg = sw && (await sw.getRegistration());
      if (reg) {
        await new Promise((res) => {
          const t = setTimeout(res, 10e3); sw.addEventListener('controllerchange', () => { clearTimeout(t); res(); }, { once: true });
          reg.update().then(() => { const w = reg.installing || reg.waiting; if (w && w.postMessage) w.postMessage('skip'); if (!reg.installing && !reg.waiting) { clearTimeout(t); res(); } }).catch(() => { clearTimeout(t); res(); });
        });
      }
    } catch (e) { /* 그래도 새로 고침 */ }
    api.reload();
    return false;
  }

  // ② 입장 문지기: 새 판이면 true · 옛 판이면 바꾸는 중(또는 ④ 안내) · false
  async function gate() {
    if (DS.SCHOOL) { check(true).catch(() => {}); return true; } // 🏫 학교판: 수업 · 방 입장은 막지 않음 (수업이 끝나면 캠프 · 첫 화면에서 새 판)
    if (!(await check(true))) return true;
    if (failed) { showFail(); return false; }
    update(); return false;
  }

  // ③ 수업 중 (학생 폰 render 마다): 옛 판이면 띠 · 단계가 바뀌는 순간 새로 고침
  function inClass(stepKey, opt = {}) {
    if (!stale()) { staleStep = null; band(null); return; }
    if (failed) { band('⚠ 옛 판이에요 — 앱을 완전히 껐다 다시 켜 주세요'); return; }
    if (staleStep == null) staleStep = stepKey;
    if (opt.test) { band('🔄 새 판이 나왔어요 — 테스트를 처음부터 다시 하면 새 판'); return; }
    if (DS.SCHOOL) { band('🔄 새 판이 나왔어요 — 수업이 끝나면 저절로 바뀌어요'); return; } // 🏫 학교판: 수업 중 강제 새로 고침 미룸 // 🧪 테스트는 처음부터 (기록 없는 연습)
    if (stepKey !== staleStep) { update(); return; }
    band('🔄 새 판이 나왔어요 — 다음 몬스터로 넘어갈 때 저절로 바뀌어요 (기록은 그대로)');
  }

  // 리모컨: 지금 들어와 있는 학생 중 옛 판(또는 판 기록 없음 = #55 전 판) → [{ uid, num }]
  function oldIn(R, ids) {
    const v = latest || DS.VERSION;
    return (ids || []).map((u) => ({ u, p: (R.players || {})[u] || {} })).filter(({ p }) => !p.teacher && !p.bot && p.ver !== v).map(({ u, p }) => ({ u, num: Number(p.num) || 0, ver: p.ver || '' })).sort((a, b) => a.num - b.num);
  }

  // ── 화면 ──
  function cover(title, sub) {
    let el = document.getElementById('fresh-cover');
    if (!el) { el = document.createElement('div'); el.id = 'fresh-cover'; el.className = 'fresh-cover'; document.body.appendChild(el); }
    el.innerHTML = `<div class="fresh-box"><b>${title}</b><p>${sub || ''}</p></div>`;
  }
  function showFail() {
    cover('⚠ 앱을 완전히 껐다 다시 켜 주세요', `지금 판(${String(DS.VERSION).replace(/^citadel-/, 'v')})이 옛 판이라 수업 문제가 달라요.<br>
      <b>아이폰 홈 화면 앱</b>: 화면 아래에서 위로 밀어 앱 목록 → 모두의 던전을 위로 밀어 끄기 → 다시 열기<br>
      <b>안드로이드 · 크롬</b>: 최근 앱에서 끄기 → 다시 열기 (안 되면 새로 고침 ↻)<br>
      <button class="btn primary" id="fresh-retry" type="button">🔄 다시 시도</button>`);
    const b = document.getElementById('fresh-retry'); if (b) b.onclick = () => { write(null); failed = false; location.reload(); };
  }
  function band(text) {
    let el = document.getElementById('fresh-band');
    if (!text) { if (el) el.remove(); return; }
    if (!el) { el = document.createElement('div'); el.id = 'fresh-band'; el.className = 'fresh-band'; document.body.appendChild(el); }
    if (el.textContent !== text) el.textContent = text;
  }

  // ① 앱을 켤 때 + 열어 둔 채로 1분마다 · 화면으로 돌아올 때 물음 (새로 고침은 ① 첫 화면 · 캠프에서만 · 수업 중은 ③)
  const inRoom = () => !!document.querySelector('#screen-student.active, #screen-teacher.active, #screen-hall.active, #screen-bonus.active');
  async function tick(boot) {
    if (document.hidden) return;
    if (!(await check(boot))) return;
    if (failed) return;
    if (boot || !inRoom()) update();
  }
  function start() {
    if (start.done || typeof document === 'undefined') return; start.done = true;
    if (!/^https?:/.test(location.protocol)) return;
    tick(true);
    setInterval(() => tick(false), 60e3);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(false); });
  }
  if (typeof document !== 'undefined') { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start(); }
  const api = { check, update, gate, inClass, oldIn, stale, reload: () => location.reload(), get latest() { return latest; }, get failed() { return failed; }, get busy() { return busy; } }; // reload = 시험에서 바꿔 끼움
  return api;
})();
