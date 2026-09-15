"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import type { Group, Mesh, MeshStandardMaterial } from "three";
import { SCENE } from "./palette";
import {
  SLIDES,
  makeLaptopTexture,
  makeReaderTexture,
  makeScreenTexture,
} from "./screenTexture";

export type Hotspot =
  | "monitor"
  | "laptop"
  | "reader"
  | "mug"
  | "calendar"
  | "posterLeft"
  | "frameRight";

interface RoomProps {
  onSelect: (hotspot: Hotspot) => void;
  /** How far hover lifts an object's emissive. */
  hoverLift: number;
  /** Whether the coffee steam drifts. Off under reduced motion. */
  idleMotion: boolean;
  /** 0 is a full mug, 3 is empty. Drives the coffee surface and the steam. */
  sips: number;
}

/**
 * One interactive object. Hover raises its emissive rather than outlining it,
 * because an outline on a dark scene reads as UI chrome and this should read as
 * the thing catching the light.
 *
 * The lift is written straight onto the material in useFrame. Putting it in
 * state would re-render the tree on every pointer move across the desk.
 */
function Hot({
  children,
  onSelect,
  hoverLift,
  name,
}: {
  children: React.ReactNode;
  onSelect: () => void;
  hoverLift: number;
  name: string;
}) {
  const group = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  const current = useRef(0);

  useFrame((_, delta) => {
    const target = hovered ? hoverLift : 0;
    current.current += (target - current.current) * Math.min(1, delta * 12);
    group.current?.traverse((child) => {
      const mesh = child as Mesh;
      const material = mesh.material as MeshStandardMaterial | undefined;
      if (material?.emissiveIntensity !== undefined && material.userData.lift) {
        material.emissiveIntensity =
          material.userData.base + current.current * material.userData.lift;
      }
    });
  });

  return (
    <group
      ref={group}
      name={name}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "";
      }}
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
    >
      {children}
    </group>
  );
}

/**
 * Marks a material as hover-liftable. `base` is its resting emissive and
 * `amount` is how much of the hover value it takes, so a mug can glow harder
 * than a screen without either needing its own handler.
 */
function lift(base: number, amount: number) {
  return { emissiveIntensity: base, userData: { base, lift: amount } };
}

