import math, random
random.seed(7)
import sys
OUT = sys.argv[1] if len(sys.argv) > 1 else 'index.html'

def f(x):
    s = f"{x:.1f}"
    return s.rstrip('0').rstrip('.') if '.' in s else s

def petal(r1, r2, w):
    m = (r1 + r2) / 2
    return f"M{f(r1)} 0Q{f(m)} {f(w)} {f(r2)} 0Q{f(m)} {f(-w)} {f(r1)} 0Z"

def ring(n, d, attrs='', rot0=0):
    return ''.join(f'<path d="{d}" transform="rotate({f(rot0 + i*360/n)})" {attrs}/>' for i in range(n))

def dots(n, r, rad, attrs='', rot0=0):
    out = ''
    for i in range(n):
        a = math.radians(rot0 + i*360/n)
        out += f'<circle cx="{f(r*math.cos(a))}" cy="{f(r*math.sin(a))}" r="{rad}" {attrs}/>'
    return out

# ---------- hero halo rosette ----------
def halo():
    s = '<svg class="halo" viewBox="-500 -500 1000 1000" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.3">'
    s += '<g class="spin-a"><circle r="492"/><circle r="482" stroke-dasharray="2 9"/>'
    s += ring(36, petal(405, 474, 15))
    s += dots(36, 392, 3.2, 'fill="currentColor" stroke="none"', 5)
    s += '<circle r="380"/></g>'
    s += '<g class="spin-b"><circle r="372" stroke-dasharray="1 7"/>'
    s += ring(24, petal(282, 366, 26)) + ring(24, petal(300, 350, 11))
    s += ring(24, petal(330, 366, 5), '', 7.5)
    s += '<circle r="274"/><circle r="266"/></g>'
    s += '<g class="spin-a">' + ring(16, petal(176, 258, 24)) + dots(16, 232, 4, 'fill="currentColor" stroke="none"', 11.25)
    s += ring(16, petal(190, 240, 8)) + '<circle r="168"/></g>'
    s += '</g></svg>'
    return s

# ---------- process medallion ----------
def medallion():
    L = 'class="ln" pathLength="1"'
    s = '<svg class="med" viewBox="-212 -212 424 424" aria-hidden="true"><g class="med-spin" fill="none" stroke-width="1.6" stroke-linecap="round">'
    s += f'<circle r="204" {L} style="--o:0"/><circle r="195" {L} style="--o:.05"/>'
    s += ring(24, petal(168, 192, 10), 'class="ln fl f3" pathLength="1" style="--o:.1"')
    s += f'<circle r="163" {L} style="--o:.18"/>'
    s += ring(12, petal(92, 160, 21), 'class="ln fl f1" pathLength="1" style="--o:.25"')
    s += ring(12, petal(106, 146, 9), 'class="ln" pathLength="1" style="--o:.35"')
    s += ring(12, petal(126, 157, 5.5), 'class="ln fl f2" pathLength="1" style="--o:.4"', 15)
    s += dots(12, 176, 2.6, 'class="fl f3 dot"', 7.5)
    s += f'<circle r="88" {L} style="--o:.5"/><circle r="81" {L} style="--o:.52"/>'
    s += ring(8, petal(30, 78, 15), 'class="ln fl f2" pathLength="1" style="--o:.58"')
    s += ring(8, petal(40, 70, 4), 'class="ln" pathLength="1" style="--o:.66"', 22.5)
    s += f'<circle r="25" class="ln fl f3" pathLength="1" style="--o:.74"/><circle r="13" {L} style="--o:.78"/>'
    s += dots(8, 19, 1.6, 'class="fl f1 dot"')
    s += '</g></svg>'
    return s

