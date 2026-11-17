/**
 * All sound is synthesized with the Web Audio API, so the site ships no audio files:
 * piano notes, a "pop" click, and a soft ambient loop. Everything goes through one master gain
 * so the mute button silences it all.
 */
export class AudioEngine {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private musicGain!: GainNode;
  private muted = false;
  private ambientTimer: number | null = null;

  /** Must be called from a user gesture (browsers block audio before that). */
  unlock(): void {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      return;
    }
    this.ctx = new AudioContext();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 1;
    this.master.connect(this.ctx.destination);
    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = 0.16;
    this.musicGain.connect(this.master);
  }

  get isMuted(): boolean {
    return this.muted;
  }

  setMuted(m: boolean): void {
    this.muted = m;
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setTargetAtTime(m ? 0 : 1, t, 0.05);
  }

  /** Short bubbly pop for clicks. */
  pop(): void {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.12);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.35, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    osc.connect(g).connect(this.master);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  /** A plucked, slightly detuned electric-piano style note. */
  note(freq: number, velocity = 0.5): void {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const out = this.ctx.createGain();
    out.gain.setValueAtTime(0.0001, t);
    out.gain.exponentialRampToValueAtTime(velocity, t + 0.008);
    out.gain.exponentialRampToValueAtTime(velocity * 0.35, t + 0.25);
    out.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);

    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(freq * 6, t);
    lp.frequency.exponentialRampToValueAtTime(freq * 1.5, t + 1.2);
    lp.connect(out).connect(this.master);

    const partials: Array<[OscillatorType, number, number]> = [['triangle', 1, 1], ['sine', 2, 0.35], ['sine', 3.01, 0.12]];
    for (const [type, mult, gain] of partials) {
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = type;
      o.frequency.value = freq * mult;
      o.detune.value = (Math.random() - 0.5) * 6;
      g.gain.value = gain;
      o.connect(g).connect(lp);
      o.start(t);
      o.stop(t + 1.7);
    }
  }

  /** Gentle looping pad: a chord progression played with slow attack/release voices. */
  startAmbient(): void {
    if (!this.ctx || this.ambientTimer !== null) return;
    const chords = [
      [261.63, 329.63, 392.0, 493.88],  // Cmaj7
      [220.0, 261.63, 329.63, 392.0],   // Am7
      [174.61, 220.0, 261.63, 329.63],  // Fmaj7
      [196.0, 246.94, 293.66, 349.23],  // G7
    ];
    let i = 0;
    const bar = 4.2;
    const play = () => {
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      chords[i % chords.length].forEach((f, k) => {
        const o = this.ctx!.createOscillator();
        const o2 = this.ctx!.createOscillator();
        const g = this.ctx!.createGain();
        o.type = 'sine';
        o2.type = 'triangle';
        o.frequency.value = f;
        o2.frequency.value = f * 2.002;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(k === 0 ? 0.5 : 0.3, t + 1.4);
        g.gain.exponentialRampToValueAtTime(0.0001, t + bar + 0.6);
        o.connect(g);
        o2.connect(g);
        g.connect(this.musicGain);
        o.start(t);
        o2.start(t);
        o.stop(t + bar + 0.8);
        o2.stop(t + bar + 0.8);
      });
      // a sparse melody note on top
      const mel = [523.25, 587.33, 659.25, 783.99, 659.25, 587.33];
      const m = this.ctx.createOscillator();
      const mg = this.ctx.createGain();
      m.type = 'sine';
      m.frequency.value = mel[i % mel.length];
      mg.gain.setValueAtTime(0.0001, t + 1.2);
      mg.gain.exponentialRampToValueAtTime(0.25, t + 1.5);
      mg.gain.exponentialRampToValueAtTime(0.0001, t + 3.6);
      m.connect(mg).connect(this.musicGain);
      m.start(t + 1.2);
      m.stop(t + 3.8);
      i += 1;
    };
    play();
    this.ambientTimer = window.setInterval(play, bar * 1000);
  }
}

/** Equal temperament frequency for a MIDI note number. */
export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}
