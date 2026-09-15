import { CanvasTexture, SRGBColorSpace } from "three";

const WIDTH = 1024;
const HEIGHT = 424;

export interface Slide {
  title: string;
  line: string;
  tint: string;
}

/**
 * What the monitor shows: one project at a time, cycling like a screensaver.
 * A static four up grid made the screen a contents page, and the point of the
 * screen is that it is the thing catching your eye across a dark room.
 */
export const SLIDES: Slide[] = [
  {
    title: "StemAlly",
    line: "Equations you move around inside",
    tint: "#1c636f",
  },
  {
    title: "TactileNav",
    line: "Street maps you read with one finger",
    tint: "#1d4e89",
  },
  { title: "Ally", line: "It failed its own rules twice", tint: "#b3338b" },
  {
    title: "Threadline",
    line: "Priced before you buy it",
    tint: "#4c7c96",
  },
];

/** A texture plus the draw call that repaints it. */
export interface ScreenTexture {
  texture: CanvasTexture;
  /** `progress` 0 to 1 crossfades from slide `index` to the next one. */
  draw: (index: number, progress: number) => void;
  dispose: () => void;
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

function paintSlide(
  ctx: CanvasRenderingContext2D,
  slide: Slide,
  alpha: number,
) {
  ctx.save();
  ctx.globalAlpha = alpha;

  const grad = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  grad.addColorStop(0, slide.tint);
  grad.addColorStop(0.55, "#241a18");
  grad.addColorStop(1, "#120d0b");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // A vignette, so the panel does not read as a flat lit card.
  const vig = ctx.createRadialGradient(
    WIDTH * 0.32,
    HEIGHT * 0.45,
    60,
    WIDTH * 0.32,
    HEIGHT * 0.45,
    WIDTH * 0.8,
  );
  vig.addColorStop(0, "rgba(0,0,0,0)");
  vig.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // A phone silhouette, so the slide reads as an app and not a colour field.
  ctx.fillStyle = "rgba(242, 234, 225, 0.14)";
  roundRect(ctx, 96, 96, 152, 300, 22);
  ctx.fill();
  ctx.strokeStyle = "rgba(242, 234, 225, 0.28)";
  ctx.lineWidth = 3;
  roundRect(ctx, 96, 96, 152, 300, 22);
  ctx.stroke();

  ctx.fillStyle = "#f2eae1";
  ctx.font = "600 68px Georgia, serif";
  ctx.fillText(slide.title, 300, 210);

  ctx.fillStyle = "rgba(242, 234, 225, 0.82)";
  ctx.font = "400 30px system-ui, sans-serif";
  ctx.fillText(slide.line, 300, 262);

  ctx.restore();
}

function paintChrome(ctx: CanvasRenderingContext2D, index: number) {
  ctx.fillStyle = "rgba(242, 234, 225, 0.72)";
  ctx.font = "500 24px system-ui, sans-serif";
  ctx.letterSpacing = "6px";
  ctx.fillText("PROJECTS", 96, 56);
  ctx.letterSpacing = "0px";

  // Position dots, so the cycle reads as a sequence rather than a glitch.
  SLIDES.forEach((_, i) => {
    ctx.beginPath();
    ctx.arc(WIDTH - 96 - (SLIDES.length - 1 - i) * 26, 48, 6, 0, Math.PI * 2);
    ctx.fillStyle =
      i === index ? "#f2eae1" : "rgba(242, 234, 225, 0.28)";
    ctx.fill();
  });
}

export function makeScreenTexture(): ScreenTexture {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d")!;

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;

  const draw = (index: number, progress: number) => {
    const current = SLIDES[index % SLIDES.length];
    const next = SLIDES[(index + 1) % SLIDES.length];

    ctx.fillStyle = "#120d0b";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    paintSlide(ctx, current, 1);
    if (progress > 0) paintSlide(ctx, next, progress);
    paintChrome(ctx, progress > 0.5 ? (index + 1) % SLIDES.length : index % SLIDES.length);

    texture.needsUpdate = true;
  };

  draw(0, 0);

  return { texture, draw, dispose: () => texture.dispose() };
}

/**
 * The laptop's screen: a terminal mid boot. The laptop opens the About view,
 * which is a terminal, so the object says what it does before you click it.
 */
export function makeLaptopTexture(): CanvasTexture {
  const width = 660;
  const height = 392;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#17100f";
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "#241a18";
  ctx.fillRect(0, 0, width, 34);
  ["#8b2332", "#d4a0a0", "#7a706a"].forEach((c, i) => {
    ctx.beginPath();
    ctx.arc(24 + i * 22, 17, 6, 0, Math.PI * 2);
    ctx.fillStyle = c;
    ctx.fill();
  });

  ctx.font = "400 19px ui-monospace, monospace";
  const lines: [string, string][] = [
    ["Resolving package dependencies", "#7a706a"],
    ["Compiling Swift", "#7a706a"],
    ["Running accessibility audit", "#7a706a"],
    ["Attaching VoiceOver", "#7a706a"],
    ["Pouring the third coffee", "#7a706a"],
  ];
  lines.forEach(([text, colour], i) => {
    const y = 78 + i * 34;
    ctx.fillStyle = colour;
    ctx.fillText(text, 28, y);
    ctx.fillStyle = "#d4a0a0";
    ctx.fillText("[100%]", width - 108, y);
  });
  ctx.fillStyle = "#f2eae1";
  ctx.fillText("Ready.", 28, 78 + 5 * 34);
  ctx.fillStyle = "#d4a0a0";
  ctx.fillRect(112, 78 + 5 * 34 - 15, 11, 20);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
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

  ctx.fillStyle = "rgba(42, 33, 28, 0.42)";
  const widths = [0.92, 0.88, 0.95, 0.7, 0.9, 0.93, 0.66, 0.91, 0.87, 0.94, 0.58];
  widths.forEach((w, i) => {
    ctx.fillRect(44, 168 + i * 34, (width - 88) * w, 9);
  });

  ctx.fillStyle = "rgba(139, 35, 50, 0.75)";
  [58, 96, 132, 74, 112].forEach((h, i) => {
    ctx.fillRect(56 + i * 44, 630 - h, 28, h);
  });

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}
