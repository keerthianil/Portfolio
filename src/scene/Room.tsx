"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import type { Group, Mesh, MeshStandardMaterial } from "three";
import { SCENE } from "./palette";
import { makeReaderTexture, makeScreenTexture } from "./screenTexture";

export type Hotspot = "monitor" | "laptop" | "reader" | "mug" | "speaker";

interface RoomProps {
  onSelect: (hotspot: Hotspot) => void;
  /** How far hover lifts an object's emissive. Varies per variant. */
  hoverLift: number;
  /** Whether the coffee steam drifts. Off under reduced motion. */
  idleMotion: boolean;
}

/**
 * One interactive object. Hover raises its emissive rather than outlining it,
 * because an outline on a dark scene reads as a UI chrome and this should read
 * as the thing catching the light.
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
    // Exponential approach, framerate independent.
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
 * Marks a material as hover-liftable. `base` is its resting emissive and `lift`
 * is how much of the hover value it takes, so a mug can glow harder than a
 * screen without either needing its own hover handler.
 */
function lift(base: number, amount: number) {
  return { emissiveIntensity: base, userData: { base, lift: amount } };
}

export function Room({ onSelect, hoverLift, idleMotion }: RoomProps) {
  const steam = useRef<Group>(null);
  const screen = useMemo(() => makeScreenTexture(), []);
  const page = useMemo(() => makeReaderTexture(), []);
  useEffect(
    () => () => {
      screen.dispose();
      page.dispose();
    },
    [screen, page],
  );

  useFrame((state) => {
    if (!idleMotion || !steam.current) return;
    const t = state.clock.elapsedTime;
    steam.current.position.y = 0.105 + ((t * 0.09) % 0.22);
    steam.current.rotation.y = t * 0.35;
    // Fades out as it rises, so the loop never visibly snaps back.
    const k = ((t * 0.09) % 0.22) / 0.22;
    steam.current.scale.setScalar(0.5 + k * 1.1);
  });

  // A slatted panel behind the monitor. The first version ran slats across the
  // whole wall, which read as theatre curtains rather than as a wall.
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

  return (
    <group>
      {/* Floor and back wall */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color={SCENE.floor} roughness={0.95} />
      </mesh>

      <mesh position={[0, 1.6, -1.72]}>
        <planeGeometry args={[7, 3.4]} />
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

      {/* Desk mat */}
      <mesh position={[0, 0.7695, -0.12]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.15, 0.5]} />
        <meshStandardMaterial color={SCENE.mat} roughness={0.98} />
      </mesh>

      {/* Monitor: the light source of the room */}
      <Hot name="monitor" hoverLift={hoverLift} onSelect={() => onSelect("monitor")}>
        <mesh position={[0, 0.79, -0.95]}>
          <cylinderGeometry args={[0.16, 0.2, 0.02, 24]} />
          <meshStandardMaterial color={SCENE.bezel} roughness={0.5} metalness={0.4} />
        </mesh>
        <mesh position={[0, 0.95, -0.95]}>
          <boxGeometry args={[0.05, 0.32, 0.05]} />
          <meshStandardMaterial color={SCENE.bezel} roughness={0.5} metalness={0.4} />
        </mesh>
        <RoundedBox
          args={[1.42, 0.62, 0.035]}
          radius={0.012}
          smoothness={3}
          position={[0, 1.3, -0.97]}
        >
          <meshStandardMaterial color={SCENE.bezel} roughness={0.45} />
        </RoundedBox>
        <mesh position={[0, 1.3, -0.948]}>
          <planeGeometry args={[1.36, 0.56]} />
          <meshStandardMaterial
            map={screen}
            emissiveMap={screen}
            emissive={SCENE.cream}
            {...lift(0.62, 0.45)}
            roughness={1}
            metalness={0}
          />
        </mesh>
      </Hot>

      {/* Laptop */}
      <Hot name="laptop" hoverLift={hoverLift} onSelect={() => onSelect("laptop")}>
        <group position={[-0.72, 0.77, -0.24]} rotation={[0, 0.42, 0]}>
          <RoundedBox args={[0.38, 0.012, 0.26]} radius={0.006} smoothness={3}>
            <meshStandardMaterial color={SCENE.metal} roughness={0.42} metalness={0.6} />
          </RoundedBox>
          <group position={[0, 0.006, -0.125]} rotation={[-0.26, 0, 0]}>
            <RoundedBox
              args={[0.38, 0.25, 0.01]}
              radius={0.006}
              smoothness={3}
              position={[0, 0.125, 0]}
            >
              <meshStandardMaterial color={SCENE.metal} roughness={0.42} metalness={0.6} />
            </RoundedBox>
            <mesh position={[0, 0.125, 0.007]}>
              <planeGeometry args={[0.35, 0.22]} />
              <meshStandardMaterial
                color={SCENE.screen}
                emissive={SCENE.accent}
                {...lift(0.95, 0.8)}
                roughness={1}
                metalness={0}
                toneMapped={false}
              />
            </mesh>
          </group>
          {/* The sticky note that says what the laptop opens */}
          <mesh position={[0.22, 0.008, 0.06]} rotation={[-Math.PI / 2, 0, -0.28]}>
            <planeGeometry args={[0.1, 0.1]} />
            <meshStandardMaterial color={SCENE.paper} roughness={1} />
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
        <mesh
          key={`${key.x}-${key.z}`}
          position={[key.x, 0.788, -0.12 + key.z]}
        >
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

      {/* Mug */}
      <Hot name="mug" hoverLift={hoverLift} onSelect={() => onSelect("mug")}>
        <group position={[0.62, 0.768, -0.5]}>
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.042, 0.037, 0.1, 20]} />
            <meshStandardMaterial
              color={SCENE.accent}
              emissive={SCENE.accent}
              {...lift(0.05, 1.6)}
              roughness={0.5}
            />
          </mesh>
          <mesh position={[0.05, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.022, 0.006, 8, 18]} />
            <meshStandardMaterial color={SCENE.accent} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.099, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.04, 20]} />
            <meshStandardMaterial color={"#1a0f0c"} roughness={0.25} />
          </mesh>
          <group ref={steam} position={[0, 0.105, 0]}>
            <mesh>
              <sphereGeometry args={[0.02, 8, 6]} />
              <meshStandardMaterial
                color={SCENE.cream}
                transparent
                opacity={0.06}
                depthWrite={false}
              />
            </mesh>
          </group>
        </group>
      </Hot>

      {/* Speaker */}
      <Hot name="speaker" hoverLift={hoverLift} onSelect={() => onSelect("speaker")}>
        <group position={[0.42, 0.768, -0.62]}>
          <mesh position={[0, 0.03, 0]}>
            <cylinderGeometry args={[0.052, 0.056, 0.06, 24]} />
            <meshStandardMaterial color={"#241d1a"} roughness={0.95} />
          </mesh>
          <mesh position={[0, 0.061, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.028, 0.04, 24]} />
            <meshStandardMaterial
              color={SCENE.highlight}
              emissive={SCENE.highlight}
              {...lift(0.25, 2)}
            />
          </mesh>
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
          position={[-0.55, book.y, -0.62]}
          rotation={[0, 0.12 * i - 0.1, 0]}
        >
          <boxGeometry args={[book.w, 0.02, 0.14]} />
          <meshStandardMaterial color={book.c} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}
