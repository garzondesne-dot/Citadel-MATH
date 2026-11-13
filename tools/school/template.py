# 🏫 학교판 📊 엑셀 양식 (과목 중립 · 2026-11-13): 우리 양식(assets/templates/question-bank-v1.xlsx · 집합 예시)을 그대로 복사하고
#   예시 글자만 과목과 상관없는 일반 예로 바꿈 (형식 · 칸 · 탭 이름 · 꾸밈은 같음 → sheet-lesson.js 가 똑같이 읽음)
#   python3 tools/school/template.py  →  assets/templates/question-bank-school-v1.xlsx
import openpyxl, os
ROOT = os.path.join(os.path.dirname(__file__), '..', '..')
SRC = os.path.join(ROOT, 'assets/templates/question-bank-v1.xlsx')
OUT = os.path.join(ROOT, 'assets/templates/question-bank-school-v1.xlsx')
wb = openpyxl.load_workbook(SRC)

def put(ws, r, vals):
    for c, v in enumerate(vals, start=1):
        ws.cell(row=r, column=c).value = v

# 설명: 기호 · 단답 예시만 (집합 기호 없이)
ws = wb['설명']
for r in range(1, ws.max_row + 1):
    k = ws.cell(row=r, column=1).value
    if k == '기호':
        ws.cell(row=r, column=2).value = '보기에 기호들(예: > <). 문제 칸에 "조건 || 식" 처럼 쓰고 식에 □'
        ws.cell(row=r, column=3).value = '>  /  문제: 두 수의 크기 || 7 □ 5'
    if k == '단답':
        ws.cell(row=r, column=3).value = '정사각형, 정 사각형'
    if k == '숫자':
        ws.cell(row=r, column=2).value = '정수 (룬 키패드 입력)'

# 표 · 그림 문제 (2026-11-13 선생님 「표 고정, 묻는 것만 바꾸기」): 설명 탭 맨 아래 한 줄
last = ws.max_row + 1
ws.cell(row=last, column=1).value = '표 · 그림'
ws.cell(row=last, column=2).value = '문제 칸에는 글만 들어가요. 도수분포표처럼 표가 필요하면 표는 수업 준비 → 그 문제 칸 「🖼 고르기」로 그림을 올려 고정하고, 버전 0 · 1 · 2… 에서는 같은 표에서 묻는 곳만 바꿔 쓰세요'
ws.cell(row=last, column=3).value = '버전 0: 도수가 가장 큰 계급은? / 버전 1: 20 이상 30 미만의 도수는?'

# 차시: 과목 · 단원 · 예시 차시
ws = wb['차시']
put(ws, 3, ['수학', '1. 단원 이름', '1', '예시 · 첫 차시', 'ex-1', '02-deep-forest', '90', '5'])

# 순서
ws = wb['순서']
put(ws, 3, ['c1', '개념', '개념 1 · 예시 개념', '이 차시에서 배우는 개념을 한두 줄로 (학생 화면 · 교실 TV 에 그대로)', None])
put(ws, 4, ['m1', '문제', '문제 1 · 예시 문제', None, None])
put(ws, 5, ['s1', '보강', '보강 · 한 걸음 더', None, None])
put(ws, 6, ['boss', '형성평가', '형성평가 · 숲의 수호자', None, None])

# 문항 (14칸: 단계ID 칸 버전 형식 문제 보기1~5 정답 해설 꼬리표 세트)
ws = wb['문항']
rows = [
    ['m1', '1', '0', '기호', '두 수의 크기 || 7 □ 5', '>', '<', None, None, None, '>', '7이 5보다 크다', '문제 1 (1)', None],
    ['m1', '1', '1', '기호', '두 수의 크기 || 3 □ 8', '>', '<', None, None, None, '<', '3이 8보다 작다', None, None],
    ['m1', '1', '2', '기호', '두 수의 크기 || 12 □ 9', '>', '<', None, None, None, '>', '12가 9보다 크다', None, None],
    ['m1', '2', '0', '숫자', '3 × 4 = ?', None, None, None, None, None, '12', '3을 4번 더함', '문제 1 (2)', None],
    ['m1', '2', '1', '숫자', '5 × 3 = ?', None, None, None, None, None, '15', '5를 3번 더함', None, None],
    ['m1', '2', '2', '숫자', '6 × 2 = ?', None, None, None, None, None, '12', '6을 2번 더함', None, None],
    ['m1', '3', '0', '여러개', '다음 중 짝수를 모두 고르시오.', '2', '3', '4', '5', '6', '1,3,5', '2 · 4 · 6 = 2로 나누어떨어짐', '문제 1 (3)', None],
    ['m1', '3', '1', '여러개', '다음 중 3의 배수를 모두 고르시오.', '3', '4', '6', '8', '9', '1,3,5', '3 · 6 · 9', None, None],
    ['m1', '3', '2', '여러개', '다음 중 홀수를 모두 고르시오.', '1', '2', '5', '6', '7', '1,3,5', '1 · 5 · 7', None, None],
    ['s1', '1', '0', '선다', '다음 중 가장 큰 수는?', '0.5', '0.25', '0.7', None, None, '3', '0.7 > 0.5 > 0.25', '보강 (1)', None],
    ['s1', '1', '1', '선다', '다음 중 가장 작은 수는?', '0.3', '0.5', '0.25', None, None, '3', '0.25 < 0.3 < 0.5', None, None],
    ['s1', '2', '0', 'OX', '0은 자연수이다.', None, None, None, None, None, 'X', '자연수는 1부터', '보강 (2)', None],
    ['s1', '2', '1', 'OX', '1은 소수가 아니다.', None, None, None, None, None, 'O', '소수는 약수가 2개인 수', None, None],
    ['s1', '3', '0', '단답', '네 변의 길이가 모두 같고 네 각이 모두 직각인 사각형은?', None, None, None, None, None, '정사각형, 정 사각형', '네 변 · 네 각이 모두 같음', '보강 (3)', None],
    ['boss', '1', None, '선다', '1. 다음 중 12의 약수가 아닌 것은?', '3', '4', '5', None, None, '3', '12 ÷ 5 는 나누어떨어지지 않음', '형성평가 1번', '1'],
    ['boss', '1', None, '선다', '1. 다음 중 18의 약수가 아닌 것은?', '3', '6', '4', None, None, '3', '18 ÷ 4 는 나누어떨어지지 않음', None, '2'],
    ['boss', '2', None, '숫자', '2. 7 + 8 = ?', None, None, None, None, None, '15', '7 + 8 = 15', '형성평가 2번', '1'],
    ['boss', '2', None, '숫자', '2. 9 + 6 = ?', None, None, None, None, None, '15', '9 + 6 = 15', None, '2'],
]
for i, row in enumerate(rows):
    put(ws, 3 + i, row)
for r in range(3 + len(rows), ws.max_row + 1):
    put(ws, r, [None] * 14)
wb.save(OUT)
print('✔', os.path.relpath(OUT, ROOT))