def compass():
    s = '<g class="compass" transform="translate(236 410)"><g class="compass-spin" fill="none" stroke="#5d1a20" stroke-width="1.1">'
    s += '<circle r="46"/><circle r="41" stroke-dasharray="1 5"/>'
    s += ring(8, petal(14, 38, 7), 'fill="#c9a04e" fill-opacity=".35"')
    s += ring(8, petal(18, 30, 2.5), '', 22.5)
    s += '<circle r="10" fill="#f4ead8"/><circle r="4" fill="#5d1a20" stroke="none"/></g>'
    s += '<text y="-54" text-anchor="middle" class="map-n">N</text></g>'
    return s

def pin(x, y, name, dx=14, anchor='start', end=False):
    c = 'pin end' if end else 'pin'
    s = f'<g class="{c}" transform="translate({x} {y})"><g class="bloom">'
    s += ring(8, petal(3, 13, 4.2), 'class="pp"')
    s += '<circle r="4.2" class="pc"/></g>'
    s += f'<text x="{dx}" y="5" text-anchor="{anchor}">{name}</text></g>'
    return s

# ---------- bezier helpers ----------
def bez(p0, p1, p2, p3, t):
    u = 1 - t
    x = u**3*p0[0] + 3*u*u*t*p1[0] + 3*u*t*t*p2[0] + t**3*p3[0]
    y = u**3*p0[1] + 3*u*u*t*p1[1] + 3*u*t*t*p2[1] + t**3*p3[1]
    dx = 3*u*u*(p1[0]-p0[0]) + 6*u*t*(p2[0]-p1[0]) + 3*t*t*(p3[0]-p2[0])
    dy = 3*u*u*(p1[1]-p0[1]) + 6*u*t*(p2[1]-p1[1]) + 3*t*t*(p3[1]-p2[1])
    return x, y, math.degrees(math.atan2(dy, dx))

LEAFC = ['#6f7f5c', '#2b3a6b', '#8a5a2b', '#56663f', '#a5574a']
def leaf(L, col):
    d = f"M0 0C{f(L*.3)} {f(-L*.3)} {f(L*.78)} {f(-L*.2)} {f(L)} 0C{f(L*.78)} {f(L*.2)} {f(L*.3)} {f(L*.3)} 0 0Z"
    s = f'<path d="{d}" fill="{col}" stroke="#2a1a12" stroke-width=".8"/>'
    s += f'<path d="M0 0L{f(L*.88)} 0" stroke="#f4ead8" stroke-width=".8" fill="none"/>'
    for k in (0.3, 0.48, 0.66):
        s += f'<circle cx="{f(L*k)}" cy="{f(-L*.09)}" r="1" fill="#f4ead8"/><circle cx="{f(L*k)}" cy="{f(L*.09)}" r="1" fill="#f4ead8"/>'
    return s

def blossom(r, col='#8a5a2b'):
    s = ring(6, petal(r*.2, r, r*.3), f'fill="{col}" stroke="#2a1a12" stroke-width=".8"')
    s += f'<circle r="{f(r*.24)}" fill="#c9a04e" stroke="#2a1a12" stroke-width=".8"/>'
    return s

def vine(cls, segs, vb, flip=False):
    """segs: list of (p0,p1,p2,p3, leaves:int, flower:bool)"""
    s = f'<svg class="vine {cls}" viewBox="0 0 {vb[0]} {vb[1]}" aria-hidden="true"><g{" transform=\"translate(%d 0) scale(-1 1)\"" % vb[0] if flip else ""}>'
    i = 0
    for (p0, p1, p2, p3, n, fl) in segs:
        s += f'<path class="stem" pathLength="1" d="M{p0[0]} {p0[1]}C{p1[0]} {p1[1]} {p2[0]} {p2[1]} {p3[0]} {p3[1]}" fill="none" stroke="#3a2a1c" stroke-width="1.6" stroke-linecap="round"/>'
        for k in range(n):
            t = (k + 1) / (n + 1.2)
            x, y, a = bez(p0, p1, p2, p3, t)
            side = 1 if k % 2 == 0 else -1
            ang = a + side * random.uniform(38, 62)
            L = random.uniform(26, 44)
            col = LEAFC[(i + k) % len(LEAFC)]
            s += f'<g transform="translate({f(x)} {f(y)}) rotate({f(ang)})"><g class="leaf" style="--i:{i}">{leaf(L, col)}</g></g>'
            i += 1
        if fl:
            x, y, a = bez(p0, p1, p2, p3, 1)
            s += f'<g transform="translate({f(x)} {f(y)})"><g class="leaf" style="--i:{i}">{blossom(random.uniform(13, 18), random.choice(["#8a5a2b", "#2b3a6b", "#a5574a"]))}</g></g>'
            i += 1
    s += '</g></svg>'
    return s

