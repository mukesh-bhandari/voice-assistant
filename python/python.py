import whisper
import sounddevice as sd
import numpy as np
import tempfile
import os
import sys
import time
import wave

model = whisper.load_model("base")  # or "small", "medium", "large"

SAMPLE_RATE = 16000
CHANNELS = 1
DURATION = 5  # seconds per chunk

def record_chunk(filename):
    print("Recording...", file=sys.stderr)
    audio = sd.rec(int(SAMPLE_RATE * DURATION), samplerate=SAMPLE_RATE, channels=CHANNELS, dtype='int16')
    sd.wait()

    with wave.open(filename, 'wb') as wf:
        wf.setnchannels(CHANNELS)
        wf.setsampwidth(2)  # 16-bit = 2 bytes
        wf.setframerate(SAMPLE_RATE)
        wf.writeframes(audio.tobytes())

while True:
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        tmp_filename = tmp.name

    record_chunk(tmp_filename)

    print("🧠 Transcribing...", file=sys.stderr)
    result = model.transcribe(tmp_filename)
    os.unlink(tmp_filename)

    text = result.get("text", "").strip()
    if text:
        print(text)
        sys.stdout.flush()
