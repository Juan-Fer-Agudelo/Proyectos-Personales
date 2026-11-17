import { BoxGeometry, CanvasTexture, Mesh, MeshStandardMaterial, Object3D, SRGBColorSpace } from 'three';

export type V3 = [number, number, number];

export interface MatOpts {
  color: string;
  emissive?: string;
  ei?: number;
  rough?: number;
  metal?: number;
}

export interface BoxOpts extends MatOpts {
  rot?: V3;
  shadow?: boolean;
}

export function mat(o: MatOpts): MeshStandardMaterial {
  return new MeshStandardMaterial({
    color: o.color,
    emissive: o.emissive ?? '#000000',
    emissiveIntensity: o.ei ?? 0,
    roughness: o.rough ?? 0.9,
    metalness: o.metal ?? 0,
  });
}

export function box(parent: Object3D, size: V3, pos: V3, o: BoxOpts): Mesh {
  const m = new Mesh(new BoxGeometry(...size), mat(o));
  m.position.set(...pos);
  if (o.rot) m.rotation.set(...o.rot);
  m.castShadow = m.receiveShadow = o.shadow ?? true;
  parent.add(m);
  return m;
}

export function add<T extends Mesh>(parent: Object3D, m: T, pos: V3, rot?: V3, shadow = true): T {
  m.position.set(...pos);
  if (rot) m.rotation.set(...rot);
  m.castShadow = m.receiveShadow = shadow;
  parent.add(m);
  return m;
}

/** Draws a short label on a canvas so it can be used as a texture on a sign. */
export function textTexture(text: string, opts: { bg: string; fg: string; font?: string; w?: number; h?: number }): CanvasTexture {
  const w = opts.w ?? 512;
  const h = opts.h ?? 160;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = opts.bg;
  ctx.fillRect(0, 0, w, h);
  // wood grain lines
  ctx.strokeStyle = 'rgba(0,0,0,0.07)';
  ctx.lineWidth = 3;
  for (let y = 18; y < h; y += 26) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(w * 0.3, y + 6, w * 0.6, y - 6, w, y + 2);
    ctx.stroke();
  }
  ctx.fillStyle = opts.fg;
  ctx.font = opts.font ?? `700 ${Math.round(h * 0.46)}px Fredoka, "Nunito", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, w / 2, h / 2 + 4);
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}
