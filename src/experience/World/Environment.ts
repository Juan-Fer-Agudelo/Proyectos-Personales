import { AmbientLight, Color, DirectionalLight, Fog, HemisphereLight } from 'three';
import type { Experience } from '../Experience';

const DAY_BG = new Color('#f3e6f7');
const NIGHT_BG = new Color('#120a24');

export class Environment {
  private experience: Experience;
  private ambient: AmbientLight;
  private hemi: HemisphereLight;
  private sun: DirectionalLight;
  private fill: DirectionalLight;
  private bg = new Color();
  private fog: Fog;

  constructor(experience: Experience) {
    this.experience = experience;
    const { scene } = experience;

    this.ambient = new AmbientLight('#ffffff', 0.6);
    this.hemi = new HemisphereLight('#f7e9ff', '#b58cc9', 0.55);

    this.sun = new DirectionalLight('#fff1e6', 2.2);
    this.sun.position.set(-5, 6.5, 2.5);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    this.sun.shadow.bias = -0.0004;
    this.sun.shadow.camera.left = -6;
    this.sun.shadow.camera.right = 6;
    this.sun.shadow.camera.top = 6;
    this.sun.shadow.camera.bottom = -6;
    this.sun.shadow.camera.near = 1;
    this.sun.shadow.camera.far = 25;

    this.fill = new DirectionalLight('#ffe9f6', 0.55);
    this.fill.position.set(6, 4, 6);

    this.fog = new Fog(DAY_BG.clone(), 13, 28);
    scene.fog = this.fog;
    scene.background = this.bg.copy(DAY_BG);

    scene.add(this.ambient, this.hemi, this.sun, this.fill);
  }

  setNight(t: number): void {
    const { scene } = this.experience;
    this.ambient.intensity = lerp(0.6, 0.14, t);
    this.ambient.color.set('#ffffff').lerp(new Color('#9b8cff'), t);
    this.hemi.intensity = lerp(0.55, 0.18, t);
    this.hemi.color.set('#f7e9ff').lerp(new Color('#5a4a9a'), t);
    this.hemi.groundColor.set('#b58cc9').lerp(new Color('#160d26'), t);
    this.sun.intensity = lerp(2.2, 0.18, t);
    this.sun.color.set('#fff1e6').lerp(new Color('#7f86e6'), t);
    this.fill.intensity = lerp(0.55, 0.1, t);
    this.bg.copy(DAY_BG).lerp(NIGHT_BG, t);
    this.fog.color.copy(this.bg);
    scene.background = this.bg;
  }
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
