import json,sys,numpy as np
from PIL import Image
from scipy import ndimage
src,outdir=sys.argv[1],sys.argv[2]
L=json.load(open('/home/user/Citadel-MATH/docs/handoff/assets/hero-awaken/gpt-layout-dknight.json'))
RS=Image.open(outdir+'/hero-dknight-v8.png').convert('RGBA'); RB=Image.open(outdir+'/hero-dknight-idle8-v8.png').convert('RGBA')
G=Image.open(src).convert('RGB').resize((1536,1008),Image.NEAREST)
a=np.array(G).astype(int); r,g,b=a[...,0],a[...,1],a[...,2]
k=(r>150)&(b>150)&(g<110)&(abs(r-b)<90)
edge=(~k)&(b>r*0.75)&(r>120)&(g<90); a[edge,2]=(a[edge,2]*0.45).astype(int)
fg=ndimage.binary_opening(~k,iterations=1)
lab,n=ndimage.label(fg); sizes=ndimage.sum(fg,lab,range(1,n+1)); coms=ndimage.center_of_mass(fg,lab,range(1,n+1))
rgba=np.dstack([a.clip(0,255).astype('uint8'),np.where(fg,255,0).astype('uint8')])
cells={}
for i in range(n):
  if sizes[i]<6: continue
  cy,cx=coms[i]; cells.setdefault(int(cy//144)*6+int(cx//256),[]).append(i+1)
def piece(idx):
  m=np.isin(lab,cells.get(idx,[])); ys,xs=np.where(m); r0,c0=divmod(idx,6)
  sub=rgba.copy(); sub[...,3]=np.where(m,255,0)
  bx0,by0,bx1,by1=xs.min(),ys.min(),xs.max()+1,ys.max()+1
  return Image.fromarray(sub[by0:by1,bx0:bx1],'RGBA'),bx0-c0*256,by0-r0*144
def feet(im):
  al=np.array(im.getchannel('A'))>0; ys=np.where(al.any(1))[0]; return ys.max()
def place(pc,ref):
  p,ox,oy=pc; y=feet(ref)-(p.height-1); pa=np.array(p.getchannel('A'))>0; ra=np.array(ref.getchannel('A'))>0; best=(-1,0)
  for dx in range(-24,25):
    xx=ox+dx; t=np.zeros((144+300,256+600),bool); t[150+y:150+y+p.height,300+xx:300+xx+p.width]=pa; t=t[150:294,300:556]
    sc=(t&ra).sum()/max(1,(t|ra).sum()); best=max(best,(sc,dx))
  o=Image.new('RGBA',(256+600,144+300)); o.alpha_composite(p,(300+ox+best[1],150+y)); return o.crop((300,150,556,294)),y
sheet=Image.new('RGBA',RS.size); breath=Image.new('RGBA',(2048,144)); cut=[]
for sl in L['slots']:
  pc=piece(sl['slot'])
  if 'src' in sl:
    r_,c_=sl['src']; o,y=place(pc,RS.crop((256*c_,144*r_,256*c_+256,144*r_+144))); sheet.alpha_composite(o,(256*c_,144*r_))
  else:
    j=sl['breath']; o,y=place(pc,RB.crop((256*j,0,256*j+256,144))); breath.alpha_composite(o,(256*j,0))
  if y<0: cut.append((sl['slot']+1,y))
print('top over',cut)
sheet.save(outdir+'/hero-dknight-awk-v8.webp',quality=92,method=6,alpha_quality=100); breath.save(outdir+'/hero-dknight-awk-idle8-v8.webp',quality=92,method=6,alpha_quality=100)
pv=Image.new('RGBA',(sheet.width,sheet.height+160),(40,40,60,255)); pv.alpha_composite(sheet); pv.alpha_composite(breath.resize((1024,72)),(0,sheet.height+40)); pv.convert('RGB').save(outdir+'/preview-awk.png')
