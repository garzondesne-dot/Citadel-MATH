// ⚙ 게시판 던전 ATB — 숫자 한 곳 (📜 2026-11-20 설계 방 · docs/board-atb/design/정리.md · 전투설정표-초안.md · 용사수치-초안.md 0절)
//   모든 숫자 = 「출발값」 · 교사 연습방에서 선생님이 3판 해 본 뒤 여기만 고침 · 화면 · 엔진은 이 파일만 읽음
//   ⏳ 아직 안 정한 값 = null 또는 TODO 줄(설계 방이 보냄): 1 · 2인 판 숫자 · 역할 스킬 넣은 모의실험 · 3 · 4 · 6 · 8 · 9 · 10차시 설정

export type Diff = 'easy' | 'normal' | 'hard';
export type Fam = 'arms' | 'flame' | 'nature' | 'wisdom' | 'mystic';
export type Role = 'dealer' | 'tank' | 'healer' | 'support';

/** 난이도마다 보스 HP (인원 1 · 2 · 3 · 4) · 📜 설정표 v3(모의실험 3) · 연습 · 도전 = 어림값 */
export const BOSS_HP: Record<Diff, [number, number, number, number]> = {
  easy: [190, 410, 780, 1240],
  normal: [230, 500, 950, 1500],
  hard: [270, 590, 1120, 1760],
};
/** 보스 공격 기본값 (단일 / 광역) · 인원 1 · 2 · 3 · 4 (설정표 v3: 4 · 3인 같음) */
export const BOSS_HIT: Record<Diff, [number, number][]> = {
  easy: [[3.5, 2], [6, 3], [8, 4], [8, 4]],
  normal: [[6, 3], [11, 5.5], [14, 7], [14, 7]],
  hard: [[8, 4], [14, 7], [18, 9], [18, 9]],
};
export const T = {
  bossEvery: 12, // 보스 공격 간격(초)
  telegraph: 2, // 표적 예고(초 전)
  aoeEvery: 3, // 세 번째마다 광역
  shieldAt: 0.7, // 보스 HP 70% 에서 실드
  shieldDmg: 0.3, // 실드가 남은 동안 받는 피해 ×0.3 (11차시 두꺼비 = 0.2 · 보스 설정)
  weak: { normal: 12, hard: 10, easy: 12 } as Record<Diff, number>, // 약점 시간(초)
  weakDmg: 2, weakAtb: 2,
  slow: { normal: 3, hard: 4, easy: 3 } as Record<Diff, number>, stun: { normal: 2, hard: 3, easy: 2 } as Record<Diff, number>,
  slowX: 0.5, // 감속 = ATB 차는 빠르기 ×0.5
  revives: 3, // 팀 부활 한 판 3번
  reviveHp: 0.3, // ⏳ 부활 HP = 최대의 30% (설계안 「테스트로 정함」)
  reviveCost: 1, // ⚡ 1개로 살림
  shieldHelpAfter: 90, // 실드가 뜬 뒤 90초 지나도 남은 칸 = 다른 사람이 완주 2번으로 대신
  shieldHelpRuns: 2,
  wrongSwap: 4, // 4번째 오답 = 같은 원문항 새 숫자 판
  zapMax: 5,
  zapMul: [0, 1.0, 2.1, 3.3, 4.6, 6.0], // ⚡ n개를 한 번에
  goldZap: 1.5, // 금색 ⚡ = 1.5배 값
  ultMul: 6.0, awkMul: 6.5, // 필살기(⚡5) · 각성 필살기(🔨+10 · 판당 1번)
  skillBase: 55, attackBase: 12, // 스킬 기본 · 일반 공격 기본 (용사수치 초안 30 · 8 → 약 4분 판에 맞춰 올림)
  timing: { miss: 0, ok: 1, crit: 1.5 }, // 일반 공격 타이밍 바
  hold: { miss: 1.0, ok: 1.25, best: 1.5 }, // 스킬 「모았다 놓기」 빗나감 · 성공 · 딱 맞음
  holdMs: 1400, // ⏳ 고리가 한 바퀴 차는 시간 (테스트로 정함)
  holdBest: [0.78, 0.9] as [number, number], holdOk: [0.62, 1.0] as [number, number], // ⏳ 딱 맞음 · 성공 칸(한 바퀴 비율) · 금색 ⚡ 1개마다 딱 맞음 칸 +0.02
  holdBestPerGold: 0.02,
  timingMs: 1600, timingOk: [0.35, 0.8] as [number, number], timingCrit: [0.52, 0.64] as [number, number], // ⏳ 타이밍 바
  critAtb: 0.2, // 타이밍 치명 = 다음 ATB +20% 채운 채
  perfectAtb: 1, // 원문항을 오답 없이 끝냄 = 내 ATB 즉시 가득
  downedAtbGift: 0.5, // 쓰러진 학생이 문제를 맞힘 = 고른 친구 ATB +50%
  role: {
    dealer: { hp: 1.0, def: 0, spd: 1.0, smash: 1.5 },
    tank: { hp: 1.3, def: 0.2, spd: 0.9, cover: 0.5 },
    healer: { hp: 0.9, def: 0, spd: 0.95, heal: 12 }, // 📜 11/20 선생님 확정 +12 (설정표 +25 대신) · 팀 전체로 보스 공격 한 번 사이에 1번
    support: { hp: 0.95, def: 0, spd: 1.1 },
  },
  atbSec: 8, defCap: 0.4, crit: 1.5,
  awk: { dealerWeak: 3, tankCut: 0.3, healerHeal: 15, supportAtb: 0.3, enhBonus: 0.03 },
  practiceKeep: 5, // 교사 연습방 = 이 폰 최근 5판
} as const;

