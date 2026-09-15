import type { CameraState } from "@/data/routes";

export interface Shot {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

/**
 * Where the camera sits for each route. `room` is the wide shot you land on;
 * the rest are close enough that the object fills the frame behind its panel.
 */
export const SHOTS: Record<CameraState, Shot> = {
  room: { position: [0, 1.32, 2.15], target: [0, 1.05, -0.7], fov: 38 },
  // Far enough back that the full 1.42-wide screen fits the frame, not just its
  // middle. At fov 34 and 1.6 units out it was cropping both edges.
  work: { position: [0, 1.31, 1.05], target: [0, 1.3, -0.95], fov: 34 },
  // The laptop is yawed 0.42rad, so the camera sits along the direction the lid
  // actually faces rather than straight down the z axis.
  about: { position: [-0.48, 0.99, 0.3], target: [-0.73, 0.9, -0.28], fov: 40 },
  // The e-reader lies flat, so this one looks down at the desk.
  research: { position: [0.88, 1.13, 0.34], target: [0.74, 0.79, -0.1], fov: 38 },
};

/**
 * Portrait framing. A phone is a tall hole in a wide room, so the shots pull
 * back and raise slightly rather than cropping the sides off the desk.
 */
export const SHOTS_PORTRAIT: Record<CameraState, Shot> = {
  /**
   * A phone is a tall hole in a wide room. At a 0.46 aspect the horizontal
   * field is less than a third of the vertical one, so the landscape framing
   * cropped the laptop and the e-reader straight off the sides. The wide shot
   * pulls back and opens up until all three objects are in frame, because the
   * whole affordance is "click the things on the desk".
   */
  room: { position: [0, 1.42, 2.9], target: [0, 1.14, -0.7], fov: 58 },
  /**
   * The close-ups do the opposite: they push in and let the object overflow.
   * Framing a 1.42m monitor edge to edge in portrait would need either a
   * fisheye or four metres of dolly, and the panel covers it a beat later
   * anyway. What has to read is the move toward it, not the whole screen.
   */
  work: { position: [0, 1.3, 1.1], target: [0, 1.3, -0.95], fov: 48 },
  about: { position: [-0.46, 1.0, 0.44], target: [-0.73, 0.9, -0.28], fov: 52 },
  research: { position: [0.93, 1.16, 0.44], target: [0.74, 0.79, -0.1], fov: 50 },
};
