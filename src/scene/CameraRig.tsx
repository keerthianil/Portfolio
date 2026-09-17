"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3, type PerspectiveCamera } from "three";
import type { CameraState } from "@/data/routes";
import { reading } from "@/lib/reading";
import { SHOTS, SHOTS_PORTRAIT, type Shot } from "./cameraStates";

/**
 * How far the room leans while you read, in radians. Four degrees at the
 * bottom of a long document.
 *
 * It only shows on two of the four routes, and that is correct rather than a
 * gap. Work and About open on the monitor's and the laptop's own screens, so
 * the room is behind a device and not visible at all; Research opens on a
 * sheet of paper and Timeline on a plain window, and both of those sit over
 * the room. Research is also the longest reading on the site, which is exactly
 * where a room frozen behind the page reads as a screenshot.
 *
 * Small on purpose. Anything you can consciously watch while reading is a
 * distraction, and past about six degrees it starts to read as the page moving
 * rather than as the space being alive.
 */
const READING_DRIFT = 0.07;

/** The point the room orbits around: roughly the middle of the desk. */
const PIVOT = new Vector3(0, 1.05, -0.5);

/**
 * Framerate-independent exponential approach. `smoothTime` is roughly the time
 * to cover 63% of the remaining distance, so 0.28 lands within a couple of
 * percent of the target in about 900ms.
 *
 * Damping rather than a fixed duration ease because it is interruptible: clicking a
 * second object mid-flight retargets from wherever the camera actually is,
 * instead of restarting a tween from a stale origin.
 */
function damp(current: number, target: number, smoothTime: number, dt: number) {
  if (smoothTime <= 0) return target;
  return current + (target - current) * (1 - Math.exp(-dt / smoothTime));
}

export function CameraRig({
  state,
  yawRef,
  smoothTime,
  portrait,
  drift = false,
}: {
  state: CameraState;
  yawRef: React.RefObject<number>;
  /** 0 jumps straight to the shot. Used under reduced motion. */
  smoothTime: number;
  portrait: boolean;
  /** Off under reduced motion, where a camera that moves on scroll is exactly the thing being asked for less of. */
  drift?: boolean;
}) {
  const scratch = useMemo(
    () => ({ position: new Vector3(), target: new Vector3(), look: new Vector3() }),
    [],
  );
  const look = useRef(new Vector3().copy(PIVOT));

  // The camera comes off the frame state rather than useThree, so it is never a
  // render-scope value that a per-frame mutation could be accused of reaching
  // back into. R3F hands the same object either way.
  useFrame((three, delta) => {
    const camera = three.camera as PerspectiveCamera;
    const shots: Record<CameraState, Shot> = portrait ? SHOTS_PORTRAIT : SHOTS;
    const shot = shots[state];
    /**
     * Scroll drift rides on top of the yaw rather than replacing it, so
     * looking left and then reading leans from where you were looking. The
     * damping below smooths it for free: the target moves and the camera takes
     * its usual 900ms to arrive, which is why scrolling fast does not whip the
     * room around.
     */
    const yaw = yawRef.current + (drift ? reading.progress * READING_DRIFT : 0);

    // Orbit: rotate the shot around the pivot rather than moving the pivot, so
    // every shot inherits the same rotation without needing its own copy.
    scratch.position.set(...shot.position).sub(PIVOT).applyAxisAngle(UP, yaw).add(PIVOT);
    scratch.target.set(...shot.target).sub(PIVOT).applyAxisAngle(UP, yaw).add(PIVOT);

    camera.position.set(
      damp(camera.position.x, scratch.position.x, smoothTime, delta),
      damp(camera.position.y, scratch.position.y, smoothTime, delta),
      damp(camera.position.z, scratch.position.z, smoothTime, delta),
    );

    look.current.set(
      damp(look.current.x, scratch.target.x, smoothTime, delta),
      damp(look.current.y, scratch.target.y, smoothTime, delta),
      damp(look.current.z, scratch.target.z, smoothTime, delta),
    );
    camera.lookAt(look.current);

    const nextFov = damp(camera.fov, shot.fov, smoothTime, delta);
    if (Math.abs(nextFov - camera.fov) > 0.001) {
      camera.fov = nextFov;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}

const UP = new Vector3(0, 1, 0);
