import type { CameraState } from "@/data/routes";

export interface Shot {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

/**
 * Where the camera sits for each route. `room` is the wide shot you land on;
 * the rest are close enough that the object fills the frame behind its panel.
 *
 * The wide shot is a seated shot: eye height about 70cm above the desk top and
 * two metres back from the screen, tilted down far enough that the front edge
 * of the desk closes the bottom of the frame. Standing further back would show
 * more room and less desk, and the desk is the thing you are meant to touch.
 */
export const SHOTS: Record<CameraState, Shot> = {
  room: { position: [0, 1.46, 2.15], target: [0, 1.12, -0.85], fov: 40 },
  // Far enough back that the full 1.62 wide screen fits the frame, not just its
  // middle. At fov 34 and 1.6 units out it was cropping both edges.
  work: { position: [0, 1.37, 0.72], target: [0, 1.36, -0.95], fov: 40 },
  // The laptop is yawed 0.5rad on its riser, so the camera sits along the
  // direction the lid actually faces rather than straight down the z axis.
  about: { position: [-0.7, 1.15, 0.1], target: [-0.98, 1.02, -0.42], fov: 34 },
  // The notebook lies flat, so this one looks down at the desk.
  research: { position: [1.0, 1.17, 0.3], target: [0.88, 0.79, -0.1], fov: 38 },
  // The calendar stands at the back left of the desk.
  timeline: { position: [-0.34, 1.02, -0.3], target: [-0.44, 0.85, -0.74], fov: 32 },
  // Close on the mug, for the two seconds it takes to knock it over.
  mug: { position: [0.74, 1.06, 0.2], target: [0.8, 0.79, -0.58], fov: 34 },
};

/**
 * Portrait framing. A phone is a tall hole in a wide room: at a 0.46 aspect the
 * horizontal field is less than a third of the vertical one, so the landscape
 * framing cropped the laptop and the notebook straight off the sides. The wide
 * shot pulls back and opens up until every object is in frame, because the
 * whole affordance is "click the things on the desk".
 *
 * The close-ups do the opposite: they push in and let the object overflow.
 * Framing a 1.62m monitor edge to edge in portrait would need either a fisheye
 * or four metres of dolly, and the panel covers it a beat later anyway.
 */
export const SHOTS_PORTRAIT: Record<CameraState, Shot> = {
  room: { position: [0, 1.55, 2.8], target: [0, 1.2, -0.85], fov: 58 },
  work: { position: [0, 1.36, 0.85], target: [0, 1.36, -0.95], fov: 52 },
  about: { position: [-0.64, 1.18, 0.22], target: [-0.98, 1.02, -0.42], fov: 46 },
  research: { position: [1.04, 1.22, 0.4], target: [0.88, 0.79, -0.1], fov: 50 },
  timeline: { position: [-0.32, 1.06, -0.2], target: [-0.44, 0.85, -0.74], fov: 44 },
  mug: { position: [0.76, 1.1, 0.3], target: [0.8, 0.79, -0.58], fov: 46 },
};
