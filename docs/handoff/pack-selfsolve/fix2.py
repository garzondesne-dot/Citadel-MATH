# 2026-11-22 · 📚 차시팩 #1 · 서버 팩 독립 검산(🌊 설계 방 pack-check-11-13-castle.md) 「답이 갈리는 곳」 5곳 + 문구 · 조사
# 쓰는 법: python3 fix2.py <입력 폴더> <출력 폴더>
#   입력 = fix.py 출력의 castle1.json · ex11.json · ex12.json(혼자 풀리게 고친 판) + 원본 castle2.json · castle3.json
# 원칙: 정답 번호 · 숫자 그대로 · 바꾸는 보기는 오답 보기만(정답과 겹치지 않게) · 문항 글 · 풀이 글 · 조사
import json,re,sys,os
SRC,OUT=sys.argv[1],sys.argv[2]; os.makedirs(OUT,exist_ok=True)
log=[]
def L(f,where,old,new):
    if old!=new: log.append(dict(src=f,where=where,old=old,new=new))
def load(n): return json.load(open(f'{SRC}/{n}'))
def save(d,n): json.dump(d,open(f'{OUT}/{n}','w'),ensure_ascii=False,indent=1)
def room(d,rid): return next(r for r in d['rooms'] if r['id']==rid)
def walk(o,f,p=''):
    """모든 글자 칸에 f(경로, 글) → 새 글"""
    if isinstance(o,dict):
        for k in list(o):
            v=o[k]
            if isinstance(v,str): o[k]=f(f'{p}.{k}',v)
            else: walk(v,f,f'{p}.{k}')
    elif isinstance(o,list):
        for i,v in enumerate(o):
            if isinstance(v,str): o[i]=f(f'{p}[{i}]',v)
            else: walk(v,f,f'{p}[{i}]')

# ── 조사: 앞말 끝소리(받침) 로 은/는 · 이/가 맞추기
HAS={**{c:True for c in 'lmnr'},**{c:False for c in 'abcdefghijkopqstuvwxyz'}}
DIG={'0':True,'1':True,'2':False,'3':True,'4':False,'5':False,'6':True,'7':True,'8':True,'9':False}
def batchim(tok):
    t=tok.lstrip('√~')
    if re.fullmatch(r'[a-z]',t): return HAS[t]
    if re.fullmatch(r'\d+',t):
        if len(t)>1 and t[-1]=='0': return True   # 십 · 백 …
        return DIG[t[-1]]
    return None
JOSA=re.compile(r'(?<![\w가-힣])(√?\d+|~?[a-z])(\s?)(은\(는\)|이\(가\)|은|는|이|가)(?=[\s?.,」)]|$)')
def josa(s):
    def rep(m):
        b=batchim(m.group(1))
        if b is None: return m.group(0)
        j=m.group(3); kind='topic' if j in ('은','는','은(는)') else 'subj'
        want=('은' if b else '는') if kind=='topic' else ('이' if b else '가')
        return f'{m.group(1)}{m.group(2)}{want}'
    return JOSA.sub(rep,s)

# ── 성채 1층 (eval-1): ② q08 [3] 보기의 「B 의 자리 수」 바꿈 · [1] 오답 「x = 2x」(= 해 x = 0) 바꿈 · ③ q09 = fix.py 로 이미 고침
d=load('castle1.json')
for vi,v in enumerate(room(d,'q08')['vers']):
    stem=v[0]['q'].split('\n')[0]
    c,b,dd=[int(t.replace('−','-')) for t in re.search(r'A = \{x² \+ (\d+)x, (−?\d+), (−?\d+)\}',stem).groups()]
    sols={x for x in range(-20,21) if x!=dd and (x==x*x+c*x or x==b)}
    q=v[3]; ans={int(i) for i in str(q['a']).split(',')}
    k=q['ch'].index(str(dd)); assert k not in ans
    have={int(t.replace('−','-')) for t in q['ch']}
    nums=[int(t.replace('−','-')) for t in q['ch']]; lo=nums[k-1] if k>0 else -99; hi=nums[k+1] if k+1<len(nums) else 99
    # 크기 순서 그대로 · 해 · 있는 보기 · B 의 자리 수가 아닌 수
    ok=lambda n: n not in have and n not in sols and n!=dd
    cand=[n for n in sorted(range(lo+1,hi),key=lambda n:abs(n-dd)) if ok(n)]
    old=q['ch'][k]
    if cand: q['ch'][k]=str(cand[0]).replace('-','−')
    else:   # 사이에 넣을 수가 없으면 가까운 수로 바꾸고 크기 순서로 다시 줄 세움(정답 번호도 같이 옮김)
        n=next(n for n in sorted(range(-9,13),key=lambda n:abs(n-dd)) if ok(n)); vals=list(nums); vals[k]=n
        order=sorted(range(len(vals)),key=lambda i:vals[i]); q['ch']=[str(vals[i]).replace('-','−') for i in order]
        q['a']=','.join(str(order.index(i)) for i in sorted(ans,key=lambda i:order.index(i)))
    L('castle1',f'q08 판{vi} [3] 보기',old+' (정답 '+','.join(map(str,sorted(ans)))+')',' · '.join(q['ch'])+' (정답 '+str(q['a'])+')')
    q=v[1]; k=q['ch'].index('x = 2x'); assert str(k) not in str(q['a']).split(',')
    q['ch'][k]=f'x + {dd} = 0'; L('castle1',f'q08 판{vi} [1] 보기','x = 2x',q['ch'][k])
