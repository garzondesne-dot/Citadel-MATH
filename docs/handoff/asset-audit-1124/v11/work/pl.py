import base64, io, json, os, sys, time, urllib.request
from PIL import Image
API = 'https://api.pixellab.ai/v2'
def call(path, body=None, method='POST'):
    req = urllib.request.Request(API + path, data=json.dumps(body).encode() if body is not None else None, method=method, headers={'Authorization': 'Bearer x', 'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=120) as r: return json.load(r)
    except urllib.error.HTTPError as e: return {'error': e.code, 'body': e.read().decode()[:600]}
def b64(im):
    b = io.BytesIO(); im.save(b, 'PNG'); return {'base64': 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()}
def edit(images, desc, size, seed=None, no_bg=False):
    body = {'method': 'edit_with_text', 'edit_images': [{'image': b64(i), 'width': i.width, 'height': i.height} for i in images], 'image_size': {'width': size[0], 'height': size[1]}, 'description': desc, 'no_background': no_bg}
    if seed is not None: body['seed'] = seed
    r = call('/edit-images-v2', body)
    if 'error' in r: return r
    jid = r.get('background_job_id') or r.get('id') or r.get('job_id')
    for _ in range(90):
        time.sleep(4); j = call(f'/background-jobs/{jid}', None, 'GET')
        if j.get('status') in ('completed', 'failed'): return j
    return j
def images_of(j):
    lr = j.get('last_response') or {}
    out = []
    def walk(x):
        if isinstance(x, dict):
            if 'base64' in x and isinstance(x['base64'], str): out.append(x['base64'])
            for v in x.values(): walk(v)
        elif isinstance(x, list):
            for v in x: walk(v)
    walk(lr)
    ims = []
    for s in out:
        s = s.split(',', 1)[-1]; ims.append(Image.open(io.BytesIO(base64.b64decode(s))).convert('RGBA'))
    return ims
