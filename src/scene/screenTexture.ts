import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from "three";

/** A texture plus the draw call that repaints it. */
export interface ScreenTexture {
  texture: CanvasTexture;
  /** `progress` 0 to 1 changes from slide `index` to the next one. */
  draw: (index: number, progress: number) => void;
  dispose: () => void;
}

function finish(canvas: HTMLCanvasElement): CanvasTexture {
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
 * Loads an image and calls back once, or never if it fails. Every texture that
 * wants a photograph in it paints once without and once with, rather than
 * blocking the scene on a decode.
 */
function load(src: string, onReady: (image: HTMLImageElement) => void) {
  const image = new Image();
  image.decoding = "async";
  image.onload = () => onReady(image);
  image.src = src;
}

/** Smoothstep. Ends of a fade that ease rather than start and stop flat. */
function smooth(t: number): number {
  const x = Math.max(0, Math.min(1, t));
  return x * x * (3 - 2 * x);
}

/**
 * Draws an image to fill a rect without squashing it, cropping the overflow.
 * The CSS equivalent is `object-fit: cover`, which a canvas does not have.
 */
function cover(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const scale = Math.max(w / image.width, h / image.height);
  const dw = image.width * scale;
  const dh = image.height * scale;
  ctx.drawImage(image, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

/**
 * The handwriting family, read off the document rather than named here.
 *
 * next/font renames a family when it self-hosts it, so asking a canvas for
 * "Patrick Hand" gets you the fallback and a sticky note set in Helvetica. The
 * CSS variable holds whatever name the build actually produced.
 */
function handwriting(): string {
  if (typeof document === "undefined") return "cursive";
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue("--font-patrick-hand")
    .trim();
  return value ? `${value}, cursive` : "cursive";
}

/* ------------------------------------------------------------------ monitor */

const SCREEN_W = 1024;
const SCREEN_H = 424;

export interface Slide {
  title: string;
  line: string;
  shot: string;
}

/**
 * What the monitor shows: one project at a time, cycling like a screensaver.
 *
 * A grid of every screen at once made it a contents page, and from across a
 * dark room a contents page is a white rectangle. One project at a time is the
 * thing that catches your eye.
 */
export const SLIDES: Slide[] = [
  {
    title: "StemAlly",
    line: "Equations you move around inside",
    shot: "/images/projects/stemally/home.webp",
  },
  {
    title: "TactileNav",
    line: "Street maps you read with one finger",
    shot: "/images/projects/tactilenav/map-congress.webp",
  },
  {
    title: "ARIA",
    line: "It audits itself first",
    shot: "/images/projects/aria/audit.webp",
  },
  {
    title: "Ally",
    line: "It failed its own rules twice",
    shot: "/images/projects/ally/toolkit-home-dark.webp",
  },
  {
    title: "Threadline",
    line: "Priced before you buy it",
    shot: "/images/projects/threadline/wardrobe.webp",
  },
];

/**
 * The monitor. One project holds for 3.4s, then changes over 0.7s.
 *
 * The canvas is only repainted while a fade is in flight, and at 24fps rather
 * than every frame, because each repaint is a texture upload to the GPU and
 * nothing on a held slide is moving.
 */
export function makeScreenTexture(): ScreenTexture {
  const canvas = document.createElement("canvas");
  canvas.width = SCREEN_W;
  canvas.height = SCREEN_H;
  const ctx = canvas.getContext("2d")!;
  const texture = finish(canvas);

  const shots: (HTMLImageElement | null)[] = SLIDES.map(() => null);
  let wallpaper: HTMLImageElement | null = null;
  let last = { index: 0, progress: 0 };

  /**
   * The background every slide shares: the same wallpaper the laptop is
   * showing, darkened so white type sits on it.
   *
   * Each project used to bring its own tint, which meant the monitor flicked
   * from teal to blue to magenta every four seconds and the room's colour
   * changed with it. One background means the slide changes and the room does
   * not.
   */
  function paintBackdrop() {
    if (wallpaper) {
      cover(ctx, wallpaper, 0, 0, SCREEN_W, SCREEN_H);
      ctx.fillStyle = "rgba(14, 10, 12, 0.55)";
      ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
    } else {
      ctx.fillStyle = "#1a1014";
      ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
    }

    // A vignette, so the panel does not read as a flat lit card.
    const vig = ctx.createRadialGradient(
      SCREEN_W * 0.4,
      SCREEN_H * 0.45,
      80,
      SCREEN_W * 0.4,
      SCREEN_H * 0.45,
      SCREEN_W * 0.78,
    );
    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(1, "rgba(0,0,0,0.6)");
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  }

  function paintSlide(
    slide: Slide,
    image: HTMLImageElement | null,
    alpha: number,
    offset: number,
  ) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(0, offset);

    // The phone, with the real screen inside it when it has decoded.
    const px = 96;
    const py = 78;
    const pw = 152;
    const ph = 268;
    ctx.save();
    roundRect(ctx, px, py, pw, ph, 22);
    ctx.clip();
    if (image) cover(ctx, image, px, py, pw, ph);
    else ctx.fillStyle = "rgba(242, 234, 225, 0.14)";
    if (!image) ctx.fillRect(px, py, pw, ph);
    ctx.restore();
    ctx.strokeStyle = "rgba(242, 234, 225, 0.32)";
    ctx.lineWidth = 3;
    roundRect(ctx, px, py, pw, ph, 22);
    ctx.stroke();

    ctx.fillStyle = "#f2eae1";
    ctx.font = "600 68px Georgia, serif";
    ctx.fillText(slide.title, 300, 210);

    ctx.fillStyle = "rgba(242, 234, 225, 0.82)";
    ctx.font = "400 30px system-ui, sans-serif";
    ctx.fillText(slide.line, 300, 262);

    ctx.restore();
  }

  const draw = (index: number, progress: number) => {
    last = { index, progress };
    const i = index % SLIDES.length;
    const j = (index + 1) % SLIDES.length;

    paintBackdrop();

    /**
     * One slide at a time.
     *
     * The two slides used to cross dissolve, the outgoing one held at full
     * opacity while the incoming one came up on top of it. Both titles are
     * set at the same point on the panel, so for the length of the fade the
     * monitor showed two project names printed over each other and neither
     * was readable. The outgoing slide now leaves before the incoming one
     * arrives, each carrying a small rise, and the panel is briefly just its
     * background in between.
     */
    if (progress <= 0) {
      paintSlide(SLIDES[i], shots[i], 1, 0);
    } else if (progress < 0.5) {
      const t = smooth(progress / 0.5);
      paintSlide(SLIDES[i], shots[i], 1 - t, -14 * t);
    } else {
      const t = smooth((progress - 0.5) / 0.5);
      paintSlide(SLIDES[j], shots[j], t, 14 * (1 - t));
    }

    ctx.fillStyle = "rgba(242, 234, 225, 0.72)";
    ctx.font = "500 24px system-ui, sans-serif";
    ctx.letterSpacing = "6px";
    ctx.fillText("PROJECTS", 96, 50);
    ctx.letterSpacing = "0px";

    // Position dots, so the cycle reads as a sequence rather than a glitch.
    const active = progress > 0.5 ? j : i;
    SLIDES.forEach((_, k) => {
      ctx.beginPath();
      ctx.arc(SCREEN_W - 96 - (SLIDES.length - 1 - k) * 26, 42, 6, 0, Math.PI * 2);
      ctx.fillStyle = k === active ? "#f2eae1" : "rgba(242, 234, 225, 0.28)";
      ctx.fill();
    });

    texture.needsUpdate = true;
  };

  load("/images/scene/wallpaper.jpg", (image) => {
    wallpaper = image;
    draw(last.index, last.progress);
  });
  SLIDES.forEach((slide, i) =>
    load(slide.shot, (image) => {
      shots[i] = image;
      draw(last.index, last.progress);
    }),
  );
  draw(0, 0);

  return { texture, draw, dispose: () => texture.dispose() };
}

/* ------------------------------------------------------------------- laptop */

/**
 * The dock, drawn rather than shipped as icons. Five apps and a bin, each one
 * a rounded square with a glyph in it, because at this size on a lid two
 * centimetres wide a glyph is all that survives anyway.
 */
const DOCK: { fill: string; glyph: string; label: string }[] = [
  { fill: "#3b7fe0", glyph: "safari", label: "Safari" },
  { fill: "#e2543a", glyph: "book", label: "Books" },
  { fill: "#2c2c31", glyph: "figma", label: "Figma" },
  { fill: "#f4f4f6", glyph: "calendar", label: "Calendar" },
  { fill: "#1f8f4a", glyph: "terminal", label: "Terminal" },
];

function dockGlyph(
  ctx: CanvasRenderingContext2D,
  kind: string,
  cx: number,
  cy: number,
  size: number,
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.lineWidth = Math.max(2, size * 0.09);
  ctx.strokeStyle = "rgba(255,255,255,0.92)";
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  const r = size * 0.3;

  if (kind === "safari") {
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-r * 0.5, r * 0.5);
    ctx.lineTo(r * 0.55, -r * 0.55);
    ctx.lineTo(r * 0.12, r * 0.12);
    ctx.closePath();
    ctx.fill();
  } else if (kind === "book") {
    ctx.beginPath();
    ctx.moveTo(-r, -r * 0.8);
    ctx.lineTo(0, -r * 0.55);
    ctx.lineTo(0, r * 0.9);
    ctx.lineTo(-r, r * 0.65);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(r, -r * 0.8);
    ctx.lineTo(0, -r * 0.55);
    ctx.lineTo(0, r * 0.9);
    ctx.lineTo(r, r * 0.65);
    ctx.closePath();
    ctx.stroke();
  } else if (kind === "figma") {
    const s = r * 0.52;
    [
      ["#f24e1e", -s, -s * 2],
      ["#ff7262", s, -s * 2],
      ["#a259ff", -s, 0],
      ["#1abcfe", s, 0],
      ["#0acf83", -s, s * 2],
    ].forEach(([c, x, y]) => {
      ctx.fillStyle = c as string;
      ctx.beginPath();
      ctx.arc(x as number, y as number, s * 0.95, 0, Math.PI * 2);
      ctx.fill();
    });
  } else if (kind === "calendar") {
    ctx.fillStyle = "#d93025";
    ctx.font = `700 ${size * 0.26}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("SEP", 0, -r * 0.25);
    ctx.fillStyle = "#1c1c1e";
    ctx.font = `600 ${size * 0.44}px system-ui, sans-serif`;
    ctx.fillText(String(new Date().getDate()), 0, r * 0.68);
    ctx.textAlign = "left";
  } else {
    ctx.strokeStyle = "rgba(255,255,255,0.92)";
    ctx.beginPath();
    ctx.moveTo(-r * 0.6, -r * 0.4);
    ctx.lineTo(-r * 0.1, 0);
    ctx.lineTo(-r * 0.6, r * 0.4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(r * 0.05, r * 0.45);
    ctx.lineTo(r * 0.65, r * 0.45);
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * The laptop's screen: her own desktop, with the wallpaper she picked, a menu
 * bar, two folders and a dock.
 *
 * It used to be a terminal mid boot. The terminal is what opens when you click
 * it, so putting the terminal on the lid as well showed the same thing twice
 * and left nowhere for the boot to happen.
 */
export function makeLaptopTexture(): ScreenTexture {
  const width = 880;
  const height = 550;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  const texture = finish(canvas);

  let wallpaper: HTMLImageElement | null = null;

  const draw = () => {
    if (wallpaper) cover(ctx, wallpaper, 0, 0, width, height);
    else {
      ctx.fillStyle = "#2a1016";
      ctx.fillRect(0, 0, width, height);
    }

    // Menu bar
    ctx.fillStyle = "rgba(20, 14, 16, 0.55)";
    ctx.fillRect(0, 0, width, 30);
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.font = "600 17px system-ui, sans-serif";
    ctx.fillText("Finder", 46, 21);
    ctx.font = "400 16px system-ui, sans-serif";
    ["File", "Edit", "View", "Go", "Window", "Help"].forEach((word, i) => {
      ctx.fillText(word, 122 + i * 62, 21);
    });
    ctx.textAlign = "right";
    ctx.fillText("Mon 9:41 AM", width - 20, 21);
    ctx.textAlign = "left";

    // Two folders down the right edge. The tax one is a joke; the timeline one
    // is a real route, and both open the same About view.
    const folders = [
      { label: "Timeline", y: 78 },
      { label: "Tax documents", y: 188 },
      { label: "Resume.pdf", y: 298 },
    ];
    folders.forEach((folder, i) => {
      const x = width - 108;
      ctx.fillStyle = i === 2 ? "#e8e6e2" : "#5aa9e6";
      if (i === 2) {
        roundRect(ctx, x, folder.y, 56, 68, 6);
        ctx.fill();
        ctx.fillStyle = "#8b2332";
        ctx.fillRect(x + 10, folder.y + 44, 36, 6);
      } else {
        roundRect(ctx, x, folder.y + 8, 62, 46, 6);
        ctx.fill();
        ctx.fillStyle = "#7cc0f0";
        roundRect(ctx, x, folder.y, 28, 12, 4);
        ctx.fill();
      }
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.font = "400 14px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(folder.label, x + 31, folder.y + 74);
      ctx.textAlign = "left";
    });

    // Dock
    const tile = 54;
    const gap = 12;
    const count = DOCK.length + 1;
    const dockW = count * tile + (count + 1) * gap;
    const dockX = (width - dockW) / 2;
    const dockY = height - tile - 26;
    ctx.fillStyle = "rgba(240, 235, 235, 0.22)";
    roundRect(ctx, dockX, dockY - gap, dockW, tile + gap * 2, 16);
    ctx.fill();
    DOCK.forEach((app, i) => {
      const x = dockX + gap + i * (tile + gap);
      ctx.fillStyle = app.fill;
      roundRect(ctx, x, dockY, tile, tile, 12);
      ctx.fill();
      dockGlyph(ctx, app.glyph, x + tile / 2, dockY + tile / 2, tile);
    });
    // The bin, at the end, past a separator, the way a dock is arranged.
    const binX = dockX + gap + DOCK.length * (tile + gap);
    ctx.strokeStyle = "rgba(255,255,255,0.28)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(binX - gap / 2, dockY + 6);
    ctx.lineTo(binX - gap / 2, dockY + tile - 6);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,0.8)";
    ctx.lineWidth = 3;
    roundRect(ctx, binX + 12, dockY + 16, 30, 32, 4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(binX + 8, dockY + 14);
    ctx.lineTo(binX + 46, dockY + 14);
    ctx.stroke();

    texture.needsUpdate = true;
  };

  load("/images/scene/wallpaper.jpg", (image) => {
    wallpaper = image;
    draw();
  });
  draw();

  return { texture, draw: () => draw(), dispose: () => texture.dispose() };
}

/* ----------------------------------------------------------------- notebook */

/**
 * The notebook page. Ruled lines, a handwritten heading and a sketch, because
 * a page with a pen resting on it should look like somebody has been writing
 * on it.
 */
export function makeReaderTexture(): CanvasTexture {
  const width = 512;
  const height = 716;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#f4f1e8";
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "rgba(42, 33, 28, 0.07)";
  for (let i = 0; i < 20; i += 1) ctx.fillRect(40, 132 + i * 30, width - 80, 2);

  // The sketch: a fingertip on a raised line with the feedback coming back out
  // of it, which is the same mark the site uses as its logo.
  ctx.strokeStyle = "#2a211c";
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(96, 250);
  ctx.lineTo(416, 250);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(256, 218, 30, 0, Math.PI * 2);
  ctx.stroke();

  ctx.lineWidth = 5;
  [0.55, 0.85, 1.15].forEach((r, i) => {
    ctx.strokeStyle = `rgba(139, 35, 50, ${0.85 - i * 0.22})`;
    ctx.beginPath();
    ctx.arc(256, 218, 30 + r * 40, -Math.PI * 0.85, -Math.PI * 0.15);
    ctx.stroke();
  });

  ctx.font = `44px ${handwriting()}`;
  ctx.fillStyle = "#2a211c";
  ctx.textAlign = "center";
  ctx.fillText("Research", 256, 128);
  ctx.font = `26px ${handwriting()}`;
  ctx.fillStyle = "rgba(42, 33, 28, 0.6)";
  ctx.fillText("what the defaults miss", 256, 330);
  ctx.textAlign = "left";

  ctx.fillStyle = "rgba(42, 33, 28, 0.45)";
  [0.86, 0.72, 0.9, 0.52].forEach((w, i) => {
    ctx.fillRect(56, 400 + i * 30, (width - 112) * w, 6);
  });

  ctx.fillStyle = "rgba(139, 35, 50, 0.8)";
  [50, 84, 116, 66, 98].forEach((h, i) => {
    ctx.fillRect(66 + i * 42, 640 - h, 26, h);
  });
  ctx.fillStyle = "rgba(42, 33, 28, 0.35)";
  ctx.fillRect(56, 640, width - 112, 3);

  return finish(canvas);
}

/* --------------------------------------------------------------- small type */

/**
 * A word set in tracked-out caps on a transparent ground: the sign above the
 * monitor, and the label beside the notebook.
 *
 * It is a texture rather than 3D text because a sign is flat, and because drei
 * Text would pull a font loader and the whole troika dependency into the scene
 * chunk for two words.
 */
export function makeSignTexture(text: string): CanvasTexture {
  const width = 512;
  const height = 64;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  ctx.font = "500 30px system-ui, sans-serif";
  ctx.letterSpacing = "9px";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#f2eae1";
  ctx.fillText(text, width / 2, height / 2 + 1);

  return finish(canvas);
}

/**
 * The sticky note on the laptop. Two handwritten words and a fold, which is
 * all a sticky note is.
 */
export function makeNoteTexture(): CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#edd97f";
  ctx.fillRect(0, 0, size, size);

  // The adhesive strip across the top reads a shade deeper than the paper.
  ctx.fillStyle = "rgba(190, 160, 60, 0.28)";
  ctx.fillRect(0, 0, size, 34);
  // And the bottom right corner lifts.
  const curl = ctx.createLinearGradient(size - 60, size - 60, size, size);
  curl.addColorStop(0, "rgba(0,0,0,0)");
  curl.addColorStop(1, "rgba(120, 95, 25, 0.35)");
  ctx.fillStyle = curl;
  ctx.fillRect(size - 70, size - 70, 70, 70);

  ctx.save();
  ctx.translate(size / 2, size / 2);
  ctx.rotate(-0.06);
  ctx.fillStyle = "#3b3117";
  ctx.textAlign = "center";
  ctx.font = `64px ${handwriting()}`;
  ctx.fillText("about", 0, -4);
  ctx.fillText("me", 0, 62);
  ctx.restore();

  return finish(canvas);
}

/**
 * The desk calendar's card. It shows the day you opened the page, not a day I
 * typed in: a calendar that is wrong is a prop, and every other date on this
 * site is a real one.
 */
export function makeCalendarTexture(): CanvasTexture {
  const width = 256;
  const height = 224;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  const today = new Date();
  const month = today
    .toLocaleString("en-US", { month: "short" })
    .toUpperCase();
  const weekday = today.getDay();

  ctx.fillStyle = "#f6f2e8";
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "#8b2332";
  ctx.fillRect(0, 0, width, 54);
  ctx.fillStyle = "#f2eae1";
  ctx.font = "600 30px system-ui, sans-serif";
  ctx.letterSpacing = "6px";
  ctx.textAlign = "center";
  ctx.fillText(month, width / 2, 38);
  ctx.letterSpacing = "0px";

  ctx.fillStyle = "#2a211c";
  ctx.font = "600 78px Georgia, serif";
  ctx.fillText(String(today.getDate()), width / 2, 140);

  // Seven days across, with today filled in.
  const cell = 26;
  const left = (width - cell * 7) / 2;
  for (let i = 0; i < 7; i += 1) {
    ctx.fillStyle = i === weekday ? "#8b2332" : "rgba(42, 33, 28, 0.2)";
    ctx.beginPath();
    ctx.arc(left + cell * i + cell / 2, 178, 7, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "rgba(42, 33, 28, 0.5)";
  ctx.font = "400 17px system-ui, sans-serif";
  ctx.fillText("timeline", width / 2, 210);
  ctx.textAlign = "left";

  return finish(canvas);
}

/**
 * What is outside the window: my photograph of a sunset, and nothing else.
 * There were painted rooftops along the bottom, which fought the picture.
 *
 * It is scenery. There was a frosted pane over it once and weather behind it
 * after that, and both of them were the window asking for attention it did
 * not need: it is a photograph in a frame on a wall, and the thing it is for
 * is being the reason there is daylight in the room.
 */
export function makeSkyTexture(): { texture: CanvasTexture; dispose: () => void } {
  const width = 512;
  const height = 720;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  const texture = finish(canvas);

  let photograph: HTMLImageElement | null = null;

  const draw = () => {
    if (photograph) {
      /**
       * The photograph, with its colour pushed rather than pulled.
       *
       * The pane carries an emissive map, which is what makes a window read
       * as a source of light rather than as a picture hung on a wall, and an
       * emissive map washes a photograph out: the brighter it is asked to
       * glow, the further every pixel travels toward white and the less of
       * the sunset is left. The emissive came down and the saturation went
       * up, so what is in the window is the colour that was in the sky.
       *
       * `ctx.filter` is a no-op string assignment where it is not supported,
       * and the picture is still the picture, so there is nothing to guard.
       */
      ctx.filter = "saturate(1.42) contrast(1.06)";
      cover(ctx, photograph, 0, 0, width, height);
      ctx.filter = "none";
    } else {
      const sky = ctx.createLinearGradient(0, 0, 0, height);
      sky.addColorStop(0, "#8f8fb8");
      sky.addColorStop(0.55, "#e29070");
      sky.addColorStop(1, "#f3b874");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, width, height);
    }

    texture.needsUpdate = true;
  };

  load("/images/scene/sky.jpg", (image) => {
    photograph = image;
    draw();
  });
  draw();

  return { texture, dispose: () => texture.dispose() };
}


/**
 * The crema on the coffee: a warm disc with a lighter centre and a scatter of
 * bubbles at the edge. Flat brown read as a hole in the mug.
 */
export function makeCoffeeTexture(): CanvasTexture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const c = size / 2;

  let seed = 9;
  const random = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };

  // The drink underneath. Dark at the wall, warmer toward the middle, because
  // a cup of coffee is deepest where it is deepest.
  const body = ctx.createRadialGradient(c, c, 4, c, c, c);
  body.addColorStop(0, "#6b431f");
  body.addColorStop(0.55, "#53341a");
  body.addColorStop(0.86, "#3a2413");
  body.addColorStop(1, "#24160c");
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(c, c, c, 0, Math.PI * 2);
  ctx.fill();

  // The crema: a ring of tan foam that is thickest against the wall and thins
  // toward the middle, which is the shape it actually takes in a cup.
  ctx.save();
  ctx.beginPath();
  ctx.arc(c, c, c, 0, Math.PI * 2);
  ctx.clip();

  const ring = ctx.createRadialGradient(c, c, c * 0.18, c, c, c);
  ring.addColorStop(0, "rgba(198, 152, 94, 0.18)");
  ring.addColorStop(0.55, "rgba(198, 152, 94, 0.5)");
  ring.addColorStop(0.9, "rgba(214, 173, 118, 0.82)");
  ring.addColorStop(1, "rgba(226, 190, 140, 0.9)");
  ctx.fillStyle = ring;
  ctx.fillRect(0, 0, size, size);

  // Bubbles. Each one is a shaded sphere rather than a dot: a dark rim, a lit
  // body and a highlight up and to the left, all on the same light as the
  // room. A field of flat circles is what made this read as gravel.
  for (let i = 0; i < 520; i += 1) {
    const angle = random() * Math.PI * 2;
    // Crowded toward the rim, sparse in the middle.
    const radius = c * (0.12 + Math.sqrt(random()) * 0.86);
    const r = 1.6 + random() * 5.2;
    const x = c + Math.cos(angle) * radius;
    const y = c + Math.sin(angle) * radius;

    const shade = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
    shade.addColorStop(0, `rgba(248, 226, 196, ${0.5 + random() * 0.4})`);
    shade.addColorStop(0.6, `rgba(190, 142, 88, ${0.35 + random() * 0.3})`);
    shade.addColorStop(1, `rgba(74, 46, 24, ${0.4 + random() * 0.35})`);
    ctx.fillStyle = shade;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // A few swirls dragged through the foam, the way a pour leaves it.
  ctx.strokeStyle = "rgba(90, 58, 30, 0.3)";
  ctx.lineWidth = 6;
  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath();
    const start = random() * Math.PI * 2;
    for (let k = 0; k <= 26; k += 1) {
      const a = start + k * 0.24;
      const rr = c * (0.2 + k * 0.026);
      const px = c + Math.cos(a) * rr;
      const py = c + Math.sin(a) * rr * 0.96;
      if (k === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }

  // The window and the bar light, sitting on the surface.
  const gloss = ctx.createRadialGradient(c * 0.66, c * 0.56, 2, c * 0.66, c * 0.56, c * 0.52);
  gloss.addColorStop(0, "rgba(255, 248, 236, 0.42)");
  gloss.addColorStop(0.5, "rgba(255, 244, 226, 0.12)");
  gloss.addColorStop(1, "rgba(255, 244, 226, 0)");
  ctx.fillStyle = gloss;
  ctx.fillRect(0, 0, size, size);

  // The dark meniscus where the drink meets the wall of the cup.
  const edge = ctx.createRadialGradient(c, c, c * 0.9, c, c, c);
  edge.addColorStop(0, "rgba(28, 16, 8, 0)");
  edge.addColorStop(1, "rgba(28, 16, 8, 0.65)");
  ctx.fillStyle = edge;
  ctx.fillRect(0, 0, size, size);
  ctx.restore();

  return finish(canvas);
}

/**
 * One monstera leaf, as a silhouette with an alpha channel.
 *
 * Geometry got this wrong twice. A flattened sphere is a coin edge-on and a
 * green ball face-on, and the notches that make a monstera a monstera are the
 * whole reason you know what the plant is. A cut-out on a plane has the right
 * outline from every angle the room can turn to, for two triangles.
 */
export function makeLeafTexture(): CanvasTexture {
  const w = 256;
  const h = 320;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  const cx = w / 2;
  ctx.fillStyle = "#2f6f41";
  ctx.beginPath();
  ctx.moveTo(cx, 12);
  ctx.bezierCurveTo(w - 18, 70, w - 10, 210, cx, h - 10);
  ctx.bezierCurveTo(10, 210, 18, 70, cx, 12);
  ctx.fill();

  // The notches, cut in from each edge toward the midrib but never reaching it.
  ctx.globalCompositeOperation = "destination-out";
  for (let i = 0; i < 5; i += 1) {
    const y = 66 + i * 46;
    const reach = 54 - i * 5;
    [-1, 1].forEach((side) => {
      ctx.beginPath();
      ctx.moveTo(cx + side * (w / 2), y);
      ctx.lineTo(cx + side * reach, y + 16);
      ctx.lineTo(cx + side * (w / 2), y + 34);
      ctx.closePath();
      ctx.fill();
    });
  }
  ctx.globalCompositeOperation = "source-over";

  // The midrib and the veins running out to each lobe.
  ctx.strokeStyle = "rgba(20, 58, 34, 0.85)";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(cx, 20);
  ctx.lineTo(cx, h - 16);
  ctx.stroke();
  ctx.lineWidth = 3;
  for (let i = 0; i < 5; i += 1) {
    const y = 84 + i * 46;
    [-1, 1].forEach((side) => {
      ctx.beginPath();
      ctx.moveTo(cx, y - 18);
      ctx.lineTo(cx + side * (w / 2 - 14), y);
      ctx.stroke();
    });
  }

  return finish(canvas);
}


/**
 * Oak, drawn rather than photographed.
 *
 * Wood grain is not noise: it is a stack of long, nearly parallel bands that
 * wander slowly along their length, with much finer streaks inside each band
 * and the occasional knot the bands have to flow around. A flat brown plane
 * with some noise on it reads as cardboard, which is what the desk was.
 *
 * Tiled 3 by 2 across the desk, so the grain runs the length of it and the
 * repeat is not on a seam you would look at.
 */
export function makeWoodTexture(): CanvasTexture {
  const w = 1024;
  const h = 512;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  let seed = 2027;
  const random = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };

  ctx.fillStyle = "#8f6a43";
  ctx.fillRect(0, 0, w, h);

  // Wide boards, each a slightly different shade, running the long way.
  const boards = [0, 0.34, 0.67, 1];
  boards.forEach((top, i) => {
    if (i === boards.length - 1) return;
    const y = top * h;
    const bh = (boards[i + 1] - top) * h;
    const shade = 0.88 + random() * 0.24;
    ctx.fillStyle = `rgb(${Math.round(143 * shade)}, ${Math.round(106 * shade)}, ${Math.round(67 * shade)})`;
    ctx.fillRect(0, y, w, bh);

    // The grain inside that board: long wandering lines, thin and low
    // contrast, crowding toward a couple of centres the way real grain does.
    for (let k = 0; k < 130; k += 1) {
      const gy = y + random() * bh;
      const dark = random() < 0.45;
      ctx.strokeStyle = dark
        ? `rgba(78, 54, 30, ${0.05 + random() * 0.16})`
        : `rgba(198, 158, 110, ${0.04 + random() * 0.12})`;
      ctx.lineWidth = 0.6 + random() * 2.2;
      ctx.beginPath();
      let px = -20;
      let py = gy;
      ctx.moveTo(px, py);
      const wobble = 1.5 + random() * 5;
      const phase = random() * Math.PI * 2;
      while (px < w + 20) {
        px += 26;
        py = gy + Math.sin(px / (90 + random() * 60) + phase) * wobble;
        ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    // A seam between boards.
    ctx.strokeStyle = "rgba(60, 40, 22, 0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  });

  // Three knots, with the grain closing in around each one.
  for (let k = 0; k < 3; k += 1) {
    const cx = 120 + random() * (w - 240);
    const cy = 60 + random() * (h - 120);
    for (let r = 26; r > 0; r -= 2.2) {
      ctx.strokeStyle = `rgba(74, 48, 24, ${0.08 + (26 - r) * 0.012})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.ellipse(cx, cy, r, r * 0.42, 0.3 + r * 0.01, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  const texture = finish(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(3, 2);
  return texture;
}

/* -------------------------------------------------------------------- mouse */

/**
 * The shell of the mouse: the two seams and the finish, drawn flat and
 * wrapped onto the parametric body in Room.tsx.
 *
 * U runs from the back of the mouse to the nose, V from the left edge where
 * it meets the desk, over the ridge, to the right edge. So the split between
 * the two buttons is one straight line across the middle of this canvas, and
 * the seam where the button shell meets the body is one straight line down it.
 * Both of them curve on the object without either being a curve here.
 */
export function makeMouseTexture(): CanvasTexture {
  const w = 256;
  const h = 128;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#2a2c33";
  ctx.fillRect(0, 0, w, h);

  // A sheen along the ridge. The lights do most of this; this is the part a
  // moulded soft touch shell does on its own, which is to stay slightly
  // lighter where the mould was polished.
  const sheen = ctx.createLinearGradient(0, 0, 0, h);
  sheen.addColorStop(0, "rgba(0,0,0,0.22)");
  sheen.addColorStop(0.5, "rgba(255,255,255,0.06)");
  sheen.addColorStop(1, "rgba(0,0,0,0.22)");
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, w, h);

  // Speckle, so the finish is plastic rather than paint.
  let seed = 31;
  const random = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  for (let i = 0; i < 2600; i += 1) {
    const grey = random() < 0.5 ? 255 : 0;
    ctx.fillStyle = `rgba(${grey},${grey},${grey},0.035)`;
    ctx.fillRect(random() * w, random() * h, 1.4, 1.4);
  }

  /**
   * A groove: a dark cut with a lit edge along one side of it. The highlight
   * is offset along the line's normal rather than straight down, so it reads
   * the same on the seam that runs across the mouse and the one that runs
   * down it.
   */
  const groove = (x0: number, y0: number, x1: number, y1: number) => {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const length = Math.hypot(dx, dy) || 1;
    const nx = (-dy / length) * 2.4;
    const ny = (dx / length) * 2.4;

    ctx.lineCap = "round";
    ctx.strokeStyle = "rgba(9, 10, 13, 0.92)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.10)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x0 + nx, y0 + ny);
    ctx.lineTo(x1 + nx, y1 + ny);
    ctx.stroke();
  };

  // Where the button shell meets the body, across the mouse.
  groove(w * 0.52, 10, w * 0.52, h - 10);
  // Between the left and the right button, from that seam to the nose.
  groove(w * 0.54, h / 2, w - 6, h / 2);

  return finish(canvas);
}
