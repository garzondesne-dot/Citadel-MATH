// ⚙ 게시판 던전 ATB — 숫자 한 곳 (📜 2026-11-20 설계 방 · docs/board-atb/design/정리.md · 전투설정표-초안.md · 용사수치-초안.md 0절)
//   모든 숫자 = 「출발값」 · 교사 연습방에서 선생님이 3판 해 본 뒤 여기만 고침 · 화면 · 엔진은 이 파일만 읽음
//   ⏳ 아직 안 정한 값 = null 또는 TODO 줄(설계 방이 보냄): 1 · 2인 판 숫자 · 역할 스킬 넣은 모의실험 · 3 · 4 · 6 · 8 · 9 · 10차시 설정

export type Diff = 'easy' | 'normal' | 'hard';
export type Fam = 'arms' | 'flame' | 'nature' | 'wisdom' | 'mystic';
export type Role = 'dealer' | 'tank' | 'healer' | 'support';

/** 🎚 난이도 = 일반에 곱함 (📜 11/20 요청 #5 ④ 출발값): 연습 = HP ×0.8 · 공격 ×0.6 / 도전 = HP ×1.1 · 공격 ×1.1 */
export const DIFF_MUL: Record<Diff, { hp: number; hit: number }> = { easy: { hp: 0.8, hit: 0.6 }, normal: { hp: 1, hit: 1 }, hard: { hp: 1.1, hit: 1.1 } }; // 도전 = 출발 ×1.2 · ×1.3 → 80% 봇 승률이 너무 낮아(평균 60%대 · 0% 칸도) ×1.1 · ×1.1 (봇 평균 85%)
/** 일반 보스 HP 기본 (인원 1 · 2 · 3 · 4) · 차시별 값(T.bossHpByNo)이 없을 때만 */
export const BOSS_HP_BASE: [number, number, number, number] = [299, 650, 1235, 1950];
/** 일반 보스 공격 (단일 / 광역) · 인원 1 · 2 · 3 · 4 = 설정표 v3 × 0.7 (📜 요청 #5 ① 「모의실험4 다」) */
export const HIT_NORMAL: [number, number][] = ([[6, 3], [11, 5.5], [14, 7], [14, 7]] as [number, number][]).map(([a, b]) => [+(a * 0.7).toFixed(2), +(b * 0.7).toFixed(2)]);
export const BOSS_HIT: Record<Diff, [number, number][]> = Object.fromEntries((['easy', 'normal', 'hard'] as Diff[]).map((d) => [d, HIT_NORMAL.map(([a, b]) => [+(a * DIFF_MUL[d].hit).toFixed(2), +(b * DIFF_MUL[d].hit).toFixed(2)])])) as Record<Diff, [number, number][]>;
export const T = {
  bossEvery: 12, // 보스 공격 간격(초)
  telegraph: 4, // 표적 예고(초 전) · 📜 요청 #35 2 → 4 (예고 중 반응 막기)
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
  /** ⚡ 충전 (📜 11/20 Y1 · 결정 14절): 원문항(한 문제)을 통째로 맞혀야 충전 · 최대 3 · 퍼펙트(오답 없이) · 재시도(오답 있었음) = ⏳ 임시값(설계 방 최종값 오면 바꿈) */
  charge: { max: 4, perSub: 1, perfect: 1, autoGap: 0.6, perfectOld: 3, retry: 2, /** 📜 요청 #49 찍기 막기 = 소문항 틀린 횟수 → 충전 (0번 1 · 1번 ½ · 2번 이상 0) */ byMiss: [1, 0.5, 0] as readonly number[] }, // 📜 요청 #41 선생님 「소문항 한 개에 충전 칸 한 개」 = 소문항 맞힘마다 +1 · 오답 없이 원문항 끝 = +1 더 · 최대 4 · 넘침 자동 스킬 사이 0.6초 (perfectOld · retry = 옛 값 · 화면 표시 안 씀)
  hitLockMs: 1000, // 📜 요청 #20 ① 몬스터 공격에 맞으면 문제 카드 잠금 1초(보스 HP 절반 아래도 같음)
  lowHp: 0.3, // 📜 요청 #18 체력 30% 아래 = 위험(빨갛게 깜박 · 🆘)
  chargeStart: 1, // 📜 요청 #6 ③ 판 시작 때 모든 용사 충전 1칸
  autoAtkDelay: 1.0, // 📜 요청 #11 문제 카드를 연 채 ATB 가 차면 이만큼(초) 뒤 자동 일반 공격 · 그 사이 스킬을 톡 할 틈 // 📜 요청 #5 ① 확정 (Y1′ · 모의실험4 「다」)
  /** 💠 스킬 비용 (Y2) */
  cost: { shield: 1, equip: 1, role: 1, revive: 1, tier4: 2, aura: 2, awk: 3, heal: 1 }, // heal = 🩹 응급 힐 (요청 #46) // tier4 = 요청 #19 로 단추 없앰(Ⅳ 장착 = 장착 스킬 피해에 단계 보너스 · G.tier)
  /** 💥 스킬 피해 비 (Y11): 장착 1 · 4레벨 2.3 · 각성 3.8(판당 1번) + 역할 덧효과 그대로 */
  ratio: { equip: 1, tier4: 2.3, awk: 3.8 },
  /** 🛡 오라 방패 (Y12 · +10 · 판당 1번): 다음 보스 공격 1번 팀 전체 막음 + 보스 석화 ⏳ 임시 6초(선생님 확인 전) */
  aura: { stone: 6 },
  skillBase: 140, attackBase: 12, // 스킬 기본(장착 = 140 · 📜 모의실험4 「55 → 140」) · 일반 공격 기본
  timing: { miss: 0, ok: 1, crit: 1.5 }, // 일반 공격 타이밍 바
  /** ⏳ 타이밍 바 (📜 11/20 요청 #3 ⑥): 판마다 성공 칸 폭 · 치명 칸 폭 · 바늘 한 번 지나는 시간(ms) 을 이 범위에서 고르고 칸 자리도 무작위
   *    치명 = 성공 칸 안의 좁은 칸 · 끝 여백 edge 안쪽에만 놓음 */
  timingZone: { okW: [0.22, 0.4] as [number, number], critW: [0.06, 0.12] as [number, number], ms: [1000, 1700] as [number, number], edge: 0.06 },
  critAtb: 0.2, // 타이밍 치명 = 다음 ATB +20% 채운 채
  perfectAtb: 1, // 원문항을 오답 없이 끝냄 = 내 ATB 즉시 가득
  /** ❤ 일반 보스 HP 차시별 (인원 1 · 2 · 3 · 4 · 📜 요청 #5 ② 봇으로 맞춤) · 연습 · 도전 = × DIFF_MUL.hp */
  bossHpByNo: {
    2: [1010, 1750, 3020, 5340], 3: [770, 1330, 2480, 4660], 4: [1150, 1770, 2310, 4350], 5: [1300, 2400, 3090, 4970],
    6: [960, 1530, 2840, 4230], 8: [890, 1570, 2580, 4050], 9: [1310, 1940, 2980, 4650], 10: [1110, 1800, 2820, 4100],
  } as Partial<Record<number, [number, number, number, number]>>, // 📜 요청 #49 찍기 막기 뒤 5분으로 되돌림(기본 피해 · 배율 · 체력 다시) · 요청 #46 황금 밸런스 2차 (차시 기본 피해 + 인원 배율 1 ~ 2 · 한 방 상한 60% · 봇 응급 힐 35% · 일반 3 · 4인 승률 70% / 1 · 2인 65% · 판 1인 3 · 2인 3.5 · 3인 4.5 · 4인 5분)
  /** 👹 보스 기본 피해 차시별 (📜 요청 #46 선생님 고름 2026-11-21 ②) = 피해 있는 공격 모두에 곱함 · 피해 0 공격(수면 · 물결 · 어둠 · 거울빛)이 많은 차시는 크게 → 아래 인원 배율은 1 ~ 2배 안 */
  bossAtkByNo: { 2: 1.38, 3: 1.32, 4: 3.17, 5: 4.6, 6: 1.75, 8: 2.9, 9: 6.9, 10: 3.1 } as Partial<Record<number, number>>,
  /** 🛡 보스 한 번 공격 피해 상한 = 그 용사 최대 체력의 60% (요청 #46 ① · 광역 · 분노 포함 · 반응 막기 · 결계 · 엄호 계산 뒤) = 한 방 쓰러짐 없음 */
  oneHitCap: 0.6,
  /** 👹 보스 공격 배율 차시별 (인원 1 · 2 · 3 · 4 · 📜 요청 #5 ③ 「HP 만으로 안 맞으면 그 보스 공격 숫자」 · 없으면 1) */
  bossHitByNo: {
    2: [1, 1, 1.85, 1.99], 3: [1.06, 1, 2, 1.93], 4: [1, 1.03, 1.96, 2], 5: [1.35, 1, 1.46, 1.33],
    6: [1.03, 1, 1.77, 1.91], 8: [1.07, 1, 1.86, 1.93], 9: [1.34, 1, 1.31, 1.34], 10: [1, 1.02, 1.81, 1.84],
  } as Partial<Record<number, [number, number, number, number]>>,
  downedAtbGift: 0.5, // 쓰러진 학생이 문제를 맞힘 = 고른 친구 ATB +50%
  role: {
    dealer: { hp: 1.0, def: 0, spd: 1.0, smash: 1.5 },
    tank: { hp: 1.3, def: 0.2, spd: 0.9, cover: 0.5 },
    healer: { hp: 0.9, def: 0, spd: 0.95, big: 0.9, atkHeal: 0.05, skillCost: 2, skillMul: 1.6, rescueAt: 0.3 }, // 📜 요청 #46 (선생님 2026-11-21) 💚 큰 힐 = 한 명 최대 체력 90% · 일반 공격 맞힘 = 팀 모두 5% · 공격 스킬 ⚡2 ×1.6 · 30% 아래 친구 살림 = 구조 (옛 +12 · 보스 공격 사이 1번 없앰)
    support: { hp: 0.95, def: 0, spd: 1.1 },
  },
  atbSec: 8, defCap: 0.4, crit: 1.5,
  awk: { dealerWeak: 3, tankCut: 0.3, healerBig: 0.15, supportAtb: 0.3, enhBonus: 0.03 }, // healerBig = 각성 힐러 큰 힐 +15%p (요청 #46 · 옛 팀 +15 옮김)
  /** 🩹 응급 힐 (요청 #46) = 힐러 아닌 용사 · ⚡1 · ATB · 고른 한 명(나 포함) 최대 체력 1/3 · 쓰러진 친구 안 됨 */
  firstAid: 1 / 3,
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
export const ROLE_SKILL: Record<Role, string> = { dealer: '강타', tank: '엄호', healer: '힐', support: '격려' }; // 📜 요청 #17 힐러 = 레이드와 같은 「💚 힐」
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
export type AtkKind = 'basic' | 'smash' | 'poison' | 'sleep' | 'fire' | 'fire13' | 'fog' | 'tongue' | 'ice' | 'confuse' | 'frost' | 'tail' | 'dark' | 'darkHit' | 'mirror' | 'bind' | 'scale' | 'aoe';
export type Sig = 'footTarget' | 'gaze' | 'iceArmor' | 'fireBreath' | 'breath' | 'mirror' | 'lock' | 'scale' | 'ripple';
export type MonPoseK = 'idle' | 'attack' | 'hit' | 'down';
export interface BossCfg { no: number; name: string; sprite: string; /** 🔄 그림이 오른쪽을 보는 자세 = 좌우 반전 (몬스터는 늘 왼쪽 · 용사 쪽을 봄 · 📜 11/20 선생님 「2차시 흑표범 방향 반대」) */ flip?: Partial<Record<MonPoseK, boolean>>;
  weak: [Fam, Fam]; type: string; cycle: AtkKind[]; tele: 'foot' | 'gaze' | 'scale'; sig: Sig; signature: string; shieldDmg?: number; draft?: boolean }
export const BOSSES: Record<number, BossCfg> = {
  2: { no: 2, name: '숲의 수호자 흑표범', sprite: 'new6:0', flip: { idle: true, hit: true, down: true }, weak: ['arms', 'flame'], type: '공격형', cycle: ['smash', 'smash', 'poison'], tele: 'foot', sig: 'footTarget', signature: '강타 표적' },
  3: { no: 3, name: '포함의 성주 보라 드래곤', sprite: 'base2:0', flip: { attack: true }, weak: ['nature', 'mystic'], type: '공격형', cycle: ['smash', 'smash', 'fire13'], tele: 'gaze', sig: 'gaze', signature: '고개 돌리기' },
  4: { no: 4, name: '서리 늑대', sprite: 'crown7:0', flip: { down: true }, weak: ['flame', 'wisdom'], type: '방어형', cycle: ['ice', 'confuse', 'aoe'], tele: 'foot', sig: 'iceArmor', signature: '얼음 갑옷', shieldDmg: 0.2 },
  5: { no: 5, name: '흑요석 미노타우로스', sprite: 'extra9:0', flip: { attack: true, down: true }, weak: ['nature', 'arms'], type: '공격형(광역)', cycle: ['sleep', 'sleep', 'fire'], tele: 'foot', sig: 'fireBreath', signature: '화염 숨 모으기' },
  6: { no: 6, name: '청록 드래곤', sprite: 'crown9:0', weak: ['arms', 'flame'], type: '회복형', cycle: ['tail', 'tail', 'frost'], tele: 'foot', sig: 'breath', signature: '숨 고르기' },
  7: { no: 7, name: '청록 드래곤', sprite: 'crown9:0', weak: ['arms', 'flame'], type: '회복형', cycle: ['tail', 'tail', 'frost'], tele: 'foot', sig: 'breath', signature: '숨 고르기 (6차시 이어하기)' },
  8: { no: 8, name: '부정의 수정 여왕', sprite: 'mirrorboss80:0', weak: ['arms', 'mystic'], type: '교란형', cycle: ['ice', 'darkHit', 'mirror'] /* 📜 요청 #46 선생님 2026-11-21 어둠 = 광역 피해 + 느려짐 (전 dark) */, tele: 'foot', sig: 'mirror', signature: '거울빛' },
  9: { no: 9, name: '열쇠 금고 문지기', sprite: 'keyvaultboss0:0', weak: ['wisdom', 'flame'], type: '방어형(속박)', cycle: ['bind', 'bind', 'darkHit'], tele: 'foot', sig: 'lock', signature: '자물쇠' },
  10: { no: 10, name: '필요충분의 천칭 수호자', sprite: 'gardenboss0:0', weak: ['flame', 'arms'], type: '교란형', cycle: ['scale', 'bind', 'scale'], tele: 'scale', sig: 'scale', signature: '기우는 저울' },
  11: { no: 11, name: '거울 웅덩이 두꺼비', sprite: 'garden4:0', weak: ['flame', 'nature'], type: '방어형', cycle: ['tongue', 'tongue', 'fog'], tele: 'foot', sig: 'ripple', signature: '물결', shieldDmg: 0.2 },
};
/** 공격 종류 → 효과 (배율 = 그 판 기본 단일 · 광역 값에 곱 · 0 = HP 피해 없음) · 설계안 5절 묶음: HP · HP+감속 · 감속 · 행동 불능 */
export const ATK: Record<AtkKind, { name: string; mul: number; aoe?: boolean; status?: 'slow' | 'stun'; wake?: boolean; split?: number; warn?: number; special?: 'mirror' | 'scale' }> = {
  basic: { name: '공격', mul: 1 },
  aoe: { name: '광역', mul: 1, aoe: true },
  smash: { name: '강타', mul: 1.5 },
  poison: { name: '독', mul: 1, aoe: true, split: 3 },
  sleep: { name: '수면', mul: 0, status: 'stun', wake: true }, // 맞으면 깸
  fire: { name: '화염 숨', mul: 1.5, aoe: true, warn: 4 }, // 5차시 · 예고 중 실드를 다 깨면 취소
  fire13: { name: '화염', mul: 1.3, aoe: true },
  fog: { name: '물결', mul: 0, aoe: true, status: 'slow' },
  tongue: { name: '혀 치기', mul: 1 },
  ice: { name: '얼음', mul: 1, status: 'slow' },
  confuse: { name: '혼란', mul: 0, status: 'slow' },
  frost: { name: '냉기', mul: 1, aoe: true, status: 'slow' },
  tail: { name: '꼬리치기', mul: 1 },
  dark: { name: '어둠', mul: 0, aoe: true, status: 'slow' },
  darkHit: { name: '어둠', mul: 1, aoe: true, status: 'slow' }, // 📜 11/20 요청 #6 ① 9차시 = 광역 피해 + 느려짐(T.slow) · 8차시 어둠은 그대로(피해 0)
  mirror: { name: '거울빛', mul: 0, aoe: true, warn: 4, special: 'mirror' },
  bind: { name: '속박', mul: 0, status: 'stun' },
  scale: { name: '저울', mul: 1, status: 'slow', special: 'scale' }, // 기울면 단일(그 쪽 용사) · 수평이면 광역
};
/** 😵 용사 상태 그림 자리 (📜 요청 #40 ②) = 공격 종류 → 상태 6가지 · 풀릴 때까지 머리 위에서 돎 · 그림(atb-status-hero 6줄 = 이 순서)이 오기 전엔 이모지 */
export type StatusLook = 'sleep' | 'bind' | 'confuse' | 'fog' | 'dark' | 'frost';
export const STATUS_ROWS: StatusLook[] = ['sleep', 'bind', 'confuse', 'fog', 'dark', 'frost'];
export const STATUS_LOOK: Record<StatusLook, { ic: string; txt: string }> = { sleep: { ic: '💤', txt: '수면' }, bind: { ic: '⛓', txt: '속박' }, confuse: { ic: '🌀', txt: '혼란' }, fog: { ic: '🌊', txt: '느려짐' }, dark: { ic: '🌑', txt: '느려짐' }, frost: { ic: '❄️', txt: '느려짐' } };
export const ATK_STATUS: Partial<Record<AtkKind, StatusLook>> = { sleep: 'sleep', bind: 'bind', confuse: 'confuse', fog: 'fog', dark: 'dark', darkHit: 'dark', frost: 'frost', ice: 'frost' };
/** 👹 보스 공격 3종 (📜 요청 #35 선생님 확정 2026-11-21) = 🎯 단일 → 🛡 탱커 엄호 · 💥 광역 → 🎵 서포터 격려(+ 💚 힐러 뒤 힐) · 🌀 특수(모으기) → ⚔ 딜러 강타로 끊음
 *  저울 = 기울면 단일 · 수평이면 광역 · 숨 고르기(SIG.breath) = 특수 */
export type AtkClass = 'single' | 'aoe' | 'special';
export const ATK_SPECIAL: ReadonlySet<AtkKind> = new Set<AtkKind>(['fire', 'sleep', 'bind', 'mirror', 'confuse']);
export const atkClass = (k: AtkKind, aoe: boolean): AtkClass => (ATK_SPECIAL.has(k) ? 'special' : aoe ? 'aoe' : 'single');
/** 반응 막기 = 예고 중 그 역할 스킬을 ATB 없이 ⚡1 로 · 단일 = 탱커 대신 맞음(cover) · 광역 = 서포터 결계(피해 ×0.7 · 느려짐 없음) · 특수 = 딜러 강타로 끊음 */
export const REACT: Record<AtkClass, Role> = { single: 'tank', aoe: 'support', special: 'dealer' };
export const REACT_CFG = { barrier: 0.3, botChance: 0.7 };
/** 👹 보스 분노 (📜 요청 #37 선생님 「몬스터도 분노 상태 · 긴장감」) = HP 30% 아래에서 한 번 들어감 · 공격 간격 · 피해 배율(난이도별) · 들어갈 때 특수 한 번 바로 · 그 뒤 차례마다 특수 하나 더
 *  진정 = 분노 중 팀 퍼펙트 2번 → 8초 공격 안 함 → 다시 분노 */
export const rage = { at: 0.3, every: { easy: 10, normal: 9, hard: 8 } as Record<Diff, number>, mul: { easy: 1.1, normal: 1.2, hard: 1.3 } as Record<Diff, number>, calmPerfect: 2, calmSec: 8 };
/** 🌈 속성 덧효과 (📜 요청 #36′ 선생님 「속성별 8가지로」 · 2026-11-21) = 장착 · 각성 스킬이 보스에 맞을 때만 · 일반 공격 · 역할 스킬 없음 · 숫자 = 이 한 곳
 *  관통 = 실드가 있을 때 피해 줄임을 1.5배 덜 받음 · 화상 = 3초 동안 피해 30% 나눠 · 감전 +1초 · 얼림 +2초 = 보스 다음 공격 늦춤(둘 합쳐 최대 4초)
 *  순풍 = 내 ATB +30% · 약점 노출 = 약점 시간 +3초(없으면 다음) · 축복 = 체력 비율 가장 낮은 친구 +5 · 저주 = 3초 동안 보스가 받는 피해 +15%
 *  (보스 실드 약점 칸 = 계열 5 그대로 · #28) */
export type AttrFx = 'pierce' | 'burn' | 'shock' | 'freeze' | 'gust' | 'expose' | 'bless' | 'curse';
export const attrFx = { pierce: 1.5, burn: { pct: 0.3, sec: 3 }, shock: 1, freeze: 2, delayMax: 4, gust: 0.3, expose: 3, bless: 5, curse: { pct: 0.15, sec: 3 } };
export const ATTR_FX: Record<string, AttrFx> = { cut: 'pierce', sweep: 'pierce', smash: 'pierce', fire: 'burn', spark: 'shock', frost: 'freeze', water: 'freeze', wind: 'gust', magic: 'expose', math: 'expose', gear: 'expose', sun: 'bless', star: 'bless', dark: 'curse' };
export const fxOfAttr = (attr: string): AttrFx => ATTR_FX[attr] ?? 'pierce';
export const ATTR_FX_TXT: Record<AttrFx, { emo: string; name: string; desc: string }> = {
  pierce: { emo: '🗡', name: '관통', desc: '실드가 있어도 피해 덜 줄어듦 (×1.5)' },
  burn: { emo: '🔥', name: '화상', desc: '3초 동안 피해 30% 더' },
  shock: { emo: '⚡', name: '감전', desc: '보스 다음 공격 1초 늦춤 (얼림과 합쳐 최대 4초)' },
  freeze: { emo: '🧊', name: '얼림', desc: '보스 다음 공격 2초 늦춤 (최대 4초)' },
  gust: { emo: '🌪', name: '순풍', desc: '내 ATB +30% 바로' },
  expose: { emo: '📖', name: '약점 노출', desc: '약점 시간 +3초 (없으면 다음 약점 시간)' },
  bless: { emo: '✨', name: '축복', desc: '가장 다친 친구 HP +5' },
  curse: { emo: '🌑', name: '저주', desc: '3초 동안 보스가 받는 피해 +15%' },
};
/** 대표 행동 숫자 (어림값 · 📜 설정표 v3 「⚠ ×0.2 · 8% · 30% · 30초 = 모의실험에 안 넣은 값」) */
export const SIG = {
  breath: { every: 30, warn: 4, heal: 0.08 }, // 6 · 7 숨 고르기: 실드가 뜬 뒤 30초마다 3초 예고 → HP 8% 회복 · 예고 중 실드 칸을 깨면 끊김
  mirror: { sec: 10, back: 0.3 }, // 8 거울빛: 다음 10초 일반 공격 피해 30% 가 공격한 용사에게 (스킬은 안 돌아옴)
  scaleTilt: 0.5, // 10 기우는 저울: 기울(단일) 확률
};

/** 🎚 균형 표 한 곳 (📜 11/20 「보스 HP · 공격 · 역할 수치를 코드 한 곳(표 하나)에 · 나중에 균형 도구가 그 표만 바꿈」)
 *  엔진은 쓰는 순간 이 표의 값을 읽음 → 도구가 칸 값을 바꾸면 다음 판부터 그대로 (읽기 전용 표시는 타입만) */
export const TUNE = { BOSS_HP_BASE, DIFF_MUL, BOSS_HIT, T, BOSSES, ATK, SIG } as const;
/** 👹 설정표(보스 · 대표 행동)가 없는 차시 = 기본 보스 표 (📜 2026-11-20 선생님 「서버 팩 = 11 · 12 · 13 ~ 17차시가 앱 고침 없이 게시판 던전에」) · 약점 = 차시 번호로 돌림 · 초안 표시 */
const FAM_RING: Fam[] = ['arms', 'flame', 'nature', 'mystic', 'wisdom'];
export const bossOf = (no: number): BossCfg => BOSSES[no] ?? { no, name: `${no}차시 던전 수호자`, sprite: 'new6:0', weak: [FAM_RING[no % 5]!, FAM_RING[(no + 2) % 5]!], type: '공격형', cycle: ['smash', 'smash', 'aoe'], tele: 'foot', sig: 'footTarget', signature: '강타 표적 (기본 보스 표)', draft: true };
