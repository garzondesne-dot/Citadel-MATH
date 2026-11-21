# 2026-11-21 학습지 없이 풀리게 (선생님 「14차시부터 소문항 하나하나 확인」) — 메인 머리
import json,re
def load(n): return json.load(open(f'out/ex{n}-more.json'))
def save(n,d): json.dump(d,open(f'out/ex{n}-more.json','w'),ensure_ascii=False,indent=1)
log=[]
# 14: 「함수인 (n)」 → 대응을 다시 적음
d=load(14); m=d['monsters']['m1']
for s in [m['first']]+m['retry']['pool']:
    for q in s[3:5]:
        n=re.search(r'함수인 \((\d)\)',q['question']).group(1)
        src=next(x for x in s[:3] if f'\n({n}) ' in x['question'])
        mp=src['question'].split(f'({n}) ')[1].split('\n')[0]
        head=src['question'].split('\n')[0].replace('문제 1) ','').replace('의 대응','의 함수')
        q['question']=q['question'].replace(f'함수인 ({n}) 의', f'{head} {mp} 의'); log.append(q['question'])
save(14,d)
# 15: ① 정답 둘 ② 「두 그림」 ③ 그래프 칸
d=load(15); m=d['monsters']['m1']
q=m['retry']['pool'][3][0]; assert 'y = −x + 3' in q['question']
q['choices'][2]='graph:pts (0,3) (1,4) (2,5) (3,6) @-4,4,-4,7'; log.append('15 pool3 보기3')
def desc(c):
    g=c[6:]
    if g.startswith('circle'): return '원'
    if g.startswith('x=y^2'): return '옆으로 누운 곡선 x = y²'
    if g.startswith('pts'):
        xs=[int(p.split(',')[0]) for p in re.findall(r'\((-?\d+),',g)]
        k=next(x for x in xs if xs.count(x)>1); return f'x = {k} 에 점이 2개인 점 그림'
    return None
for s in [m['first']]+m['retry']['pool']:
    ch=s[2]['choices']; a=s[2]['answerIndex']
    bad=[desc(c) for i,c in enumerate(ch) if i!=a]
    s[3]['question']=f"문제 5) 앞 문제에서 함수의 그래프가 아닌 두 그림({bad[0]} · {bad[1]})의 까닭은?"; log.append(s[3]['question'])
b=d['boss']
def widen(q):
    q['choices']=[re.sub(r'@-4,4,-5,5$','@-6,6,-6,6',c) for c in q['choices']]
for i in (1,5,6): widen(b['pool'][0][i])
if b.get('sets') and b['sets'][1]: widen(b['sets'][1][0])
save(15,d)
# 17: 문구
d=load(17); m=d['monsters']['m1']
for s in [m['first']]+m['retry']['pool']:
    for q in s:
        t=q['question']; g=re.search(r'의 역함수가 존재하도록 그림을 완성하면 \((.*?)\)',t)
        vals=', '.join(f'f({a}) = {b}' for a,b in re.findall(r'(\d+) → (\d+)',g.group(1)))
        t=t.replace(g.group(0), f'는 일대일대응이고 {vals}')
        t=t.replace('역함수가 존재하도록 f 의 화살표를 모두 이으시오. (빈 곳 하나를 채우기)','주어진 3개와 남은 1개, f 의 화살표를 모두 이으시오.')
        q['question']=t
    log.append(s[0]['question']); log.append(s[1]['question'])
save(17,d)
print('\n'.join(log))
