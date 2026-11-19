import sys,json,colorsys
import numpy as np
from PIL import Image, ImageFilter
def rgb2hsv(a):
  r,g,b=[a[...,i]/255.0 for i in range(3)]
  mx=np.max(a[...,:3],axis=-1)/255.0; mn=np.min(a[...,:3],axis=-1)/255.0; d=mx-mn
  h=np.zeros_like(mx)
  m=d>0
  rr=(mx==r)&m; gg=(mx==g)&m&~rr; bb=m&~rr&~gg
  h[rr]=((g-b)[rr]/d[rr])%6; h[gg]=((b-r)[gg]/d[gg])+2; h[bb]=((r-g)[bb]/d[bb])+4
  h=h*60; s=np.where(mx>0,d/np.where(mx>0,mx,1),0)
  return h,s,mx
def hsv2rgb(h,s,v):
  c=v*s; x=c*(1-np.abs((h/60)%2-1)); m=v-c
  z=np.zeros_like(h); k=(h//60).astype(int)%6
  r=np.choose(k,[c,x,z,z,x,c]); g=np.choose(k,[x,c,c,x,z,z]); b=np.choose(k,[z,z,x,c,c,x])
  return np.stack([(r+m),(g+m),(b+m)],-1)*255
def recolor(src,dst,rules,glow,gray=None):
  im=Image.open(src).convert('RGBA'); a=np.array(im).astype(float)
  h,s,v=rgb2hsv(a); H,S,V=h.copy(),s.copy(),v.copy()
  op=a[...,3]>0
  for lo,hi,to,sm,vm in rules:
    m=op&(s>0.18)&(((h>=lo)&(h<hi)) if lo<hi else ((h>=lo)|(h<hi)))
    H[m]=to; S[m]=np.clip(s[m]*sm,0,1); V[m]=np.clip(v[m]*vm,0,1)
  if gray:  # (to_hue, sat, vmul) for low-sat bright pixels (silver armor)
    to,sat,vm=gray; m=op&(s<=0.18)&(v>0.45); H[m]=to; S[m]=sat; V[m]=np.clip(v[m]*vm,0,1)
  out=a.copy(); out[...,:3]=hsv2rgb(H,S,V)
  res=Image.fromarray(out.clip(0,255).astype('uint8'),'RGBA')
  # glow outline
  al=res.getchannel('A').point(lambda x:255 if x>=128 else 0)
  dil=al.filter(ImageFilter.MaxFilter(3)); ring=Image.fromarray(((np.array(dil)>0)&(np.array(al)==0)).astype('uint8')*255)
  g=Image.new('RGBA',res.size,tuple(glow)+(200,)); base=Image.new('RGBA',res.size,(0,0,0,0)); base.paste(g,(0,0),ring)
  base.alpha_composite(res); base.save(dst)
if __name__=='__main__':
  cfg=json.loads(sys.argv[3]); recolor(sys.argv[1],sys.argv[2],cfg['rules'],cfg['glow'],cfg.get('gray'))