save(d,'castle1.json')

# ── 성채 2층 (eval-2): ① 👑 q11 분수 묶기 · 「1a」 · 풀이 「y² = 3 로 가능」 · q04 판0 풀이 P 표기
d=load('castle2.json')
for vi,v in enumerate(room(d,'q11')['vers']):
    q=v[0]; old=q['q']; q['q']=re.sub(r'\+ (\d+) / \(x² \+ y² \+ 1\)',r'+ [\1 / (x² + y² + 1)]',old); assert q['q']!=old
    L('castle2',f'q11 판{vi}',old,q['q'])
    old=q.get('sol','')
    if old:
        q['sol']=re.sub(r'x = (\d+) 일 때 y² = (\d+) 로 가능',r'x = \1, y² = \2 일 때 가능',old); L('castle2',f'q11 판{vi} 풀이',old,q['sol'])
def f2(p,s):
    n=re.sub(r'([+−] )1a\b',r'\1a',s)
    if n!=s: L('castle2',p,s,n)
    return n
walk(d,f2)
q=room(d,'q04')['vers'][0][0]; old=q['sol']; q['sol']=old.replace('P = (x ≤ 2)','P = {x | x ≤ 2}'); L('castle2','q04 판0 [0] 풀이',old,q['sol'])
save(d,'castle2.json')

# ── 성채 3층 (eval-3): ④ 👑 q17 [0] 오답 「÷ ≥ 1」 · [2] 같은 식 보기 · q14 [2] 「≥ ?」 · q03 풀이 「1b」 · 조사(q08 · q12 · q16)
d=load('castle3.json')
for vi,v in enumerate(room(d,'q17')['vers']):
    q=v[0]; k=q['ch'].index('(좌변) ÷ (우변) ≥ 1 을 보인다'); assert str(k)!=str(q['a'])
    q['ch'][k]='(좌변) − (우변) ≤ 0 을 보인다'; L('castle3',f'q17 판{vi} [0] 보기','(좌변) ÷ (우변) ≥ 1 을 보인다',q['ch'][k])
    q=v[2]; k=q['ch'].index('(a − b)(a + b)²'); assert str(k)!=str(q['a'])
    q['ch'][k]='(a − b)³'; L('castle3',f'q17 판{vi} [2] 보기','(a − b)(a + b)²','(a − b)³')
for vi,v in enumerate(room(d,'q14')['vers']):
    q=v[2]; old=q['q']; q['q']=old.replace(' ≥ ?',' 의 최솟값은?'); L('castle3',f'q14 판{vi} [2]',old,q['q'])
for vi,v in enumerate(room(d,'q03')['vers']):
    q=v[0]; old=q.get('sol',''); q['sol']=re.sub(r'([+−] )1b\b',r'\1b',old); L('castle3',f'q03 판{vi} 풀이',old,q['sol'])
for rid in ('q08','q12','q16'):
    def f3(p,s,rid=rid):
        n=josa(s)
        if n!=s: L('castle3',f'{rid}{p}',s,n)
        return n
    walk(room(d,rid),f3)
save(d,'castle3.json')

# ── 11차시: 형성평가 5 「세 조건 p, q, r 에 대하여」 통일
d=load('ex11.json'); b=d['boss']
for q in [*b['pool'][4], b['sets'][1][4]] if b.get('sets') else b['pool'][4]:
    old=q['question']
    if '세 조건' not in old: q['question']=old.replace('5. 두 명제','5. 세 조건 p, q, r 에 대하여 두 명제'); L('ex11','boss 5',old,q['question'])
save(d,'ex11.json')

# ── 12차시: ⑤ 형성평가 3 단서 · 조사(m2 · m3 · 열쇠)
d=load('ex12.json'); b=d['boss']
for q in [*b['pool'][2], b['sets'][1][2]]:
    old=q['question']; new=old.replace('(단, a, b 는 자연수 또는 실수)','(단, a, b 는 자연수)' if ('홀수' in old or '짝수' in old) else '(단, a, b 는 실수)')
    q['question']=new; L('ex12','boss 3',old,new)
def f12(p,s):
    n=josa(s)
    if n!=s: L('ex12',p,s,n)
    return n
walk(d,f12)
save(d,'ex12.json')
json.dump(log,open(f'{OUT}/log2.json','w'),ensure_ascii=False,indent=1)
from collections import Counter
print(len(log),'곳', Counter(x['src'] for x in log))
