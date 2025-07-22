

window.assistant.onTranscript((text) => {
  const box = document.getElementById('transcript');
  box.textContent = text;
});
