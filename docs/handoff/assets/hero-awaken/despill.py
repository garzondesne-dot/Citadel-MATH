import sys, numpy as np
from PIL import Image
for f in sys.argv[1:]:
  a=np.array(Image.open(f).convert('RGBA')).astype(int)
  for _ in range(2):
    op=a[...,3]>0
    r,g,b=a[...,0],a[...,1],a[...,2]
    tint=op&(b>90)&(r>90)&(g<b-35)&(abs(r-b)<110)
    # only remove if touching transparency
    t=~op; nb=np.zeros_like(op)
    nb[1:]|=t[:-1]; nb[:-1]|=t[1:]; nb[:,1:]|=t[:,:-1]; nb[:,:-1]|=t[:,1:]
    a[tint&nb,3]=0
  # remaining interior tint -> pull blue down
  op=a[...,3]>0; r,g,b=a[...,0],a[...,1],a[...,2]
  tint=op&(b>90)&(r>90)&(g<b-35)
  a[tint,2]=(a[tint,1]+a[tint,2])//3
  Image.fromarray(a.clip(0,255).astype('uint8'),'RGBA').save(f)
  print(f,'left tint',int(tint.sum()))
