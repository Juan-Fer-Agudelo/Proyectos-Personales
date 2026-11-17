import {
  CapsuleGeometry, CircleGeometry, Color, ConeGeometry, CylinderGeometry, DodecahedronGeometry, DoubleSide, Group,
  Mesh, MeshStandardMaterial, PlaneGeometry, PointLight, SphereGeometry, TorusGeometry,
} from 'three';
import type { Experience } from '../Experience';
import { add, box, mat, textTexture } from './builders';

const BOOKS: Array<[string, number]> = [
  ['#f472b6', 0.28], ['#a78bfa', 0.32], ['#fbbf24', 0.25], ['#34d399', 0.3], ['#60a5fa', 0.27],
  ['#fb7185', 0.31], ['#2dd4bf', 0.26], ['#c084fc', 0.29], ['#f9a8d4', 0.33],
];

/** A pair of colors mixed with the day/night factor. */
class Themed {
  constructor(public mat: MeshStandardMaterial, public day: Color, public night: Color, public prop: 'color' | 'emissive' = 'color') {}
  apply(t: number): void {
    this.mat[this.prop].copy(this.day).lerp(this.night, t);
  }
}

/**
 * The room in pastel purple: floor, two walls, window, bed, desk with computer, shelves,
 * hanging signs (the clickable menu), lamp, fan, fish bowl, plant and bean bag.
 */
export class Room {
  readonly group = new Group();

  private experience: Experience;
  private themed: Themed[] = [];
  private moon!: MeshStandardMaterial;
  private bulb!: MeshStandardMaterial;
  private paneMat!: MeshStandardMaterial;
  private screenMat!: MeshStandardMaterial;
  private lampLight!: PointLight;
  private screenLight!: PointLight;
  private foliage!: Group;
  private fanBlades!: Group;
  private chairTop!: Group;
  private fish!: Mesh;
  private signs: Group[] = [];
  private night = 0;

  constructor(experience: Experience) {
    this.experience = experience;
    this.buildShell();
    this.buildWindow();
    this.buildBed();
    this.buildDesk();
    this.buildComputer();
    this.buildLamp();
    this.buildChair();
    this.buildShelves();
    this.buildSigns();
    this.buildPlant();
    this.buildBeanBag();
    this.setNight(0);
  }

  private theme(m: Mesh, day: string, night: string, prop: 'color' | 'emissive' = 'color'): void {
    this.themed.push(new Themed(m.material as MeshStandardMaterial, new Color(day), new Color(night), prop));
  }

  /* ---------- shell ---------- */
  private buildShell(): void {
    const g = this.group;
    const floor = box(g, [6.6, 0.14, 6.6], [0.3, -0.07, 0.3], { color: '#e9c8a9', rough: 0.85 });
    this.theme(floor, '#e9c8a9', '#4a3358');
    for (let i = 0; i < 10; i++) {
      const plank = box(g, [0.012, 0.004, 6.6], [-2.7 + i * 0.66, 0.002, 0.3], { color: '#cfa787', shadow: false });
      this.theme(plank, '#cfa787', '#3a2747');
    }
    const back = box(g, [6.6, 3.4, 0.14], [0.3, 1.7, -3.07], { color: '#dcc8ef' });
    const left = box(g, [0.14, 3.4, 6.6], [-3.07, 1.7, 0.3], { color: '#d2bce8' });
    this.theme(back, '#dcc8ef', '#3b2a5e');
    this.theme(left, '#d2bce8', '#33245a');
    box(g, [6.6, 0.12, 0.04], [0.3, 0.06, -2.98], { color: '#fbf3ff', shadow: false });
    box(g, [0.04, 0.12, 6.6], [-2.98, 0.06, 0.3], { color: '#fbf3ff', shadow: false });

    const rug = add(g, new Mesh(new CylinderGeometry(1.45, 1.45, 0.02, 48), mat({ color: '#f3c5e4', rough: 1 })), [0.7, 0.012, -0.3]);
    rug.castShadow = false;
    this.theme(rug, '#f3c5e4', '#5a2f5e');
    const rug2 = add(g, new Mesh(new CylinderGeometry(0.95, 0.95, 0.02, 48), mat({ color: '#fbe3f3', rough: 1 })), [0.7, 0.024, -0.3]);
    rug2.castShadow = false;
    this.theme(rug2, '#fbe3f3', '#6d3d72');
  }

