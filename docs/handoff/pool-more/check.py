#!/usr/bin/env python3
"""14 ~ 17차시 팩 · 성채 4층 독립 검산 (설계 방 · 묶음 #5 건 3) — 팩이 적어 둔 답을 믿지 않고 문제 글에서 다시 계산
쓰기: python3 check.py <ex14.json> <ex15.json> <ex16.json> <ex17.json> [castle4.json]"""
import json, re, sys, collections
from fnlib import ev, num, same, Fr
bad = []; note = collections.Counter(); stat = collections.defaultdict(list)
def B(where, msg): bad.append(f"{where}: {msg}")
def ans(it): return it['choices'][it['answerIndex']]
def style(where, it):
    txt = ' '.join([it.get('question', '')] + [c for c in it.get('choices') or [] if not c.startswith('graph:')] + list(it.get('options') or []) + [it.get('solution', '') or ''])
    if re.search(r'(?<![\d/(])1x\b', txt): B(where, '「1x」 표기(계수 1)')
    if re.search(r'[−+] 0(?!\.)\b(?! 이| 을| 은)', txt): B(where, '「− 0」/「+ 0」 표기')
    if re.search(r'\((-\d+)\)', it.get('question', '')): B(where, '빼기 기호가 영문 하이픈(-) — 다른 곳은 「−」')
    for m in re.finditer(r'([0-9x²⁴)])\s(와|과|을|를)\s', it.get('question', '')):
        last, p = m[1], m[2]
        jong = {'0': 1, '1': 1, '2': 0, '3': 1, '4': 0, '5': 0, '6': 1, '7': 1, '8': 1, '9': 0, 'x': 0, '²': 0, '⁴': 0, ')': None}.get(last)
        if jong is None: continue
        if (p in '과을') != bool(jong): note['조사(와/과 · 을/를)'] += 1; stat['조사'].append(where); break
def struct(where, it):
    t = it['type']
    if t == 'choice':
        ch = it['choices']
        if len(set(ch)) != len(ch): B(where, f'보기 겹침 {ch}')
        if not (0 <= it['answerIndex'] < len(ch)): B(where, '정답 번호가 보기 밖')
        stat['pos'].append(it['answerIndex'])
    elif t == 'multi':
        op = it['options']; a = it.get('answerIndexes', it.get('answer'))
        if len(set(op)) != len(op): B(where, '보기 겹침')
        if not a or any(not (0 <= i < len(op)) for i in a): B(where, f'multi 정답 {a}')
    style(where, it)
FN = r'([fgh])\(x\) = ([^와과,에일]+?)(?= [와과] | 에 대하여|, | 일 때| 가 | 과 | 와 )'
def funcs(q): return {m[1]: m[2].strip() for m in re.finditer(FN, q)}
def math16(where, it):
    q = it['question']; F = funcs(q)
    if it['type'] != 'choice': return 0
    m = re.search(r'\(([fgh])∘([fgh])\)\((−?-?\d+)\) 의 값은', q)
    if m and m[1] in F and m[2] in F:
        v = ev(F[m[1]], ev(F[m[2]], num(m[3])))
        if num(ans(it)) != v: B(where, f'합성 값 {v} ≠ 팩 {ans(it)}')
        return 1
    m = re.search(r'\(([fgh])∘([fgh])\)\(x\) 는\?', q)
    if m and m[1] in F and m[2] in F:
        ok = all(ev(F[m[1]], ev(F[m[2]], x)) == ev(ans(it), x) for x in (-2, -1, 0, 1, 2, 3))
        if not ok: B(where, f'합성 식 틀림 {ans(it)}')
        wrong = [c for c in it['choices'] if c != ans(it) and all(ev(F[m[1]], ev(F[m[2]], x)) == ev(c, x) for x in (-2, -1, 0, 1, 2, 3))]
        if wrong: B(where, f'오답 보기도 정답 {wrong}')
        return 1
    if '(f∘h)(x) = g(x)' in q and 'f' in F and 'g' in F:
        a = ans(it); mh = re.search(r'h\(x\) = (.+)$', a)
        if q.rstrip().endswith('그러므로 h(x) 는?') or re.search(r'h\(x\) =\s*$', q) or (mh and '2h' not in a and 'h(x) =' in a and '그러므로' in q):
            ok = all(ev(F['f'], ev(mh[1], x)) == ev(F['g'], x) for x in (-2, 0, 1, 3))
            if not ok: B(where, f'h(x) 틀림 {a}')
            return 1
        m2 = re.fullmatch(r'(\d+)h\(x\) = (.+)', a)
        if m2 and '는?' in q:
            k = int(m2[1])   # k·h = rhs  ⇔  f(h) = g  (f = kx + c)
            ok = all(ev(F['f'], ev(m2[2], x) / k) == ev(F['g'], x) for x in (-1, 0, 2))
            if not ok: B(where, f'{a} 틀림')
            return 1
    if '만족시키는 h(x) 는?' in q and 'f' in F and 'g' in F:
        mh = re.search(r'h\(x\) = (.+)$', ans(it))
        if not all(ev(F['f'], ev(mh[1], x)) == ev(F['g'], x) for x in (-2, 0, 1, 3)): B(where, f'h(x) 틀림 {ans(it)}')
        for cc in it['choices']:
            if cc != ans(it) and all(ev(F['f'], ev(cc.split('= ')[1], x)) == ev(F['g'], x) for x in (-2, 0, 1, 3)): B(where, f'오답 보기도 정답 {cc}')
        return 1
    return 0
