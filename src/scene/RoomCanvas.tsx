"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, ContactShadows } from "@react-three/drei";
import type { CameraState } from "@/data/routes";
import { CameraRig } from "./CameraRig";
import { ROOM } from "./config";
import { LIGHTS, SCENE } from "./palette";
import { Room, type Hotspot } from "./Room";

export function RoomCanvas({
  camera,
  yawRef,
  onSelect,
  reduceMotion,
  onReady,
  sips,
  className,
}: {
  camera: CameraState;
  yawRef: React.RefObject<number>;
  onSelect: (hotspot: Hotspot) => void;
  reduceMotion: boolean;
  onReady?: () => void;
  sips: number;
  className?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [portrait, setPortrait] = useState(false);

  // Portrait is measured from the element, not the window: on the comparison
  // page three canvases share one window but have very different shapes.
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const observer = new ResizeObserver(([entry]) => {
      const { inlineSize, blockSize } = entry.contentBoxSize[0];
      setPortrait(inlineSize / blockSize < 0.9);
    });
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={hostRef} className={className}>
      <Canvas
        // Clamped so a Retina phone does not render four times the pixels it
        // needs for a scene made of flat-shaded boxes.
        dpr={[1, 1.75]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 1.32, 2.15], fov: 38, near: 0.05, far: 40 }}
        onCreated={({ scene }) => {
          scene.background = SCENE.bg;
          onReady?.();
        }}
      >
        <AdaptiveDpr pixelated />

        <ambientLight
          color={LIGHTS.ambient.color}
          intensity={LIGHTS.ambient.intensity}
        />

        {/* Key: overhead front-left, the light that makes the desk readable. */}
        <spotLight
          color={LIGHTS.key.color}
          intensity={LIGHTS.key.intensity}
          position={LIGHTS.key.position}
          angle={LIGHTS.key.angle}
          penumbra={LIGHTS.key.penumbra}
          distance={9}
          decay={2}
        />

        {/* The monitor's own spill onto the desk in front of it. */}
        <pointLight
          color={LIGHTS.screenGlow.color}
          intensity={LIGHTS.screenGlow.intensity}
          position={LIGHTS.screenGlow.position}
          distance={LIGHTS.screenGlow.distance}
          decay={2}
        />

        {/* Burgundy bounce off the back wall. */}
        <pointLight
          color={LIGHTS.bounce.color}
          intensity={LIGHTS.bounce.intensity * ROOM.bounce}
          position={LIGHTS.bounce.position}
          distance={LIGHTS.bounce.distance}
          decay={2}
        />

        {/* Dim wash high on the back wall, so a portrait frame has a room in
            its top half rather than a void. */}
        <pointLight
          color={LIGHTS.wallWash.color}
          intensity={LIGHTS.wallWash.intensity * ROOM.bounce}
          position={LIGHTS.wallWash.position}
          distance={LIGHTS.wallWash.distance}
          decay={2}
        />

        {/* Small fill from the right, so the e-reader is not a black rectangle. */}
        <pointLight
          color={LIGHTS.fill.color}
          intensity={LIGHTS.fill.intensity}
          position={LIGHTS.fill.position}
          distance={LIGHTS.fill.distance}
          decay={2}
        />

        {/* Rose rim from the front right. */}
        <directionalLight
          color={LIGHTS.rim.color}
          intensity={LIGHTS.rim.intensity * ROOM.rim}
          position={LIGHTS.rim.position}
        />

        <Room
          onSelect={onSelect}
          hoverLift={ROOM.hoverLift}
          idleMotion={!reduceMotion}
          sips={sips}
        />

        {/* Baked once. The desk never moves, so there is nothing to re-render. */}
        <ContactShadows
          position={[0, 0.7705, -0.25]}
          scale={3.2}
          resolution={512}
          blur={2.4}
          opacity={0.5}
          far={0.5}
          frames={1}
        />

        <CameraRig
          state={camera}
          yawRef={yawRef}
          smoothTime={reduceMotion ? 0 : ROOM.smoothTime}
          portrait={portrait}
        />
      </Canvas>
    </div>
  );
}