  private buildWindow(): void {
    const g = new Group();
    g.position.set(-3.0, 2.05, 0.3);
    this.group.add(g);

    this.paneMat = mat({ color: '#cfe9ff', emissive: '#b7dcff', ei: 1.5, rough: 0.2 });
    add(g, new Mesh(new PlaneGeometry(1.7, 1.3), this.paneMat), [0.06, 0, 0], [0, Math.PI / 2, 0], false);
    this.moon = mat({ color: '#fff7d6', emissive: '#fff3c4', ei: 2.5 });
    this.moon.transparent = true;
    add(g, new Mesh(new CircleGeometry(0.13, 32), this.moon), [0.07, 0.35, -0.45], [0, Math.PI / 2, 0], false);

    const f = '#fbf3ff';
    box(g, [0.1, 1.42, 0.08], [0.08, 0, -0.89], { color: f });
    box(g, [0.1, 1.42, 0.08], [0.08, 0, 0.89], { color: f });
    box(g, [0.1, 0.08, 1.86], [0.08, 0.69, 0], { color: f });
    box(g, [0.1, 0.08, 1.86], [0.08, -0.69, 0], { color: f });
    box(g, [0.1, 1.3, 0.04], [0.08, 0, 0], { color: f, shadow: false });
    box(g, [0.1, 0.04, 1.7], [0.08, 0, 0], { color: f, shadow: false });
    box(g, [0.22, 0.06, 2.0], [0.14, -0.76, 0], { color: f });
    const curtain = box(g, [0.08, 1.7, 0.45], [0.14, 0.05, 1.15], { color: '#f6cfe8', rough: 1 });
    this.theme(curtain, '#f6cfe8', '#4a2a5a');

    // wall clock on the left wall
    const clock = new Group();
    clock.position.set(-2.98, 2.5, 3.0);
    this.group.add(clock);
    add(clock, new Mesh(new CylinderGeometry(0.26, 0.26, 0.04, 32), mat({ color: '#6b3f7c' })), [0, 0, 0], [0, 0, Math.PI / 2]);
    add(clock, new Mesh(new CircleGeometry(0.22, 32), mat({ color: '#fff7fb' })), [0.025, 0, 0], [0, Math.PI / 2, 0], false);
    add(clock, new Mesh(new PlaneGeometry(0.02, 0.15), mat({ color: '#2a0f4e' })), [0.03, 0.07, 0], [0, Math.PI / 2, 0], false);
    add(clock, new Mesh(new PlaneGeometry(0.02, 0.11), mat({ color: '#2a0f4e' })), [0.03, 0, 0.05], [0, Math.PI / 2, Math.PI / 2], false);
  }

  /* ---------- bed along the left wall ---------- */
  private buildBed(): void {
    const g = new Group();
    g.position.set(-2.3, 0, -0.5);
    this.group.add(g);
    box(g, [1.2, 0.3, 2.2], [0, 0.2, 0], { color: '#b48bd0', rough: 0.8 });                 // frame
    box(g, [1.12, 0.18, 2.1], [0, 0.42, 0], { color: '#fbf3ff', rough: 1 });                // mattress
    const blanket = box(g, [1.14, 0.12, 1.35], [0, 0.55, 0.3], { color: '#c89bea', rough: 1 });
    this.theme(blanket, '#c89bea', '#5e3d85');
    box(g, [0.5, 0.12, 0.34], [-0.2, 0.57, -0.8], { color: '#fdf0ff', rough: 1, rot: [0, 0.15, 0] }); // pillow
    box(g, [0.5, 0.12, 0.34], [0.28, 0.57, -0.82], { color: '#f3c5e4', rough: 1, rot: [0, -0.1, 0] });
    box(g, [1.2, 0.9, 0.1], [0, 0.6, -1.12], { color: '#9b6bbd', rough: 0.7 });             // headboard
    for (const x of [-0.55, 0.55]) box(g, [0.08, 0.3, 0.08], [x, 0.05, 1.05], { color: '#9b6bbd' });
    // sleeping cat
    const cat = new Group();
    cat.position.set(0.25, 0.62, 0.55);
    g.add(cat);
    const fur = mat({ color: '#f5e6d3', rough: 1 });
    const body = add(cat, new Mesh(new SphereGeometry(0.17, 16, 16), fur), [0, 0.08, 0]);
    body.scale.set(1.3, 0.6, 1);
    add(cat, new Mesh(new SphereGeometry(0.11, 16, 16), fur), [0.2, 0.1, 0.02]);
    add(cat, new Mesh(new ConeGeometry(0.035, 0.07, 8), fur), [0.17, 0.2, -0.04]);
    add(cat, new Mesh(new ConeGeometry(0.035, 0.07, 8), fur), [0.25, 0.2, -0.04]);
    const tail = add(cat, new Mesh(new TorusGeometry(0.12, 0.03, 8, 16, Math.PI), fur), [-0.2, 0.05, 0.05], [Math.PI / 2, 0, 0]);
    tail.scale.set(1, 1, 0.8);
  }

