# Voice Assistant — Project Review

> A living review of the project, updated to reflect the current codebase (2026-08-16).

---

## 1. Project Overview

A desktop voice assistant that listens to spoken commands and performs system actions (open/close apps, control volume, quit). Built as an **Electron** shell around a **Python** speech-recognition backend.

| Layer | Technology |
|-------|------------|
| Desktop shell | Electron 36.9.5 (`src/main.js`) |
| Speech recognition | Python + Vosk (`python/listener.py`) |
| UI | HTML + Tailwind CSS (`src/renderer/index.html`, `src/input.css`) |
| System control | `exec`, `taskkill`, PowerShell, `nircmd.exe` |
| Alternate recognizer | Whisper (`python/python.py`, dormant) |

### Architecture Flow

```
python/listener.py (Vosk, mic in)
      │  prints recognized text to stdout
      ▼
src/main.js  (spawns listener, reads stdout)
      │  matches text against hardcoded command rules
      ├─► exec("start firefox" / "code" / ...)        open apps
      ├─► taskkill /PID <pid> /F                       close apps
      ├─► nircmd.exe changesysvolume / mutesysvolume   volume
      ├─► webContents.send("transcript", text)          update UI
      └─► app.quit()                                   quit
```

### Project Layout

```
├── src/
│   ├── main.js              Electron main process
│   ├── preload.js           contextBridge → assistant.onTranscript
│   ├── input.css            Tailwind source (@theme + custom animations)
│   └── renderer/
│       ├── index.html       UI markup (Tailwind utility classes)
│       └── renderer.js      UI logic (transcript, buttons)
├── python/
│   ├── listener.py          Vosk recognizer
│   ├── python.py            Experimental Whisper recognizer
│   └── testdevice.py        Audio device lister (debug)
├── index.css                Generated Tailwind output (build artifact)
└── package.json / README.md / review.md / requirements.txt / .gitignore
```

---

## 2. Current Status

### Working ✅
- App launches and opens a 500×400 window
- Python listener spawns (venv-aware) and recognizes speech via Vosk
- Recognized text is sent to the UI and rendered in the transcript (IPC wired)
- `open firefox/code/explorer/terminal/settings` works
- `close firefox/code/terminal/explorer` works (LIFO PID tracking)
- `volume up` / `volume down` / `mute` / `unmute` work (via `nircmd.exe`)
- `quit` exits the app
- UI buttons (mic toggle, Clear) functional; CSP no longer blocks scripts
- Tailwind CSS pipeline working (`npm run build:css` → `index.css`)

### Placeholder / Not Yet Implemented ⚠️
- Mic button toggles a cosmetic "listening" state — does not start/stop the Python listener (which runs continuously)
- Save / Settings buttons are `alert()` stubs
- Grammar words `shutdown`, `exit`, `sleep`, `pause`, `play`, `scroll`, `codes` have no command handlers yet (planned features)

---

## 3. File-by-File Review

| File | Role | Condition |
|------|------|-----------|
| `src/main.js` | Electron main process; spawns listener, dispatches commands, forwards transcripts | Works |
| `src/preload.js` | `contextBridge` → `assistant.onTranscript` | Works (event now emitted) |
| `src/renderer/index.html` | UI markup using Tailwind utilities | Works |
| `src/renderer/renderer.js` | Transcript rendering + button handlers | Works (loaded via `<script defer>`) |
| `src/input.css` | Tailwind source (`@theme` custom animations) | Works |
| `index.css` | Generated Tailwind output | Works (build artifact) |
| `python/listener.py` | Vosk recognizer with grammar list | Works; several grammar words unused by JS |
| `python/python.py` | Whisper-based recognizer (chunked) | Dormant/experimental |
| `python/testdevice.py` | Lists audio input devices | Debug helper |
| `requirements.txt` | Python deps | Complete (`vosk`, `pyaudio`, `openai-whisper`, `sounddevice`, `numpy`) |
| `nircmd.exe` | Volume/mute control | Present locally, gitignored (documented in README) |
| `README.md` | Setup, commands, structure | Documented (Vosk model, nircmd, venv, run) |

