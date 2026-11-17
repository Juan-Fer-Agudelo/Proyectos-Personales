import gsap from 'gsap';
import { Object3D, Raycaster, Scene, Vector2 } from 'three';
import type { AudioEngine } from '../audio/AudioEngine';
import { Camera } from './Camera';
import { Renderer } from './Renderer';
import { EventEmitter } from './utils/EventEmitter';
import { Sizes } from './utils/Sizes';
import { Time } from './utils/Time';
import { World } from './World/World';

/** Objects in the room opt in to pointer interaction through userData. */
export interface Interactive {
  /** Which modal to open, or a custom handler. */
  action?: string;
  onClick?: (obj: Object3D) => void;
  /** Scale multiplier on hover (default 1.12). */
  hoverScale?: number;
}

/**
 * Root of the 3D experience: owns scene, camera, renderer and world, and handles
 * hover/click on interactive objects (signs, computer, piano keys...).
 */
export class Experience extends EventEmitter {
  static instance: Experience;

  readonly canvas: HTMLCanvasElement;
  readonly sizes = new Sizes();
  readonly time = new Time();
  readonly scene = new Scene();
  readonly camera: Camera;
  readonly renderer: Renderer;
  readonly world: World;

  private raycaster = new Raycaster();
  private pointer = new Vector2();
  private pointerDown = { x: 0, y: 0 };
  private hovered: Object3D | null = null;
  private interactables: Object3D[] = [];
  private pointerLocked = false;

  constructor(canvas: HTMLCanvasElement, audio: AudioEngine) {
    super();
    Experience.instance = this;
    this.canvas = canvas;

    this.camera = new Camera(this);
    this.renderer = new Renderer(this);
    this.world = new World(this, audio);
    this.collectInteractables();

    this.sizes.on('resize', () => this.resize());
    this.time.on('tick', () => this.update());
    this.bindPointer();
  }

  /** While a modal is open, the scene ignores the pointer and the controls are off. */
  lockPointer(locked: boolean): void {
    this.pointerLocked = locked;
    this.camera.setInteractive(!locked);
    if (locked) this.setHovered(null);
  }

  private collectInteractables(): void {
    this.interactables = [];
    this.world.group.traverse((o) => {
      if ((o.userData as Interactive).action || (o.userData as Interactive).onClick) this.interactables.push(o);
    });
  }

  /** Walks up from a hit mesh to the object that declared the interaction. */
  private ownerOf(o: Object3D | null): Object3D | null {
    let cur: Object3D | null = o;
    while (cur) {
      const d = cur.userData as Interactive;
      if (d.action || d.onClick) return cur;
      cur = cur.parent;
    }
    return null;
  }

  private setHovered(obj: Object3D | null): void {
    if (obj === this.hovered) return;
    if (this.hovered) {
      const base = (this.hovered.userData.baseScale as number) ?? 1;
      gsap.to(this.hovered.scale, { x: base, y: base, z: base, duration: 0.5, ease: 'back.out(2)' });
    }
    this.hovered = obj;
    this.canvas.classList.toggle('is-hover', !!obj);
    if (obj) {
      if (obj.userData.baseScale === undefined) obj.userData.baseScale = obj.scale.x;
      const base = obj.userData.baseScale as number;
      const s = base * ((obj.userData as Interactive).hoverScale ?? 1.12);
      gsap.to(obj.scale, { x: s, y: s, z: s, duration: 0.5, ease: 'back.out(2.5)' });
    }
  }

  private pick(clientX: number, clientY: number): Object3D | null {
    this.pointer.set((clientX / this.sizes.width) * 2 - 1, -(clientY / this.sizes.height) * 2 + 1);
    this.raycaster.setFromCamera(this.pointer, this.camera.instance);
    const hits = this.raycaster.intersectObjects(this.interactables, true);
    return hits.length ? this.ownerOf(hits[0].object) : null;
  }

  private bindPointer(): void {
    const c = this.canvas;
    c.addEventListener('pointerdown', (e) => {
      this.pointerDown = { x: e.clientX, y: e.clientY };
    });
    c.addEventListener('pointermove', (e) => {
      if (this.pointerLocked || e.pointerType === 'touch') return;
      this.setHovered(this.pick(e.clientX, e.clientY));
    });
    c.addEventListener('pointerup', (e) => {
      if (this.pointerLocked) return;
      const moved = Math.hypot(e.clientX - this.pointerDown.x, e.clientY - this.pointerDown.y);
      if (moved > 8) return;
      const obj = this.pick(e.clientX, e.clientY);
      if (!obj) return;
      const d = obj.userData as Interactive;
      if (d.onClick) d.onClick(obj);
      if (d.action) this.trigger('action', d.action);
    });
    c.addEventListener('pointerleave', () => this.setHovered(null));
  }

  private resize(): void {
    this.camera.resize();
    this.renderer.resize();
  }

  private update(): void {
    this.camera.update();
    this.world.update();
    this.renderer.update();
  }
}
