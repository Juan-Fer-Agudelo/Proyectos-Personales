import gsap from 'gsap';
import { BoxGeometry, CylinderGeometry, Group, Mesh, MeshStandardMaterial } from 'three';
import { AudioEngine, midiToFreq } from '../../audio/AudioEngine';
import type { Experience } from '../Experience';
import { add, box, mat } from './builders';

const WHITE_MIDI = [60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79, 81, 83]; // C4..B5
// black keys sit between these white-key indexes (0-based), with their midi numbers
const BLACK: Array<[number, number]> = [[0, 61], [1, 63], [3, 66], [4, 68], [5, 70], [7, 73], [8, 75], [10, 78], [11, 80], [12, 82]];

/**
 * An upright piano against the back wall. Every key is clickable and plays a synthesized note.
 */
export class Piano {
  readonly group = new Group();

  constructor(_experience: Experience, audio: AudioEngine) {
    const g = this.group;
    g.position.set(2.25, 0, -2.6);

    const wood = { color: '#6b3f7c', rough: 0.55 };
    // body
    box(g, [1.5, 1.15, 0.42], [0, 0.575 + 0.3, 0], wood);        // upper case
    box(g, [1.5, 0.08, 0.6], [0, 0.86, 0.09], { ...wood, color: '#7a4a8c' }); // key bed lid
    box(g, [1.5, 0.05, 0.62], [0, 1.45, 0.1], { ...wood, color: '#7a4a8c' }); // top lid
    box(g, [0.1, 0.86, 0.5], [-0.7, 0.43, 0.05], wood);           // left leg panel
    box(g, [0.1, 0.86, 0.5], [0.7, 0.43, 0.05], wood);            // right leg panel
    box(g, [1.2, 0.06, 0.1], [0, 1.3, 0.22], { color: '#e9d3ef', rough: 0.8, emissive: '#e9d3ef', ei: 0.1 }); // music stand
    // pedals
    for (const x of [-0.12, 0.12]) box(g, [0.06, 0.02, 0.12], [x, 0.03, 0.25], { color: '#d4af37', metal: 0.8, rough: 0.3 });
    // stool
    const stool = new Group();
    stool.position.set(0, 0, 0.85);
    g.add(stool);
    add(stool, new Mesh(new CylinderGeometry(0.22, 0.22, 0.06, 20), mat({ color: '#f3c5e4', rough: 0.9 })), [0, 0.46, 0]);
    add(stool, new Mesh(new CylinderGeometry(0.035, 0.035, 0.44, 10), mat({ color: '#6b3f7c', rough: 0.5 })), [0, 0.22, 0]);
    add(stool, new Mesh(new CylinderGeometry(0.2, 0.2, 0.03, 20), mat({ color: '#6b3f7c', rough: 0.5 })), [0, 0.015, 0]);

    // keys
    const keys = new Group();
    keys.position.set(0, 0.905, 0.1);
    g.add(keys);
    const n = WHITE_MIDI.length;
    const kw = 1.32 / n;
    const whiteGeo = new BoxGeometry(kw - 0.006, 0.035, 0.34);
    const blackGeo = new BoxGeometry(kw * 0.6, 0.035, 0.2);
    const whiteMat = new MeshStandardMaterial({ color: '#fdf7ff', roughness: 0.4 });
    const blackMat = new MeshStandardMaterial({ color: '#2a1535', roughness: 0.5 });

    const makeKey = (geo: BoxGeometry, material: MeshStandardMaterial, x: number, y: number, z: number, midi: number) => {
      const m = new Mesh(geo, material.clone());
      m.position.set(x, y, z);
      m.castShadow = m.receiveShadow = true;
      m.userData.hoverScale = 1.0;
      m.userData.onClick = () => this.play(m, midi, audio);
      keys.add(m);
    };
    WHITE_MIDI.forEach((midi, i) => makeKey(whiteGeo, whiteMat, -0.66 + kw / 2 + i * kw, 0, 0.17, midi));
    BLACK.forEach(([i, midi]) => makeKey(blackGeo, blackMat, -0.66 + kw * (i + 1), 0.03, 0.1, midi));
  }

  private play(key: Mesh, midi: number, audio: AudioEngine): void {
    audio.note(midiToFreq(midi), 0.45);
    gsap.killTweensOf(key.rotation);
    gsap.fromTo(key.rotation, { x: 0 }, { x: 0.12, duration: 0.07, yoyo: true, repeat: 1, ease: 'power1.out' });
    const m = key.material as MeshStandardMaterial;
    gsap.killTweensOf(m.emissive);
    m.emissive.set('#c084fc');
    gsap.fromTo(m, { emissiveIntensity: 0.9 }, { emissiveIntensity: 0, duration: 0.5 });
  }
}
