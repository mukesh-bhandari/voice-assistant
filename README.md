<div align="center">

# Voice Assistant (Under Development)

A modern, user-friendly app that recognizes voice or text commands and performs tasks accordingly — designed to make device interaction faster, smarter, and more intuitive.

</div>

### Main Features

- Easy and intuitive commands
- Run your custom scripts (upcoming)
- Customizable wordset

### Screenshots

<img width="1892" height="1068" alt="Screenshot 2025-07-29 164015" src="https://github.com/user-attachments/assets/9ad65a9c-1252-4ea1-9a2b-1999fd3b0204" />

---

## Requirements

- **Windows** (uses `nircmd.exe`, `start`, `taskkill`, PowerShell)
- **Node.js** 18+ and npm
- **Python** 3.8+ (with `pip`)

## Setup

### 1. Install Node dependencies

```bash
npm install
```

### 2. Set up the Python environment

```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

> The app auto-detects `venv\Scripts\python.exe`; otherwise it falls back to `python` on PATH.

### 3. Download the Vosk model

Download **`vosk-model-small-en-us-0.15`** from [Vosk models](https://alphacephei.com/vosk/models) and extract it into the project root so that `vosk-model-small-en-us-0.15/am/final.mdl` exists.

### 4. Download `nircmd.exe`

Volume controls require **NirCmd**. Download `nircmd.exe` from the [NirSoft website](https://www.nirsoft.net/utils/nircmd.html) and place it in the project root.

> `nircmd.exe` is gitignored, so each new clone needs to fetch it manually.

### 5. Run

```bash
npm start
```

---

## Voice Commands

| Command | Action |
|---------|--------|
| `open firefox` | Opens Firefox |
| `open code` | Opens VS Code |
| `open explorer` | Opens File Explorer |
| `open terminal` | Opens Command Prompt |
| `open settings` | Opens Windows Settings |
| `close firefox/code/explorer/terminal` | Closes the most recent instance |
| `volume up` / `volume down` | Adjusts system volume |
| `mute` / `unmute` | Mutes / unmutes system audio |
| `quit` | Exits the app |

---

## Project Structure

| File | Purpose |
|------|---------|
| `src/main.js` | Electron main process — spawns listener, dispatches commands |
| `src/preload.js` | Bridge between main process and UI |
| `src/renderer/index.html` | UI markup |
| `src/renderer/renderer.js` | UI logic (transcript rendering, buttons) |
| `src/input.css` | Tailwind source (compiled to `index.css`) |
| `index.css` | Generated Tailwind output |
| `python/listener.py` | Vosk speech recognition |
| `python/python.py` | Experimental Whisper-based recognizer |
| `python/testdevice.py` | Lists audio input devices (debug helper) |

See `review.md` for a full code review and known issues.
