import { Color, LinearSRGBColorSpace, SRGBColorSpace } from "three";

/**
 * The room's materials.
 *
 * The desk is warm oak and the panel behind the monitor is the same oak run
 * vertically, with maroon battens standing proud of it. Maroon is the only
 * saturated hue in the room: it is on the battens, the felt the battens sit
 * against, the home row of the keyboard, and nothing else. Everything that is
 * not maroon is either wood, paper, or a grey that leans warm.
 */
export const SCENE = {
  bg: new Color("#140f10"),

  /** Felt on the side walls and behind the batten panel. */
  wall: new Color("#3d1c25"),
  /** The darker felt the battens cast onto. */
  wallDeep: new Color("#2c1219"),
  /** Vertical battens across the panel. */
  batten: new Color("#3a1520"),
  /** Oak, run vertically, behind the battens. */
  panelWood: new Color("#6f5741"),
  panelWoodDark: new Color("#564330"),

  floor: new Color("#3a2c20"),
  skirting: new Color("#2a2019"),

  desk: new Color("#8f6a43"),
  deskEdge: new Color("#6f4e2e"),
  deskLeg: new Color("#4a382a"),
  /** The desk mat. Maroon, so the one saturated hue runs through the desk
      as well as the wall. */
  mat: new Color("#4a1d28"),

  /** Monitor and laptop shells. */
  bezel: new Color("#1b1c20"),
  shell: new Color("#4a4a54"),
  shellDark: new Color("#3a3a44"),
  metal: new Color("#7d7a78"),

  /** Keyboard: white body, white keys, maroon home row. */
  board: new Color("#e2e2e6"),
  key: new Color("#f4f4f6"),
  keyAccent: new Color("#8b2332"),

  accent: new Color("#8b2332"),
  highlight: new Color("#d4a0a0"),
  cream: new Color("#f2eae1"),
  paper: new Color("#f0ece0"),
  /** The paper plane. A shade under the notebook, so it is paper and not a
      light source. */
  plane: new Color("#e6e0d2"),
  note: new Color("#e8d77c"),

  mug: new Color("#2b2d33"),
  mugInner: new Color("#191b20"),

  /**
   * The door on the left wall: the frame standing on its face, the panels
   * behind that frame, and the casing around the opening.
   *
   * The panel is a long way darker than the frame in front of it, and further
   * than it looks like it should be on paper. It is a broad flat face square
   * on to the overhead, where the stiles and rails are narrow and stand proud
   * and shade themselves, so matching their paint made the panel the palest
   * thing on that wall. These are the numbers the render wanted, not the ones
   * the arithmetic did.
   */
  door: new Color("#59402a"),
  doorPanel: new Color("#2b1f14"),
  doorFrame: new Color("#3b2a1b"),

  /**
   * The window on the right wall. The frame was `#cfc7b6`, which against a
   * maroon wall made it the brightest object in the room and the first thing
   * the eye went to on a wall that has nothing on it. It is a warm off white
   * now, the colour painted softwood actually is in a warm room.
   */
  windowFrame: new Color("#5d4630"),
  /** The sides of the hole the window sits in, which are in its own shadow. */
  windowReveal: new Color("#463322"),
  glass: new Color("#93aabd"),

  leaf: new Color("#2f6f41"),
  leafDark: new Color("#1f4c2d"),
  pot: new Color("#7a4f38"),
  /** Coffee: a mid roast with crema on it, not a black disc. */
  coffee: new Color("#5c3a1e"),
  crema: new Color("#a9793f"),
} as const;

/**
 * Six lights, and each one has a job you can name.
 *
 * An earlier version put the key light on top of the monitor, half a unit from
 * the screen plane, which blew the screen to pure white and left everything
 * else in a red cave. The screen is a source rather than a subject: it emits,
 * and the bar light clipped to the top of it carries that spill onto the desk.
 *
 * The rig runs about a fifth brighter than it used to. There is a sunset out
 * of the window, and a room with that much light coming into it does not sit
 * at the level of a room at dusk. The two screens did not move with it: they
 * emit their own light and were already reading correctly, and raising them
 * with everything else would only have flattened the difference between the
 * lit part of the desk and the part the monitor lights.
 */
