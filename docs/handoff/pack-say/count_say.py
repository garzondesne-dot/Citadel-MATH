import json,sys,os
def qs_of(x):
    out=[]
    if isinstance(x,dict):
        if 'question' in x or 'q' in x: out.append(x)
        for v in x.values(): out+=qs_of(v)
    elif isinstance(x,list):
        for v in x: out+=qs_of(v)
    return out
def stat(f):
    d=json.load(open(f)); r={}
    if 'rooms' in d:
        for R in d['rooms']:
            q=qs_of(R.get('vers')); r[R.get('id')]=(sum(bool(x.get('say')) for x in q),sum(bool(x.get('why')) for x in q),len(q))
    else:
        for m,M in (d.get('monsters') or d.get('mons') or {}).items():
            q=qs_of({k:v for k,v in M.items()}); r[m]=(sum(bool(x.get('say')) for x in q),sum(bool(x.get('why')) for x in q),len(q))
        if d.get('boss'): q=qs_of(d['boss']); r['boss']=(sum(bool(x.get('say')) for x in q),sum(bool(x.get('why')) for x in q),len(q))
    return r
for f in sys.argv[1:]:
    s=stat(f); tot=[sum(v[i] for v in s.values()) for i in range(3)]
    print(os.path.basename(f), 'say',tot[0],'why',tot[1],'문항',tot[2], {k:v for k,v in s.items() if v[0] or v[1]})
