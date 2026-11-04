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
DS.VERSION = 'citadel-0.9.7.2';
DS.AUTHOR = '김찬우'; // 개발자 (2026-11-03 사용자 요청: 모든 화면 · 첫 화면에 새김)
// 버전 꼬리표 (2026-11-03): 어느 화면에서든 왼쪽 아래 구석에 작게 — 학생 · 교사 · 전광판 화면에서 업데이트 됐는지 바로 확인
if (typeof document !== 'undefined') {
  const tag = () => { if (document.getElementById('ver-tag') || /demo\.html$/.test(location.pathname)) return; /* 체험판 겉틀은 빼고 안쪽 화면마다 */ const d = document.createElement('div'); d.id = 'ver-tag'; d.setAttribute('aria-hidden', 'true'); d.textContent = 'v' + DS.VERSION.replace(/^citadel-/, '') + ' · 개발 ' + DS.AUTHOR; document.body.appendChild(d); };
  document.body ? tag() : document.addEventListener('DOMContentLoaded', tag);
}
