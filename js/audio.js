/* ==========================================================================
   Moon Outpost - Web Audio API Synthesizer
   ========================================================================== */

let AC;

/**
 * Plays a procedurally synthesized sound effect.
 * @param {number} f Frequency in Hertz (Hz)
 * @param {number} d Duration in seconds
 */
function beep(f, d) {
  if (!meta.set.snd) return;
  try {
    AC = AC || new AudioContext();
    const o = AC.createOscillator();
    const g = AC.createGain();
    o.frequency.value = f;
    g.gain.value = 0.04;
    o.connect(g);
    g.connect(AC.destination);
    o.start();
    o.stop(AC.currentTime + d);
  } catch (e) {}
}
