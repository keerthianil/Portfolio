"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3, type PerspectiveCamera } from "three";
import type { CameraState } from "@/data/routes";
import { SHOTS, SHOTS_PORTRAIT, type Shot } from "./cameraStates";

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
}: {
  state: CameraState;
  yawRef: React.RefObject<number>;
  /** 0 jumps straight to the shot. Used under reduced motion. */
  smoothTime: number;
  portrait: boolean;
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
    const yaw = yawRef.current;

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
