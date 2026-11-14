# Synthesizes a simple sound track (pops, typing, chime, soft pad) timed to scene.html.
# Usage: python3 audio.py out/audio.wav
import sys, wave
import numpy as np

SR, DUR = 44100, 24.5
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

for i, t in enumerate([3.5, 4.5, 5.5, 6.5]): add(t, pop(1 + i * 0.12), 0.5)          # client messages
add(8.05, whoosh(0.6), 0.25)                                                          # turn to the laptop
t = 9.3
while t < 14.7:                                                                       # typing
    add(t, click(), 0.10 + rs.rand() * 0.06); t += 0.059 if rs.rand() > 0.12 else 0.2
for i, f in enumerate([783.99, 1046.5]): add(15.5 + i * 0.12, bell(f), 0.3)           # export done
for i, t in enumerate([16.45, 16.8, 17.15]): add(t, whoosh(0.45), 0.3); add(t + 0.5, pop(1.3 + i * 0.15), 0.4)
for i, t in enumerate([18.7, 19.3, 19.9]): add(t, pop(1.5 + i * 0.1), 0.4)            # replies
for i, f in enumerate([523.25, 659.25, 783.99, 1046.5]): add(22.0 + i * 0.09, bell(f, 2.0), 0.22)

fade = int(SR * 0.6); out[-fade:] *= np.linspace(1, 0, fade)
out = np.tanh(out * 1.2) * 0.9
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((out * 32767).astype(np.int16).tobytes())
