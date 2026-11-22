# 혼자 안 풀리는 꼴 찾기 (문항 글만 보고)
import json,re,sys
from collections import defaultdict
rows=json.load(open(sys.argv[1]))+json.load(open(sys.argv[2]))
REF=re.compile(r'위의|위 식|위 그림|위 표|위에서|앞에서|앞 문제|앞의|앞 단계|이 집합|이 조건|이 명제|이 함수|이 식|그림에서|그림을|표에서|다음 그림|아래 그림|오른쪽 그림|왼쪽 그림|학습지|\(\d\)\s*의|\(\d\)\s*에서|⑴에서|⑵에서|\(\d\)\s*과 같|\(\d\)\s*의 답|위 결과|이때')
def undefined(q):
    bad=[]
    for L in 'ABCUXPQY':
        if re.search(rf'(?<![A-Za-z가-힣\(]){L}(?![A-Za-z])',q):
            if not re.search(rf'(?<![A-Za-z]){L}\s*=|집합\s*{L}|{L}\s*(는|은|이|가)\s|{L}\s*:\s|{L}\s*=\s*\{{',q): bad.append(L)
    for L in 'pqr':
        if re.search(rf'(?<![A-Za-z]){L}(?![A-Za-z(])',q) and re.search(rf'(?<![A-Za-z]){L}\s*(→|⇒|⇔|이|의|는|를|가|,|$|\s)',q):
            if not re.search(rf'{L}\s*:|조건\s*{L}\s*[:=]|{L}\s*:\s*「|{L}\s*=',q): bad.append(L)
    for L in 'fgh':
        if re.search(rf'(?<![A-Za-z]){L}\s*(\(|∘|⁻¹|의|:)',q) and not re.search(rf'{L}\s*\(x\)\s*=|{L}\s*:\s*X|{L}\s*:|함수\s*{L}',q): bad.append(L)
    return bad
out=defaultdict(list)
for r in rows:
    q=r.get('q') or ''
    if not q: continue
    ref=REF.findall(q); und=undefined(q)
    if ref or und:
        grp=re.sub(r'\[\d+\]','[]',r['id']); grp=re.sub(r'\.\d+$','',grp)
        out[(r['src'],grp)].append(dict(ref=ref,und=und,q=q,pass_=r.get('pass'),ch=r.get('ch')))
for (src,g),L in sorted(out.items()):
    print(f'== {src} {g} · {len(L)}건 · ref={sorted(set(sum([x["ref"] for x in L],[])))} und={sorted(set(sum([x["und"] for x in L],[])))}')
    seen=set()
    for x in L:
        k=re.sub(r'-?\d+','#',x['q'])
        if k in seen: continue
        seen.add(k); print('   ', x['q'].replace('\n',' ⏎ ')[:230])
