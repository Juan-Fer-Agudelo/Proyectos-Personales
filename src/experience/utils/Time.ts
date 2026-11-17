import { EventEmitter } from './EventEmitter';

export class Time extends EventEmitter {
  readonly start = performance.now();
  current = this.start;
  /** Seconds since start. */
  elapsed = 0;
  /** Seconds since last frame (clamped so a background tab doesn't explode animations). */
  delta = 0.016;

  constructor() {
    super();
    window.requestAnimationFrame(() => this.tick());
  }

  private tick(): void {
    const now = performance.now();
    this.delta = Math.min((now - this.current) / 1000, 0.1);
    this.current = now;
    this.elapsed = (now - this.start) / 1000;
    this.trigger('tick');
    window.requestAnimationFrame(() => this.tick());
  }
}