---

## 4. Environment Verification

Verified working on this machine (Windows, `win32`):

| Item | Status | Details |
|------|--------|---------|
| Node.js | ✅ | v22.14.0 |
| npm | ✅ | 10.9.2 |
| Electron | ✅ | 36.9.5 in `node_modules` |
| Tailwind CLI | ✅ | `@tailwindcss/cli` 4.3.3 |
| Python venv (`venv/`) | ✅ | `vosk` + `pyaudio 0.2.14` installed |
| Vosk model | ✅ | `vosk-model-small-en-us-0.15/am/final.mdl` present |
| `nircmd.exe` | ✅ (local only) | present, 119 KB, not in git |

---

## 5. Resolved Issues

The following were identified during review and have since been fixed:

| # | Issue | Resolution |
|---|-------|------------|
| 1 | Transcript never reached the UI | `src/main.js:137` now sends `transcript` IPC to the renderer |
| 2 | `renderer.js` orphaned (never loaded) | `src/renderer/index.html` loads it via `<script src="renderer.js" defer>` |
| 3 | CSP blocked inline scripts | Inline `<script>` moved into `src/renderer/renderer.js` |
| 4 | `unmute` command never fired | Grammar/handler aligned to `unmute` (`src/main.js:150`) |
| 8 | Tailwind/PostCSS unused | Tailwind v4 adopted; `tailwind.config.js` / `postcss.config.mjs` removed |
| 9 | Incomplete `requirements.txt` | Added `openai-whisper`, `sounddevice`, `numpy` |
| 10 | Undocumented Windows deps | README now documents `nircmd.exe`, Vosk model, and setup |

---

## 6. Open Issues & Future Work

### Issue A — Mic button is cosmetic (Medium)
Toggling the mic button only flips a CSS state; the Python listener runs continuously from launch. No start/stop IPC exists.
- **Files:** `src/renderer/renderer.js:34-46`, `src/main.js:131`
- **Suggested fix:** add `ipcRenderer.send('mic-toggle')` → main process spawn/kill the listener.

### Issue B — Save / Settings are stubs (Low)
Both buttons call `alert()` placeholders.
- **Files:** `src/renderer/renderer.js:52-57`

### Issue C — Grammar words without handlers (Feature backlog)
`shutdown`, `exit`, `sleep`, `pause`, `play`, `scroll`, `codes` are recognized by Vosk but have no dispatcher logic. To be implemented as features (not treated as bugs).
- **Files:** `python/listener.py:4`, `src/main.js:138-152`

### Gap D — No tests, no packaging (Low)
`package.json` `test` script is a stub. No `electron-builder`/`electron-forge` config or distribution output.
- **Files:** `package.json:9`

---

## 7. Security Notes

| Area | Status | Comment |
|------|--------|---------|
| `nodeIntegration` | ✅ disabled | `src/main.js:20` |
| `contextIsolation` | ✅ enabled | `src/main.js:21` |
| CSP | ✅ fixed | `script-src 'self'`; no inline scripts remain |
| Sandbox | ⚠️ not set | `sandbox` defaults vary; consider explicit `sandbox: true` |
| `exec` usage | ⚠️ unvalidated | Command values are hardcoded and text is matched with strict equality — no injection risk today; keep it that way |
| Windows-only deps | ⚠️ by design | `nircmd.exe`, `start`, `taskkill`, PowerShell, `venv\Scripts\python.exe` |

---

## 8. Recommended Next Steps (Prioritized)

1. **Connect the mic button** to real start/stop of the Python listener (Issue A).
2. **Implement Save/Settings** or remove the buttons (Issue B).
3. **Add handlers for the remaining grammar words** (`shutdown`/`exit` → quit, media play/pause, scroll, etc.) (Issue C).
4. **Add tests + packaging** when the feature set stabilizes (Gap D).
5. **Consider `sandbox: true`** for the renderer.