  /* ---------- desk ---------- */
  private buildDesk(): void {
    const g = new Group();
    g.position.set(-0.15, 0, -2.35);
    this.group.add(g);
    const leg = '#8d5fb0';

    box(g, [2.5, 0.07, 1.1], [0, 0.75, 0], { color: '#fbf3ff', rough: 0.6 });
    for (const [x, z] of [[-1.18, -0.48], [-1.18, 0.48], [1.18, -0.48], [1.18, 0.48]]) {
      box(g, [0.07, 0.72, 0.07], [x, 0.36, z], { color: leg, rough: 0.6 });
    }
    box(g, [0.55, 0.56, 1.0], [0.85, 0.44, 0], { color: '#e9d3ef', rough: 0.7 });
    box(g, [0.3, 0.025, 0.02], [0.85, 0.56, 0.51], { color: leg, shadow: false });
    box(g, [0.3, 0.025, 0.02], [0.85, 0.32, 0.51], { color: leg, shadow: false });

    box(g, [0.85, 0.03, 0.3], [0, 0.8, 0.33], { color: '#fdf7ff', rough: 0.6 });                       // keyboard
    box(g, [0.78, 0.012, 0.23], [0, 0.82, 0.33], { color: '#e3cdf0', rough: 0.6, shadow: false });
    add(g, new Mesh(new CapsuleGeometry(0.045, 0.08, 4, 12), mat({ color: '#fdf7ff', rough: 0.5 })), [0.62, 0.8, 0.35]); // mouse

    add(g, new Mesh(new CylinderGeometry(0.065, 0.055, 0.13, 24), mat({ color: '#f3c5e4', rough: 0.5 })), [-0.85, 0.85, 0.25]); // mug
    add(g, new Mesh(new TorusGeometry(0.04, 0.012, 8, 20), mat({ color: '#f3c5e4', rough: 0.5 })), [-0.77, 0.86, 0.25], [Math.PI / 2, 0, 0]);
    add(g, new Mesh(new CylinderGeometry(0.055, 0.055, 0.005, 24), mat({ color: '#5a3a2a', rough: 0.3 })), [-0.85, 0.915, 0.25], undefined, false);
    box(g, [0.3, 0.025, 0.4], [-0.7, 0.8, 0.3], { color: '#fbbf24', rot: [0, 0.3, 0] });              // notebook

    // fish bowl
    const bowl = new Group();
    bowl.position.set(-1.0, 0.785, -0.2);
    g.add(bowl);
    const glass = new MeshStandardMaterial({ color: '#dff4ff', transparent: true, opacity: 0.35, roughness: 0.1 });
    add(bowl, new Mesh(new SphereGeometry(0.17, 24, 24), glass), [0, 0.16, 0], undefined, false);
    const water = add(bowl, new Mesh(new SphereGeometry(0.155, 24, 24), new MeshStandardMaterial({ color: '#8ed0ff', transparent: true, opacity: 0.45 })), [0, 0.15, 0], undefined, false);
    water.scale.y = 0.8;
    add(bowl, new Mesh(new CylinderGeometry(0.12, 0.12, 0.03, 20), mat({ color: '#f0d9b5' })), [0, 0.03, 0], undefined, false);
    this.fish = add(bowl, new Mesh(new SphereGeometry(0.04, 10, 10), mat({ color: '#fb923c', emissive: '#fb923c', ei: 0.3 })), [0.03, 0.16, 0.04], undefined, false);
    this.fish.scale.set(1.4, 0.8, 0.7);
    add(this.fish, new Mesh(new ConeGeometry(0.03, 0.05, 6), mat({ color: '#fb923c' })), [-0.055, 0, 0], [0, 0, Math.PI / 2], false);

    // desk fan
    const fan = new Group();
    fan.position.set(1.0, 0.785, -0.15);
    g.add(fan);
    add(fan, new Mesh(new CylinderGeometry(0.1, 0.12, 0.03, 20), mat({ color: '#9b6bbd', rough: 0.5 })), [0, 0.015, 0]);
    add(fan, new Mesh(new CylinderGeometry(0.02, 0.02, 0.22, 10), mat({ color: '#9b6bbd', rough: 0.5 })), [0, 0.13, 0]);
    const head = new Group();
    head.position.set(0, 0.26, 0);
    head.rotation.y = 0.5;
    fan.add(head);
    add(head, new Mesh(new TorusGeometry(0.14, 0.012, 8, 32), mat({ color: '#9b6bbd', rough: 0.5 })), [0, 0, 0]);
    this.fanBlades = new Group();
    head.add(this.fanBlades);
    add(this.fanBlades, new Mesh(new CylinderGeometry(0.03, 0.03, 0.04, 12), mat({ color: '#6b3f7c' })), [0, 0, 0], [Math.PI / 2, 0, 0]);
    for (let i = 0; i < 3; i++) {
      const blade = box(this.fanBlades, [0.05, 0.11, 0.008], [0, 0.075, 0], { color: '#f3c5e4', rough: 0.6, shadow: false });
      blade.rotation.z = 0;
      const pivot = new Group();
      pivot.rotation.z = (i / 3) * Math.PI * 2;
      this.fanBlades.add(pivot);
      pivot.add(blade);
    }
  }

