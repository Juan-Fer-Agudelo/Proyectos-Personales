import {
  IcosahedronGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  Object3D,
  PlaneGeometry,
  Vector3,
} from "three";
import { Application } from "../../../Application";
import { resources } from "../../../resources/Resources";
import { Easing, Tween } from "@tweenjs/tween.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";

const rockGeometry = new IcosahedronGeometry(0.5, 0);
const rockMaterial = new MeshLambertMaterial({
  color: 0xffffff,
  fog: true,
  transparent: false,
});
const textMaterial = new MeshBasicMaterial({
  color: 0xffffff,
  fog: true,
  transparent: false,
});
const subtitleMaterial = new MeshBasicMaterial({
  color: 0xffffff,
  fog: true,
  transparent: true,
  opacity: 0.65,
});
const enterGeometry = new PlaneGeometry(1, 1, 1);
const enterMaterial = new MeshBasicMaterial({ side: 2, transparent: true });

export type ActiveElementLink = {
  text: string;
  url?: string;
  subtitle?: string;
};

// The 3D font only carries basic Latin and a few accents. Any letter it lacks
// is written without its accent (í becomes i, ñ becomes n) instead of vanishing.
function toFontGlyphs(text: string) {
  const font = resources.getFont("optimerbold") as unknown as {
    data: { glyphs: Record<string, unknown> };
  };
  return Array.from(text)
    .map((c) =>
      c in font.data.glyphs ? c : c.normalize("NFD").replace(/[̀-ͯ]/g, ""),
    )
    .join("");
}

export class ActiveElement {
  instance: Object3D = new Object3D();
  private tween: Tween<Vector3> | undefined;
  private textTween: Tween<Vector3> | undefined;
  private enterTween: Tween<Vector3> | undefined;
  private readonly rock: Mesh;
  private readonly text: Mesh;
  private readonly subtitle: Mesh | undefined;
  private readonly enter: Mesh;

  isActivated: boolean = false;
  isVisible: boolean = true;
  isFocused: boolean = false;
  constructor(
    protected application: Application,
    public link: ActiveElementLink,
  ) {
    enterMaterial.map = resources.getTexture("enter");

    this.rock = new Mesh(rockGeometry, rockMaterial);
    this.text = this.createText(link.text, 0.35, textMaterial);
    this.subtitle = link.subtitle
      ? this.createText(link.subtitle, 0.17, subtitleMaterial)
      : undefined;
    this.enter = this.createEnter();
    this.assembleObjects();
  }

  private assembleObjects() {
    this.instance.add(this.text);
    this.text.position.y = this.subtitle ? 1.15 : 0.8;
    this.text.scale.set(0, 0, 0);
    if (this.subtitle) {
      this.instance.add(this.subtitle);
      this.subtitle.position.y = 0.72;
      this.subtitle.scale.set(0, 0, 0);
    }
    // Without a link there is nothing to open, so there is no ENTER sign.
    this.enter.visible = Boolean(this.link.url);
    this.instance.add(this.enter);
    this.enter.position.y = -1.2;
    this.enter.scale.set(0, 0, 0);
    this.instance.add(this.rock);
  }

  private createText(text: string, size: number, material: MeshBasicMaterial) {
    const textGeometry = new TextGeometry(toFontGlyphs(text), {
      font: resources.getFont("optimerbold"),
      size,
      height: 0,
      curveSegments: 6,
      bevelEnabled: false,
    });

    textGeometry.center();
    return new Mesh(textGeometry, material);
  }

  private createEnter() {
    return new Mesh(enterGeometry, enterMaterial);
  }

  private get positionTween() {
    if (this.tween) {
      return this.tween;
    } else {
      this.tween = new Tween(this.instance.position);
      return this.tween;
    }
  }

  private get textScaleTween() {
    if (this.textTween) {
      return this.textTween;
    } else {
      this.textTween = new Tween(this.text.scale);
      return this.textTween;
    }
  }

  private get enterScaleTween() {
    if (this.enterTween) {
      return this.enterTween;
    } else {
      this.enterTween = new Tween(this.enter.scale);
      return this.enterTween;
    }
  }
  addInstanceToScene() {
    this.application.scene.add(this.instance);
  }

  setPosition(x: number, y: number, z: number) {
    this.instance.position.set(x, y, z);
  }

  setRotation(x: number, y: number, z: number) {
    this.instance.rotation.set(x, y, z);
  }

  hide() {
    this.isVisible = false;
    this.positionTween
      .stop()
      .to({ z: -2 }, 1000)
      .easing(Easing.Elastic.Out)
      .startFromCurrentValues();
  }

  show() {
    this.isVisible = true;
    this.positionTween
      .stop()
      .to({ z: 0 }, 1000)
      .easing(Easing.Elastic.Out)
      .startFromCurrentValues();
  }

  activate() {
    this.isActivated = true;
  }

  deactivate() {
    this.isActivated = false;
  }

  focus() {
    this.isFocused = true;
    this.textScaleTween
      .stop()
      .to({ x: 1.0, y: 1.0, z: 1.0 }, 300)
      .easing(Easing.Quadratic.Out)
      .startFromCurrentValues();
    this.enterScaleTween
      .stop()
      .to({ x: 1.0, y: 1.0, z: 1.0 }, 300)
      .easing(Easing.Quadratic.Out)
      .startFromCurrentValues();
  }

  unfocus() {
    this.isFocused = false;
    this.textScaleTween
      .stop()
      .to({ x: 0.0, y: 0.0, z: 0.0 }, 300)
      .easing(Easing.Quadratic.Out)
      .startFromCurrentValues();
    this.enterScaleTween
      .stop()
      .to({ x: 0.0, y: 0.0, z: 0.0 }, 300)
      .easing(Easing.Quadratic.Out)
      .startFromCurrentValues();
  }

  update() {
    // The subtitle grows and shrinks with the title.
    if (this.subtitle) {
      this.subtitle.scale.copy(this.text.scale);
      this.subtitle.lookAt(this.application.camera.instance.position);
    }
    this.text.lookAt(this.application.camera.instance.position);
    this.enter.lookAt(this.application.camera.instance.position);
    if (this.isActivated) {
      this.rock.rotation.y += 0.01;
      this.rock.rotation.z += 0.01;
    }
  }
}
