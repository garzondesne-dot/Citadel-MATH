import sys; sys.path.insert(0,'.')
import pl
from PIL import Image
A='/home/user/garzondesne-dot/citadel-math-test/public/art/heroes/hero-spellblade-v7.webp'
im=Image.open(A).convert('RGBA')
D='Pixel art chibi spellblade hero facing right. One raised hand holds a glowing purple rune orb. His other hand must firmly GRIP the hilt of the sword, fingers wrapped around the handle, the blade pointing forward and slightly down. The sword must not float in the air: it is held in the hand. Keep everything else exactly the same: same colors, size, pose, outline, cape and hair.'
jobs=[('idle',0,0)]+[('walk',1,c) for c in range(4)]
for nm,r,c in jobs:
    cell=im.crop((c*256,r*144,(c+1)*256,(r+1)*144))
    j=pl.edit([cell],D,(256,144),seed=20+c+r)
    ims=pl.images_of(j); print(nm,r,c,j.get('status'),j.get('usage'),len(ims),flush=True)
    for n,i in enumerate(ims): i.save(f'spell_{nm}{c}_{n}.png')
