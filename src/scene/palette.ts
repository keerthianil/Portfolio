import { Color } from "three";

/**
 * The scene's materials, derived from the site tokens rather than picked by eye.
 * Anything warm in here is the burgundy or the rose at some distance; there is
 * no hue in the room that is not in the palette.
 */
export const SCENE = {
  bg: new Color("#0c0a09"),
  wall: new Color("#171210"),
  slat: new Color("#241c17"),
  floor: new Color("#100d0b"),
  desk: new Color("#3a2c20"),
  deskEdge: new Color("#2b2019"),
  mat: new Color("#1a1512"),
  metal: new Color("#6b6058"),
  bezel: new Color("#191412"),
  key: new Color("#d9cec2"),
  keyAccent: new Color("#8b2332"),
  accent: new Color("#8b2332"),
  highlight: new Color("#d4a0a0"),
  cream: new Color("#f2eae1"),
  paper: new Color("#c9bcae"),
  screen: new Color("#1b1614"),
} as const;

/**
 * Four lights, and each one has a job you can name.
 *
 * The first version put the key light on top of the monitor, half a unit from
 * the screen plane, which blew the screen to pure white and left everything
 * else in a red cave. The screen is now a source rather than a subject: it
 * emits, and a small light just in front of it carries that spill onto the desk.
 */
export const LIGHTS = {
  /** Overhead, front-left. Does the actual work of making the desk readable. */
  key: {
    color: "#f0e4d8",
    intensity: 19,
    position: [-1.25, 2.7, 1.9] as [number, number, number],
    angle: 0.95,
    penumbra: 1,
  },
  /** The monitor's own spill. Sits in front of the screen, pointed at the desk. */
  screenGlow: {
    color: "#d4a0a0",
    intensity: 1.6,
    position: [0, 1.28, -0.72] as [number, number, number],
    distance: 2.6,
  },
  /** Burgundy off the back wall. This is what keeps the shadows warm, not grey. */
  bounce: {
    color: "#8b2332",
    intensity: 3.4,
    position: [-1.75, 1.2, -0.95] as [number, number, number],
    distance: 3.4,
  },
  /** Rose rim from the front right, so objects separate from the background. */
  rim: {
    color: "#d4a0a0",
    intensity: 0.55,
    position: [2.4, 1.7, 2] as [number, number, number],
  },
  /** Small cool fill from the right, so the e-reader is not a black rectangle. */
  fill: {
    color: "#c9bcae",
    intensity: 2.2,
    position: [1.6, 1.5, 0.55] as [number, number, number],
    distance: 3,
  },
  /** A dim wash high on the back wall. Without it the top half of a portrait
      frame is pure black and the room reads as a void with a desk in it. */
  wallWash: {
    color: "#8b2332",
    intensity: 2.6,
    position: [0, 2.35, -1.05] as [number, number, number],
    distance: 3.2,
  },
  ambient: { color: "#3a2b26", intensity: 1.05 },
} as const;