def math17(where, it):
    q = it['question']
    if it['type'] == 'match' and '완성하면' in q:
        Y = it['ys']; f = {a: b for a, b in re.findall(r'(\d) → (\d)', q)}
        got = {it['xs'][x]: Y[y] for x, y in it['answer']}
        if any(got[k] != v for k, v in f.items()) or len(set(got.values())) != 4 or len(got) != 4: B(where, f'화살표 정답이 일대일대응이 아님 {got}')
        return 1
    if it['type'] != 'choice': return 0
    m = re.search(r'f\(x\) = (.+?) 에 대하여 f⁻¹\((−?\d+)\) 의 값은', q)
    if m:
        v = num(ans(it))
        if ev(m[1], v) != num(m[2]): B(where, f'f⁻¹ 값 틀림 {ans(it)}')
        return 1
    m = re.search(r'y = (.+?) 의 역함수는\?', q) or re.search(r'f\(x\) = (.+?) 에 대하여 f⁻¹\(x\) 는', q)
    if m:
        inv = ans(it).split('=')[-1].strip()
        if not all(ev(inv, ev(m[1], x)) == x for x in (-2, 0, 1, 3)): B(where, f'역함수 틀림 {ans(it)}')
        for c in it['choices']:
            if c != ans(it) and all(ev(c.split('=')[-1].strip(), ev(m[1], x)) == x for x in (-2, 0, 1, 3)): B(where, f'오답 보기도 정답 {c}')
        return 1
    m = re.search(r'함수 y = (.+?) [와과] 그 역함수.*그래프', q)
    if m and ans(it).startswith('graph:'):
        parts = [p.strip() for p in ans(it)[6:].split('@')[0].split(';')]
        inv = parts[1].replace('y=', '')
        if not all(ev(inv, ev(m[1], x)) == x for x in (-1, 0, 2)): B(where, f'그래프의 역함수 식 틀림 {inv}')
        return 1
    m = re.search(r'f\(x\) = (.+?) 에 대하여 y = f⁻¹\(x\) 는', q)
    if m:
        inv = ans(it).split('=')[-1].strip()
        if not all(ev(inv, ev(m[1], x)) == x for x in (-2, 0, 1, 3)): B(where, f'역함수 틀림 {ans(it)}')
        return 1
    m = re.search(r'f\(x\) = ax \+ b 가 f\((−?\d+)\) = (−?\d+), f⁻¹\((−?\d+)\) = (−?\d+) [을를] 만족시킬 때, f\((−?\d+)\) 의 값은', q)
    if m:
        x1, y1, y2, x2, t = (num(m[i]) for i in range(1, 6)); a = (y2 - y1) / (x2 - x1); b = y1 - a * x1
        if num(ans(it)) != a * t + b: B(where, f'f({t}) = {a*t+b} ≠ 팩 {ans(it)}')
        return 1
    m = re.search(r'완성하면 \((.+?)\)\n(.+)$', q, re.S)
    if m and 'X = {1, 2, 3, 4}' in q:
        Y = [int(v) for v in re.search(r'Y = \{([\d, ]+)\}', q)[1].split(',')]; f = {int(a): int(b) for a, b in re.findall(r'(\d) → (\d)', m[1])}
        miss = [x for x in (1, 2, 3, 4) if x not in f][0]; f[miss] = [y for y in Y if y not in f.values()][0]; inv = {v: k for k, v in f.items()}; t = m[2]
        mm = re.search(r'^f⁻¹\((\d)\) 의 값', t)
        if mm: want = inv[int(mm[1])]
        elif (mm := re.search(r'^\(f⁻¹∘f\)\((\d)\)', t)): want = int(mm[1])
        elif (mm := re.search(r'^\(f∘f⁻¹\)\((\d)\)', t)): want = int(mm[1])
        elif (mm := re.search(r'^\(f⁻¹\)⁻¹\((\d)\)', t)): want = f[int(mm[1])]
        else: return 0
        if num(ans(it)) != want: B(where, f'값 {want} ≠ 팩 {ans(it)}')
        return 1
    m = re.search(r'f\(x\) = ax \+ b 가 f\((−?\d+)\) = (−?\d+) [과와] f⁻¹\((−?\d+)\) = (−?\d+) 를 만족시킬 때, f\((−?\d+)\)', q)
    if m:
        x1, y1, y2, x2, t = (num(m[i]) for i in range(1, 6)); a = (y2 - y1) / (x2 - x1); b = y1 - a * x1; A = ans(it)
        if '그러므로' in q:
            if num(A) != a * t + b: B(where, f'f({t}) = {a*t+b} ≠ 팩 {A}')
            return 1
        mm = re.fullmatch(r'a = (−?\d+), b = (−?\d+)', A)
        if mm:
            if (num(mm[1]), num(mm[2])) != (a, b): B(where, f'a, b = {a}, {b} ≠ 팩 {A}')
            return 1
    return 0
