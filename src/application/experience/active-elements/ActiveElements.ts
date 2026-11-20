import { ActiveElement } from "./elements/ActiveElement";

import { Object3D } from "three";
import { Application } from "../../Application";
import { contacts, projects } from "../../data/portfolio";

export class ActiveElements {
  private activeElements: Map<Object3D, ActiveElement> = new Map<
    Object3D,
    ActiveElement
  >();
  private activeElementInstances: Object3D[] = [];
  private rangeData = { range: 0, distance: 0 };
  private focusedElement: ActiveElement | undefined;

  constructor(
    private application: Application,
    private getRangeFactor: (
      element: Object3D,
      data: { range: number; distance: number },
    ) => { range: number; distance: number },
    private getDistance2d: (element: Object3D) => number,
  ) {
    // One rock per project and per contact, all built the same way.
    [...projects, ...contacts].forEach(({ x, y, ...link }) => {
      const element = new ActiveElement(application, link);
      element.addInstanceToScene();
      element.setPosition(x, y, 0);
      this.activeElements.set(element.instance, element);
    });

    this.activeElementInstances = Array.from(this.activeElements.keys());

    document.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && this.focusedElement?.link.url) {
        const win = window.open(this.focusedElement.link.url, "_blank");
        if (!win) {
          alert("Please allow popups for this website");
        }
      }
    });
  }

  update() {
    const threshold = 0.9;
    let range = -1;
    let focusedElementCandidate: ActiveElement | undefined;
    this.activeElementInstances.forEach((instance) => {
      const elementRange = this.getRangeFactor(instance, this.rangeData);
      const distance2d = this.getDistance2d(instance);
      const activeElement = this.activeElements.get(instance);

      if (!activeElement) return;

      const elementInFrustum = this.application.camera.checkIfInFrustum(
        activeElement.instance.position,
      );
      const cameraPositionOn2Floor =
        this.application.camera.instance.position.y < 0;

      if (
        cameraPositionOn2Floor &&
        elementInFrustum &&
        elementRange.range > threshold &&
        elementRange.range > range
      ) {
        range = elementRange.range;
        focusedElementCandidate = activeElement;
      }

      if (elementRange.range > threshold) {
        if (!activeElement.isActivated) {
          activeElement.activate();
        }
      } else {
        if (activeElement.isActivated) {
          activeElement.deactivate();
        }
      }

      if (distance2d < 2.5 && activeElement.isVisible) {
        activeElement.hide();
      } else if (distance2d > 2.5 && !activeElement.isVisible) {
        activeElement.show();
      }

      activeElement.update();
    });

    if (focusedElementCandidate && !focusedElementCandidate.isFocused) {
      if (this.focusedElement !== focusedElementCandidate) {
        this.focusedElement?.unfocus();
      }
      focusedElementCandidate.focus();
      this.focusedElement = focusedElementCandidate;
    }

    if (!focusedElementCandidate && this.focusedElement) {
      this.focusedElement.unfocus();
      this.focusedElement = undefined;
    }
  }
}
