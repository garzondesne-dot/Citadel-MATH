# v3 고침 (2026-11-16): 판 1~3 문항 꼴을 판 0(학습지)과 같게 · zip 안 파일 이름을 영어로(앱이 한글 이름을 깨뜨림)
import json,random
def to_choice(it,cands):
    a=it['a']; opts=[a]+[c for c in cands if c!=a]
    opts=opts[:4]; random.Random(it['q']+a).shuffle(opts)
    it['type']='choice'; it['ch']=opts; it['a']=str(opts.index(a))
for f,vid in [('mid1-stat-01.json','mid1-01-video.mp4'),('mid1-stat-02.json','mid1-02-video.mp4')]:
    d=json.load(open(f))
    for k,m in d['mons'].items():
        for i in range(len(m['vers'][0])):
            t0=m['vers'][0][i]['type']
            for v in m['vers'][1:]:
                it=v[i]
                if it['type']==t0: continue
                assert t0=='choice'
                if it['type']=='number':
                    n=int(it['a']); to_choice(it,[str(x) for x in (n+1,n-1,n+2,n*2,n+3) if x>=0])
                elif it['type']=='ox':
                    it['type']='choice'; it['ch']=['맞다','틀리다']; it['a']='0' if it['a']=='O' else '1'
    d['video']=[{'file':vid,'at':['c1']}]
    json.dump(d,open(f,'w'),ensure_ascii=False,indent=1)
    for k,m in d['mons'].items():
        print(f,k,[[x['type'] for x in v] for v in m['vers']])
