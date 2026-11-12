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
DS.VERSION = 'citadel-0.9.54.0';
// 🕶 익명 보기 (2026-11-09 #36 · 미래교육상 제출용): 주소 뒤 ?anon → 개발자 이름을 모든 화면에서 숨김 · 한 번 열면 그 탭 안에서 유지(sessionStorage · 체험판은 주소에 남음)
DS.ANON = (() => { if (typeof location === 'undefined') return false; const q = /[?&]anon(=|&|$)/.test(location.search); try { if (q) sessionStorage.setItem('ds-anon', '1'); return q || sessionStorage.getItem('ds-anon') === '1'; } catch (e) { return q; } })();
DS.AUTHOR = DS.ANON ? '' : '김찬우'; // 개발자 (2026-11-03 사용자 요청: 모든 화면 · 첫 화면에 새김)
DS.CREDIT = DS.ANON ? '모두의 던전™' : '모두의 던전™ · 만든 이 ' + DS.AUTHOR; // 2026-11-07 사용자: 「개발 김찬우」 → 이 문구 (첫 화면 · 버전 꼬리표)
// 버전 꼬리표 (2026-11-03): 어느 화면에서든 왼쪽 아래 구석에 작게 — 학생 · 교사 · 전광판 화면에서 업데이트 됐는지 바로 확인
if (typeof document !== 'undefined') {
  const tag = () => { if (document.getElementById('ver-tag') || /demo\.html$/.test(location.pathname)) return; /* 체험판 겉틀은 빼고 안쪽 화면마다 */ const d = document.createElement('div'); d.id = 'ver-tag'; d.setAttribute('aria-hidden', 'true'); d.textContent = 'v' + DS.VERSION.replace(/^citadel-/, '') + ' · ' + DS.CREDIT; document.body.appendChild(d); };
  const anon = () => { if (!DS.ANON) return; document.querySelectorAll('.splash-by').forEach((e) => (e.textContent = DS.CREDIT)); const m = document.querySelector('meta[name="author"]'); if (m) m.setAttribute('content', ''); }; // 🕶 #36 첫 화면 글 · author 메타
  document.body ? (tag(), anon()) : document.addEventListener('DOMContentLoaded', () => { tag(); anon(); });
}
