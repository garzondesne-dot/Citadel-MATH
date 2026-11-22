# 새로 붙인 문제 글(성채 1층 q08 · q09 · q10 · q12)에서 숫자를 읽어 👑 정답을 따로 다시 계산 · 팩 정답과 견줌
import json,re,sys,math
SUB=str.maketrans('₀₁₂₃₄₅₆₇₈₉','0123456789'); M=lambda s:int(s.replace('−','-'))
def ans_of(q):
    a=q['a']
    if q['type']=='multi': return sorted(q['ch'][int(i)].replace('−','-') for i in str(a).split(','))
    return str(a)
bad=0; n=0
for f in sys.argv[1:]:
    d=json.load(open(f))
    for r in d['rooms']:
        if r['id'] not in ('q08','q09','q10','q12'): continue
        for vi,v in enumerate(r['vers']):
            stem=v[0]['q'].split('\n')[0]; last=v[-1]
            assert all(x['q'].split('\n')[0]==stem for x in v), (r['id'],vi)
            if r['id']=='q08':
                c,b,dd=map(M,re.search(r'A = \{x² \+ (\d+)x, (−?\d+), (−?\d+)\}',stem).groups())
                assert f'B = {{x, {dd}}}' in stem
                want=sorted(str(x) for x in range(-20,21) if x!=dd and (x==x*x+c*x or x==b))
            elif r['id']=='q09':
                a,b,c=[int(s.translate(SUB)) for s in re.search(r'n\(A(\S+) ∩ \(A(\S+) ∪ A(\S+)\)\)',stem).groups()]
                want=str(sum(1 for x in range(1,101) if x%a==0 and (x%b==0 or x%c==0)))
            elif r['id']=='q10':
                N,k,m=map(int,re.search(r'U = \{x \| x는 (\d+) 이하의 자연수\}, A = \{x \| x는 (\d+)의 배수\}, B = \{x \| x는 (\d+)의 약수\}',stem).groups())
                want=str(sum(1 for x in range(1,N+1) if x%k!=0 and m%x!=0))
            else:
                N,p,q,rem=map(int,re.search(r'(\d+) 미만의 자연수 중에서 (\d+)의 배수가 아니거나 (\d+)으?로 나눈 나머지가 (\d+)[이가] 아닌',stem).groups())
                want=str(sum(1 for x in range(1,N) if not (x%p==0 and x%q==rem)))
            got=ans_of(last); n+=1
            if got!=want: bad+=1; print('✗',f,r['id'],vi,stem,'팩',got,'계산',want)
print(f'{n}판 다시 계산 · 다름 {bad}')