  /** The computer on the desk: clicking the screen opens "Mi trabajo". */
  private buildComputer(): void {
    const g = new Group();
    g.position.set(-0.15, 1.33, -2.6);
    this.group.add(g);
    g.userData.action = 'work';
    g.userData.hoverScale = 1.06;

    const frame = mat({ color: '#fbf3ff', rough: 0.5 });
    add(g, new Mesh(new CylinderGeometry(0.2, 0.22, 0.03, 24), frame), [0, -0.54, 0.06]);
    box(g, [0.08, 0.4, 0.05], [0, -0.33, 0], { color: '#fbf3ff', rough: 0.5 });
    box(g, [1.25, 0.8, 0.06], [0, 0, 0], { color: '#fbf3ff', rough: 0.5 });
    this.screenMat = mat({ color: '#2a0f4e', emissive: '#7c3aed', ei: 0.9, rough: 0.3 });
    add(g, new Mesh(new PlaneGeometry(1.13, 0.68), this.screenMat), [0, 0.01, 0.032], undefined, false);
    // "windows" drawn on the screen
    box(g, [0.5, 0.3, 0.004], [-0.22, 0.1, 0.036], { color: '#f3c5e4', emissive: '#f3c5e4', ei: 0.6, shadow: false });
    box(g, [0.4, 0.22, 0.004], [0.25, -0.08, 0.036], { color: '#a5f3fc', emissive: '#a5f3fc', ei: 0.6, shadow: false });
    box(g, [0.26, 0.05, 0.004], [-0.22, -0.2, 0.036], { color: '#fde68a', emissive: '#fde68a', ei: 0.6, shadow: false });
    this.screenLight = new PointLight('#a78bfa', 0.4, 3, 2);
    this.screenLight.position.set(0, 0, 0.5);
    g.add(this.screenLight);
  }

  private buildLamp(): void {
    const g = new Group();
    g.position.set(-1.25, 0.78, -2.65);
    this.group.add(g);
    const metal = { color: '#6b3f7c', metal: 0.3, rough: 0.5 };
    add(g, new Mesh(new CylinderGeometry(0.13, 0.14, 0.03, 24), mat(metal)), [0, 0, 0]);
    add(g, new Mesh(new CylinderGeometry(0.014, 0.014, 0.78, 10), mat(metal)), [0.05, 0.38, 0.03], [0.1, 0, -0.25]);
    const shade = new Mesh(new ConeGeometry(0.14, 0.2, 24, 1, true), mat({ color: '#f3c5e4', rough: 0.8 }));
    (shade.material as MeshStandardMaterial).side = DoubleSide;
    add(g, shade, [0.22, 0.74, 0.1], [0.35, 0, 0.55]);
    this.bulb = mat({ color: '#fff2cc', emissive: '#ffd27a', ei: 0.6 });
    add(g, new Mesh(new SphereGeometry(0.035, 12, 12), this.bulb), [0.27, 0.68, 0.14], undefined, false);
    this.lampLight = new PointLight('#ffd08a', 0.25, 4, 2);
    this.lampLight.position.set(0.3, 0.6, 0.2);
    this.lampLight.castShadow = true;
    this.lampLight.shadow.mapSize.set(512, 512);
    g.add(this.lampLight);
  }

