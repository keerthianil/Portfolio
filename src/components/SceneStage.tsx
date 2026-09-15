"use client";

import { useEffect, useRef } from "react";
import type { CameraState, RouteId } from "@/data/routes";

/**
 * Placeholder for the 3D room. Phase 2 replaces the body of this file with the
 * R3F canvas; the props are already the ones the canvas needs, so nothing above
 * it has to change.
 *
 * Yaw arrives as a ref and is applied inside an animation frame, so holding a
 * rotate arrow never triggers a React render.
 */
export function SceneStage({
  camera,
  yawRef,
}: {
  camera: CameraState;
  yawRef: React.RefObject<number>;
  onNavigate: (id: RouteId) => void;
  onProp: (object: string) => void;
}) {
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      const box = boxRef.current;
      if (box) {
        box.style.transform = `rotate(${(yawRef.current * 180) / Math.PI / 6}deg)`;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [yawRef]);

  return (
    <div
      className="absolute inset-0 grid place-items-center overflow-hidden"
      aria-hidden="true"
    >
      <div
        ref={boxRef}
        className="border-border text-text-muted grid h-[min(60vh,420px)] w-[min(80vw,720px)] place-items-center rounded-2xl border border-dashed font-mono text-sm"
      >
        room, camera: {camera}
      </div>
    </div>
  );
}
