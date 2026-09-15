import { CanvasTexture, SRGBColorSpace } from "three";

const CARDS = [
  { label: "StemAlly", tint: "#8b2332" },
  { label: "TactileNav", tint: "#6d2b38" },
  { label: "Ally", tint: "#a8555f" },
  { label: "Threadline", tint: "#7a4046" },
];

/**
 * The monitor's contents, drawn once into a canvas rather than loaded as an
 * image. Four cards, one per project, because the screen is what the eye lands
 * on first and a blank glowing rectangle says nothing about the work.
 *
 * Phase 3 swaps this for the real thumbnails; the geometry does not change.
 */
export function makeScreenTexture(): CanvasTexture {
  const width = 1024;
  const height = 424;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#15100e";
  ctx.fillRect(0, 0, width, height);

  // Title bar
  ctx.fillStyle = "#f2eae1";
  ctx.font = "600 30px system-ui, sans-serif";
  ctx.fillText("Selected work", 52, 66);

  const gap = 26;
  const left = 52;
  const top = 100;
  const cardW = (width - left * 2 - gap) / 2;
  const cardH = (height - top - 52 - gap) / 2;

  CARDS.forEach((card, index) => {
    const x = left + (index % 2) * (cardW + gap);
    const y = top + Math.floor(index / 2) * (cardH + gap);

    const grad = ctx.createLinearGradient(x, y, x + cardW, y + cardH);
    grad.addColorStop(0, card.tint);
    grad.addColorStop(1, "#2a1a1a");
    ctx.fillStyle = grad;
    roundRect(ctx, x, y, cardW, cardH, 14);
    ctx.fill();

    // A phone silhouette, so each card reads as an app rather than a swatch.
    ctx.fillStyle = "rgba(242, 234, 225, 0.16)";
    roundRect(ctx, x + 22, y + 20, cardH * 0.42, cardH - 40, 10);
    ctx.fill();

    ctx.fillStyle = "#f2eae1";
    ctx.font = "500 24px system-ui, sans-serif";
    ctx.fillText(card.label, x + cardH * 0.42 + 46, y + 44);
  });

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * The e-reader's page. Ruled lines and a heading, so the object reads as a
 * document rather than as a dark slab with a stylus lying on it.
 */
export function makeReaderTexture(): CanvasTexture {
  const width = 512;
  const height = 716;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#e8ddd0";
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "#2a211c";
  ctx.font = "600 44px Georgia, serif";
  ctx.fillText("Research", 44, 96);

  ctx.fillStyle = "#8b2332";
  ctx.fillRect(44, 118, 120, 5);

  // Ruled lines, with ragged right edges so they read as prose.
  ctx.fillStyle = "rgba(42, 33, 28, 0.42)";
  const widths = [0.92, 0.88, 0.95, 0.7, 0.9, 0.93, 0.66, 0.91, 0.87, 0.94, 0.58];
  widths.forEach((w, i) => {
    ctx.fillRect(44, 168 + i * 34, (width - 88) * w, 9);
  });

  // A small chart block, because three of the four artifacts have one.
  ctx.fillStyle = "rgba(139, 35, 50, 0.75)";
  [58, 96, 132, 74, 112].forEach((h, i) => {
    ctx.fillRect(56 + i * 44, 630 - h, 28, h);
  });

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}
