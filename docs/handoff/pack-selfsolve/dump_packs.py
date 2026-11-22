# 서버 팩 · 체험판 JSON 에서 문항(question 칸이 있는 묶음)을 모두 뽑음 (읽기만)
import json,sys
rows=[]
def walk(o,src,path):
    if isinstance(o,dict):
        qk='question' if isinstance(o.get('question'),str) else ('q' if isinstance(o.get('q'),str) and 'type' in o else None)
        if qk:
            rows.append(dict(src=src,id=path,type=o.get('type'),q=o[qk],ch=o.get('choices') or o.get('ch') or o.get('options') or [i.get('left','')+' □ '+i.get('right','') for i in o.get('items',[]) if isinstance(i,dict)],a=o.get('answer',o.get('answerIndex',o.get('a'))),say=o.get('say',''),prob=o.get('problem','')))
        for k,v in o.items(): walk(v,src,f'{path}.{k}' if path else k)
    elif isinstance(o,list):
        for i,v in enumerate(o): walk(v,src,f'{path}[{i}]')
for f in sys.argv[2:]:
    walk(json.load(open(f)),f.split('/')[-1],'')
json.dump(rows,open(sys.argv[1],'w'),ensure_ascii=False)
print(len(rows))
