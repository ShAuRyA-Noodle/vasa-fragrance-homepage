// Procedural WebAudio ambient pad: low drone + filtered noise "room tone".
// Off by default. No external audio files.

export function initSound(button) {
  let ctx = null;
  let nodes = null;
  let on = false;
  const label = button.querySelector('#sound-label') || button.querySelector('.chrome-label');

  function build() {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    // low drone: two detuned oscillators
    const oscA = ctx.createOscillator();
    oscA.type = 'sine';
    oscA.frequency.value = 55;
    const oscB = ctx.createOscillator();
    oscB.type = 'sine';
    oscB.frequency.value = 55 * 1.005;
    const droneGain = ctx.createGain();
    droneGain.gain.value = 0.5;
    oscA.connect(droneGain);
    oscB.connect(droneGain);
    droneGain.connect(master);

    // filtered noise room tone
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 420;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.18;
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(master);

    // slow LFO on drone gain for breathing motion
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.07;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.12;
    lfo.connect(lfoGain);
    lfoGain.connect(droneGain.gain);

    oscA.start();
    oscB.start();
    noise.start();
    lfo.start();

    nodes = { master, oscA, oscB, noise, lfo, droneGain, noiseGain, filter };
  }

  function setOn(next) {
    on = next;
    button.setAttribute('aria-pressed', String(on));
    if (label) label.textContent = on ? 'SOUND ON' : 'SOUND OFF';
    if (on) {
      if (!ctx) build();
      if (ctx.state === 'suspended') ctx.resume();
      nodes.master.gain.cancelScheduledValues(ctx.currentTime);
      nodes.master.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 1.2);
    } else if (ctx) {
      nodes.master.gain.cancelScheduledValues(ctx.currentTime);
      nodes.master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
    }
  }

  button.addEventListener('click', () => setOn(!on));

  return {
    get isOn() { return on; },
    setOn,
    destroy() {
      if (ctx) ctx.close().catch(() => {});
    },
  };
}