VINE_A = vine('vine-a', [
    ((400, -10), (330, 80), (300, 150), (210, 190), 6, True),
    ((330, 70), (380, 130), (372, 200), (330, 250), 4, True),
    ((300, 150), (250, 230), (150, 250), (110, 330), 6, True),
    ((250, 215), (270, 290), (240, 340), (200, 380), 4, True),
    ((210, 190), (150, 170), (90, 190), (40, 150), 4, True),
], (420, 420))
VINE_B = vine('vine-b', [
    ((0, 430), (60, 340), (120, 300), (200, 270), 6, True),
    ((60, 350), (20, 280), (40, 220), (90, 170), 5, True),
    ((120, 300), (190, 330), (250, 310), (300, 350), 4, True),
    ((200, 270), (230, 200), (290, 180), (330, 120), 5, True),
], (360, 440))

def butterfly(x, y, sc, cls=''):
    wing = ('<path d="M0 0C-6 -20 -30 -26 -34 -10C-36 2 -22 8 0 4Z" fill="#2b3a6b" stroke="#2a1a12" stroke-width=".8"/>'
            '<path d="M0 4C-16 6 -26 16 -18 24C-10 28 -2 16 0 6Z" fill="#8a5a2b" stroke="#2a1a12" stroke-width=".8"/>'
            '<circle cx="-22" cy="-10" r="2.4" fill="#f4ead8"/><circle cx="-13" cy="-13" r="1.4" fill="#f4ead8"/><circle cx="-12" cy="16" r="1.6" fill="#f4ead8"/>')
    return (f'<svg class="bfly {cls}" viewBox="-40 -34 80 66" aria-hidden="true"><g class="bw l">{wing}</g>'
            f'<g class="bw r"><g transform="scale(-1 1)">{wing}</g></g>'
            '<path d="M0 -8V14" stroke="#2a1a12" stroke-width="2.4" stroke-linecap="round"/>'
            '<path d="M0 -8C-2 -16 -6 -20 -9 -22M0 -8C2 -16 6 -20 9 -22" stroke="#2a1a12" stroke-width=".8" fill="none"/></svg>')

# ---------- diorama scene ----------
def meru(x, base, n, w0, col='#2a130f'):
    s = f'<g class="meru">'
    s += f'<path d="M{f(x-w0*.6)} {base}H{f(x+w0*.6)}V{base-26}H{f(x-w0*.6)}Z" fill="{col}" stroke="#e7cf94" stroke-width="1"/>'
    s += f'<path d="M{f(x-w0*.6)} {base-9}H{f(x+w0*.6)}M{f(x-w0*.6)} {base-18}H{f(x+w0*.6)}" stroke="#e7cf94" stroke-width=".7" opacity=".6"/>'
    y = base - 26
    for i in range(n):
        w = w0 * (1 - i * 0.62 / n)
        s += f'<path d="M{f(x-w*.36)} {f(y)}H{f(x+w*.36)}V{f(y-10)}H{f(x-w*.36)}Z" fill="{col}" stroke="#e7cf94" stroke-width=".8"/>'
        y -= 10
        s += (f'<path d="M{f(x-w-5)} {f(y+3)}Q{f(x-w)} {f(y)} {f(x-w*.5)} {f(y-11)}H{f(x+w*.5)}Q{f(x+w)} {f(y)} {f(x+w+5)} {f(y+3)}Q{f(x)} {f(y-3)} {f(x-w-5)} {f(y+3)}Z" '
              f'fill="{col}" stroke="#e7cf94" stroke-width="1"/>')
        s += f'<path d="M{f(x-w*.7)} {f(y-3)}H{f(x+w*.7)}" stroke="#c9a04e" stroke-width=".7" opacity=".7"/>'
        y -= 11
    s += f'<path d="M{f(x)} {f(y)}V{f(y-16)}" stroke="#e7cf94" stroke-width="1.6"/><circle cx="{f(x)}" cy="{f(y-18)}" r="2.4" fill="#e7cf94"/></g>'
    return s

