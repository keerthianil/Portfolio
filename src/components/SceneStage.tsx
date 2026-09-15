"use client";

import dynamic from "next/dynamic";
import { memo, useCallback } from "react";
import { useReducedMotion } from "motion/react";
import type { CameraState, RouteId } from "@/data/routes";
import type { Hotspot } from "@/scene/Room";

/**
 * The canvas is client-only: the monitor and e-reader textures are drawn into a
 * `<canvas>` at module scope of the render, which has no meaning on the server.
 */
const RoomCanvas = dynamic(
  () => import("@/scene/RoomCanvas").then((module) => module.RoomCanvas),
  { ssr: false },
);

/** Which route or prop each object in the room maps to. */
const HOTSPOT_ROUTES: Partial<Record<Hotspot, RouteId>> = {
  monitor: "work",
  laptop: "about",
  reader: "research",
  calendar: "timeline",
  posterLeft: "taborder",
  frameRight: "beforeafter",
};

/**
 * The room. It is decoration in the accessibility sense: every object in it is
 * also a real button in SceneObjectButtons, so nothing here is the only way to
 * reach anything.
 *
 * Memoised because Experience re-renders on every announcement and route
 * change, and a re-render that reached the Canvas would remount the whole
 * scene.
 */
export const SceneStage = memo(function SceneStage({
  camera,
  yawRef,
  onNavigate,
  onProp,
  onReady,
  sips,
}: {
  camera: CameraState;
  yawRef: React.RefObject<number>;
  onNavigate: (id: RouteId) => void;
  onProp: (object: string) => void;
  onReady: () => void;
  sips: number;
}) {
  const shouldReduce = useReducedMotion();

  const handleSelect = useCallback(
    (hotspot: Hotspot) => {
      const route = HOTSPOT_ROUTES[hotspot];
      if (route) onNavigate(route);
      else onProp(hotspot);
    },
    [onNavigate, onProp],
  );

  return (
    <RoomCanvas
      className="absolute inset-0"
      camera={camera}
      yawRef={yawRef}
      onSelect={handleSelect}
      onReady={onReady}
      reduceMotion={!!shouldReduce}
      sips={sips}
    />
  );
});
