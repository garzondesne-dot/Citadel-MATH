// 📅 시간표 계산 검산 (v0.9.7.0): 한국 시각 · 교시 시각 · 끝 + 10분 · 월 5교시 · 목 7교시 제외 · 출석 판정 — node tests/sched.test.js
global.window = global; global.DS = { UI: { esc: (s) => s } };
require('../js/raid/sched.js');
const S = DS.Sched; let ok = 0, bad = 0;
const t = (name, got, want) => { if (JSON.stringify(got) === JSON.stringify(want)) ok++; else { bad++; console.log('❌', name, '\n  got ', JSON.stringify(got), '\n  want', JSON.stringify(want)); } };
const K = (s) => Date.parse(s + '+09:00');
// 2026-11-09 = 월요일
t('요일', S.kst(K('2026-11-09T08:00:00')).dow, 1);
t('날짜(자정 직후 한국 날짜)', S.kst(K('2026-11-10T00:30:00')).date, '2026-11-10');
t('3교시 시각', S.times('2026-11-09', 3), [K('2026-11-09T11:00:00'), K('2026-11-09T12:00:00')]);
t('7교시 = 16:10 ~ 17:10', S.times('2026-11-09', 7), [K('2026-11-09T16:10:00'), K('2026-11-09T17:10:00')]);
t('월 5교시 제외', S.usable(1, 5), false);
t('목 7교시 제외', S.usable(4, 7), false);
t('화 5교시 됨', S.usable(2, 5), true);
t('수 7교시 없음(특기적성)', S.usable(3, 7), false);
t('금 6교시 없음', S.usable(5, 6), false);
const week = { '1-3': '1-3', '1-5': '1-3', '2-1': '1-5', '4-7': '1-1', '5-5': '1-2' };
const up = S.upcoming(week, { '2026-11-10_1': true }, K('2026-11-09T11:30:00'));
t('7일 예약 칸', up.map((s) => `${s.key} ${s.cls}`), ['2026-11-09_3 1-3', '2026-11-13_5 1-2']); // 월 5 · 목 7 제외 · 화 1교시 「쉼」
// 다음 주 월요일(11-16)은 7일 안(11-09 ~ 11-15)이 아님 → 없음 · 11-10 1교시는 「이번엔 쉼」 · 지금 11:30 이면 월 3교시(11:00~12:00)는 아직 열림
t('지난 칸 안 넣음', S.upcoming(week, {}, K('2026-11-09T12:00:01')).some((s) => s.key === '2026-11-09_3'), false);
// 학생 캠프: 시각 안의 예약 수업
const slots = { 111111: { from: K('2026-11-09T11:00:00'), to: K('2026-11-09T12:00:00'), lesson: 'set-05', no: 5, theme: 'x' } };
t('열림 (11:59)', !!S.active(slots, K('2026-11-09T11:59:00')), true);
t('닫힘 (12:00)', !!S.active(slots, K('2026-11-09T12:00:00')), false);
t('닫힘 (10:59)', !!S.active(slots, K('2026-11-09T10:59:00')), false);
// 출석 판정: 시작 + 5분 안 = 출석 · 뒤 = 지각 · 없음 = 미입장 · 선생님이 고친 것 우선
const g = { from: K('2026-11-09T11:00:00'), sum: { players: { 1: K('2026-11-09T11:04:59'), 2: K('2026-11-09T11:05:01') } } };
t('출석', S.judge(g, 1), 'o'); t('지각', S.judge(g, 2), 'l'); t('미입장', S.judge(g, 3), 'x'); t('고친 것 우선', S.judge(g, 3, { s: 'e' }), 'e');
console.log(bad ? `❌ ${bad}개 틀림 · ${ok}개 맞음` : `✅ 시간표 계산 ${ok}개 모두 맞음`); process.exit(bad ? 1 : 0);
