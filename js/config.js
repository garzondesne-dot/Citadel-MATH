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
// 👩‍🏫 교사용 체험판 (2026-11-07 · 링크 = …/?trial): 이 탭 안에서만 · 아무것도 남기지 않음 → 브라우저 저장소를 메모리로 바꿔 끼움 (실제 게임 기록 · 로그인과 섞이지 않음)
if (typeof location !== 'undefined' && /[?&]trial(=|&|$)/.test(location.search)) {
  const mem = () => { const m = new Map(); return { getItem: (k) => (m.has(String(k)) ? m.get(String(k)) : null), setItem: (k, v) => { m.set(String(k), String(v)); }, removeItem: (k) => { m.delete(String(k)); }, clear: () => m.clear(), key: (i) => Array.from(m.keys())[i] ?? null, get length() { return m.size; } }; };
  try { Object.defineProperty(window, 'localStorage', { value: mem(), configurable: true }); Object.defineProperty(window, 'sessionStorage', { value: mem(), configurable: true }); } catch (e) { /* 못 바꾸면 그대로 */ }
  DS.TRIAL = { lesson: 'set-06', lessons: ['set-06'], castle: 'eval-1', rooms: ['q04', 'q07'], cls: '체험' };
  { const ln = document.querySelector('link[rel="manifest"]'); if (ln) ln.setAttribute('href', 'manifest-trial.webmanifest'); } // 📲 체험판 링크에서 「앱 설치」 = 체험판 앱 (시작 주소 ?trial · 이름 「던전 체험판」 · 실제 게임 앱과 따로)
}
DS.VERSION = 'citadel-0.9.16.1';
DS.AUTHOR = '김찬우'; // 개발자 (2026-11-03 사용자 요청: 모든 화면 · 첫 화면에 새김)
// 버전 꼬리표 (2026-11-03): 어느 화면에서든 왼쪽 아래 구석에 작게 — 학생 · 교사 · 전광판 화면에서 업데이트 됐는지 바로 확인
if (typeof document !== 'undefined') {
  const tag = () => { if (document.getElementById('ver-tag') || /demo\.html$/.test(location.pathname)) return; /* 체험판 겉틀은 빼고 안쪽 화면마다 */ const d = document.createElement('div'); d.id = 'ver-tag'; d.setAttribute('aria-hidden', 'true'); d.textContent = 'v' + DS.VERSION.replace(/^citadel-/, '') + ' · 개발 ' + DS.AUTHOR; document.body.appendChild(d); };
  document.body ? tag() : document.addEventListener('DOMContentLoaded', tag);
}