def math14(where, it):
    q = it['question']
    m = re.search(r'정의역이 \{(\d+), (\d+)\}인 두 함수 f\(x\) = x \+ a, g\(x\) = x² \+ bx \+ (\d+)', q)
    if m and it['type'] == 'choice' and '그러므로' in q:
        p, r, c = int(m[1]), int(m[2]), int(m[3])
        # p + a = p² + bp + c ,  r + a = r² + br + c
        b = Fr((r - p) - (r * r - p * p), (r - p)); a = p * p + b * p + c - p
        mm = re.fullmatch(r'a = (−?\d+), b = (−?\d+)', ans(it))
        if (num(mm[1]), num(mm[2])) != (a, b): B(where, f'a, b = {a}, {b} ≠ 팩 {ans(it)}')
        return 1
    m = re.search(r'정의역이 \{(\d+), (\d+)\}인 두 함수 f\(x\) = ax \+ b, g\(x\) = x²', q)
    if m and it['type'] == 'choice':
        p, r = int(m[1]), int(m[2]); a = p + r; b = -p * r
        mm = re.fullmatch(r'a = (−?\d+), b = (−?\d+)', ans(it))
        if (num(mm[1]), num(mm[2])) != (a, b): B(where, f'a, b = {a}, {b} ≠ 팩 {ans(it)}')
        return 1
    m = re.search(r'X = \{([\d, ]+)\} 에서 Y = \{([\d, ]+)\} 로의 함수 f\(x\) = (.+?) 의 치역', q)
    if m and it['type'] == 'multi':
        X = [int(v) for v in m[1].split(',')]; rng = {ev(m[3], x) for x in X}
        got = {num(it['options'][i]) for i in it.get('answerIndexes', it.get('answer'))}
        if got != rng: B(where, f'치역 {sorted(rng)} ≠ 팩 {sorted(got)}')
        return 1
    m = re.search(r'\((\d)\) ([^\n/]+)\n이 대응은\?', q) or re.search(r'\((\d)\) (.+?) / 이 대응은', q.replace('\n', ' / '))
    if m and it['type'] == 'choice':
        pairs = re.findall(r'(\d)→([a-d])', m[2]); cnt = collections.Counter(x for x, _ in pairs)
        isf = all(cnt.get(str(x), 0) == 1 for x in (1, 2, 3, 4)); A = ans(it)
        if isf != (A == '함수이다'): B(where, f'함수 판정 틀림 {A}')
        if not isf:
            mm = re.search(r'원소 (\d) 에 대응하는 Y 의 원소가 (없다|2개이다)', A); c = cnt.get(mm[1], 0)
            if (mm[2] == '없다') != (c == 0) or (mm[2] == '2개이다' and c != 2): B(where, f'까닭 틀림 {A}')
        return 1
    m = re.search(r'y = (−?x² [+−] \d+|x² [+−] \d+) 의 치역은', q)
    if m and it['type'] == 'choice':
        e = m[1]; top = ev(e, 0); A = ans(it)
        want = f"{{y | y {'≤' if e.startswith('−') else '≥'} {str(top).replace('-', '−')}}}"
        if A != want: B(where, f'치역 {want} ≠ 팩 {A}')
        return 1
    return 0
