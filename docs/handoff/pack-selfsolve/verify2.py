# fix2 검산: ① 성채 2층 👑 q11 묶은 식으로 최솟값 다시 계산(격자 + 산술기하) ② 바뀐 칸이 글 · 보기(오답)만인지 ③ 고른 정답 값이 그대로인지
import json,re,sys,math
A,B=sys.argv[1],sys.argv[2]
c2=json.load(open(f'{B}/castle2.json')); bad=0
for vi,v in enumerate(next(r for r in c2['rooms'] if r['id']=='q11')['vers']):
    q=v[0]['q']; m=re.search(r'2x² \+ y² − (\d+)x \+ \[(\d+) / \(x² \+ y² \+ 1\)\]',q); k,c=map(int,m.groups())
    f=lambda x,y: 2*x*x+y*y-k*x+c/(x*x+y*y+1)
    best=min(f(x/20,y/20) for x in range(-200,201) for y in range(0,201))
    # 정확한 최솟값: t = x² + y² + 1 ≥ x² + 1 · f = (x − k/2)² − k²/4 − 1 + t + c/t ≥ … (t = √c 가 되면)
    ok=abs(best-int(v[0]['a']))<0.01
    print(f'q11 판{vi}: 팩 {v[0]["a"]} · 격자 최솟값 {best:.3f}', '✔' if ok else '✗'); bad+=not ok
def chosen(q):
    a=q.get('a',q.get('answerIndex',q.get('answer'))); ch=q.get('ch') or q.get('choices')
    if ch is None or a is None: return a
    if isinstance(a,(int,)) or (isinstance(a,str) and re.fullmatch(r'\d+(,\d+)*',a)):
        return sorted(ch[int(i)] for i in str(a).split(','))
    return a
def items(o,p=''):
    if isinstance(o,dict):
        if ('q' in o or 'question' in o) and 'type' in o: yield p,o
        for k,v in o.items(): yield from items(v,f'{p}.{k}')
    elif isinstance(o,list):
        for i,v in enumerate(o): yield from items(v,f'{p}[{i}]')
import unicodedata
J=lambda s: re.sub(r'[은는이가]','·',s) if isinstance(s,str) else s
for f in ['castle1','castle2','castle3','ex11','ex12']:
    a=dict(items(json.load(open(f'{A}/{f}.json')))); b=dict(items(json.load(open(f'{B}/{f}.json'))))
    assert a.keys()==b.keys()
    n=0
    for k in a:
        ca,cb=chosen(a[k]),chosen(b[k])
        if [J(x) for x in ca] if isinstance(ca,list) else J(ca) != ([J(x) for x in cb] if isinstance(cb,list) else J(cb)):
            if not (isinstance(ca,list) and [J(x) for x in ca]==[J(x) for x in cb]): bad+=1; print('✗ 정답 값 바뀜',f,k,ca,cb)
        for key in set(a[k])|set(b[k]):
            if key in ('q','question','sol','solution','say','ch','choices','answer','a','problem','help','review','helps','reviews'): continue
            if a[k].get(key)!=b[k].get(key): bad+=1; print('✗ 다른 칸 바뀜',f,k,key)
        n+=1
    print(f,'문항',n,'· 정답 값 그대로 확인')
print('다름',bad)
