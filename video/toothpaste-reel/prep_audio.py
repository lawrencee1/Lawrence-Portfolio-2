# Prepares the audio: adds a beat of silence around "Sugar.", shifts the word
# timings to match, and trims the sound effects. Run: python3 prep_audio.py
import json, subprocess
A = "assets/audio/"
CUTS = [(30.8, 0.3), (31.75, 0.7)]   # (time in raw VO, silence to insert)
def run(*a): subprocess.run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", *a], check=True)
# voiceover with inserted silences
parts, prev = [], 0
flt = ""
for i, (t, d) in enumerate(CUTS + [(None, 0)]):
    seg = f"[0:a]atrim={prev}:{t},asetpts=PTS-STARTPTS[a{i}];" if t else f"[0:a]atrim=start={prev},asetpts=PTS-STARTPTS[a{i}];"
    flt += seg; parts.append(f"[a{i}]")
    if t:
        flt += f"anullsrc=r=44100:cl=mono,atrim=0:{d}[s{i}];"; parts.append(f"[s{i}]"); prev = t
flt += "".join(parts) + f"concat=n={len(parts)}:v=0:a=1,loudnorm=I=-15:TP=-1.5:LRA=11,aresample=48000[o]"
run("-i", A + "vo.mp3", "-filter_complex", flt, "-map", "[o]", "-c:a", "pcm_s16le", A + "vo_final.wav")
# shifted words
words = []
for w in json.load(open(A + "words_raw.json"))["words"]:
    if w.get("type") != "word" or w["text"] == "...": continue
    sh = sum(d for t, d in CUTS if w["start"] >= t)
    words.append({"w": w["text"], "s": round(w["start"] + sh, 3), "e": round(w["end"] + sh, 3)})
json.dump(words, open("words.json", "w"))
# trimmed sound effects (seconds kept)
for name, dur in [("whoosh", 0.5), ("squish", 0.9), ("register", 1.2), ("scratch", 0.9), ("trombone", 1.9), ("boom", 1.04)]:
    run("-i", A + name + ".mp3", "-t", str(dur), "-af", f"afade=t=out:st={dur-0.15}:d=0.15,aresample=48000", "-c:a", "pcm_s16le", A + "sfx_" + name + ".wav")
print(len(words), "words; last ends", words[-1]["e"])