def kind15(e):
    e = e.strip()
    if 'x' not in e: return 'C'
    if e == 'x': return 'I'
    if '²' in e or '|' in e: return 'Q'
    return 'L'
def math15(where, it):
    q = it['question']; KN = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ']
    bg = re.findall(r'([ㄱ-ㄹ])\. y = (.+?)(?=   [ㄱ-ㄹ]\.|\n|$)', q)
    if len(bg) == 4:
        kd = {k: kind15(e) for k, e in bg}; ex = dict(bg)
        if it['type'] == 'match':
            want = sorted([[0, KN.index(k)] for k in KN if kd[k] in 'IL'] + [[1, KN.index(k)] for k in KN if kd[k] == 'I'] + [[2, KN.index(k)] for k in KN if kd[k] == 'C'])
            if sorted(it['answer']) != want: B(where, f'화살표 정답 {it["answer"]} ≠ {want}')
            return 1
        if '상수함수는?' in q: want = [k for k in KN if kd[k] == 'C'][0]
        elif '항등함수는?' in q: want = [k for k in KN if kd[k] == 'I'][0]
        elif '일대일함수일까' in q:
            qq = [k for k in KN if kd[k] == 'Q'][0]; v = ev(ex[qq], 1); mm = re.match(r'f\(−1\) = f\(1\) = (−?\d+) 이므로 일대일함수가 아니다', ans(it))
            if not mm or num(mm[1]) != v or ev(ex[qq], -1) != v: B(where, f'f(±1) = {v} ≠ 팩 {ans(it)}')
            return 1
        elif '치역은?' in q: want = '실수 전체'
        else: return 0
        if ans(it) != want: B(where, f'{want} ≠ 팩 {ans(it)}')
        return 1
    if it['type'] == 'multi':
        ops = [re.sub(r'^\(\d\) ', '', o).replace('y = ', '') for o in it['options']]
        want = [i for i, o in enumerate(ops) if ('이면' in o) or kind15(o) in 'IL']
        if sorted(it.get('answer', it.get('answerIndexes'))) != want: B(where, f'고를 것 {want} ≠ 팩 {it.get("answer")}')
        return 1
    m = re.search(r'y = (−x² [+−] \d+) [이가] 일대일함수가 아닌 까닭', q)
    if m and it['type'] == 'choice':
        v = ev(m[1], 1); mm = re.match(r'f\(−1\) = f\(1\) = (−?\d+) 이다', ans(it))
        if not mm or num(mm[1]) != v: B(where, f'f(±1) = {v} ≠ 팩 {ans(it)}')
        for cc in it['choices']:
            m2 = re.fullmatch(r'f\(−1\) = (−?\d+), f\(1\) = (−?\d+) 이다', cc)
            if m2 and num(m2[1]) == v and num(m2[2]) == v: B(where, f'오답 보기가 참 {cc}')
        return 1
    m = re.search(r'정의역이 \{([−\d, ]+)\} 인 함수 (?:y|f\(x\)) = (.+?) 의 그래프는', q)
    if m and it['type'] == 'choice':
        X = [num(v) for v in m[1].split(',')]; pts = re.findall(r'\((-?\d+),(-?\d+)\)', ans(it))
        if {(Fr(a), Fr(b)) for a, b in pts} != {(x, ev(m[2], x)) for x in X}: B(where, f'점 그래프 틀림 {ans(it)}')
        return 1
    return 0
