// Firebase 설정 (Firebase 콘솔 → 프로젝트 설정 → 웹 앱의 firebaseConfig). 비밀번호가 아니라 웹 페이지에 공개되는 값이다.
// 데이터는 firebase/database.rules.json 의 보안 규칙이 지킨다. 비워 두면 '이 기기 체험 모드'로 동작한다.
window.DS = window.DS || {};
DS.FIREBASE = {
  apiKey: 'AIzaSyAp64JvZ7ZPJJvsRpL6P4_yxca6lgK0inE',
  authDomain: 'citadel-math.firebaseapp.com',
  databaseURL: 'https://citadel-math-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'citadel-math',
  storageBucket: 'citadel-math.firebasestorage.app',
  messagingSenderId: '434932944226',
  appId: '1:434932944226:web:0763464faf9dde9639b03b',
};
// 🏫 다른 학교판 (2026-11-13 · 선생님 「추천대로」 = A 학교 주소): s/<학교코드>/ 페이지(tools/school/page.js 가 만듦)가 window.DS_SCHOOL = { code, name, fb } 를 먼저 둠
//   → 같은 코드 · 그 학교 Firebase(공개 웹 설정값)로만 읽고 씀 · 이 기기 저장소는 학교코드 앞말로 나눔(같은 폰에서 우리 게임 · 다른 학교판이 섞이지 않게) · 학습지 그림(prep)만 우리 서버에서 읽기 전용(js/raid/net.js)
if (typeof window !== 'undefined' && window.DS_SCHOOL && window.DS_SCHOOL.fb && window.DS_SCHOOL.fb.apiKey) {
  DS.HOME_FB = DS.FIREBASE; DS.FIREBASE = window.DS_SCHOOL.fb; DS.SCHOOL = { code: String(window.DS_SCHOOL.code), name: String(window.DS_SCHOOL.name || ''), subject: String(window.DS_SCHOOL.subject || '수학') };
  const pre = (st, p) => { const ks = () => { const a = []; for (let i = 0; i < st.length; i++) { const k = st.key(i); if (k && k.indexOf(p) === 0) a.push(k.slice(p.length)); } return a; };
    return { getItem: (k) => st.getItem(p + k), setItem: (k, v) => st.setItem(p + k, v), removeItem: (k) => st.removeItem(p + k), clear: () => ks().forEach((k) => st.removeItem(p + k)), key: (i) => (ks()[i] == null ? null : ks()[i]), get length() { return ks().length; } }; };
  try { const L0 = window.localStorage, S0 = window.sessionStorage, p = `s.${DS.SCHOOL.code}.`; Object.defineProperty(window, 'localStorage', { value: pre(L0, p), configurable: true }); Object.defineProperty(window, 'sessionStorage', { value: pre(S0, p), configurable: true }); } catch (e) { /* 못 바꾸면 그대로 */ }
  if (typeof document !== 'undefined') document.documentElement.classList.add('school');
}
// 👩‍🏫 교사용 체험판 (2026-11-07 · 링크 = …/trial/ · 예전 …/?trial 은 그리로 옮김): 이 탭 안에서만 · 아무것도 남기지 않음 → 브라우저 저장소를 메모리로 바꿔 끼움 (실제 게임 기록 · 로그인과 섞이지 않음)
//   v0.9.16.2: 전용 주소 trial/ (tools/trial/page.js) — 앱 정보를 스크립트로 바꿔 끼우던 방식은 삼성 인터넷 · 옛 캐시에서 실제 게임 앱으로 설치됨 (사용자 「여전히 본판」)
// 2026-11-08 사용자 「4번(trial/ v2)만 남기고 정리」: 전면 중단 장치(TRIAL_OFF) · 가상 학생 체험판(demo.html) 지움
if (typeof location !== 'undefined' && (/\/trial\/(index\.html)?$/.test(location.pathname) || /[?&]trial(=|&|$)/.test(location.search))) {
  if (!/\/trial\/(index\.html)?$/.test(location.pathname)) location.replace('trial/' + (/[?&]anon(=|&|$)/.test(location.search) ? '?anon' : '')); // 옛 링크 ?trial → 전용 주소 (?anon 은 그대로)
  const mem = () => { const m = new Map(); return { getItem: (k) => (m.has(String(k)) ? m.get(String(k)) : null), setItem: (k, v) => { m.set(String(k), String(v)); }, removeItem: (k) => { m.delete(String(k)); }, clear: () => m.clear(), key: (i) => Array.from(m.keys())[i] ?? null, get length() { return m.size; } }; };
  try { Object.defineProperty(window, 'localStorage', { value: mem(), configurable: true }); Object.defineProperty(window, 'sessionStorage', { value: mem(), configurable: true }); } catch (e) { /* 못 바꾸면 그대로 */ }
  document.documentElement.classList.add('trial'); // CSS: 체험판 화면 다듬기
  DS.TRIAL = { lesson: 'set-03', lessons: ['set-03', 'trial-07'], castle: 'eval-1', cls: '체험' }; // v2 (2026-11-07): 테스트 모드 기준 · 3차시
}
// 🏫 학교판 다른 점 (2026-11-13 선생님 「최대한 기본 기능 위주로 · 버그 없게」 · CLAUDE.md 「🏫 학교판 규칙」): 과목 글자 · 숨기는 기능 (DS.OFF('forge') …)
DS.SUBJECT = DS.SCHOOL ? DS.SCHOOL.subject : '공통수학2';
DS.OFF = (k) => !!(DS.SCHOOL && ['forge', 'symtalk', 'castle', 'survey', 'quest', 'ox', 'sched', 'mis', 'std'].includes(k)); // + 오개념 · 성취기준(우리 집합 단원 기준 · 2026-11-13) // ⚒ 모루 · 도감 · 📖 기호 톡 · 🏰 성채 · 📝 설문 · ✏ 출제 · ⭕ OX · 📅 시간표(우리 학교 일과표 · 2026-11-13)
DS.VERSION = 'citadel-0.9.63.0';
// 🕶 익명 보기 (2026-11-09 #36 · 미래교육상 제출용): 주소 뒤 ?anon → 개발자 이름을 모든 화면에서 숨김 · 한 번 열면 그 탭 안에서 유지(sessionStorage · 체험판은 주소에 남음)
DS.ANON = (() => { if (typeof location === 'undefined') return false; const q = /[?&]anon(=|&|$)/.test(location.search); try { if (q) sessionStorage.setItem('ds-anon', '1'); return q || sessionStorage.getItem('ds-anon') === '1'; } catch (e) { return q; } })();
DS.AUTHOR = DS.ANON ? '' : '김찬우'; // 개발자 (2026-11-03 사용자 요청: 모든 화면 · 첫 화면에 새김)
DS.CREDIT = DS.ANON ? '모두의 던전™' : '모두의 던전™ · 만든 이 ' + DS.AUTHOR; // 2026-11-07 사용자: 「개발 김찬우」 → 이 문구 (첫 화면 · 버전 꼬리표)
// 버전 꼬리표 (2026-11-03): 어느 화면에서든 왼쪽 아래 구석에 작게 — 학생 · 교사 · 전광판 화면에서 업데이트 됐는지 바로 확인
if (typeof document !== 'undefined') {
  const tag = () => { if (document.getElementById('ver-tag') || /demo\.html$/.test(location.pathname)) return; /* 체험판 겉틀은 빼고 안쪽 화면마다 */ const d = document.createElement('div'); d.id = 'ver-tag'; d.setAttribute('aria-hidden', 'true'); d.textContent = 'v' + DS.VERSION.replace(/^citadel-/, '') + ' · ' + DS.CREDIT + (DS.SCHOOL && DS.SCHOOL.name ? ' · 🏫 ' + DS.SCHOOL.name : ''); document.body.appendChild(d); };
  const anon = () => { if (!DS.ANON) return; document.querySelectorAll('.splash-by').forEach((e) => (e.textContent = DS.CREDIT)); const m = document.querySelector('meta[name="author"]'); if (m) m.setAttribute('content', ''); }; // 🕶 #36 첫 화면 글 · author 메타
  document.body ? (tag(), anon()) : document.addEventListener('DOMContentLoaded', () => { tag(); anon(); });
}
