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
  night,
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
  night: boolean;
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
   * Evening.
   *
   * The sun going down is not one dimmer on the whole room. The daylight
   * through the window all but goes, the warm rim off the front right goes
   * with it, the overhead comes down to what one lamp in a room actually
   * does, and the two things still emitting, the desk lamp and the monitor,
   * come up. That last part is what makes it read as evening rather than as
   * a screenshot with the brightness pulled down: at night the screen is the
   * brightest thing in the room, and it always is.
   *
   * The moon is cool, so the window's light changes colour as well as
   * intensity. A dimmed warm light reads as a lamp on a timer.
   */
  const dusk = {
    ambient: night ? 0.5 : 1,
    key: night ? 0.34 : 1,
    bar: night ? 1.2 : 1,
    screenGlow: night ? 1.85 : 1,
    window: night ? 0.16 : 1,
    rim: night ? 0.25 : 1,
    bounce: night ? 0.62 : 1,
  };

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
          color={night ? "#3b4463" : LIGHTS.ambient.color}
          intensity={LIGHTS.ambient.intensity * dusk.ambient}
        />

        {/* Key: overhead front-left, the light that makes the desk readable. */}
        <spotLight
          color={LIGHTS.key.color}
          intensity={LIGHTS.key.intensity * dusk.key}
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
          intensity={LIGHTS.bar.intensity * dusk.bar}
          position={LIGHTS.bar.position}
          angle={LIGHTS.bar.angle}
          penumbra={LIGHTS.bar.penumbra}
          distance={LIGHTS.bar.distance}
          target={barTarget}
          decay={2}
        />

        {/* Daylight through the window on the right wall. */}
        <pointLight
          color={night ? "#8ba2d8" : LIGHTS.window.color}
          intensity={LIGHTS.window.intensity * dusk.window}
          position={LIGHTS.window.position}
          distance={LIGHTS.window.distance}
          decay={2}
        />

        {/* The monitor's own spill onto the desk in front of it. */}
        <pointLight
          color={LIGHTS.screenGlow.color}
          intensity={LIGHTS.screenGlow.intensity * dusk.screenGlow}
          position={LIGHTS.screenGlow.position}
          distance={LIGHTS.screenGlow.distance}
          decay={2}
        />

        {/* Burgundy bounce off the back wall. */}
        <pointLight
          color={LIGHTS.bounce.color}
          intensity={LIGHTS.bounce.intensity * ROOM.bounce * dusk.bounce}
          position={LIGHTS.bounce.position}
          distance={LIGHTS.bounce.distance}
          decay={2}
        />

        {/* Dim wash high on the back wall, so a portrait frame has a room in
            its top half rather than a void. */}
        <pointLight
          color={LIGHTS.wallWash.color}
          intensity={LIGHTS.wallWash.intensity * ROOM.bounce * dusk.bounce}
          position={LIGHTS.wallWash.position}
          distance={LIGHTS.wallWash.distance}
          decay={2}
        />

        {/* Warm rim from the front right. */}
        <directionalLight
          color={LIGHTS.rim.color}
          intensity={LIGHTS.rim.intensity * ROOM.rim * dusk.rim}
          position={LIGHTS.rim.position}
        />

        <Room
          onSelect={onSelect}
          hoverLift={ROOM.hoverLift}
          idleMotion={!reduceMotion}
          spilled={spilled}
          vision={vision}
          night={night}
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