def gate():
    # right half of a candi bentar (split gate); mirrored for the left half
    steps = [(26, 0), (26, 22), (36, 22), (36, 46), (48, 46), (48, 72), (62, 72), (62, 100), (78, 100), (78, 130), (96, 130), (96, 176)]
    top = 468
    d = f"M746 {top+176}V{top}"
    for (dx, dy) in steps:
        d += f"L{720+dx} {top+dy}"
    d += "Z"
    half = f'<path d="{d}" fill="#2a130f" stroke="#e7cf94" stroke-width="1.2" stroke-linejoin="round"/>'
    for (dx, dy) in [(36, 34), (48, 59), (62, 86), (78, 115), (96, 152)]:
        half += f'<path d="M749 {top+dy}H{720+dx-3}" stroke="#c9a04e" stroke-width=".8" opacity=".75"/>'
    half += f'<path d="M754 {top+140}v-22q8 -9 16 0v22z" fill="none" stroke="#c9a04e" stroke-width=".9"/>'
    half += f'<circle cx="762" cy="{top+92}" r="3" fill="none" stroke="#c9a04e" stroke-width=".9"/>'
    s = f'<g class="gate">{half}<g transform="translate(1440 0) scale(-1 1)">{half}</g>'
    for k in range(5):
        y = top + 150 + k * 7
        s += f'<path d="M{694 - k*5} {y}H{746 + k*5}" stroke="#e7cf94" stroke-width="1" opacity=".8"/>'
    s += '</g>'
    return s

def palm(x, base, h, lean, sc=1.0):
    tx, ty = x + lean, base - h
    s = f'<g class="palm"><path d="M{x} {base}Q{f(x+lean*.2)} {f(base-h*.55)} {f(tx)} {f(ty)}" fill="none" stroke="#1c0f0a" stroke-width="{f(7*sc)}" stroke-linecap="round"/>'
    s += f'<path d="M{x} {base}Q{f(x+lean*.2)} {f(base-h*.55)} {f(tx)} {f(ty)}" fill="none" stroke="#c9a04e" stroke-width="1" stroke-dasharray="1 9" opacity=".8"/>'
    s += f'<g transform="translate({f(tx)} {f(ty)})"><g class="fronds">'
    for a in (-168, -138, -108, -74, -44, -14, 16, 190):
        L = random.uniform(60, 82) * sc
        s += (f'<path transform="rotate({a})" d="M0 0Q{f(L*.5)} {f(-L*.34)} {f(L)} {f(L*.12)}Q{f(L*.5)} {f(-L*.1)} 0 0Z" '
              f'fill="#23301f" stroke="#c9a04e" stroke-width=".9"/>')
    s += f'<circle r="{f(4*sc)}" fill="#c9a04e"/></g></g></g>'
    return s

def wave(y0, amp, period, phase, close=True, x0=-20, x1=1460, step=20):
    pts = []
    x = x0
    while x <= x1:
        pts.append((x, y0 + amp * math.sin((x + phase) / period * 2 * math.pi) + amp * .4 * math.sin((x + phase * 2) / (period * .37) * 2 * math.pi)))
        x += step
    d = 'M' + ' L'.join(f"{f(px)} {f(py)}" for px, py in pts)
    if close:
        d += ' V840 H-20 Z'
    return d

