import gsap from 'gsap';
import { PerspectiveCamera, Vector3 } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { Experience } from './Experience';

export const INTRO_POS = new Vector3(11, 9, 11);
export const HOME_POS = new Vector3(5.8, 4.4, 5.8);
export const HOME_TARGET = new Vector3(0.2, 1.1, -0.5);

export class Camera {
  readonly instance: PerspectiveCamera;
  readonly controls: OrbitControls;

  private experience: Experience;
  private look = HOME_TARGET.clone();
  private animating = false;

  constructor(experience: Experience) {
    this.experience = experience;
    const { sizes, canvas, scene } = experience;

    this.instance = new PerspectiveCamera(40, sizes.aspect, 0.1, 60);
    this.instance.position.copy(INTRO_POS);
    this.instance.lookAt(this.look);
    scene.add(this.instance);

    this.controls = new OrbitControls(this.instance, canvas);
    this.controls.enabled = false;
    this.controls.enablePan = false;
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 3.5;
    this.controls.maxDistance = 12;
    this.controls.minPolarAngle = 0.3;
    this.controls.maxPolarAngle = 1.45;
    this.controls.minAzimuthAngle = 0.05;
    this.controls.maxAzimuthAngle = Math.PI / 2 - 0.05;
    this.controls.target.copy(HOME_TARGET);
  }

  /** Intro flight from far away into the room. */
  enter(instant = false): void {
    if (instant) {
      this.instance.position.copy(HOME_POS);
      this.controls.target.copy(HOME_TARGET);
      this.controls.enabled = true;
      this.controls.update();
      return;
    }
    this.animating = true;
    gsap.to(this.instance.position, {
      x: HOME_POS.x, y: HOME_POS.y, z: HOME_POS.z,
      duration: 2.4, ease: 'power3.inOut',
      onUpdate: () => this.instance.lookAt(this.look),
      onComplete: () => {
        this.animating = false;
        this.controls.target.copy(HOME_TARGET);
        this.controls.enabled = true;
        this.controls.update();
      },
    });
  }

  setInteractive(on: boolean): void {
    if (!this.animating) this.controls.enabled = on;
  }

  resize(): void {
    this.instance.aspect = this.experience.sizes.aspect;
    this.instance.updateProjectionMatrix();
  }

  update(): void {
    if (this.controls.enabled && !this.animating) this.controls.update();
  }
}