  private buildChair(): void {
    const g = new Group();
    g.position.set(0.0, 0, -1.2);
    this.group.add(g);
    const c = '#f3c5e4';
    add(g, new Mesh(new CylinderGeometry(0.03, 0.03, 0.46, 10), mat({ color: '#9b6bbd', metal: 0.4, rough: 0.4 })), [0, 0.27, 0]);
    for (let i = 0; i < 5; i++) {
      const arm = new Group();
      arm.rotation.y = (i / 5) * Math.PI * 2;
      g.add(arm);
      box(arm, [0.3, 0.03, 0.04], [0.15, 0.05, 0], { color: '#9b6bbd', rough: 0.5 });
      add(arm, new Mesh(new SphereGeometry(0.035, 10, 10), mat({ color: '#6b3f7c', rough: 0.6 })), [0.3, 0.035, 0]);
    }
    this.chairTop = new Group();
    this.chairTop.rotation.y = 0.35;
    g.add(this.chairTop);
    box(this.chairTop, [0.62, 0.09, 0.6], [0, 0.5, 0], { color: c, rough: 0.9 });
    box(this.chairTop, [0.62, 0.72, 0.09], [0, 0.9, 0.3], { color: c, rough: 0.9 });
    box(this.chairTop, [0.5, 0.25, 0.05], [0, 0.97, 0.3], { color: '#fbe3f3', shadow: false });
    for (const x of [-0.33, 0.33]) {
      box(this.chairTop, [0.05, 0.05, 0.4], [x, 0.72, 0.05], { color: '#9b6bbd' });
      box(this.chairTop, [0.05, 0.18, 0.05], [x, 0.62, 0.05], { color: '#9b6bbd' });
    }
  }

  private buildShelves(): void {
    const root = this.group;
    // shelf on the left wall above the bed
    const left = new Group();
    left.position.set(-2.85, 2.35, -1.6);
    left.rotation.y = Math.PI / 2;
    root.add(left);
    box(left, [1.5, 0.05, 0.3], [0, 0, 0], { color: '#fbf3ff', rough: 0.6 });
    box(left, [0.04, 0.3, 0.04], [-0.65, -0.17, 0.1], { color: '#9b6bbd' });
    box(left, [0.04, 0.3, 0.04], [0.65, -0.17, 0.1], { color: '#9b6bbd' });
    BOOKS.forEach(([color, h], i) => {
      box(left, [0.065, h, 0.22], [-0.55 + i * 0.08, 0.025 + h / 2, 0], { color, rough: 0.8, rot: [0, 0, i === 8 ? -0.18 : 0] });
    });
    add(left, new Mesh(new CylinderGeometry(0.06, 0.05, 0.12, 16), mat({ color: '#fdf0ff', rough: 0.7 })), [0.5, 0.09, 0]);
    add(left, new Mesh(new SphereGeometry(0.1, 14, 14), mat({ color: '#4ade80', rough: 1 })), [0.5, 0.22, 0]);

    // frames on the left wall
    for (const [z, w, h, col] of [[1.95, 0.42, 0.52, '#fbbf24'], [2.5, 0.5, 0.4, '#60a5fa']] as Array<[number, number, number, string]>) {
      const f = new Group();
      f.position.set(-2.98, 2.45, z);
      f.rotation.y = Math.PI / 2;
      root.add(f);
      box(f, [w, h, 0.03], [0, 0, 0], { color: '#6b3f7c' });
      box(f, [w - 0.08, h - 0.08, 0.01], [0, 0, 0.02], { color: '#fdf0ff', shadow: false });
      box(f, [w * 0.45, h * 0.45, 0.012], [0, 0.03, 0.03], { color: col, shadow: false });
    }
  }