export const LIGHTS = {
  /**
   * Overhead, front-left. Does the actual work of making the desk readable.
   *
   * It moved in toward the middle of the desk. Out at x -1.15 it was closer
   * to the door on the left wall than to the thing it is supposed to be
   * lighting, and with an inverse square falloff that put the door two and a
   * half times over: tone mapping then compressed it toward white, so
   * repainting the timber darker changed almost nothing. A light aimed at
   * the desk is the fix for a wall that is too bright, not a darker wall.
   */
  key: {
    color: "#fff0dd",
    intensity: 18,
    position: [-0.72, 2.8, 1.55] as [number, number, number],
    angle: 1.05,
    penumbra: 1,
  },
  /**
   * The bar light clipped to the top of the monitor. It points down and
   * forward at the keyboard, which is the whole reason that kind of lamp
   * exists, so this is the one light whose position is not a taste decision.
   */
  bar: {
    color: "#ffe6c4",
    intensity: 4.2,
    position: [0, 1.73, -0.86] as [number, number, number],
    target: [0, 0.77, -0.12] as [number, number, number],
    angle: 0.85,
    penumbra: 0.9,
    distance: 3.2,
  },
  /** The monitor's own spill. Sits in front of the screen, pointed at the desk. */
  screenGlow: {
    color: "#cfd8e2",
    intensity: 1.4,
    position: [0, 1.3, -0.7] as [number, number, number],
    distance: 2.4,
  },
  /** Maroon off the back wall. This is what keeps the shadows warm, not grey. */
  bounce: {
    color: "#8b2332",
    intensity: 2.5,
    position: [-1.15, 1.5, -1.5] as [number, number, number],
    distance: 2.8,
  },
  /**
   * Daylight through the window on the right wall.
   *
   * It used to sit at x 2.0, thirty centimetres off a window frame at 2.28,
   * which meant the frame was the closest thing to the brightest light in the
   * room and was blown to white whatever colour it was painted. It is out in
   * the room now, where daylight through a window actually falls, and it
   * lights the desk instead of lighting its own frame. The frame is the same
   * timber as the door on the opposite wall for the same reason: a room has
   * one joiner in it.
   */
  window: {
    color: "#bcd2e4",
    intensity: 7.6,
    position: [1.55, 1.62, -0.3] as [number, number, number],
    distance: 5.5,
  },
  /** Warm rim from the front right, so objects separate from the background. */
  rim: {
    color: "#f0d9c0",
    intensity: 0.64,
    position: [2.4, 1.7, 2] as [number, number, number],
  },
  /** A dim wash high on the back wall, so its top half is a wall and not a void. */
  wallWash: {
    color: "#a8404f",
    intensity: 1.35,
    position: [0, 2.4, -1.0] as [number, number, number],
    distance: 3.4,
  },
  ambient: { color: "#6a5449", intensity: 1.18 },
} as const;


/**
 * Colour vision simulation, run on the whole room from the switch by the door.
 *
 * These are the Brettel/Vienot linear RGB matrices for the three dichromacies.
 * They are applied to every material colour in the scene rather than as a
 * filter over the canvas, because a filter would also recolour the interface
 * on top of it, and the interface is not what is being demonstrated.
 *
 * The point is not that it looks odd. The point is which pairs stop being two
 * different things: the maroon battens against the oak, and the green plant
 * against the wall behind it.
 */
export type ColourVision = "normal" | "deuteranopia" | "protanopia" | "tritanopia";

export const COLOUR_VISION: ColourVision[] = [
  "normal",
  "deuteranopia",
  "protanopia",
  "tritanopia",
];

type Matrix = [number, number, number, number, number, number, number, number, number];

const MATRICES: Record<Exclude<ColourVision, "normal">, Matrix> = {
  deuteranopia: [0.367, 0.861, -0.228, 0.28, 0.673, 0.047, -0.012, 0.043, 0.969],
  protanopia: [0.152, 1.053, -0.205, 0.115, 0.786, 0.099, -0.004, -0.048, 1.052],
  tritanopia: [1.256, -0.077, -0.179, -0.078, 0.931, 0.148, 0.005, 0.691, 0.304],
};

/**
 * Applies the simulation in linear light, which is where the matrices are
 * defined, and hands back an sRGB hex string.
 *
 * A string rather than a `Color`: react-three-fiber diffs material props by
 * reference, and a fresh `Color` instance every render is a new reference
 * whether or not the colour changed, so passing objects meant the scene either
 * never updated or updated every frame depending on the path through the
 * diff. A hex string is a value, and the renderer treats it as one.
 */
const scratch = new Color();

export function simulate(colour: Color, mode: ColourVision): string {
  if (mode === "normal") return `#${colour.getHexString(SRGBColorSpace)}`;
  const m = MATRICES[mode];
  const { r, g, b } = colour;
  scratch.setRGB(
    Math.max(0, Math.min(1, m[0] * r + m[1] * g + m[2] * b)),
    Math.max(0, Math.min(1, m[3] * r + m[4] * g + m[5] * b)),
    Math.max(0, Math.min(1, m[6] * r + m[7] * g + m[8] * b)),
    LinearSRGBColorSpace,
  );
  return `#${scratch.getHexString(SRGBColorSpace)}`;
}
