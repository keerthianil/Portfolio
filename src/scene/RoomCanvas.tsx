"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { AdaptiveDpr, ContactShadows } from "@react-three/drei";
import { Object3D } from "three";
import type { AmbientLight, DirectionalLight, PointLight } from "three";
import type { CameraState } from "@/data/routes";
import { CameraRig } from "./CameraRig";
import { ROOM } from "./config";
import { LIGHTS, SCENE, type ColourVision } from "./palette";
import { Room, type Hotspot } from "./Room";

/**
 * The three lights the blind takes down with it: the daylight through the
 * window, the warm rim off the front right, which is the sun, and a little of
 * the ambient.
 *
 * They are animated here rather than set from the prop, and they trail the
 * slats on purpose. Driven straight off the prop the room went dark on the
 * click, a full second before the blind it was supposed to be caused by had
 * finished coming down, which reads as a light switch somebody hid in a
 * window.
 *
 * The level damps slower than the slats fall, and then the first 45% of it
 * does nothing at all. A blind that is half down is not half a blind: the
 * slats are still open enough that the light is barely touched, and the room
 * only loses it over the last part of the travel, as the slats close on each
 * other. Without the dead zone most of the dimming was over before the blind
 * had visibly landed, which was the whole complaint.
 *
 * Mutating the light intensities in a frame loop rather than re-rendering:
 * this changes sixty times a second for about a second, and not one of those
 * is a render anybody needs.
 */
function Daylight({ blindsDown }: { blindsDown: number }) {
  const ambient = useRef<AmbientLight>(null);
  const daylight = useRef<PointLight>(null);
  const rim = useRef<DirectionalLight>(null);
  const level = useRef(0);

  useFrame((_, delta) => {
    level.current += (blindsDown - level.current) * Math.min(1, delta * 2.6);
    const past = Math.max(0, (level.current - 0.45) / 0.55);
    // Squared on top of the dead zone, so what light does go is lost late.
    const shut = Math.min(1, past * past);

    // A closed venetian blind is not a wall. The slats are tilted and some of
    // the daylight gets past them, so this never reaches nothing.
    if (daylight.current)
      daylight.current.intensity = LIGHTS.window.intensity * (1 - shut * 0.84);
    if (rim.current)
      rim.current.intensity = LIGHTS.rim.intensity * ROOM.rim * (1 - shut * 0.45);
    if (ambient.current)
      ambient.current.intensity = LIGHTS.ambient.intensity * (1 - shut * 0.2);
  });

  return (
    <>
      <ambientLight
        ref={ambient}
        color={LIGHTS.ambient.color}
        intensity={LIGHTS.ambient.intensity}
      />
      {/* Daylight through the window on the right wall. */}
      <pointLight
        ref={daylight}
        color={LIGHTS.window.color}
        intensity={LIGHTS.window.intensity}
        position={LIGHTS.window.position}
        distance={LIGHTS.window.distance}
        decay={2}
      />
      {/* Warm rim from the front right, which is the sun. */}
      <directionalLight
        ref={rim}
        color={LIGHTS.rim.color}
        intensity={LIGHTS.rim.intensity * ROOM.rim}
        position={LIGHTS.rim.position}
      />
    </>
  );
}

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

        <Daylight blindsDown={blindsDown} />

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