export function Room({ onSelect, hoverLift, idleMotion, sips }: RoomProps) {
  const steam = useRef<Group>(null);
  const screen = useMemo(() => makeScreenTexture(), []);
  const page = useMemo(() => makeReaderTexture(), []);
  const lidScreen = useMemo(() => makeLaptopTexture(), []);
  useEffect(
    () => () => {
      screen.dispose();
      page.dispose();
      lidScreen.dispose();
    },
    [screen, page, lidScreen],
  );

  /**
   * The screensaver. Each slide holds for 3.4s then crossfades over 0.7s.
   *
   * The canvas is only repainted while a fade is in flight, and at 15fps rather
   * than every frame, because each repaint is a texture upload to the GPU and
   * nothing on a held slide is moving. Under reduced motion it paints slide one
   * and never touches it again.
   */
  const slideClock = useRef({ index: 0, elapsed: 0, lastPaint: 0 });
  useFrame((_, delta) => {
    if (!idleMotion) return;
    const HOLD = 3.4;
    const FADE = 0.7;
    const clock = slideClock.current;
    clock.elapsed += delta;

    if (clock.elapsed >= HOLD + FADE) {
      clock.elapsed = 0;
      clock.index = (clock.index + 1) % SLIDES.length;
      screen.draw(clock.index, 0);
      return;
    }
    if (clock.elapsed < HOLD) return;

    clock.lastPaint += delta;
    if (clock.lastPaint < 1 / 15) return;
    clock.lastPaint = 0;
    const progress = (clock.elapsed - HOLD) / FADE;
    screen.draw(clock.index, Math.min(1, progress));
  });

  const empty = sips >= 3;

  useFrame((state) => {
    if (!steam.current) return;
    if (!idleMotion || empty) {
      steam.current.visible = false;
      return;
    }
    steam.current.visible = true;
    const t = state.clock.elapsedTime;
    const k = ((t * 0.09) % 0.22) / 0.22;
    steam.current.position.y = 0.105 + k * 0.22;
    steam.current.rotation.y = t * 0.35;
    steam.current.scale.setScalar(0.5 + k * 1.1);
  });

  // A slatted panel behind the monitor. Running slats across the whole wall
  // read as theatre curtains rather than as a wall.
  const slats = useMemo(
    () => Array.from({ length: 15 }, (_, i) => -1.4 + i * 0.2),
    [],
  );

  const keys = useMemo(() => {
    const rows: { x: number; z: number; accent: boolean }[] = [];
    for (let row = 0; row < 4; row += 1) {
      for (let col = 0; col < 14; col += 1) {
        rows.push({
          x: -0.2 + col * 0.031,
          z: -0.045 + row * 0.03,
          // The accent keys spell nothing. They are the row your hands rest on.
          accent: row === 2 && col > 3 && col < 8,
        });
      }
    }
    return rows;
  }, []);

  // Laptop keys. Smaller and denser than the desktop board.
  const laptopKeys = useMemo(() => {
    const rows: { x: number; z: number }[] = [];
    for (let row = 0; row < 4; row += 1) {
      for (let col = 0; col < 12; col += 1) {
        rows.push({ x: -0.145 + col * 0.0265, z: -0.05 + row * 0.024 });
      }
    }
    return rows;
  }, []);

  return (
    <group>
      {/* Floor, back wall, and the two side walls the posters hang on */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color={SCENE.floor} roughness={0.95} />
      </mesh>

      <mesh position={[0, 1.6, -1.72]}>
        <planeGeometry args={[7, 3.4]} />
        <meshStandardMaterial color={SCENE.wall} roughness={1} />
      </mesh>

      <mesh position={[-2.2, 1.6, 0.2]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[4.2, 3.4]} />
        <meshStandardMaterial color={SCENE.wall} roughness={1} />
      </mesh>
      <mesh position={[2.2, 1.6, 0.2]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[4.2, 3.4]} />
        <meshStandardMaterial color={SCENE.wall} roughness={1} />
      </mesh>

      <mesh position={[0, 1.7, -1.7]}>
        <planeGeometry args={[3.2, 2.6]} />
        <meshStandardMaterial color={SCENE.slat} roughness={0.95} />
      </mesh>
      {slats.map((x) => (
        <mesh key={x} position={[x, 1.7, -1.67]}>
          <boxGeometry args={[0.055, 2.6, 0.03]} />
          <meshStandardMaterial color={SCENE.wall} roughness={0.95} />
        </mesh>
      ))}

      {/* Left wall: the tab order poster */}
      <Hot
        name="posterLeft"
        hoverLift={hoverLift}
        onSelect={() => onSelect("posterLeft")}
      >
        <group position={[-2.17, 1.42, -0.5]} rotation={[0, Math.PI / 2, 0]}>
          <mesh>
            <boxGeometry args={[0.84, 0.6, 0.025]} />
            <meshStandardMaterial color={SCENE.frame} roughness={0.6} />
          </mesh>
          <mesh position={[0, 0, 0.015]}>
            <planeGeometry args={[0.76, 0.52]} />
            <meshStandardMaterial
              color={SCENE.paper}
              emissive={SCENE.cream}
              {...lift(0.07, 0.7)}
              roughness={1}
            />
          </mesh>
          {/* Nine numbered targets, scattered. */}
          {[
            [-0.24, 0.14],
            [0.02, 0.17],
            [0.26, 0.11],
            [-0.28, -0.02],
            [0.0, 0.0],
            [0.25, -0.05],
            [-0.22, -0.16],
            [0.05, -0.18],
            [0.27, -0.14],
          ].map(([x, y], i) => (
            <mesh key={i} position={[x, y, 0.017]}>
              <circleGeometry args={[0.028, 16]} />
              <meshStandardMaterial
                color={i === 0 ? SCENE.accent : SCENE.slat}
                roughness={0.9}
              />
            </mesh>
          ))}
        </group>
      </Hot>

      {/* Right wall: the before and after frame */}
      <Hot
        name="frameRight"
        hoverLift={hoverLift}
        onSelect={() => onSelect("frameRight")}
      >
        <group position={[2.17, 1.42, -0.5]} rotation={[0, -Math.PI / 2, 0]}>
          <mesh>
            <boxGeometry args={[0.88, 0.58, 0.025]} />
            <meshStandardMaterial color={SCENE.frame} roughness={0.6} />
          </mesh>
          <mesh position={[-0.2, 0, 0.015]}>
            <planeGeometry args={[0.39, 0.5]} />
            <meshStandardMaterial color={"#3a322e"} roughness={1} />
          </mesh>
          <mesh position={[0.2, 0, 0.015]}>
            <planeGeometry args={[0.39, 0.5]} />
            <meshStandardMaterial
              color={SCENE.paper}
              emissive={SCENE.cream}
              {...lift(0.09, 0.7)}
              roughness={1}
            />
          </mesh>
          <mesh position={[0, 0, 0.018]}>
            <planeGeometry args={[0.012, 0.5]} />
            <meshStandardMaterial
              color={SCENE.highlight}
              emissive={SCENE.highlight}
              {...lift(0.3, 1.4)}
            />
          </mesh>
        </group>
      </Hot>

      {/* Desk */}
      <RoundedBox
        args={[2.9, 0.055, 1.05]}
        radius={0.012}
        smoothness={3}
        position={[0, 0.74, -0.25]}
      >
        <meshStandardMaterial color={SCENE.desk} roughness={0.72} />
      </RoundedBox>
      {[-1.3, 1.3].map((x) => (
        <mesh key={x} position={[x, 0.37, -0.25]}>
          <boxGeometry args={[0.06, 0.72, 0.9]} />
          <meshStandardMaterial color={SCENE.deskEdge} roughness={0.9} />
        </mesh>
      ))}
      {/* Modesty panel, so the desk reads as furniture and not a floating slab */}
      <mesh position={[0, 0.5, -0.7]}>
        <boxGeometry args={[2.5, 0.42, 0.02]} />
        <meshStandardMaterial color={SCENE.deskEdge} roughness={0.95} />
      </mesh>

      <mesh position={[0, 0.7695, -0.12]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.15, 0.5]} />
        <meshStandardMaterial color={SCENE.mat} roughness={0.98} />
      </mesh>

      {/*
        Monitor. The stand used to run from 0.79 to 1.11 while the panel's
        bottom edge sat at 0.99, so the neck pushed a visible 12cm into the
        screen. The neck now stops at the panel's lower edge and sits behind it.
      */}
      <Hot name="monitor" hoverLift={hoverLift} onSelect={() => onSelect("monitor")}>
        {/* Foot: a flat ellipse on the desk, not a cylinder */}
        <mesh position={[0, 0.775, -0.95]} scale={[1, 1, 0.62]}>
          <cylinderGeometry args={[0.2, 0.22, 0.012, 28]} />
          <meshStandardMaterial color={SCENE.bezel} roughness={0.42} metalness={0.5} />
        </mesh>
        {/* Neck: tapered, stops at the panel's bottom edge, sits behind it */}
        <mesh position={[0, 0.9, -0.99]}>
          <cylinderGeometry args={[0.028, 0.045, 0.26, 16]} />
          <meshStandardMaterial color={SCENE.bezel} roughness={0.42} metalness={0.5} />
        </mesh>
        {/* Back housing: thicker in the middle, so the panel has depth */}
        <RoundedBox
          args={[0.5, 0.3, 0.05]}
          radius={0.015}
          smoothness={3}
          position={[0, 1.32, -1.0]}
        >
          <meshStandardMaterial color={SCENE.bezel} roughness={0.5} metalness={0.3} />
        </RoundedBox>
        {/* Panel */}
        <RoundedBox
          args={[1.44, 0.64, 0.022]}
          radius={0.01}
          smoothness={3}
          position={[0, 1.34, -0.972]}
        >
          <meshStandardMaterial color={SCENE.bezel} roughness={0.38} />
        </RoundedBox>
        {/* Screen, inset so the bezel reads as a bezel */}
        <mesh position={[0, 1.355, -0.9605]}>
          <planeGeometry args={[1.4, 0.58]} />
          <meshStandardMaterial
            map={screen.texture}
            emissiveMap={screen.texture}
            emissive={SCENE.cream}
            {...lift(0.42, 0.4)}
            roughness={1}
            metalness={0}
          />
        </mesh>
        {/* Chin */}
        <mesh position={[0, 1.045, -0.96]}>
          <planeGeometry args={[1.4, 0.03]} />
          <meshStandardMaterial color={SCENE.bezel} roughness={0.5} />
        </mesh>
      </Hot>

      {/* Laptop */}
      <Hot name="laptop" hoverLift={hoverLift} onSelect={() => onSelect("laptop")}>
        <group position={[-0.72, 0.77, -0.24]} rotation={[0, 0.42, 0]}>
          {/* Chassis */}
          <RoundedBox args={[0.38, 0.014, 0.26]} radius={0.007} smoothness={4}>
            <meshStandardMaterial color={SCENE.metal} roughness={0.38} metalness={0.65} />
          </RoundedBox>
          {/* Key well */}
          <mesh position={[0, 0.0075, -0.012]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.33, 0.13]} />
            <meshStandardMaterial color={"#2b2520"} roughness={0.9} />
          </mesh>
          {laptopKeys.map((key) => (
            <mesh
              key={`${key.x}-${key.z}`}
              position={[key.x, 0.0105, key.z - 0.012]}
            >
              <boxGeometry args={[0.021, 0.004, 0.018]} />
              <meshStandardMaterial color={"#4a423b"} roughness={0.85} />
            </mesh>
          ))}
          {/* Trackpad */}
          <mesh position={[0, 0.0078, 0.082]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.13, 0.085]} />
            <meshStandardMaterial color={"#585049"} roughness={0.35} metalness={0.4} />
          </mesh>
          {/* Hinge */}
          <mesh position={[0, 0.01, -0.127]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.008, 0.008, 0.36, 12]} />
            <meshStandardMaterial color={"#2e2822"} roughness={0.5} metalness={0.6} />
          </mesh>
          {/* Lid, leaning back about 15 degrees from vertical */}
          <group position={[0, 0.008, -0.125]} rotation={[-0.26, 0, 0]}>
            <RoundedBox
              args={[0.38, 0.25, 0.009]}
              radius={0.007}
              smoothness={4}
              position={[0, 0.125, 0]}
            >
              <meshStandardMaterial color={SCENE.metal} roughness={0.38} metalness={0.65} />
            </RoundedBox>
            <mesh position={[0, 0.125, 0.0055]}>
              <planeGeometry args={[0.352, 0.222]} />
              <meshStandardMaterial color={SCENE.bezel} roughness={0.45} />
            </mesh>
            <mesh position={[0, 0.128, 0.0062]}>
              <planeGeometry args={[0.33, 0.196]} />
              <meshStandardMaterial
                map={lidScreen}
                emissiveMap={lidScreen}
                emissive={SCENE.cream}
                {...lift(0.5, 0.6)}
                roughness={1}
                metalness={0}
              />
            </mesh>
          </group>
          {/* The sticky note that says what the laptop opens */}
          <mesh position={[0.235, 0.0085, 0.07]} rotation={[-Math.PI / 2, 0, -0.28]}>
            <planeGeometry args={[0.1, 0.1]} />
            <meshStandardMaterial color={SCENE.note} roughness={1} />
          </mesh>
        </group>
      </Hot>

      {/* E-reader with stylus */}
      <Hot name="reader" hoverLift={hoverLift} onSelect={() => onSelect("reader")}>
        <group position={[0.74, 0.775, -0.1]} rotation={[0, -0.38, 0]}>
          <RoundedBox args={[0.238, 0.016, 0.318]} radius={0.008} smoothness={3}>
            <meshStandardMaterial color={SCENE.bezel} roughness={0.75} />
          </RoundedBox>
          {/* The page sits 3.5mm above the body. At 1.5mm it was inside the
              rounded corner radius and lost the depth test from above. */}
          <mesh position={[0, 0.0088, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.202, 0.282]} />
            <meshStandardMaterial
              map={page}
              emissiveMap={page}
              emissive={SCENE.cream}
              {...lift(0.3, 0.6)}
              roughness={1}
              metalness={0}
            />
          </mesh>
          <mesh position={[0.158, 0.014, 0.02]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.006, 0.006, 0.26, 10]} />
            <meshStandardMaterial color={SCENE.metal} roughness={0.35} metalness={0.7} />
          </mesh>
        </group>
      </Hot>

      {/* Desk calendar: the timeline */}
      <Hot name="calendar" hoverLift={hoverLift} onSelect={() => onSelect("calendar")}>
        <group position={[-0.44, 0.768, -0.56]} rotation={[0, 0.26, 0]}>
          {/* Wire stand */}
          <mesh position={[0, 0.045, 0.03]} rotation={[0.42, 0, 0]}>
            <boxGeometry args={[0.12, 0.09, 0.006]} />
            <meshStandardMaterial color={SCENE.metal} roughness={0.4} metalness={0.6} />
          </mesh>
          {/* Card */}
          <mesh position={[0, 0.062, -0.006]} rotation={[-0.16, 0, 0]}>
            <planeGeometry args={[0.13, 0.11]} />
            <meshStandardMaterial
              color={SCENE.note}
              emissive={SCENE.cream}
              {...lift(0.18, 0.8)}
              roughness={1}
            />
          </mesh>
          {/* Header band */}
          <mesh position={[0, 0.101, -0.0005]} rotation={[-0.16, 0, 0]}>
            <planeGeometry args={[0.13, 0.032]} />
            <meshStandardMaterial
              color={SCENE.accent}
              emissive={SCENE.accent}
              {...lift(0.08, 1.2)}
              roughness={0.8}
            />
          </mesh>
          {/* Two ruled lines, so the card reads as a calendar rather than a tile */}
          {[0.055, 0.04].map((y) => (
            <mesh key={y} position={[0, y, 0.0005]} rotation={[-0.16, 0, 0]}>
              <planeGeometry args={[0.08, 0.005]} />
              <meshStandardMaterial color={SCENE.slat} roughness={1} />
            </mesh>
          ))}
        </group>
      </Hot>

      {/* Keyboard */}
      <RoundedBox
        args={[0.48, 0.016, 0.17]}
        radius={0.005}
        smoothness={3}
        position={[0, 0.777, -0.12]}
      >
        <meshStandardMaterial color={SCENE.bezel} roughness={0.7} />
      </RoundedBox>
      {keys.map((key) => (
        <mesh key={`${key.x}-${key.z}`} position={[key.x, 0.788, -0.12 + key.z]}>
          <boxGeometry args={[0.024, 0.006, 0.023]} />
          <meshStandardMaterial
            color={key.accent ? SCENE.keyAccent : SCENE.key}
            roughness={0.85}
          />
        </mesh>
      ))}

      {/* Mouse */}
      <mesh position={[0.34, 0.783, -0.11]} scale={[1, 0.55, 1.5]}>
        <sphereGeometry args={[0.035, 16, 12]} />
        <meshStandardMaterial color={SCENE.bezel} roughness={0.55} />
      </mesh>

      {/*
        Mug. Three sips empty it and a fourth fills it again. The coffee surface
        is a separate disc that drops, and the inner wall is real geometry, so
        an empty mug reads as empty from above rather than as a dark lid.
      */}
      <Hot name="mug" hoverLift={hoverLift} onSelect={() => onSelect("mug")}>
        <group position={[0.62, 0.768, -0.5]}>
          {/* Outer wall */}
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.043, 0.036, 0.1, 28, 1, true]} />
            <meshStandardMaterial
              color={SCENE.accent}
              emissive={SCENE.accent}
              {...lift(0.05, 1.6)}
              roughness={0.35}
              side={2}
            />
          </mesh>
          {/* Inner wall, slightly darker so the cavity reads */}
          <mesh position={[0, 0.052, 0]}>
            <cylinderGeometry args={[0.039, 0.033, 0.096, 28, 1, true]} />
            <meshStandardMaterial color={"#5d1722"} roughness={0.5} side={2} />
          </mesh>
          {/* Base */}
          <mesh position={[0, 0.002, 0]}>
            <cylinderGeometry args={[0.036, 0.036, 0.004, 28]} />
            <meshStandardMaterial color={SCENE.accent} roughness={0.35} />
          </mesh>
          {/* Rim lip */}
          <mesh position={[0, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.0415, 0.0035, 8, 28]} />
            <meshStandardMaterial color={SCENE.accent} roughness={0.3} />
          </mesh>
          {/* Handle */}
          <mesh position={[0.052, 0.052, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.024, 0.0065, 10, 20, Math.PI * 1.35]} />
            <meshStandardMaterial color={SCENE.accent} roughness={0.35} />
          </mesh>
          {/* Coffee. Drops 22mm per sip, gone on the third. */}
          {!empty && (
            <mesh position={[0, 0.088 - sips * 0.024, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.038 - sips * 0.002, 28]} />
              <meshStandardMaterial
                color={"#1b0f0a"}
                roughness={0.12}
                metalness={0.25}
              />
            </mesh>
          )}
          <group ref={steam} position={[0, 0.105, 0]}>
            {[
              [0, 0, 0.02],
              [0.012, 0.018, 0.013],
              [-0.011, 0.034, 0.009],
            ].map(([x, y, r]) => (
              <mesh key={`${x}-${y}`} position={[x, y, 0]}>
                <sphereGeometry args={[r, 8, 6]} />
                <meshStandardMaterial
                  color={SCENE.cream}
                  transparent
                  opacity={0.055}
                  depthWrite={false}
                />
              </mesh>
            ))}
          </group>
        </group>
      </Hot>

      {/* A short stack of books, instead of the usual plant. */}
      {[
        { y: 0.782, w: 0.2, c: SCENE.accent },
        { y: 0.804, w: 0.185, c: SCENE.paper },
        { y: 0.824, w: 0.195, c: SCENE.slat },
      ].map((book, i) => (
        <mesh
          key={book.y}
          position={[-0.98, book.y, -0.56]}
          rotation={[0, 0.12 * i - 0.1, 0]}
        >
          <boxGeometry args={[book.w, 0.02, 0.14]} />
          <meshStandardMaterial color={book.c} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}
