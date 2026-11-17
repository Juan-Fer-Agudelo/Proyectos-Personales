import { ACESFilmicToneMapping, PCFSoftShadowMap, WebGLRenderer } from 'three';
import type { Experience } from './Experience';

export class Renderer {
  readonly instance: WebGLRenderer;
  private experience: Experience;

  constructor(experience: Experience) {
    this.experience = experience;
    const { canvas, sizes } = experience;

    this.instance = new WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.instance.shadowMap.enabled = true;
    this.instance.shadowMap.type = PCFSoftShadowMap;
    this.instance.toneMapping = ACESFilmicToneMapping;
    this.instance.toneMappingExposure = 1.05;
    this.instance.setSize(sizes.width, sizes.height);
    this.instance.setPixelRatio(sizes.pixelRatio);
  }

  resize(): void {
    const { sizes } = this.experience;
    this.instance.setSize(sizes.width, sizes.height);
    this.instance.setPixelRatio(sizes.pixelRatio);
  }

  update(): void {
    const { scene, camera } = this.experience;
    this.instance.render(scene, camera.instance);
  }
}
