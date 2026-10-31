// 그래픽 에셋 배치표: 그림 파일과 칸 배치만 적는다. 그림을 바꾸려면 assets/img 의 파일과 이 표만 고치면 된다 (코드 수정 없음).
// 칸 위치: 열(col)·행(row) 번호 → CSS background-position 으로 계산 (js/engine/art.js)
window.DS = window.DS || {};
DS.ASSETS = {
  base: 'assets/img/',
  heroes: { src: 'heroes-v2.webp', cols: 4, rows: 8, poses: { idle: 0, walk: 1, attack: 2, fall: 3 }, count: 8, teacher: 7 },
  monsters: { src: 'monsters-v2.webp', cols: 3, rows: 3, poses: { idle: 0, attack: 1, down: 2 }, names: ['수정 슬라임', '바위 골렘', '성채 드래곤'] },
  cards: { src: 'cards-v4.webp', cols: 4, rows: 2 }, // 카드 그림 8칸: 0 소속 · 1 개수 · 2 공집합 · 3 포함 · 4 반례 · 5 같음 · 6 부분집합 목록 · 7 개수의 비밀
  frame: { src: 'frame-v2.webp', slice: 140 },
  background: { src: 'dungeon.webp' },
  fonts: { pixel: 'assets/fonts/Galmuri11.woff2', pixelBold: 'assets/fonts/Galmuri11-Bold.woff2' },
};
