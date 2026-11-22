# 2026-11-22 · 📚 차시팩 #1 · 소문항 「혼자 풀리게」 전수 조사 고침 (선생님 베타 게시판 캡처 · 메인 🔨)
# 원칙: 문항 글(question / q)만 고침 · 정답 · 보기 · 숫자 · 풀이(say · sol)는 손대지 않음
# 쓰는 법: python3 fix.py <원본 폴더> <출력 폴더>
#   원본 폴더 = castle1.json(성채 1층 v2) · ex11.json(11차시 v4) · ex12.json(12차시 v4) · (선택) castle-1.json · ex-12.json(베타 체험판)
import json,re,sys,os,copy
SRC,OUT=sys.argv[1],sys.argv[2]; os.makedirs(OUT,exist_ok=True)
log=[]
def L(src,where,old,new): log.append(dict(src=src,where=where,old=old,new=new))
MARK=['①','②','③','④','⑤']
def mark(i,n): return '👑' if i==n-1 else MARK[i]

# ── 성채 1층: q08 · q09 · q10 · q12 = 단계마다 문제 글 앞에 붙임 (q07 · q11 과 같은 꼴 「번호 문제 ⏎ ① 단계」)
def castle(name):
    d=json.load(open(f'{SRC}/{name}')); before=copy.deepcopy(d)
    for r in d['rooms']:
        rid=r['id']
        if rid not in ('q08','q09','q10','q12'): continue
        for vi,v in enumerate(r['vers']):
            n=len(v); qs=[x['q'] for x in v]
            if rid=='q08':
                m=re.match(r'(A = \{.*?\}), (B = \{.*?\}) 에서 A ∩ B = B 이면',qs[0]); A,B=m.group(1),m.group(2)
                stem=f'08 {A}, {B} 에 대하여 A ∩ B = B 를 만족시키는 정수 x 를 모두 구하시오.'
                body=['A ∩ B = B 이면 두 집합 A, B 사이의 관계는?']+qs[1:]
            elif rid=='q09':
                m=re.match(r'(A\S+) ∩ \((A\S+) ∪ (A\S+)\) 을 분배법칙',qs[0]); a,b,c=m.groups()
                stem=f'09 100 이하의 자연수 중 k 의 배수의 집합을 Aₖ 라 할 때, n({a} ∩ ({b} ∪ {c})) 의 값은?'
                body=qs
            elif rid=='q10':
                m=re.match(r'(U = .*?) 일 때 n\(A\), n\(B\) 는\?',qs[1]); cond=m.group(1)
                stem=f'10 {cond} 일 때 n(Aᶜ ∩ Bᶜ) 의 값은?'
                body=[qs[0],'n(A), n(B) 는?']+qs[2:]
            elif rid=='q12':
                N=re.match(r'(\d+) 미만의 자연수는',qs[0]).group(1)
                ph=re.search(r'「(.*?)인? 수」의 집합은',qs[1]).group(1)
                stem=f'12 {N} 미만의 자연수 중에서 {ph} 자연수의 개수는?'  # ph 끝 = 「… 아닌」
                body=qs
            for i,x in enumerate(v):
                new=f'{stem}\n{mark(i,n)} {body[i]}'
                if vi==0: L(name,f'{rid} 판{vi} 단계{i+1}',x['q'],new)
                x['q']=new
    # 정답 · 보기 · 풀이 그대로인지
    for r0,r1 in zip(before['rooms'],d['rooms']):
        for v0,v1 in zip(r0['vers'],r1['vers']):
            for a,b in zip(v0,v1):
                assert {k:a[k] for k in a if k!='q'}=={k:b[k] for k in b if k!='q'}
    return d

# ── 11차시 m3 (문제 1 · 3의 배수 증명): 2~5 단계 앞에 그 판의 명제를 붙임
def ex11(name):
    d=json.load(open(f'{SRC}/{name}')); m=d['monsters']['m3']
    sets=[('first',m['first'])]+[(f'retry{i}',s) for i,s in enumerate(m['retry']['pool'])]+[(f'chain{i}',s) for i,s in enumerate(m['chain']['pool'])]
    for nm,s in sets:
        P=re.search(r'명제 「(.*?)」의 대우는',s[0]['question']).group(1)
        for i in range(1,len(s)):
            old=s[i]['question']; new=f'명제 「{P}」를 대우로 증명 ⏎\n{old}'.replace(' ⏎\n','\n')
            if i==len(s)-1: new=new.replace('그러므로 어느 경우든','n 이 3의 배수가 아닌 어느 경우든').replace(' 결론은?',' 그러므로 결론은?')
            if nm in ('first','retry0'): L(name,f'm3 {nm} 단계{i+1}',old,new)
            s[i]['question']=new
    return d

# ── 12차시 m2 (4) · m3 (2~5 단계)
def ex12(name):
    d=json.load(open(f'{SRC}/{name}')); m=d['monsters']['m2']
    for nm,s in [('first',m['first'])]+[(f'retry{i}',s) for i,s in enumerate(m['retry']['pool'])]:
        g=re.search(r'√2 = (\w)/(\w) \((\w), (\w)은 서로소인 자연수\)',s[1]['question']); top,bot=g.group(1),g.group(2)
        old=s[3]['question']; new=old.replace('(4) ',f'(4) √2 = {top}/{bot} ({g.group(3)}, {g.group(4)}은 서로소인 자연수)로 놓았더니 ',1)
        if nm in ('first','retry0'): L(name,f'm2 {nm} (4)',old,new)
        s[3]['question']=new
    m=d['monsters']['m3']
    for nm,s in [('first',m['first'])]+[(f'retry{i}',s) for i,s in enumerate(m['retry']['pool'])]+[(f'chain{i}',s) for i,s in enumerate(m['chain']['pool'])]:
        P=re.search(r'「(.*?)」를 귀류법으로',s[0]['question']).group(1)
        for i in range(1,len(s)):
            old=s[i]['question']; new=f'「{P}」를 귀류법으로 증명\n{old}'
            if nm in ('first','retry0'): L(name,f'm3 {nm} 단계{i+1}',old,new)
            s[i]['question']=new
    return d

def save(d,name): json.dump(d,open(f'{OUT}/{name}','w'),ensure_ascii=False,indent=1)
for nm,fn in [('castle1.json',castle),('castle-1.json',castle),('ex11.json',ex11),('ex12.json',ex12),('ex-12.json',ex12)]:
    if os.path.exists(f'{SRC}/{nm}'): save(fn(nm),nm)
json.dump(log,open(f'{OUT}/log.json','w'),ensure_ascii=False,indent=1)
print(len(log),'줄 (판0 · 대표만)')
