import sys; sys.path.insert(0,'.')
import pl
from PIL import Image
A='/home/user/garzondesne-dot/citadel-math-test/public/art/heroes/hero-ninja-v7.webp'
im=Image.open(A).convert('RGBA'); 
D='Pixel art chibi ninja walking to the right. The ninja must hold TWO short white daggers, one in each hand (reverse grip, blades pointing down and backward), both clearly visible. Keep everything else exactly the same: same colors, size, pose, outline, scarf and ponytail.'
for c in range(4):
    cell=im.crop((c*256,144,(c+1)*256,288))
    j=pl.edit([cell],D,(256,144),seed=10+c)
    ims=pl.images_of(j); print(c,j.get('status'),j.get('usage'),len(ims),flush=True)
    for n,i in enumerate(ims): i.save(f'ninja_w{c}_{n}.png')
