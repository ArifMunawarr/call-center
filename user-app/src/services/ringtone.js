let audioContext = null;
let oscillator = null;
let gainNode = null;
let ringbackInterval = null;

export function playRingback() {
  stopRingback();

  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  gainNode = audioContext.createGain();
  gainNode.connect(audioContext.destination);
  gainNode.gain.value = 0;

  const playTone = () => {
    if (!audioContext || audioContext.state === "closed") return;

    oscillator = audioContext.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.value = 480;
    oscillator.connect(gainNode);

    const now = audioContext.currentTime;

    // Ringback pattern: long tone, pause
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.2, now + 0.05);
    gainNode.gain.setValueAtTime(0.2, now + 1.0);
    gainNode.gain.linearRampToValueAtTime(0, now + 1.05);

    oscillator.start(now);
    oscillator.stop(now + 1.2);
  };

  playTone();
  ringbackInterval = setInterval(playTone, 3000);
}

export function stopRingback() {
  if (ringbackInterval) {
    clearInterval(ringbackInterval);
    ringbackInterval = null;
  }
  if (oscillator) {
    try { oscillator.stop(); } catch (e) { /* already stopped */ }
    oscillator = null;
  }
  if (audioContext && audioContext.state !== "closed") {
    audioContext.close();
    audioContext = null;
  }
  gainNode = null;
}
