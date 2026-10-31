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
  scene: { src: 'dungeon.webp' }, // 학생 폰 전투 장면: 몬스터 등 뒤 배경 (던전마다 바꿀 수 있게 따로 둠)
  // ── 2026-10-31 사용자 제공 추가 에셋 (아직 화면에 안 씀 — 쓰기 시작할 때 sw.js STATIC 에 넣는다). 자세한 설명: docs/ASSETS.md
  heroesExtra: { src: 'heroes-extra-v1.webp', cols: 4, rows: 8, poses: { idle: 0, walk: 1, attack: 2, fall: 3 }, count: 8,
    names: ['성기사', '격투가', '무희', '음유시인', '연금술사', '해적', '빙결 마법사', '조련사'] },
  monstersExtra: { src: 'monsters-extra-v1.webp', cols: 3, rows: 10, aspect: 2.22, poses: { idle: 0, attack: 1, down: 2 }, // 칸이 가로로 긴 직사각형 (가로 : 세로 ≈ 2.22 : 1)
    names: ['에메랄드 멧돼지', '화염 도마뱀', '장갑 외눈괴물', '이끼 미믹', '자수정 박쥐', '태엽 딱정벌레', '서리 늑대', '버섯 기사', '마법책 정령', '흑요석 미노타우로스'] },
  fields: { forest: 'field-forest-v1.webp', lava: 'field-lava-v1.webp', ice: 'field-ice-v1.webp' }, // 전투 배경 (달빛 숲 유적 · 화산 대장간 · 빙결 신전)
  camp: {
    bg: 'camp-forest-v1.webp',                                   // 어두운 숲 야영지 (텐트 포함, 모닥불·입구는 따로)
    fire: { src: 'campfire-v1.webp', cols: 4, rows: 2, frames: 8, ms: 110 }, // 모닥불 8프레임, 110ms 반복
    gate: { src: 'gates-v1.webp', cols: 2, rows: 1, states: { on: 0, off: 1 } }, // 던전 차원문: 활성 / 꺼짐
    trees: { src: 'camp-trees-v1.webp', cuts: [0, 630, 1020, 1550, 2048], base: 2048, names: ['활엽수', '침엽수', '고목', '전경 나무'] }, // 폭이 달라 cuts 비율로 자름
    anvil: { src: 'anvil-v1.webp', cols: 3, rows: 1, states: { idle: 0, forging: 1, done: 2 } }, // 모루: 대기 / 연성 중 / 완성
    layers: ['bg', 'trees-back', 'gate', 'heroes', 'fire', 'anvil', 'trees-front', 'ui'],
  },
  panels: { src: 'ui-panels-v1.webp', cols: 2, rows: 2, kinds: { inventory: 0, paper: 1, dialog: 2, reward: 3 } }, // 남색 인벤토리 · 양피지 문제지 · 청록 대화창 · 보라 보상창
  fonts: { pixel: 'assets/fonts/Galmuri11.woff2', pixelBold: 'assets/fonts/Galmuri11-Bold.woff2' },
};
