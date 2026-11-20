import {
  BoxGeometry,
  BufferGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  SRGBColorSpace,
} from "three";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils";
import { resources } from "../../resources/Resources";
import { signs, type SignPiece } from "../../data/portfolio";

// The map model came with the original author's details written on its walls
// (his jobs, his degree, a map of his city). Each of those meshes keeps its
// place, orientation and material; only its shape is swapped for new text, so
// the result sits in the scene exactly like the original did.

function piece({ text, x, y, size, align = "left", underline }: SignPiece) {
  const geometry: BufferGeometry = new TextGeometry(text, {
    font: resources.getFont("jost"),
    size,
    height: 0.1, // any depth: fitInto sets the real thickness
    curveSegments: 5,
    bevelEnabled: false,
  });
  geometry.computeBoundingBox();
  const box = geometry.boundingBox!;
  const width = box.max.x - box.min.x;
  const shift = align === "center" ? -width / 2 : align === "right" ? -width : 0;
  geometry.translate(x + shift - box.min.x, y, 0);
  if (!underline) return [geometry];
  const bar = new BoxGeometry(width, size * 0.1, 0.1).toNonIndexed();
  bar.translate(x + shift + width / 2, y - size * 0.32, 0.05);
  return [geometry, bar];
}

function buildSign(pieces: SignPiece[]) {
  const parts = pieces.flatMap(piece);
  parts.forEach((g) => {
    if (g.index) throw new Error("expected non-indexed geometry");
    g.deleteAttribute("uv");
  });
  const geometry = mergeGeometries(parts)!;
  // Text is written in XY with +Y up; the map's text meshes lie in their local
  // XZ plane with -Z up, so rotate a quarter turn about X.
  geometry.rotateX(-Math.PI / 2);
  return geometry;
}

function fitInto(target: Mesh, geometry: BufferGeometry, align: "left" | "center") {
  target.geometry.computeBoundingBox();
  const old = target.geometry.boundingBox!;
  geometry.computeBoundingBox();
  let box = geometry.boundingBox!;
  const scale = (old.max.x - old.min.x) / (box.max.x - box.min.x);
  geometry.scale(scale, scale, scale);
  // Same thickness as the original lettering, whatever the scale.
  geometry.computeBoundingBox();
  geometry.scale(1, (old.max.y - old.min.y) / (geometry.boundingBox!.max.y - geometry.boundingBox!.min.y), 1);
  geometry.computeBoundingBox();
  box = geometry.boundingBox!;
  const dx = align === "center" ? (old.min.x + old.max.x) / 2 - (box.min.x + box.max.x) / 2 : old.min.x - box.min.x;
  const dy = (old.min.y + old.max.y) / 2 - (box.min.y + box.max.y) / 2;
  geometry.translate(dx, dy, old.min.z - box.min.z); // tops line up (-Z is up)
  target.geometry.dispose();
  target.geometry = geometry;
}

export function personalizeMap(scene: Group) {
  scene.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    const sign = signs[object.name];
    if (sign) fitInto(object, buildSign(sign.pieces), sign.align);

    if (object.name === "Poster") {
      const original = (object.material as MeshStandardMaterial).map;
      const map = resources.getTexture("cityMap");
      map.flipY = original?.flipY ?? false;
      map.colorSpace = original?.colorSpace ?? SRGBColorSpace;
      map.needsUpdate = true;
      (object.material as MeshStandardMaterial).map = map;
    }
  });
}
