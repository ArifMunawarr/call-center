let audioContext = null;
let gainNode = null;
let ringtoneTimeout = null;
let isPlaying = false;
let activeOscillators = []; // track all running oscillators
let _unlocked = false;

export function isAudioUnlocked() {
  return _unlocked;
}

function ensureAudioContext() {
  if (!audioContext || audioContext.state === "closed") {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    gainNode = null;
  }
  if (!gainNode && audioContext.state !== "closed") {
    gainNode = audioContext.createGain();
    gainNode.connect(audioContext.destination);
    gainNode.gain.value = 0;
  }
  return audioContext;
}

export async function unlockRingtoneAudio() {
  if (_unlocked) return;
  try {
    const ctx = ensureAudioContext();
    if (ctx.state === "suspended") await ctx.resume();
    // Play a silent buffer to fully unlock
    const buf = ctx.createBuffer(1, 1, ctx.sampleRate);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    src.start();
    _unlocked = true;
  } catch (_err) {}
}

function killOscillators() {
  activeOscillators.forEach((osc) => {
    try { osc.disconnect(); } catch (_e) {}
    try { osc.stop(); } catch (_e) {}
  });
  activeOscillators = [];
}

// Play a single "kring" burst: two quick tones that mimic a classic phone bell
function playBurst() {
  if (!audioContext || audioContext.state === "closed" || !gainNode) return;

  killOscillators();

  const now = audioContext.currentTime;

  // --- Bell hit 1 ---
  const osc1 = audioContext.createOscillator();
  const osc1b = audioContext.createOscillator();
  osc1.type = "sine";
  osc1b.type = "sine";
  osc1.frequency.value = 480;
  osc1b.frequency.value = 620;
  osc1.connect(gainNode);
  osc1b.connect(gainNode);

  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.25, now + 0.02);
  gainNode.gain.setValueAtTime(0.25, now + 0.4);
  gainNode.gain.linearRampToValueAtTime(0, now + 0.45);

  osc1.start(now);
  osc1b.start(now);
  osc1.stop(now + 0.5);
  osc1b.stop(now + 0.5);

  // --- Bell hit 2 (slightly delayed) ---
  const osc2 = audioContext.createOscillator();
  const osc2b = audioContext.createOscillator();
  osc2.type = "sine";
  osc2b.type = "sine";
  osc2.frequency.value = 480;
  osc2b.frequency.value = 620;
  osc2.connect(gainNode);
  osc2b.connect(gainNode);

  gainNode.gain.linearRampToValueAtTime(0.25, now + 0.55);
  gainNode.gain.setValueAtTime(0.25, now + 0.95);
  gainNode.gain.linearRampToValueAtTime(0, now + 1.0);

  osc2.start(now + 0.5);
  osc2b.start(now + 0.5);
  osc2.stop(now + 1.05);
  osc2b.stop(now + 1.05);

  activeOscillators.push(osc1, osc1b, osc2, osc2b);
}

function scheduleLoop() {
  if (!isPlaying) return;
  playBurst();
  ringtoneTimeout = setTimeout(() => scheduleLoop(), 3000);
}

export function playRingtone() {
  stopRingtone();

  audioContext = ensureAudioContext();
  if (audioContext.state === "suspended") {
    audioContext.resume().catch(() => {});
  }

  isPlaying = true;
  scheduleLoop();
}

export function stopRingtone() {
  isPlaying = false;
  if (ringtoneTimeout) {
    clearTimeout(ringtoneTimeout);
    ringtoneTimeout = null;
  }
  killOscillators();
  if (gainNode && audioContext && audioContext.state !== "closed") {
    try {
      gainNode.gain.cancelScheduledValues(audioContext.currentTime);
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    } catch (_err) {}
  }
}