  /** Three hanging signs on the back wall: the menu of the portfolio. */
  private buildSigns(): void {
    const items: Array<[string, string, number]> = [['Mi trabajo', 'work', -1.75], ['Sobre mí', 'about', 0.2], ['Contacto', 'contact', 2.15]];
    for (const [label, action, x] of items) {
      const pivot = new Group();
      pivot.position.set(x, 3.2, -2.9);
      this.group.add(pivot);
      const sign = new Group();
      sign.position.y = -0.55;
      pivot.add(sign);
      pivot.userData.action = action;
      pivot.userData.hoverScale = 1.1;

      const rope = mat({ color: '#8d5fb0' });
      add(sign, new Mesh(new CylinderGeometry(0.012, 0.012, 0.5, 6), rope), [-0.5, 0.33, 0]);
      add(sign, new Mesh(new CylinderGeometry(0.012, 0.012, 0.5, 6), rope), [0.5, 0.33, 0]);
      const plank = box(sign, [1.3, 0.42, 0.06], [0, 0, 0], { color: '#f6cfe8', rough: 0.8 });
      const tex = textTexture(label, { bg: '#f6cfe8', fg: '#4a1d6b' });
      const face = new Mesh(new PlaneGeometry(1.3, 0.42), new MeshStandardMaterial({ map: tex, roughness: 0.8 }));
      face.position.z = 0.031;
      plank.add(face);
      this.signs.push(pivot);
    }
  }

  private buildPlant(): void {
    const g = new Group();
    g.position.set(1.9, 0, 1.6);
    this.group.add(g);
    add(g, new Mesh(new CylinderGeometry(0.22, 0.17, 0.44, 20), mat({ color: '#f3c5e4' })), [0, 0.22, 0]);
    add(g, new Mesh(new CylinderGeometry(0.2, 0.2, 0.02, 20), mat({ color: '#5a3a2a', rough: 1 })), [0, 0.44, 0], undefined, false);
    this.foliage = new Group();
    this.foliage.position.set(0, 0.45, 0);
    g.add(this.foliage);
    add(this.foliage, new Mesh(new CylinderGeometry(0.025, 0.035, 0.6, 8), mat({ color: '#6b4b3a', rough: 1 })), [0, 0.3, 0]);
    const leaves: Array<[number, number, number, number]> = [
      [0, 0.75, 0, 0.3], [0.2, 0.6, 0.1, 0.22], [-0.2, 0.62, -0.08, 0.24], [0.05, 0.55, -0.22, 0.2], [-0.05, 0.95, 0.05, 0.22],
    ];
    leaves.forEach(([x, y, z, r], i) => {
      add(this.foliage, new Mesh(new SphereGeometry(r, 14, 14), mat({ color: i % 2 ? '#4ade80' : '#86efac', rough: 1 })), [x, y, z]);
    });
  }

  private buildBeanBag(): void {
    const g = new Group();
    g.position.set(0.4, 0, 1.3);
    this.group.add(g);
    const a = add(g, new Mesh(new SphereGeometry(0.6, 24, 24), mat({ color: '#c084fc', rough: 1 })), [0, 0.3, 0]);
    a.scale.set(1, 0.6, 1);
    const b = add(g, new Mesh(new SphereGeometry(0.5, 24, 24), mat({ color: '#d8b4fe', rough: 1 })), [0, 0.45, 0]);
    b.scale.set(0.8, 0.5, 0.8);
    add(g, new Mesh(new DodecahedronGeometry(0.12), mat({ color: '#fbbf24', rough: 0.4 })), [0.55, 0.12, 0.35]);
  }

  setNight(t: number): void {
    this.night = t;
    this.themed.forEach((th) => th.apply(t));
    this.paneMat.color.set('#cfe9ff').lerp(new Color('#1a1040'), t);
    this.paneMat.emissive.set('#b7dcff').lerp(new Color('#2a1d5e'), t);
    this.paneMat.emissiveIntensity = 1.5 - 0.6 * t;
    this.moon.opacity = t;
    this.bulb.emissiveIntensity = 0.6 + 3.4 * t;
    this.screenMat.emissiveIntensity = 0.9 + 0.8 * t;
  }

  update(): void {
    const { elapsed, delta } = this.experience.time;
    this.lampLight.intensity = 0.25 + 2.6 * this.night + Math.sin(elapsed * 2.2) * 0.04;
    this.screenLight.intensity = 0.4 + 1.2 * this.night + Math.sin(elapsed * 7) * 0.05;
    this.foliage.rotation.z = Math.sin(elapsed * 0.8) * 0.02;
    this.fanBlades.rotation.z += delta * 9;
    this.chairTop.rotation.y = 0.35 + Math.sin(elapsed * 0.7) * 0.12;
    this.fish.position.x = 0.03 + Math.sin(elapsed * 1.3) * 0.05;
    this.fish.position.z = 0.04 + Math.cos(elapsed * 1.3) * 0.05;
    this.fish.rotation.y = -elapsed * 1.3 + Math.PI;
    this.signs.forEach((s, i) => {
      s.rotation.z = Math.sin(elapsed * 0.9 + i * 1.7) * 0.025;
    });
  }
}