/** 성장 식 = 로그 (용사수치 초안 0절): 몫(x) = 기준 몫 × ln(1 + x) ÷ ln(1 + 기준 x) */
const logShare = (base: number, x: number, at: number) => (x <= 0 ? 0 : (base * Math.log(1 + x)) / Math.log(1 + at));
export const G = {
  lv: (lv: number) => logShare(0.2, Math.max(1, lv) - 1, 9), // Lv.10 → +20%
  enh: (e: number) => logShare(0.3, Math.max(0, e), 10) + (e >= 10 ? T.awk.enhBonus : 0), // +10 → +30% (+각성 3%)
  tier: (t: number) => logShare(0.25, Math.max(1, t) - 1, 3), // Ⅳ → +25%
  spd: (lv: number) => logShare(0.1, Math.max(1, lv) - 1, 9), // Lv.10 → ATB +10%
  grit: (n: number) => logShare(0.1, Math.max(0, n), 100), // 🛡 끈기 100 → 방어 +10%
  focus: (n: number) => logShare(0.2, Math.max(0, n), 100), // 🎯 집중 100 → 치명 +0.2
};

/** 5계열 (속성 → 계열) */
export const FAM_OF_ATTR: Record<string, Fam> = { cut: 'arms', smash: 'arms', sweep: 'arms', fire: 'flame', spark: 'flame', water: 'nature', frost: 'nature', wind: 'nature', magic: 'wisdom', math: 'wisdom', gear: 'wisdom', sun: 'mystic', dark: 'mystic', star: 'mystic' };
export const FAM_NAME: Record<Fam, string> = { arms: '무기', flame: '화염', nature: '자연', wisdom: '지혜', mystic: '신비' };
export const ROLE_NAME: Record<Role, string> = { dealer: '딜러', tank: '탱커', healer: '힐러', support: '서포터' };
export const ROLE_SKILL: Record<Role, string> = { dealer: '강타', tank: '엄호', healer: '광역 회복', support: '격려' };
/** 용사 → 역할 (설계안 v1 2절 표 · 33칸 · 각성 로안 = 로안 · 올드윈 = 서포터) */
const ROLE_BY_NAME: Record<string, Role> = {
  로안: 'dealer', 리아넬: 'dealer', 바루: 'dealer', 바르코: 'dealer', 녹스: 'dealer', 이그니: 'dealer', 케라운: 'dealer', 칼시: 'dealer', 아르발: 'dealer', 호버: 'dealer',
  시엔: 'tank', 하스타: 'tank', 보르간: 'tank', 발도르: 'tank', 에이라: 'tank',
  루멘: 'healer', 파셀: 'healer', 타미: 'healer', 칸델: 'healer',
  누아: 'support', 셰라: 'support', 리라: 'support', 글라세: 'support', 한수: 'support', 미지: 'support', 볼트: 'support', 핑: 'support', 아바쿠: 'support', 콤파: 'support', 마진: 'support', 폴라: 'support', 올드윈: 'support',
};
export const roleOfName = (name: string): Role => ROLE_BY_NAME[name] ?? 'dealer';