MATH = {14: math14, 15: math15, 16: math16, 17: math17}
def walk(n, d):
    cnt = verified = 0; rows = []
    for k, m in d['monsters'].items():
        sets = [('세트0', m['first'])] + [(f'pool{i}', s) for i, s in enumerate(m.get('retry', {}).get('pool', []))]
        if m.get('chain'): sets += [(f'chain{i}', s) for i, s in enumerate(m['chain']['pool'])]
        seen = {}
        for nm, s in sets:
            key = json.dumps([[i.get('question'), i.get('choices'), i.get('options')] for i in s], ensure_ascii=False, sort_keys=True)
            base = [[i.get('question'), i.get('choices'), i.get('options')] for i in s]
            if nm.startswith('pool') and str(base) in seen.values(): B(f'{n}차시 {k} {nm}', '다른 판과 문제 글이 같음')
            if nm.startswith('pool'): seen[nm] = str(base)
            for j, it in enumerate(s):
                w = f'{n}차시 {k} {nm} #{j+1}'; struct(w, it); cnt += 1; verified += MATH[n](w, it)
        if m.get('chain'):
            cp = m['chain']['pool']
            for i, s in enumerate(cp):
                if any(not it.get('say') for it in s): B(f'{n}차시 {k} chain{i}', '소레이드 단계에 say(서술 문장) 없음')
        rows.append((k, m['title'], len(m['first']), len(m.get('retry', {}).get('pool', [])), len(m['chain']['pool']) if m.get('chain') else None))
    b = d['boss']
    for i, vs in enumerate(b['pool']):
        if len({json.dumps([v['question'], v.get('choices'), v.get('options')], ensure_ascii=False) for v in vs}) != len(vs): B(f'{n}차시 보스 {i+1}번', '판끼리 문제 · 보기가 같음')
        for j, it in enumerate(vs):
            w = f'{n}차시 보스 {i+1}번 판{j}'; struct(w, it); cnt += 1; verified += MATH[n](w, it)
    rows.append(('boss', b['title'], b['items'], len(b['pool'][0]) - 1, None))
    return cnt, verified, rows
if __name__ == '__main__':
    for path in sys.argv[1:]:
        d = json.load(open(path))
        if d.get('kind') == 'castle' or 'rooms' in d:
            c = 0
            for r in d['rooms']:
                for vi, v in enumerate(r['vers']):
                    its = v if isinstance(v, list) else v.get('items', [])
                    for j, it in enumerate(its):
                        c += 1; a = it.get('a'); ch = it.get('ch')
                        w = f"성채4 {r['id']} 판{vi} #{j+1}"
                        if it.get('type') == 'choice':
                            if ch is None or len(set(ch)) != len(ch): B(w, '보기 겹침/없음')
                            elif not str(a).isdigit() or not (0 <= int(a) < len(ch)): B(w, f'정답 번호 {a}')
                        if re.search(r'(?<![\d/(])1x\b', it.get('q', '')) : B(w, '「1x」 표기')
                        if re.search(r'[−+] 0\b(?! 이| 을| 은|\.)', it.get('q', '')): B(w, '「± 0」 표기')
                qs = [json.dumps([[i.get('q'), i.get('ch')] for i in (v if isinstance(v, list) else v.get('items', []))], ensure_ascii=False) for v in r['vers']]
                if len(set(qs[1:])) != len(qs) - 1: B(f"성채4 {r['id']}", f'바뀐 판 {len(qs)-1}개 중 서로 다른 것 {len(set(qs[1:]))}개')
                if r.get('chain'):
                    for vi, v in enumerate(r['vers']):
                        its = v if isinstance(v, list) else v.get('items', [])
                        if any(not i.get('say') for i in its): B(f"성채4 {r['id']} 판{vi}", '소레이드 say 없음'); break
            print(f"성채 4층: 방 {len(d['rooms'])} · 소문항 {c} · 구조만 검사(수식 검산 안 함)")
            continue
        n = d['no']; cnt, ver, rows = walk(n, d)
        print(f"\n{n}차시 {d['title']}: 소문항 {cnt}개 · 그중 다시 계산해 본 것 {ver}개")
        for k, t, f, p, c in rows: print(f"  {k} {t} | 세트0 소문항 {f} | 바뀐 판 {p}" + (f" | 소레이드 판 {c}" if c else ''))
    print(f"\n정답 위치 분포(choice): {dict(sorted(collections.Counter(stat['pos']).items()))}")
    print(f"조사 어긋남: {note['조사(와/과 · 을/를)']}곳(문항 묶음 수) 예: {stat['조사'][:4]}")
    print(f"\n고칠 것 {len(bad)}건"); [print(' -', b) for b in bad[:80]]
