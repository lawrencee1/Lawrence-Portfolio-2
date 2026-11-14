# Synthesizes a simple sound track (pops, typing, chime, soft pad) timed to scene.html.
# Usage: python3 audio.py out/audio.wav
import sys, wave
import numpy as np

SR, DUR = 44100, 21.5
rs = np.random.RandomState(4)
out = np.zeros(int(SR * DUR))

def add(t, sig, gain=1.0):
    i = int(t * SR); n = min(len(sig), len(out) - i)
    if n > 0: out[i:i + n] += sig[:n] * gain

def tone(f0, f1, dur, decay):
    t = np.arange(int(SR * dur)) / SR
    f = f0 + (f1 - f0) * (t / dur)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * decay) * np.minimum(1, t * 400)

def pop(pitch=1.0): return tone(520 * pitch, 880 * pitch, 0.16, 26)
def click():
    n = int(SR * 0.03); return rs.randn(n) * np.exp(-np.arange(n) / SR * 220)
def bell(f, dur=1.2): return tone(f, f, dur, 4) + 0.4 * tone(f * 2.01, f * 2.01, dur, 7)
def whoosh(dur=0.5):
    n = int(SR * dur); x = np.cumsum(rs.randn(n)); x -= np.linspace(x[0], x[-1], n)
    x = np.diff(x, prepend=0) * 0.5 + x / (np.abs(x).max() + 1e-9) * 0.5
    return x * np.sin(np.linspace(0, np.pi, n)) ** 2

# soft pad: C - Am - F - G, 3 voices
for k, chord in enumerate([(261.6, 329.6, 392.0), (220.0, 261.6, 329.6), (174.6, 220.0, 261.6), (196.0, 246.9, 293.7)] * 2):
    d = DUR / 8; t = np.arange(int(SR * (d + 0.4))) / SR
    env = np.minimum(1, t / 0.5) * np.minimum(1, (d + 0.4 - t) / 0.5)
    add(k * d, sum(np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * f * 2 * t) for f in chord) * env, 0.035)

add(0.0, whoosh(0.8), 0.3)
for i, t in enumerate([0.6, 1.15, 1.7, 2.25, 2.8]):                                    # notifications fly out of the phone
    add(t - 0.05, tone(150, 150, 0.18, 14), 0.35); add(t + 0.05, pop(1 + i * 0.1), 0.45); add(t, whoosh(0.4), 0.2)
add(4.1, whoosh(1.0), 0.45)                                                            # cursor darts off, whip to the room
add(5.0, whoosh(1.3), 0.3)                                                             # swoop across the room
add(6.35, whoosh(0.5), 0.4)
t = 6.8
while t < 9.2:                                                                         # working
    add(t, click(), 0.10 + rs.rand() * 0.06); t += 0.055 if rs.rand() > 0.12 else 0.18
add(8.0, whoosh(0.5), 0.3)
for i, f in enumerate([783.99, 1046.5]): add(9.2 + i * 0.1, bell(f, 0.8), 0.22)        # export done
add(9.4, whoosh(0.6), 0.35); add(9.5, pop(1.2), 0.4)                                   # publish button appears
add(10.5, click(), 0.6); add(10.5, tone(180, 60, 0.3, 9), 0.7)                         # click
add(10.6, whoosh(0.9), 0.5)
for i, f in enumerate([523.25, 659.25, 783.99, 1046.5, 1318.5]): add(10.66 + i * 0.07, bell(f, 1.6), 0.2)
for i, t in enumerate([12.4, 12.9, 13.4]): add(t, pop(1.5 + i * 0.1), 0.4)             # replies
for i, t in enumerate([15.35, 16.1, 16.85, 17.6]): add(t, tone(110, 45, 0.25, 12), 0.75); add(t, click(), 0.35)   # type cards hit
add(18.3, whoosh(0.5), 0.3)
for i, f in enumerate([523.25, 783.99, 1046.5]): add(18.5 + i * 0.09, bell(f, 2.2), 0.2)

fade = int(SR * 0.6); out[-fade:] *= np.linspace(1, 0, fade)
out = np.tanh(out * 1.2) * 0.9
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((out * 32767).astype(np.int16).tobytes())