/** 보스 설정 (차시 번호 → 몬스터) · 📜 설정표 v3 「차시별 한눈에」 · 선생님 확정 11/20 (대표 행동 9) · 숫자 = 어림값(연습방에서 맞춤)
 *  cycle = 공격 차례(되풀이) · tele = 표적 보여 주는 꼴(foot 발밑 · gaze 고개 돌리기 · scale 기우는 저울) · sig = 대표 행동 */
export type AtkKind = 'basic' | 'smash' | 'poison' | 'sleep' | 'fire' | 'fire13' | 'fog' | 'tongue' | 'ice' | 'confuse' | 'frost' | 'tail' | 'dark' | 'mirror' | 'bind' | 'scale' | 'aoe';
export type Sig = 'footTarget' | 'gaze' | 'iceArmor' | 'fireBreath' | 'breath' | 'mirror' | 'lock' | 'scale' | 'ripple';
export type MonPoseK = 'idle' | 'attack' | 'hit' | 'down';
export interface BossCfg { no: number; name: string; sprite: string; /** 🔄 그림이 오른쪽을 보는 자세 = 좌우 반전 (몬스터는 늘 왼쪽 · 용사 쪽을 봄 · 📜 11/20 선생님 「2차시 흑표범 방향 반대」) */ flip?: Partial<Record<MonPoseK, boolean>>;
  weak: [Fam, Fam]; type: string; cycle: AtkKind[]; tele: 'foot' | 'gaze' | 'scale'; sig: Sig; signature: string; shieldDmg?: number; draft?: boolean }
