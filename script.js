(() => {
  const intro = document.getElementById("intro");
  const waiting = document.getElementById("waiting");
  const reveal = document.getElementById("reveal");
  const timerText = document.getElementById("timer");
  const progress = document.getElementById("progress");
  const progressWrap = document.querySelector(".progress");
  let interval = null;
  let remaining = 5;
  let audioContext = null;

  document.getElementById("start").addEventListener("click", start);
  document.getElementById("cancel").addEventListener("click", reset);
  document.getElementById("again").addEventListener("click", reset);

  function start() {
    intro.hidden = true;
    reveal.hidden = true;
    waiting.hidden = false;
    remaining = 5;
    timerText.textContent = "05";
    progress.style.width = "0";
    progressWrap.classList.remove("run");
    // Trigger the progress animation after the browser has applied the reset.
    requestAnimationFrame(() => progressWrap.classList.add("run"));
    interval = window.setInterval(() => {
      remaining -= 1;
      timerText.textContent = String(remaining).padStart(2, "0");
      if (remaining <= 0) {
        window.clearInterval(interval);
        interval = null;
        waiting.hidden = true;
        reveal.hidden = false;
        playSound();
      }
    }, 1000);
  }

  function reset() {
    if (interval !== null) window.clearInterval(interval);
    interval = null;
    reveal.hidden = true;
    waiting.hidden = true;
    intro.hidden = false;
    if (audioContext && audioContext.state === "running") audioContext.suspend().catch(() => {});
  }

  function playSound() {
    // Sound is short and synthesized locally; it does not load external audio.
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      audioContext = audioContext || new AudioCtx();
      audioContext.resume().then(() => {
        const now = audioContext.currentTime;
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(115, now);
        osc.frequency.exponentialRampToValueAtTime(260, now + 0.18);
        osc.frequency.exponentialRampToValueAtTime(72, now + 0.85);
        filter.type = "lowpass";
        filter.frequency.value = 850;
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.075, now + 0.06);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.95);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(audioContext.destination);
        osc.start(now);
        osc.stop(now + 1);
      }).catch(() => {});
    } catch (_) {
      // The visual effect still works if audio is unavailable.
    }
  }
})();
