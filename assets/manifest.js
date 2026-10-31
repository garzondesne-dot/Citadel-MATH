// 그래픽 에셋 배치표: 그림 파일과 칸 배치만 적는다. 그림을 바꾸려면 assets/img 의 파일과 이 표만 고치면 된다 (코드 수정 없음).
// 칸 위치: 열(col)·행(row) 번호 → CSS background-position 으로 계산 (js/engine/art.js)
window.DS = window.DS || {};
DS.ASSETS = {
  base: 'assets/img/',
  heroes: { src: 'heroes-v2.webp', cols: 4, rows: 8, poses: { idle: 0, walk: 1, attack: 2, fall: 3 }, count: 8, teacher: 7 },
  monsters: { src: 'monsters-v2.webp', cols: 3, rows: 3, poses: { idle: 0, attack: 1, down: 2 }, names: ['수정 슬라임', '바위 골렘', '성채 드래곤'], flip: [1] }, // flip: 오른쪽을 보고 그려진 줄 (용사는 왼쪽에 선다)
  cards: { src: 'cards-v4.webp', cols: 4, rows: 2 }, // 카드 그림 8칸: 0 소속 · 1 개수 · 2 공집합 · 3 포함 · 4 반례 · 5 같음 · 6 부분집합 목록 · 7 개수의 비밀
  frame: { src: 'frame-v2.webp', slice: 140 },
  background: { src: 'dungeon.webp' },
  scene: { src: 'dungeon.webp' }, // 학생 폰 전투 장면: 몬스터 등 뒤 배경 (던전마다 바꿀 수 있게 따로 둠)
  // ── 2026-10-31 사용자 제공 추가 에셋 (아직 화면에 안 씀 — 쓰기 시작할 때 sw.js STATIC 에 넣는다). 자세한 설명: docs/ASSETS.md
  heroesExtra: { src: 'heroes-extra-v1.webp', cols: 4, rows: 8, poses: { idle: 0, walk: 1, attack: 2, fall: 3 }, count: 8,
    names: ['성기사', '격투가', '무희', '음유시인', '연금술사', '해적', '빙결 마법사', '조련사'] },
  // 몬스터 추가 시트: 칸을 정사각형(256)으로 다시 맞춘 판. 차시 파일에서 sprite: 'extra:3' · 'new:5' 처럼 부른다
  monstersExtra: { src: 'monsters-extra-v2.webp', cols: 3, rows: 10, poses: { idle: 0, attack: 1, down: 2 },
    names: ['에메랄드 멧돼지', '화염 도마뱀', '장갑 외눈괴물', '이끼 미믹', '자수정 박쥐', '태엽 딱정벌레', '서리 늑대', '버섯 기사', '마법책 정령', '흑요석 미노타우로스'] },
  monstersNew: { src: 'monsters-new-v1.webp', cols: 3, rows: 10, poses: { idle: 0, attack: 1, down: 2 },
    names: ['수정 아홀로틀', '선인장 수호수', '등불 유령', '번개 독수리', '자수정 슬라임', '해바라기 정령', '흑요석 표범', '용암 게', '황금 스카라베', '별빛 해파리'] },
  // 던전 테마 10종: 던전 안 전투 배경(dg-) + 같은 번호의 포털(portal-, 2열: 활성 / 봉쇄). 차시 파일의 theme 으로 고른다
  dungeons: { ids: ['01-burrow', '02-deep-forest', '03-dimensional', '04-mine', '05-ruins', '06-frost', '07-volcano', '08-crypt', '09-underwater', '10-sky'],
    names: ['땅굴', '깊은 숲 성역', '차원 균열 지대', '폐광 갱도', '고대 유적 심장부', '빙결 동굴', '화산 심연', '망자의 지하 묘실', '수중 신전', '천공 성소'],
    bg: (id) => `dg-${id}-v1.webp`, portal: (id) => `portal-${id}-v1.webp` },
  fields: { forest: 'field-forest-v1.webp', lava: 'field-lava-v1.webp', ice: 'field-ice-v1.webp' }, // 전투 배경 (달빛 숲 유적 · 화산 대장간 · 빙결 신전)
  camp: {
    bg: 'camp-forest-v1.webp',                                   // 어두운 숲 야영지 (텐트 포함, 모닥불·입구는 따로)
    fire: { src: 'campfire-v1.webp', cols: 4, rows: 2, frames: 8, ms: 110 }, // 모닥불 8프레임, 110ms 반복
    gate: { src: 'gates-v1.webp', cols: 2, rows: 1, states: { on: 0, off: 1 } }, // 던전 차원문: 활성 / 꺼짐
    trees: { src: 'camp-trees-v1.webp', cuts: [0, 630, 1020, 1550, 2048], base: 2048, names: ['활엽수', '침엽수', '고목', '전경 나무'] }, // 폭이 달라 cuts 비율로 자름
    anvil: { src: 'anvil-v1.webp', cols: 3, rows: 1, states: { idle: 0, forging: 1, done: 2 } }, // 모루: 대기 / 연성 중 / 완성
    layers: ['bg', 'trees-back', 'gate', 'heroes', 'fire', 'anvil', 'trees-front', 'ui'],
  },
  // 수학 카드 (모루 연성): 공통 금테 + 위쪽 무기·마법 그림 8칸. 좌표는 테두리(384×512) 기준. 그림은 한 색으로 차분하게, 등급은 아래 보석 색
  cardKit: { frame: 'card-frame-v1.webp', w: 384, h: 512, arts: { src: 'card-arts-v1.webp', cols: 8, names: ['검', '주판', '수정구', '반지', '돋보기', '쌍수정', '두루마리', '빛나무'] },
    box: { art: [62, 24, 292, 186], body: [72, 214, 270, 172], plate: [92, 398, 230, 48], gem: [166, 418, 52, 74] } },
  // 모루 연성창: 위에서 본 모루(작업면 = face, 그림 비율 0~1) · 망치
  forge: { anvil: { src: 'forge-anvil-v1.webp', w: 820, h: 509, face: [0.273, 0.328, 0.830, 0.734] }, hammer: { src: 'forge-hammer-v1.webp', w: 420, h: 435 } },
  // 브랜드: 공통 = 배경 · 메뉴 아이콘(학생 · 교사 · 종합상황실 · 수업 준비 · 로그인), 에디션 = 제목 화면 · 머리 배너 · 로고 (과목이 늘면 에디션만 바꿈)
  brand: { name: '모두의 던전', edition: '공통수학2', full: '모두의 던전 : 공통수학2', tagline: '함께 풀고, 모두 함께 돌파하라',
    bg: 'brand-bg-v1.webp', menu: { src: 'menu-icons-v1.webp', cols: 5, kinds: { student: 0, teacher: 1, hall: 2, prep: 3, login: 4 } },
    title: 'brand-m2-title-v1.webp', header: 'brand-m2-header-v1.webp', logo: 'brand-m2-logo-v1.webp' },
  panels: { src: 'ui-panels-v1.webp', cols: 2, rows: 2, kinds: { inventory: 0, paper: 1, dialog: 2, reward: 3 } }, // 남색 인벤토리 · 양피지 문제지 · 청록 대화창 · 보라 보상창
  fonts: { pixel: 'assets/fonts/Galmuri11.woff2', pixelBold: 'assets/fonts/Galmuri11-Bold.woff2' },
};
