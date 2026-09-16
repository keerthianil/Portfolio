"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, ContactShadows } from "@react-three/drei";
import { Object3D } from "three";
import type { CameraState } from "@/data/routes";
import { CameraRig } from "./CameraRig";
import { ROOM } from "./config";
import { LIGHTS, SCENE, type ColourVision } from "./palette";
import { Room, type Hotspot } from "./Room";

export function RoomCanvas({
  camera,
  yawRef,
  onSelect,
  reduceMotion,
  onReady,
  spilled,
  vision,
  prodded,
  blindsDown,
  focused,
  className,
}: {
  camera: CameraState;
  yawRef: React.RefObject<number>;
  onSelect: (hotspot: Hotspot) => void;
  reduceMotion: boolean;
  onReady?: () => void;
  spilled: boolean;
  vision: ColourVision;
  prodded: boolean;
  blindsDown: number;
  focused: Hotspot | null;
  className?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [portrait, setPortrait] = useState(false);

  /**
   * A spot light aims at its `target` object, and the default target sits at
   * the world origin, which is the floor in front of the desk. The bar light
   * has to point at the keyboard, so it gets a real target to aim at.
   */
  /**
   * The blind over the window, in the light rig.
   *
   * It takes most of the daylight out and leaves a little, because a closed
   * venetian blind is not a wall: the slats are tilted and some of the light
   * gets past them. The ambient comes down with it, so the room reads as
   * shaded rather than as the same room with one lamp switched off.
   */
  const shade = 1 - blindsDown * 0.84;

  const barTarget = useMemo(() => {
    const object = new Object3D();
    object.position.set(...LIGHTS.bar.target);
    return object;
  }, []);

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
        camera={{ position: [0, 1.44, 2.0], fov: 38, near: 0.05, far: 40 }}
        onCreated={({ scene }) => {
          scene.background = SCENE.bg;
          onReady?.();
        }}
      >
        <AdaptiveDpr pixelated />

        <ambientLight
          color={LIGHTS.ambient.color}
          intensity={LIGHTS.ambient.intensity * (1 - blindsDown * 0.2)}
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

        {/* The bar light clipped to the top of the monitor, aimed at the
            keyboard. Its geometry is in Room.tsx at the same position, so the
            lamp you can see and the light you can see are the same lamp. */}
        <primitive object={barTarget} />
        <spotLight
          color={LIGHTS.bar.color}
          intensity={LIGHTS.bar.intensity}
          position={LIGHTS.bar.position}
          angle={LIGHTS.bar.angle}
          penumbra={LIGHTS.bar.penumbra}
          distance={LIGHTS.bar.distance}
          target={barTarget}
          decay={2}
        />

        {/* Daylight through the window on the right wall. */}
        <pointLight
          color={LIGHTS.window.color}
          intensity={LIGHTS.window.intensity * shade}
          position={LIGHTS.window.position}
          distance={LIGHTS.window.distance}
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

        {/* Warm rim from the front right. */}
        <directionalLight
          color={LIGHTS.rim.color}
          intensity={LIGHTS.rim.intensity * ROOM.rim * (1 - blindsDown * 0.45)}
          position={LIGHTS.rim.position}
        />

        <Room
          onSelect={onSelect}
          hoverLift={ROOM.hoverLift}
          idleMotion={!reduceMotion}
          spilled={spilled}
          vision={vision}
          prodded={prodded}
          blindsDown={blindsDown}
          focused={focused}
        />

        {/* Baked once. The desk never moves, so there is nothing to re-render. */}
        <ContactShadows
          position={[0, 0.7705, -0.32]}
          scale={3.8}
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
