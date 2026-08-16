const micButton = document.getElementById('mic-button');
const statusText = document.getElementById('status-text');
const listeningRings = document.getElementById('listening-rings');
const transcript = document.getElementById('transcript');
const clearBtn = document.getElementById('clear-btn');

let isListening = false;

function appendTranscript(text) {
  const placeholder = transcript.querySelector('[data-placeholder]');
  if (placeholder) placeholder.remove();

  const message = document.createElement('div');
  message.className = 'mb-4';

  const time = document.createElement('div');
  time.className = 'mb-2 text-xs text-slate-500';
  time.textContent = new Date().toLocaleTimeString();

  const line = document.createElement('p');
  line.className = 'leading-relaxed text-slate-100';
  line.textContent = text;

  message.appendChild(time);
  message.appendChild(line);
  transcript.appendChild(message);
  transcript.scrollTop = transcript.scrollHeight;
}

window.assistant.onTranscript((text) => {
  appendTranscript(text);
});

micButton.addEventListener('click', () => {
  isListening = !isListening;

  if (isListening) {
    micButton.classList.add('listening');
    statusText.textContent = 'Listening...';
    listeningRings.classList.remove('hidden');
  } else {
    micButton.classList.remove('listening');
    statusText.textContent = 'Tap to start listening';
    listeningRings.classList.add('hidden');
  }
});

clearBtn.addEventListener('click', () => {
  transcript.innerHTML = '<p data-placeholder class="py-8 text-center text-sm italic text-slate-500">Your conversation will appear here...</p>';
});

document.getElementById('save-btn').addEventListener('click', () => {
  alert('Save functionality would be implemented here');
});

document.getElementById('settings-btn').addEventListener('click', () => {
  alert('Settings functionality would be implemented here');
});
