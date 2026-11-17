import { EventEmitter } from './EventEmitter';

export class Sizes extends EventEmitter {
  width = window.innerWidth;
  height = window.innerHeight;
  pixelRatio = Math.min(window.devicePixelRatio, 1.75);

  constructor() {
    super();
    window.addEventListener('resize', () => {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.pixelRatio = Math.min(window.devicePixelRatio, 1.75);
      this.trigger('resize');
    });
  }

  get aspect(): number {
    return this.width / this.height;
  }
}