def frangi(x, y, sc, i, stem):
    s = f'<g class="rise" style="--i:{i}"><path d="M{f(x)} 840Q{f(x+stem*.3)} {f((y+840)/2)} {f(x)} {f(y)}" fill="none" stroke="#3d4a2c" stroke-width="{f(2.6*sc)}"/>'
    for k, ty in enumerate((0.35, 0.6)):
        ly = y + (840 - y) * ty
        side = 1 if (k + i) % 2 else -1
        s += f'<path transform="translate({f(x+stem*.12)} {f(ly)}) rotate({-90 + side*55}) scale({f(sc)})" d="M0 0C12 -12 34 -9 44 0C34 9 12 12 0 0Z" fill="#4a5a36" stroke="#c9a04e" stroke-width=".8"/>'
    s += f'<g transform="translate({f(x)} {f(y)}) scale({f(sc)}) rotate({random.randint(0, 70)})">'
    s += ring(5, 'M0 0C-11 -9 -10 -25 0 -30C10 -25 11 -9 0 0Z', 'fill="#f6ecd9" stroke="#c9a04e" stroke-width="1"')
    s += ring(5, 'M0 0C-3 -5 -3 -12 0 -15C3 -12 3 -5 0 0Z', 'fill="#e3b54a" opacity=".85"')
    s += '</g></g>'
    return s

def bird(cls):
    return (f'<g class="bird {cls}"><g class="bird-in">'
            '<path d="M-22 2C-12 -5 6 -6 18 0L28 -3L21 4C12 10 -8 10 -22 2Z" fill="#f6ecd9" stroke="#c9a04e" stroke-width="1"/>'
            '<path d="M-22 2L-34 -2L-30 5Z" fill="#c9a04e"/>'
            '<g class="wing"><path d="M-6 0C-10 -16 0 -26 12 -28C7 -19 8 -9 6 0Z" fill="#b0655a" stroke="#f6ecd9" stroke-width=".9"/></g>'
            '<circle cx="17" cy="0" r="1.3" fill="#2a130f"/></g></g>')

