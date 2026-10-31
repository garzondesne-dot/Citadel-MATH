// 계정 도구 검증: node tests/account.test.js
// 가린 이름 · 반 이름 정리 · 명단 붙여 넣기 · 학생 이메일(초기화마다 새 로그인) · 4자리 비밀번호 → 6자 이상
const DS = require('./load')(['js/raid/account.js']);
const A = DS.Account;
let fail = 0;
const check = (c, m) => { if (!c) { fail++; console.error('FAIL:', m); } };
check(A.mask('김민준') === '김*준' && A.mask('이안') === '이*' && A.mask('남궁민수') === '남**수' && A.mask('윤') === '*', `가린 이름 ${A.mask('김민준')} ${A.mask('이안')} ${A.mask('남궁민수')}`);
check(A.classKey(' 1-3 ') === '1-3' && A.classKey('1 반') === '1반' && A.classKey('1/3') === '1-3', '반 이름 정리');
const r = A.parseRoster('1 김민준\n2\t이서연\n3, 박도윤\n1-4 5 최하은\n이름만\n99 범위밖\n7 아주아주긴이름입니다', '1-3');
check(r.rows.length === 4 && r.rows[0].c === '1-3' && r.rows[1].name === '이서연' && r.rows[2].n === 3 && r.rows[3].c === '1-4' && r.rows[3].n === 5, `명단 읽기 ${JSON.stringify(r.rows)}`);
check(r.bad.length === 3, `읽지 못한 줄 ${JSON.stringify(r.bad)}`);
const e0 = A.email('1-3', 7, 0), e1 = A.email('1-3', 7, 1);
check(e0 !== e1 && /^[a-z0-9_.-]+@citadel\.class$/.test(e0) && /^[a-z0-9_.-]+@citadel\.class$/.test(A.email('1반', 2, 0)), `이메일 ${e0} ${A.email('1반', 2, 0)}`);
check(A.email('1-3', 7, 0) !== A.email('1-3', 17, 0) && A.email('1-3', 7, 0) !== A.email('1-37', 0, 0), '번호가 다르면 다른 계정');
check(A.pw('0427').length >= 6 && A.validPin('0427') && !A.validPin('427') && !A.validPin('04a7') && !A.validPin('12345'), '비밀번호 4자리 → 6자 이상');
check(/^t_[a-z0-9._-]+@citadel\.class$/.test(A.teacherEmail('Kim T')), `교사 이메일 ${A.teacherEmail('Kim T')}`);
if (fail) { console.error(`\n${fail}건 실패`); process.exit(1); }
console.log('OK: 계정 — 가린 이름 · 반 이름 · 명단 붙여 넣기 · 학생/교사 이메일 · 4자리 비밀번호 통과');