export const BOSSES: Record<number, BossCfg> = {
  2: { no: 2, name: '숲의 수호자 흑표범', sprite: 'new6:0', flip: { idle: true, hit: true, down: true }, weak: ['arms', 'flame'], type: '공격형', cycle: ['smash', 'smash', 'poison'], tele: 'foot', sig: 'footTarget', signature: '강타 표적' },
  3: { no: 3, name: '포함의 성주 보라 드래곤', sprite: 'base2:0', flip: { attack: true }, weak: ['nature', 'mystic'], type: '공격형', cycle: ['smash', 'smash', 'fire13'], tele: 'gaze', sig: 'gaze', signature: '고개 돌리기' },
  4: { no: 4, name: '서리 늑대', sprite: 'crown7:0', flip: { down: true }, weak: ['flame', 'wisdom'], type: '방어형', cycle: ['ice', 'confuse', 'aoe'], tele: 'foot', sig: 'iceArmor', signature: '얼음 갑옷', shieldDmg: 0.2 },
  5: { no: 5, name: '흑요석 미노타우로스', sprite: 'extra9:0', flip: { attack: true, down: true }, weak: ['nature', 'arms'], type: '공격형(광역)', cycle: ['sleep', 'sleep', 'fire'], tele: 'foot', sig: 'fireBreath', signature: '화염 숨 모으기' },
  6: { no: 6, name: '청록 드래곤', sprite: 'crown9:0', weak: ['arms', 'mystic'], type: '회복형', cycle: ['tail', 'tail', 'frost'], tele: 'foot', sig: 'breath', signature: '숨 고르기' },
  7: { no: 7, name: '청록 드래곤', sprite: 'crown9:0', weak: ['arms', 'mystic'], type: '회복형', cycle: ['tail', 'tail', 'frost'], tele: 'foot', sig: 'breath', signature: '숨 고르기 (6차시 이어하기)' },
  8: { no: 8, name: '부정의 수정 여왕', sprite: 'mirrorboss80:0', weak: ['arms', 'mystic'], type: '교란형', cycle: ['ice', 'dark', 'mirror'], tele: 'foot', sig: 'mirror', signature: '거울빛' },
  9: { no: 9, name: '열쇠 금고 문지기', sprite: 'keyvaultboss0:0', weak: ['wisdom', 'flame'], type: '방어형(속박)', cycle: ['bind', 'bind', 'dark'], tele: 'foot', sig: 'lock', signature: '자물쇠' },
  10: { no: 10, name: '필요충분의 천칭 수호자', sprite: 'gardenboss0:0', weak: ['wisdom', 'mystic'], type: '교란형', cycle: ['scale', 'bind', 'scale'], tele: 'scale', sig: 'scale', signature: '기우는 저울' },
  11: { no: 11, name: '거울 웅덩이 두꺼비', sprite: 'garden4:0', weak: ['flame', 'nature'], type: '방어형', cycle: ['tongue', 'tongue', 'fog'], tele: 'foot', sig: 'ripple', signature: '물결', shieldDmg: 0.2 },
};
/** 공격 종류 → 효과 (배율 = 그 판 기본 단일 · 광역 값에 곱 · 0 = HP 피해 없음) · 설계안 5절 묶음: HP · HP+감속 · 감속 · 행동 불능 */
export const ATK: Record<AtkKind, { name: string; mul: number; aoe?: boolean; status?: 'slow' | 'stun'; wake?: boolean; split?: number; warn?: number; special?: 'mirror' | 'scale' }> = {
  basic: { name: '공격', mul: 1 },
  aoe: { name: '광역', mul: 1, aoe: true },
  smash: { name: '강타', mul: 1.5 },
  poison: { name: '독', mul: 1, aoe: true, split: 3 },
  sleep: { name: '수면', mul: 0, status: 'stun', wake: true }, // 맞으면 깸
  fire: { name: '화염 숨', mul: 1.5, aoe: true, warn: 3 }, // 5차시 · 예고 중 실드를 다 깨면 취소
  fire13: { name: '화염', mul: 1.3, aoe: true },
  fog: { name: '물결', mul: 0, aoe: true, status: 'slow' },
  tongue: { name: '혀 치기', mul: 1 },
  ice: { name: '얼음', mul: 1, status: 'slow' },
  confuse: { name: '혼란', mul: 0, status: 'slow' },
  frost: { name: '냉기', mul: 1, aoe: true, status: 'slow' },
  tail: { name: '꼬리치기', mul: 1 },
  dark: { name: '어둠', mul: 0, aoe: true, status: 'slow' },
  mirror: { name: '거울빛', mul: 0, aoe: true, warn: 3, special: 'mirror' },
  bind: { name: '속박', mul: 0, status: 'stun' },
  scale: { name: '저울', mul: 1, status: 'slow', special: 'scale' }, // 기울면 단일(그 쪽 용사) · 수평이면 광역
};
/** 대표 행동 숫자 (어림값 · 📜 설정표 v3 「⚠ ×0.2 · 8% · 30% · 30초 = 모의실험에 안 넣은 값」) */
export const SIG = {
  breath: { every: 30, warn: 3, heal: 0.08 }, // 6 · 7 숨 고르기: 실드가 뜬 뒤 30초마다 3초 예고 → HP 8% 회복 · 예고 중 실드 칸을 깨면 끊김
  mirror: { sec: 10, back: 0.3 }, // 8 거울빛: 다음 10초 일반 공격 피해 30% 가 공격한 용사에게 (스킬은 안 돌아옴)
  scaleTilt: 0.5, // 10 기우는 저울: 기울(단일) 확률
};

/** 🎚 균형 표 한 곳 (📜 11/20 「보스 HP · 공격 · 역할 수치를 코드 한 곳(표 하나)에 · 나중에 균형 도구가 그 표만 바꿈」)
 *  엔진은 쓰는 순간 이 표의 값을 읽음 → 도구가 칸 값을 바꾸면 다음 판부터 그대로 (읽기 전용 표시는 타입만) */
export const TUNE = { BOSS_HP, BOSS_HIT, T, BOSSES, ATK, SIG } as const;
