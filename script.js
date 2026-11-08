(() => {
  const intro = document.getElementById("intro");
  const countdown = document.getElementById("countdown");
  const scare = document.getElementById("scare");
  const number = document.getElementById("number");
  let timer = null;
  let audioContext = null;

  document.getElementById("start").addEventListener("click", () => {
    intro.hidden = true;
    countdown.hidden = false;
    let remaining = 5;
    number.textContent = remaining;

    // Prepare a short, synthesized spooky sound after the user's click.
    // It is intentionally brief and not extremely loud.
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) audioContext = new AudioCtx();
    } catch (_) { audioContext = null; }

    timer = window.setInterval(() => {
      remaining -= 1;
      number.textContent = remaining;
      if (remaining <= 0) {
        window.clearInterval(timer);
        countdown.hidden = true;
        scare.hidden = false;
        playSound();
      }
    }, 1000);
  });

  document.getElementById("cancel").addEventListener("click", reset);
  document.getElementById("again").addEventListener("click", reset);

  function reset() {
    if (timer) window.clearInterval(timer);
    timer = null;
    scare.hidden = true;
    countdown.hidden = true;
    intro.hidden = false;
    if (audioContext && audioContext.state === "running") audioContext.suspend();
  }

  function playSound() {
    if (!audioContext) return;
    audioContext.resume().then(() => {
      const now = audioContext.currentTime;
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();
      oscillator.type = "sawtooth";
      oscillator.frequency.setValueAtTime(180, now);
      oscillator.frequency.exponentialRampToValueAtTime(620, now + 0.12);
      oscillator.frequency.exponentialRampToValueAtTime(95, now + 0.55);
      filter.type = "lowpass";
      filter.frequency.value = 1300;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);
      oscillator.connect(filter);
      filter.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.7);
    }).catch(() => {});
  }
})();
