import openpyxl, json, sys
OUT='.'
TYPE={'숫자':'number','선다':'choice','OX':'ox','여러개':'multi','단답':'text'}
def item(r):
    typ,q,opts,ans,sol=r
    t=TYPE[typ]; ch=[o for o in opts if o is not None and str(o)!='']
    a=str(ans)
    if t=='choice': a=str(int(ans)-1)
    if t=='ox': a=str(ans).upper(); ch=[]
    if t in('number','text'): ch=[]
    return {"type":t,"q":str(q),"a":a,"ch":[str(c) for c in ch],"sol":str(sol or '')}
def load(f):
    wb=openpyxl.load_workbook(f,data_only=True); ws=wb['문항']
    mons={}; boss={}
    for row in list(ws.iter_rows(values_only=True))[2:]:
        if not row[0]: continue
        sid,kan=row[0],int(row[1])
        if sid=='boss':
            # boss rows: 단계ID 칸 형식 문제 보기1..5 정답 해설 꼬리표(세트)... boss rows have no 버전 column value shift
            vals=[c for c in row]
            # layout: sid, 칸, None(버전), 형식,...  check
            ver=None
            typ=vals[3] if vals[2] is None or vals[2] in TYPE else vals[2]
        if sid!='boss':
            ver=int(row[2]); typ=row[3]; q=row[4]; opts=row[5:10]; ans=row[10]; sol=row[11]
            mons.setdefault(sid,{}).setdefault(ver,{})[kan]=item((typ,q,opts,ans,sol))
        else:
            boss.setdefault(sid,[]).append(row)
    return mons, boss
for f in ['m1.xlsx','m2.xlsx']:
    m,b=load(f)
    for r in b['boss']: print(f, r)

def ox(q,a,sol): return {"type":"ox","q":q,"a":a,"ch":[],"sol":sol}
def boss_items(rows):
    s={}
    for r in rows:
        s.setdefault(r[13],[]).append(item((r[3],r[4],r[5:10],r[10],r[11])))
    return s
P=[dict(f='m1.xlsx',id='mid1-stat-01',no=1,title='도수분포표',goal='① 계급 · 계급의 크기 · 도수의 뜻을 말할 수 있다. ② 자료를 도수분포표로 나타내고 해석할 수 있다.',theme='01-burrow',
  intro='생각 열기 · 어제 스마트폰, 몇 분 썼어?',c1=('STEP 1 · 도수분포표의 낱말','변량을 일정한 간격으로 나눈 구간 = 계급 · 구간의 너비 = 계급의 크기 · 계급에 속하는 변량의 개수 = 도수 · 계급과 도수를 나타낸 표 = 도수분포표 · 「30 이상 60 미만」에 60은 안 들어감'),
  mt=['문제 1 · 통학 시간','문제 2 · 선거 투표율','문제 3 · 50m 달리기'],sp=['new0:0','new1:0','new2:0'],bt='형성평가 · 계급의 수호자',bsp='base2:0',vid='(중1통계1차시) 01_도수분포표.mp4',
  extra1=[ox('「20 이상 40 미만」 계급에 40점은 들어간다.','X','40은 다음 계급 「40 이상 60 미만」'),ox('도수분포표를 보면 가장 큰 변량을 정확히 알 수 있다.','X','계급으로 묶어서 정확한 값은 사라짐')],
  extra2=[ox('「40 이상 60 미만」 계급에 60점은 들어간다.','X','60은 다음 계급 「60 이상 80 미만」'),ox('도수분포표를 보면 각 학생의 정확한 점수를 알 수 있다.','X','계급으로 묶어서 정확한 값은 사라짐')]),
 dict(f='m2.xlsx',id='mid1-stat-02',no=2,title='히스토그램과 도수분포다각형',goal='① 도수분포표를 히스토그램과 도수분포다각형으로 나타낼 수 있다. ② 히스토그램과 도수분포다각형을 읽고 해석할 수 있다.',theme='05-ruins',
  intro='지난 시간 기억하기 · 생각 열기 · 표 vs 그림',c1=('STEP 1 · 2 · 히스토그램과 도수분포다각형','히스토그램 = 계급의 크기를 가로, 도수를 세로로 하는 직사각형 그래프 · 직사각형 넓이 = 계급의 크기 × 도수 → 도수에 비례 · 도수분포다각형 = 윗변 중앙의 점과 양 끝 도수 0 인 계급의 중앙을 선분으로 이은 그래프'),
  mt=['문제 1 · 블로그 방문자','문제 2 · 영화 관객','문제 3 · 나무의 키'],sp=['new3:0','new4:0','new5:0'],bt='형성평가 · 찢어진 히스토그램',bsp='base1:0',vid='(중1통계2차시) 01_히스토그램과 도수분포다각형.mp4',
  extra1=[ox('히스토그램에서 직사각형의 넓이는 그 계급의 도수에 비례한다.','O','넓이 = 계급의 크기(같음) × 도수'),ox('도수분포다각형은 도수분포표에서 바로 그릴 수 없다.','X','계급의 중앙과 도수만 있으면 바로 그릴 수 있음')],
  extra2=[ox('히스토그램에서 직사각형의 높이는 그 계급의 도수이다.','O','세로축 = 도수'),ox('도수분포다각형을 그릴 때 양 끝에 도수가 0 인 계급은 더하지 않는다.','X','양 끝에 도수 0 인 계급을 하나씩 더해 중앙에 점을 찍음')])]
for p in P:
    m,b=load(p['f']); bs=boss_items(b['boss'])
    mons={}
    for i,mid in enumerate(['m1','m2','m3']):
        vs=m[mid]; vers=[[vs[v][k] for k in sorted(vs[v])] for v in sorted(vs)]
        mons[mid]={"title":p['mt'][i],"sprite":p['sp'][i],"vers":vers}
    set1=bs['1']+p['extra1']; set2=bs['2']+p['extra2']
    pack={"id":p['id'],"no":p['no'],"title":p['title'],"unit":"중학수학1 Ⅵ. 통계 · 1 자료의 정리와 해석","goal":p['goal'],"theme":p['theme'],"pct":100,
      "steps":[{"kind":"intro","id":"intro","title":p['intro'],"img":"review"},{"kind":"concept","id":"c1","title":p['c1'][0],"say":p['c1'][1]},
        {"kind":"monster","id":"m1","title":p['mt'][0]},{"kind":"monster","id":"m2","title":p['mt'][1]},{"kind":"monster","id":"m3","title":p['mt'][2]},
        {"kind":"boss","id":"sum","title":p['bt']}],
      "mons":mons,"boss":{"title":p['bt'],"sprite":p['bsp'],"items":5,"hpItems":5,"tags":["c1"]*5,"vers":[set1,set2]},"img":[],"video":[{"file":p["vid"],"at":["c1"]}] if p.get("vid") else []}
    json.dump(pack,open(f"{OUT}/{p['id']}.json",'w'),ensure_ascii=False,indent=1)
    print(p['id'],'mons',{k:[len(v['vers']),len(v['vers'][0])] for k,v in mons.items()},'boss',len(set1),len(set2))