def scene():
    s = '<svg class="diorama" viewBox="0 0 1440 820" preserveAspectRatio="xMidYMax slice" aria-hidden="true">'
    s += ('<defs><radialGradient id="sun" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#f6e2a8"/><stop offset=".7" stop-color="#e7b96a"/><stop offset="1" stop-color="#d99a56"/></radialGradient>'
          '<linearGradient id="mtn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a2a2c"/><stop offset="1" stop-color="#4a1519"/></linearGradient></defs>')
    # clouds
    s += '<g data-par="-0.10"><g class="drift d1" color="#f6e2a8"><use href="#cloud" x="120" y="150" width="210" height="106"/><use href="#cloud" x="1010" y="90" width="260" height="130"/></g>'
    s += '<g class="drift d2" color="#f6e2a8" opacity=".7"><use href="#cloud" x="420" y="70" width="150" height="76"/><use href="#cloud" x="1220" y="250" width="170" height="86"/><use href="#cloud" x="-30" y="300" width="190" height="96"/></g></g>'
    # sun
    s += '<g data-par="-0.06"><g class="sun"><circle cx="720" cy="470" r="196" fill="none" stroke="#f6e2a8" stroke-width="1" stroke-dasharray="2 10" opacity=".7"/><circle cx="720" cy="470" r="176" fill="none" stroke="#f6e2a8" stroke-width="1" opacity=".5"/><circle cx="720" cy="470" r="158" fill="url(#sun)"/></g></g>'
    # mountain
    s += '<g data-par="-0.035"><path d="M250 660L500 440Q560 388 606 376L646 356Q662 348 676 354L702 346Q722 340 742 352L770 349Q790 352 802 366L842 386Q890 408 940 458L1190 660Z" fill="url(#mtn)" stroke="#e7cf94" stroke-width="1.2"/>'
    for k in range(13):
        x1 = 640 + k * 14
        x2 = 400 + k * 62
        s += f'<path d="M{x1} {372 + abs(k-6)*2}Q{f((x1+x2)/2 + (k-6)*4)} {500} {x2} 650" fill="none" stroke="#e7cf94" stroke-width=".7" opacity=".32"/>'
    s += '<path d="M646 356q30 16 56 2q22 12 40 -6q24 14 60 14" fill="none" stroke="#f6ecd9" stroke-width="1" opacity=".7"/>'
    s += '<path d="M40 660L190 560Q230 536 262 548L330 600L400 660Z M1100 660L1230 572Q1270 550 1300 566L1420 660Z" fill="#5a1d21" stroke="#e7cf94" stroke-width="1" opacity=".9"/></g>'
    # hills + temple
    s += f'<g data-par="-0.015"><path d="{wave(640, 10, 520, 60)}" fill="#3d1014" stroke="#c9a04e" stroke-width="1"/>'
    s += meru(520, 648, 7, 30) + meru(596, 650, 5, 25) + meru(920, 648, 7, 30) + meru(844, 650, 5, 25)
    s += gate()
    s += palm(250, 668, 190, 26) + palm(330, 672, 140, -18, .8) + palm(1140, 668, 170, -24, .9) + palm(1220, 672, 210, 20) + palm(1040, 664, 110, 14, .65) + palm(420, 664, 100, -10, .6)
    s += '</g>'
    # terraces
    s += f'<g data-par="0.02"><path d="{wave(690, 14, 640, 200)}" fill="#2e1512" stroke="#c9a04e" stroke-width="1"/>'
    for k in range(4):
        s += f'<path d="{wave(706 + k*13, 14 - k*2, 640, 200 + k*30, False)}" fill="none" stroke="#c9a04e" stroke-width=".8" opacity="{f(.55 - k*.1)}"/>'
    s += '</g>'
    s += f'<g data-par="0.05"><path d="{wave(752, 16, 760, 500)}" fill="#1c0f0a" stroke="#c9a04e" stroke-width="1"/>'
    for k in range(3):
        s += f'<path d="{wave(768 + k*13, 15 - k*3, 760, 520 + k*40, False)}" fill="none" stroke="#c9a04e" stroke-width=".8" opacity="{f(.5 - k*.12)}"/>'
    s += '</g>'
    # foreground: gunungan + flowers
    s += '<g data-par="0.08">'
    s += '<g class="rise big" style="--i:1" color="#e7cf94"><use href="#gunungan" x="470" y="560" width="170" height="255" style="--gfill:#4a1519"/></g>'
    s += '<g class="rise big" style="--i:2" color="#e7cf94"><use href="#gunungan" x="800" y="560" width="170" height="255" style="--gfill:#4a1519"/></g>'
    s += '<g class="rise big" style="--i:3" color="#e7cf94"><use href="#gunungan" x="386" y="640" width="120" height="180" style="--gfill:#2a130f"/></g>'
    s += '<g class="rise big" style="--i:4" color="#e7cf94"><use href="#gunungan" x="934" y="640" width="120" height="180" style="--gfill:#2a130f"/></g>'
    xs = [40, 110, 190, 280, 350, 648, 720, 792, 1090, 1160, 1250, 1330, 1400, 560, 880]
    for i, x in enumerate(xs):
        s += frangi(x + random.randint(-12, 12), random.randint(700, 772), random.uniform(.9, 1.5), 3 + i, random.randint(-40, 40))
    s += '</g>'
    s += bird('b1') + bird('b2') + bird('b3')
    s += '</svg>'
    return s

