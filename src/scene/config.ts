/**
 * The room's look, chosen from the three variants in the comparison pass.
 *
 * "Night shift": burgundy bounce off the wall, rose rim on the front edges, a
 * contact shadow baked once, and the coffee steam as the only thing that moves
 * on its own. The two rejected directions were a flatter product-shot rig with
 * almost no colour in the shadows, and a pushed version where the red started
 * to eat the desk's material read.
 */
export const ROOM = {
  /** Multiplier on the burgundy wall bounce. */
  bounce: 1,
  /** Multiplier on the dusty rose rim. */
  rim: 1,
  /** How far a hovered object's emissive climbs. */
  hoverLift: 1,
  /**
   * Camera smoothTime in seconds. Roughly the time to cover 63% of the
   * remaining distance, so 0.28 settles in about 900ms, which is the beat the
   * 700ms overlay lead is built around.
   */
  smoothTime: 0.28,
} as const;
