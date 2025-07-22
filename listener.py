from vosk import Model, KaldiRecognizer
import pyaudio, json, sys

grammar = ["shutdown", "close", "exit", "quit", "firefox", "open", "settings", "codes", "sleep", "pause", "play", "volume", "down", "up", "scroll", "code", "terminal", "explorer", "mute", "un mute"]

model = Model("vosk-model-small-en-us-0.15")  # put your model folder here
rec = KaldiRecognizer(model, 16000, json.dumps(grammar)) 

p = pyaudio.PyAudio()
stream = p.open(format=pyaudio.paInt16, channels=1, rate=16000,
                input=True, frames_per_buffer=8000)
stream.start_stream()

print("ready", flush=True)  # just to signal we're ready

while True:
    data = stream.read(4000, exception_on_overflow=False)
    if rec.AcceptWaveform(data):
        result = json.loads(rec.Result())
        print(result.get("text", ""), flush=True)




