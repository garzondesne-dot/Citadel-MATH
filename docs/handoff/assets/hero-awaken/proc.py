import json,sys
import numpy as np
from PIL import Image
k=sys.argv[1]; gpt=sys.argv[2]
L=json.load(open(f'/home/user/hv2/docs/handoff/assets/hero-awaken/gpt-layout-{k}.json'))
S=Image.open(f'/home/user/beta/public/art/heroes/hero-{k}-v5.webp').convert('RGBA')
HD=json.load(open('/home/user/beta/src/ui/idle8-hd-map.json')) if False else None
G=Image.open(gpt).convert('RGB'); W,H=G.size; cw,ch=W/6,H/7
def key(im):
  a=np.array(im).astype(int); r,g,b=a[...,0],a[...,1],a[...,2]
  mag=(r>150)&(b>150)&(g<110)&(abs(r-b)<90)
  # despill: pixels near magenta edge
  alpha=np.where(mag,0,255).astype('uint8')
  out=np.dstack([a.clip(0,255).astype('uint8'),alpha])
  o=Image.fromarray(out,'RGBA')
  # remove tiny specks: keep alpha
  return o
def cellimg(i):
  c,r=i%6,i//6; x0,y0=round(c*cw),round(r*ch)
  return key(G.crop((x0,y0,x0+256,y0+min(144,round(ch))+4)))
def best_shift(new,ref):
  na=np.array(new.getchannel('A'))>0; ra=np.array(ref.getchannel('A'))>0
  if not ra.any() or not na.any(): return 0,0
  best=(-1,0,0)
  for dy in range(-10,11):
    for dx in range(-14,15):
      sh=np.zeros_like(ra); 
      ys=slice(max(0,dy),min(ra.shape[0],na.shape[0]+dy)); xs=slice(max(0,dx),min(ra.shape[1],na.shape[1]+dx))
      sh[ys,xs]=na[ys.start-dy:ys.stop-dy, xs.start-dx:xs.stop-dx]
      sc=(sh&ra).sum()/max(1,(sh|ra).sum())
      if sc>best[0]: best=(sc,dx,dy)
  return best[1],best[2]
def place(new,ref):
  dx,dy=best_shift(new,ref); o=Image.new('RGBA',(256,144)); o.alpha_composite(new,(dx,dy)) if dx>=0 and dy>=0 else o.paste(new,(dx,dy),new); return o
sheet=Image.new('RGBA',S.size); breath=Image.new('RGBA',(2048,144))
B=Image.open(f'/home/user/hv2/docs/handoff/assets/hero-idle8-hd/'+sys.argv[3]).convert('RGBA')
for sl in L['slots']:
  new=cellimg(sl['slot'])
  if 'src' in sl:
    r,c=sl['src']; ref=S.crop((256*c,144*r,256*c+256,144*r+144))
    sheet.alpha_composite(place(new,ref),(256*c,144*r))
  else:
    j=sl['breath']; ref=B.crop((256*j,0,256*j+256,144))
    breath.alpha_composite(place(new,ref),(256*j,0))
sheet.save(f'{k}-gpt-v5.png'); breath.save(f'{k}-gpt-idle8.png')
