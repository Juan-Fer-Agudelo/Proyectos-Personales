import gsap from 'gsap';
import { Group } from 'three';
import type { AudioEngine } from '../../audio/AudioEngine';
import type { Experience } from '../Experience';
import { Environment } from './Environment';
import { Piano } from './Piano';
import { Room } from './Room';

export class World {
  readonly group = new Group();
  readonly room: Room;
  readonly piano: Piano;
  readonly environment: Environment;

  /** 0 = day, 1 = night. Tweened by GSAP so every material and light fades together. */
  private mix = { t: 0 };
  night = false;

  constructor(experience: Experience, audio: AudioEngine) {
    this.room = new Room(experience);
    this.piano = new Piano(experience, audio);
    this.environment = new Environment(experience);
    this.group.add(this.room.group, this.piano.group);
    experience.scene.add(this.group);
  }

  setNight(night: boolean, animate = true): void {
    this.night = night;
    gsap.killTweensOf(this.mix);
    const apply = () => {
      this.room.setNight(this.mix.t);
      this.environment.setNight(this.mix.t);
    };
    if (!animate) {
      this.mix.t = night ? 1 : 0;
      apply();
      return;
    }
    gsap.to(this.mix, { t: night ? 1 : 0, duration: 1.2, ease: 'power2.inOut', onUpdate: apply });
  }

  update(): void {
    this.room.update();
  }
}
