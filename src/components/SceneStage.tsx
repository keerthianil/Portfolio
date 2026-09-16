"use client";

import dynamic from "next/dynamic";
import { Component, memo, useCallback } from "react";
import type { ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import type { CameraState, RouteId } from "@/data/routes";
import type { Hotspot } from "@/scene/Room";
import type { ColourVision } from "@/scene/palette";
import { RoomFallback } from "./RoomFallback";

/**
 * The canvas is client-only: the monitor, laptop and notebook textures are
 * drawn into a 2D canvas during render, which has no meaning on the server.
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
};

/**
 * If the scene throws at runtime, fall back rather than take the page down
 * with it. A dropped GPU context or a driver bug should cost you the room, not
 * the site.
 *
 * It reports the failure upwards as well as swallowing it. The curtain over
 * the page only lifts once the scene says it is ready, and a scene that threw
 * on its way up never says anything, so catching the error silently left the
 * whole site behind a black rectangle with the working flat view underneath
 * it. A scene that has failed is as ready as it is ever going to be.
 */
class SceneBoundary extends Component<
  { fallback: ReactNode; children: ReactNode; onFail: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFail();
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/**
 * The room. It is decoration in the accessibility sense: every object in it is
 * also a real button in SceneObjectButtons, so nothing here is the only way to
 * reach anything.
 *
 * Memoised because Experience re-renders on every announcement and route
 * change, and a re-render that reached the Canvas would remount the scene.
 */
export const SceneStage = memo(function SceneStage({
  camera,
  yawRef,
  onNavigate,
  onProp,
  onReady,
  spilled,
  vision,
  prodded,
  lampAim,
  focused,
  flat,
}: {
  camera: CameraState;
  yawRef: React.RefObject<number>;
  onNavigate: (id: RouteId) => void;
  onProp: (object: string) => void;
  onReady: () => void;
  spilled: boolean;
  vision: ColourVision;
  prodded: boolean;
  lampAim: number;
  focused: Hotspot | null;
  /** Null while the WebGL probe is still pending. */
  flat: boolean | null;
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

  const fallback = <RoomFallback onNavigate={onNavigate} onProp={onProp} />;

  if (flat === null) return null;
  if (flat) return fallback;

  return (
    <SceneBoundary fallback={fallback} onFail={onReady}>
      <RoomCanvas
        className="absolute inset-0"
        camera={camera}
        yawRef={yawRef}
        onSelect={handleSelect}
        onReady={onReady}
        reduceMotion={!!shouldReduce}
        spilled={spilled}
        vision={vision}
        prodded={prodded}
        lampAim={lampAim}
        focused={focused}
      />
    </SceneBoundary>
  );
});