MAP = '''<svg viewBox="0 0 800 480" role="img" aria-label="Animated map of Bali with a route from Uluwatu through Seminyak and Canggu to Ubud">
  <rect width="800" height="480" fill="url(#sea)"/>
  <g class="map-waves" fill="none" stroke="#2b3a6b" stroke-width="1" opacity=".5">
    <path d="M40 60q14 -12 28 0t28 0M610 440q14 -12 28 0t28 0M400 440q14 -12 28 0t28 0M690 320q14 -12 28 0t28 0M50 236q14 -12 28 0t28 0M560 46q14 -12 28 0t28 0M690 60q14 -12 28 0t28 0"/>
  </g>
  <text class="map-title" x="104" y="318">Bali</text>
  <text class="map-sub" x="107" y="338">8.65&#176; S &#183; 115.22&#176; E</text>
  <g class="island">
    <path class="isl-shadow" d="@@BALI@@" transform="translate(5 7)"/>
    <path class="isl" d="@@BALI@@"/>
    <path class="isl-pat" d="@@BALI@@"/>
    <path class="isl-line" pathLength="1" d="@@BALI@@"/>
    <path class="isl" d="M590 388C600 370 640 366 664 380C676 390 668 408 648 412C624 418 596 410 590 388Z"/>
    <path class="isl-pat" d="M590 388C600 370 640 366 664 380C676 390 668 408 648 412C624 418 596 410 590 388Z"/>
    <circle class="isl" cx="577" cy="371" r="7"/>
  </g>
  <g class="mount" transform="translate(648 198)"><path d="M-22 16L-7 -10Q0 -15 7 -10L22 16Z"/><path d="M-9 4L-4 -6M0 6V-8M9 4L4 -6" class="hatch"/><text y="30" text-anchor="middle">Mt Agung</text></g>
  <g class="mount" transform="translate(566 152)"><path d="M-17 12L-5 -8Q0 -12 5 -8L17 12Z"/><path d="M-6 3L-3 -4M6 3L3 -4" class="hatch"/><text y="-16" text-anchor="middle">Mt Batur</text></g>
  @@COMPASS@@
  <path id="route" class="route-bg" d="M436 418C448 404 462 386 458 366C456 356 452 350 448 342C440 334 430 328 420 322C450 304 490 284 520 262"/>
  <path class="route" pathLength="1" d="M436 418C448 404 462 386 458 366C456 356 452 350 448 342C440 334 430 328 420 322C450 304 490 284 520 262"/>
  @@PINS@@
  <g id="marker" class="marker"><circle r="13" class="m-ring"/><circle r="5.5" class="m-core"/></g>
</svg>'''
BALI = ("M48 132C90 112 140 106 200 100C270 92 320 86 380 86C450 84 520 90 580 104C640 118 694 142 730 186"
        "C748 210 734 232 704 244C664 258 632 272 602 292C572 312 550 320 530 332C514 344 502 354 494 368"
        "C490 378 498 388 510 398C522 412 510 430 488 434C464 438 438 432 432 416C428 402 446 394 460 382"
        "C466 374 464 362 456 352C442 334 418 324 394 314C340 296 300 282 262 262C210 236 160 214 120 186C92 168 62 150 48 132Z")
PINS = pin(436, 418, 'Uluwatu', -16, 'end') + pin(448, 342, 'Seminyak', 16) + pin(420, 322, 'Canggu', -16, 'end') + pin(520, 262, 'Ubud', 16, 'start', True)
MAP = MAP.replace('@@BALI@@', BALI).replace('@@COMPASS@@', compass()).replace('@@PINS@@', PINS)

import os
HERE = os.path.dirname(os.path.abspath(__file__))
TEMPLATE = sys.argv[2] if len(sys.argv) > 2 else 'template.html'
tpl = open(os.path.join(HERE, TEMPLATE)).read()
html = (tpl.replace('@@HALO@@', halo()).replace('@@MEDALLION@@', medallion()).replace('@@MAP@@', MAP)
        .replace('@@VINE_A@@', VINE_A).replace('@@VINE_B@@', VINE_B).replace('@@SCENE@@', scene())
        .replace('@@BFLY1@@', butterfly(0, 0, 1, 'bf1')).replace('@@BFLY2@@', butterfly(0, 0, 1, 'bf2')))
assert '@@' not in html, [l for l in html.split('\n') if '@@' in l][:3]
open(OUT, 'w').write(html)
print(OUT, len(html) // 1024, 'KB')
