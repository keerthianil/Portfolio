"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { Box3, BufferGeometry, Float32BufferAttribute, Vector3 } from "three";
import type { Group, Mesh, MeshStandardMaterial } from "three";
import { SCENE, simulate, type ColourVision } from "./palette";
import {
  SLIDES,
  makeCalendarTexture,
  makeCoffeeTexture,
  makeLaptopTexture,
  makeLeafTexture,
  makeMouseTexture,
  makeNoteTexture,
  makeReaderTexture,
  makeScreenTexture,
  makeSignTexture,
  makeSkyTexture,
  makeWoodTexture,
} from "./screenTexture";

/**
 * The shell of the mouse.
 *
 * A mouse is not a dome and it is not a pebble. It is an asymmetric shell:
 * widest a little behind the middle, tallest about a third back from the nose
 * where the palm sits, narrowing and running downhill to a low front where
 * the buttons are, and walling almost straight down to the desk the whole way
 * round. That is a surface of revolution about no axis, so there is no
 * primitive with that shape in it.
 *
 * It is built here as a grid instead: a half ellipse across the mouse, swept
 * along the length, with the width and the height each following their own
 * profile. Both profiles close to nothing at the ends, which is what gives it
 * a rounded back and a nose rather than two open holes.
 *
 * The exponent flattens the top of that half ellipse and stands its sides up,
 * because a semicircular section is the difference between a mouse and a
 * stone. U runs back to nose and V runs left edge to right edge, which is
 * what lets the two seams be straight lines in the texture.
 */
function makeMouseGeometry(): BufferGeometry {
  const LENGTH = 0.112;
  const WIDTH = 0.064;
  const HEIGHT = 0.036;
  const ALONG = 44;
  const ROUND = 28;
  const SQUARE = 0.74;

  /** Half an ellipse, warped so its peak sits where the profile wants it. */
  const arch = (t: number, bias: number) => {
    const p = Math.pow(t, bias);
    return Math.sqrt(Math.max(0, 1 - (2 * p - 1) ** 2));
  };

  const position: number[] = [];
  const uv: number[] = [];
  const index: number[] = [];

  for (let a = 0; a <= ALONG; a += 1) {
    const u = a / ALONG;
    const halfWidth = (WIDTH / 2) * arch(u, 0.86);
    const height = HEIGHT * arch(u, 0.62);
    // The nose points at -z, away from the chair, which is the way a mouse
    // on a desk actually sits. The old one had its scroll wheel facing the
    // viewer.
    const z = (0.5 - u) * LENGTH;

    for (let b = 0; b <= ROUND; b += 1) {
      const v = b / ROUND;
      const angle = Math.PI * v;
      const c = Math.cos(angle);
      const s = Math.sin(angle);
      position.push(
        -Math.sign(c) * Math.pow(Math.abs(c), SQUARE) * halfWidth,
        Math.pow(Math.abs(s), SQUARE) * height,
        z,
      );
      uv.push(u, v);
    }
  }

  for (let a = 0; a < ALONG; a += 1) {
    for (let b = 0; b < ROUND; b += 1) {
      const here = a * (ROUND + 1) + b;
      const next = here + ROUND + 1;
      index.push(here, here + 1, next, here + 1, next + 1, next);
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(position, 3));
  geometry.setAttribute("uv", new Float32BufferAttribute(uv, 2));
  geometry.setIndex(index);
  geometry.computeVertexNormals();
  return geometry;
}

export type Hotspot =
  | "monitor"
  | "laptop"
  | "reader"
  | "mug"
  | "calendar"
  | "lightSwitch"
  | "duck"
  | "blinds";

interface RoomProps {
  onSelect: (hotspot: Hotspot) => void;
  /** How far hover lifts an object's emissive. */
  hoverLift: number;
  /** Whether the coffee steam drifts. Off under reduced motion. */
  idleMotion: boolean;
  /** True from the moment the mug is knocked until it rights itself. */
  spilled: boolean;
  /** True from the moment the duck is prodded until it stops rocking. */
  prodded: boolean;
  /** How far the blind is down over the window: 0 is up, 1 is closed. */
  blindsDown: number;
  /** Which colour vision the wall switch by the door is currently simulating. */
  vision: ColourVision;
  /** Which object's mirror button currently has focus, if any. */
  focused: Hotspot | null;
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
  const pivot = useRef<Group>(null);
  const inner = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  const current = useRef(0);
  const centred = useRef(false);

  useFrame((_, delta) => {
    const outer = pivot.current;
    const content = inner.current;
    if (!outer || !content) return;

    /**
     * Scaling has to happen about the object's own centre, not about the
     * room's origin.
     *
     * Scaling the group directly also scales its children's positions, so the
     * light switch, which sits at x -2.28 against a wall at -2.3, moved 7cm
     * further left on hover and disappeared into the wall. It read as the
     * switch going black.
     *
     * So: measure the content's centre once, push the content back by it and
     * the pivot forward by the same amount, and scale the pivot. The object
     * does not move; it only grows.
     */
    if (!centred.current) {
      const box = new Box3().setFromObject(content);
      if (!box.isEmpty()) {
        const centre = box.getCenter(new Vector3());
        content.worldToLocal(centre);
        content.position.sub(centre);
        outer.position.add(centre);
        centred.current = true;
      }
    }

    const target = hovered ? hoverLift : 0;
    current.current += (target - current.current) * Math.min(1, delta * 12);
    content.traverse((child) => {
      const mesh = child as Mesh;
      const material = mesh.material as MeshStandardMaterial | undefined;
      if (material?.emissiveIntensity !== undefined && material.userData.lift) {
        material.emissiveIntensity =
          material.userData.base + current.current * material.userData.lift;
      }
    });
    // Three percent. Emissive alone is easy to miss on anything that is not
    // already a screen, and three percent reads as "this one" without the desk
    // appearing to breathe.
    outer.scale.setScalar(1 + current.current * 0.03);
  });

  return (
    <group
      ref={pivot}
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
      <group ref={inner}>{children}</group>
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

export function Room({
  onSelect,
  hoverLift,
  idleMotion,
  spilled,
  prodded,
  blindsDown,
  vision,
  focused,
}: RoomProps) {
  /**
   * Every colour in the room, run through the current simulation. Memoised on
   * the mode, so switching costs one pass over about thirty colours and then
   * nothing until you press the switch again.
   */
  const modeIndex = ["normal", "deuteranopia", "protanopia", "tritanopia"].indexOf(
    vision,
  );

  /**
   * Where the focus ring sits for each object, and how big it is. Measured
   * off each object's own position rather than from a bounding box, because a
   * bounding box of the monitor includes its bar light and the ring would be
   * a metre wide.
   */
  const RINGS: Partial<
    Record<
      Hotspot,
      { at: [number, number, number]; r: number; turn?: [number, number, number] }
    >
  > = {
    monitor: { at: [0, 0.79, -0.95], r: 0.3 },
    laptop: { at: [-0.86, 0.775, -0.2], r: 0.27 },
    reader: { at: [0.88, 0.784, -0.1], r: 0.22 },
    mug: { at: [0.76, 0.774, -0.6], r: 0.09 },
    calendar: { at: [-0.44, 0.772, -0.74], r: 0.12 },
    // The two on the walls stand up against the wall they are on. A ring
    // lying flat at shoulder height in the middle of the room is a ring on
    // nothing.
    lightSwitch: { at: [-2.262, 1.14, -0.2], r: 0.13, turn: [0, Math.PI / 2, 0] },
    duck: { at: [-0.66, 0.774, -0.52], r: 0.1 },
    blinds: { at: [2.2, 1.52, -0.35], r: 0.62, turn: [0, -Math.PI / 2, 0] },
  };
  const focusRing = focused ? RINGS[focused] : undefined;

  const C = useMemo(() => {
    if (vision === "normal") return SCENE;
    const out = {} as Record<string, unknown>;
    for (const [key, value] of Object.entries(SCENE)) {
      out[key] = simulate(value, vision);
    }
    return out as typeof SCENE;
  }, [vision]);
  const steam = useRef<Group>(null);
  const cup = useRef<Group>(null);
  const coffee = useRef<Mesh>(null);
  const puddle = useRef<Mesh>(null);
  const stream = useRef<Group>(null);
  const pen = useRef<Group>(null);
  const duck = useRef<Group>(null);
  const blind = useRef<Group>(null);
  /** How far through the duck's rock we are, and how far the blind is down. */
  const rock = useRef(0);
  const drop = useRef(0);
  /** 0 is upright and full, 1 is over and empty. */
  const progress = useRef(0);
  const screen = useMemo(() => makeScreenTexture(), []);
  const page = useMemo(() => makeReaderTexture(), []);
  const lidScreen = useMemo(() => makeLaptopTexture(), []);
  const coffeeMap = useMemo(() => makeCoffeeTexture(), []);
  const sign = useMemo(() => makeSignTexture("SELECTED WORK"), []);
  const readerLabel = useMemo(() => makeSignTexture("RESEARCH"), []);
  const note = useMemo(() => makeNoteTexture(), []);
  const calendar = useMemo(() => makeCalendarTexture(), []);
  const sky = useMemo(() => makeSkyTexture(), []);
  const leafMap = useMemo(() => makeLeafTexture(), []);
  const wood = useMemo(() => makeWoodTexture(), []);
  const mouseMap = useMemo(() => makeMouseTexture(), []);
  const mouseShell = useMemo(() => makeMouseGeometry(), []);
  useEffect(
    () => () => {
      screen.dispose();
      page.dispose();
      lidScreen.dispose();
      coffeeMap.dispose();
      sign.dispose();
      readerLabel.dispose();
      note.dispose();
      calendar.dispose();
      sky.dispose();
      leafMap.dispose();
      wood.dispose();
      mouseMap.dispose();
      mouseShell.dispose();
    },
    [
      screen,
      page,
      lidScreen,
      coffeeMap,
      sign,
      readerLabel,
      note,
      calendar,
      sky,
      leafMap,
      wood,
      mouseMap,
      mouseShell,
    ],
  );

  /**
   * The screensaver. Each slide holds for 3.4s then changes over 0.7s.
   *
   * The canvas is only repainted while a fade is in flight, and at 24fps rather
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
    // 24fps, and only for the 0.7s a fade is in flight. The fade used to
    // repaint at 15, which over two half second halves is five frames each
    // and reads as a slide show of a fade rather than as one.
    if (clock.lastPaint < 1 / 24) return;
    clock.lastPaint = 0;
    const progress = (clock.elapsed - HOLD) / FADE;
    screen.draw(clock.index, Math.min(1, progress));
  });

  useFrame((state) => {
    if (!steam.current) return;
    if (!idleMotion || spilled) {
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

  /**
   * The slats of the blind, spaced once.
   *
   * There are eighteen of them, hung from the headrail. Lowering the blind is
   * the group's Y scale going to 1 and raising it is that scale going to
   * almost nothing, with the group's origin at the headrail, so the slats
   * compress into a stack under it. That is what a venetian blind does: it
   * does not slide away anywhere, it piles up at the top.
   */
  const slats = useMemo(
    () => Array.from({ length: 18 }, (_, i) => -0.028 - i * 0.0585),
    [],
  );

  /**
   * The blind coming down, and going back up.
   */
  useFrame((_, delta) => {
    const group = blind.current;
    if (!group) return;
    drop.current += (blindsDown - drop.current) * Math.min(1, delta * (idleMotion ? 4.2 : 14));
    // Never exactly zero: a group scaled to nothing has no normals worth
    // computing and the slats flicker on the way back up.
    group.scale.y = 0.035 + drop.current * 0.965;
  });

  /**
   * The duck, rocking.
   *
   * It is a rubber duck on a hard desk, so it does not swing like a pendulum
   * on a string: it tips onto its front, comes back past level, and dies out
   * over about a second and a half. That is a decaying sine, and the decay is
   * what stops it reading as a metronome.
   *
   * It also lifts very slightly while it rocks, because a round bottom
   * pivoting on a flat surface has to.
   */
  useFrame((_, delta) => {
    const model = duck.current;
    if (!model) return;

    const target = prodded ? 1 : 0;
    rock.current += (target - rock.current) * Math.min(1, delta * 7);
    const amount = rock.current;

    if (amount < 0.002) {
      model.rotation.set(0, -0.42, 0);
      model.position.y = 0.771;
      return;
    }

    // Under reduced motion it tips once and holds, rather than oscillating.
    const swing = idleMotion
      ? Math.sin(rock.current * Math.PI * 5.5) * amount
      : amount;
    model.rotation.x = swing * 0.42;
    model.rotation.z = swing * 0.12;
    model.rotation.y = -0.42;
    model.position.y = 0.771 + Math.abs(swing) * 0.006;
  });

  /**
   * The pen drifts back and forth along the line it is drawing. Two
   * centimetres of travel and a slight lift at each end, which is enough to
   * read as writing and not enough to look like it is being waved about.
   */
  useFrame((state) => {
    if (!pen.current || !idleMotion) return;
    const t = state.clock.elapsedTime * 0.55;
    const sweep = Math.sin(t);
    pen.current.position.x = 0.026 + sweep * 0.02;
    pen.current.position.z = 0.042 - sweep * 0.012;
    // Lifts off the page at the end of each stroke, the way a hand does.
    pen.current.position.y = 0.0105 + Math.abs(Math.cos(t)) * 0.004;
    pen.current.rotation.y = sweep * 0.08;
  });

  /**
   * The spill, and the recovery.
   *
   * `progress` runs 0 to 1 and back, damped, and five things read off it: how
   * far the cup is tipped, how much is left in it, where the stream is, how
   * far it has poured, and how wide the puddle has spread.
   *
   * The order matters and it used to be wrong. The cup went over and a puddle
   * appeared under it, with nothing in between, so it read as a cut rather
   * than as a spill. The coffee now leaves the cup first: a stream out of the
   * rim that only exists while the cup is past the angle where a cup actually
   * pours, and the puddle only starts growing once the stream has been running
   * for a moment. You watch it come out, land, and spread.
   */
  useFrame((_, delta) => {
    const target = spilled ? 1 : 0;
    // Going over is faster than coming back, because that is what gravity and
    // a tidy-up respectively look like.
    const rate = spilled ? 6 : 3.2;
    const next =
      progress.current + (target - progress.current) * Math.min(1, delta * rate);
    progress.current = next;

    const tip = next * 1.55;

    if (cup.current) {
      cup.current.rotation.z = -tip;
      // Tipping about the base alone drives the rim through the desk, so the
      // cup also lifts and slides as it goes.
      cup.current.position.x = next * 0.028;
      cup.current.position.y = next * 0.036;
    }

    if (coffee.current) {
      // What is left in the cup. It holds its level until the cup is past
      // about 50 degrees, then goes quickly, which is how a cup empties.
      const poured = Math.max(0, (next - 0.34) / 0.66);
      coffee.current.position.y = 0.108 - poured * 0.086;
      coffee.current.scale.setScalar(Math.max(0.001, 1 - poured));
      coffee.current.visible = poured < 0.98;
      // The surface stays level while the cup turns under it.
      coffee.current.rotation.set(-Math.PI / 2, 0, tip);
    }

    if (stream.current) {
      // The stream exists only while it is pouring: past the tipping angle and
      // before the cup is empty.
      const pouring = next > 0.3 && next < 0.94 && spilled;
      stream.current.visible = pouring;
      if (pouring) {
        const strength = Math.min(1, (next - 0.3) / 0.25) * Math.min(1, (0.94 - next) / 0.2);
        // Out of the rim, which has swung right and up as the cup went over.
        stream.current.position.set(0.058 + next * 0.03, 0.098 - next * 0.02, 0);
        stream.current.scale.set(0.5 + strength * 0.6, 1, 0.5 + strength * 0.6);
      }
    }

    if (puddle.current) {
      // The puddle lags the stream: nothing on the desk until coffee has been
      // in the air for a moment.
      const spread = Math.max(0, (next - 0.42) / 0.58);
      puddle.current.visible = spread > 0.01;
      puddle.current.scale.setScalar(Math.max(0.001, spread));
    }
  });

  /**
   * The battens on the panel behind the monitor. They stand 3cm proud of the
   * oak rather than being painted on it, so the key light puts a real edge
   * shadow down the side of each one and the wall has depth at a glance.
   */
  const battens = useMemo(
    () => Array.from({ length: 27 }, (_, i) => -2.28 + i * 0.176),
    [],
  );

  /** Plank seams in the oak, so the wood is boards and not a photograph. */
  const planks = useMemo(
    () => Array.from({ length: 9 }, (_, i) => -2.16 + i * 0.54),
    [],
  );

  /**
   * The keyboard. Four rows of white keys with a maroon home row. The accent
   * keys spell nothing: they are the row your hands rest on, which is the only
   * reason a keyboard ever gets a second colour.
   */
  const keys = useMemo(() => {
    const rows: { x: number; z: number; w: number; accent: boolean }[] = [];
    for (let row = 0; row < 5; row += 1) {
      for (let col = 0; col < 16; col += 1) {
        rows.push({
          x: -0.288 + col * 0.0385,
          z: -0.072 + row * 0.031,
          w: 0.03,
          accent: row === 2 && col > 2 && col < 10,
        });
      }
    }
    // Space bar, and the two maroon modifiers flanking it.
    rows.push({ x: -0.06, z: -0.072 + 4 * 0.031, w: 0.18, accent: false });
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

  /**
   * The plant in the right corner. Leaves are placed on a spiral rather than at
   * random, so the silhouette reads as one plant from every angle the room can
   * turn to instead of clumping when you pan.
   */
  const leaves = useMemo(
    () =>
      Array.from({ length: 15 }, (_, i) => {
        // The golden angle, which is how a plant actually arranges itself.
        const angle = i * 2.399;
        const rise = 0.1 + i * 0.038;
        const reach = 0.16 + (i % 3) * 0.07;
        return {
          position: [
            Math.cos(angle) * reach,
            rise,
            Math.sin(angle) * reach * 0.85,
          ] as [number, number, number],
          // Each leaf tips away from the stem by a different amount, so no two
          // present the same face and the plant is not a stack of discs.
          // Each leaf turns on its own stem and tips a different way, so no
          // two present the same face and the plant is not a stack of coins
          // when the room turns to look at it side on.
          rotation: [
            -0.5 + (i % 5) * 0.16,
            angle + 0.4,
            0.28 + Math.sin(i * 1.7) * 0.34,
          ] as [number, number, number],
          scale: 0.72 + ((i * 7) % 5) * 0.1,
          dark: i % 2 === 0,
        };
      }),
    [],
  );

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[16, 16]} />
        <meshStandardMaterial color={C.floor} roughness={0.95} />
      </mesh>

      {/* Back wall, and the two side walls the door and the window sit in */}
      <mesh position={[0, 1.7, -1.74]}>
        <planeGeometry args={[9, 3.4]} />
        <meshStandardMaterial color={C.wallDeep} roughness={1} />
      </mesh>
      <mesh position={[-2.3, 1.7, 0.2]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[4.4, 3.4]} />
        <meshStandardMaterial color={C.wall} roughness={1} />
      </mesh>
      <mesh position={[2.3, 1.7, 0.2]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[4.4, 3.4]} />
        <meshStandardMaterial color={C.wall} roughness={1} />
      </mesh>
      {/* Skirting, so the walls meet the floor in a line rather than a seam */}
      <mesh position={[0, 0.055, -1.71]}>
        <boxGeometry args={[9, 0.11, 0.03]} />
        <meshStandardMaterial color={C.skirting} roughness={0.9} />
      </mesh>

      {/* The oak panel behind the monitor, with maroon battens standing on it */}
      <mesh position={[0, 1.68, -1.71]}>
        <planeGeometry args={[4.76, 2.92]} />
        <meshStandardMaterial map={wood} color={C.panelWood} roughness={0.85} />
      </mesh>
      {planks.map((x) => (
        <mesh key={`plank-${x}`} position={[x, 1.68, -1.705]}>
          <planeGeometry args={[0.012, 2.92]} />
          <meshStandardMaterial color={C.panelWoodDark} roughness={0.9} />
        </mesh>
      ))}
      {battens.map((x) => (
        <mesh key={`batten-${x}`} position={[x, 1.68, -1.685]}>
          <boxGeometry args={[0.092, 2.92, 0.032]} />
          <meshStandardMaterial color={C.batten} roughness={0.92} />
        </mesh>
      ))}

      {/* The sign on the wall above the monitor */}
      <mesh position={[0, 1.93, -1.655]}>
        <planeGeometry args={[0.86, 0.1]} />
        <meshStandardMaterial
          map={sign}
          emissiveMap={sign}
          emissive={C.cream}
          {...lift(0.5, 0)}
          transparent
          roughness={1}
        />
      </mesh>

      {/*
        Left wall: the door, and the light switch beside it. The door is
        scenery; the switch is the only thing on that wall you can press.

        It was a slab with two dark rectangles stuck on the front and an
        emissive of its own colour, which under a brighter room came out the
        colour of cream and read as a cupboard. It is built the way a panel
        door is built now: a casing of three members around the opening, then
        two stiles and three rails standing proud of the leaf, and the panels
        are the leaf showing through between them rather than anything added
        on top. Nothing here glows. It is a door.
      */}
      <group position={[-2.28, 0, -0.72]} rotation={[0, Math.PI / 2, 0]}>
        {/* The casing: two jambs and a head, proud of the wall. */}
        {[
          { at: [-0.5, 1.03, 0.03], size: [0.08, 2.12, 0.026] },
          { at: [0.5, 1.03, 0.03], size: [0.08, 2.12, 0.026] },
          { at: [0, 2.05, 0.03], size: [1.08, 0.08, 0.026] },
        ].map(({ at, size }) => (
          <mesh key={`case-${at[0]}-${at[1]}`} position={at as [number, number, number]}>
            <boxGeometry args={size as [number, number, number]} />
            <meshStandardMaterial color={C.doorFrame} roughness={0.82} />
          </mesh>
        ))}

        {/* The leaf. Its face is the bottom of the two panels, so it is the
            darker timber and the frame on top of it is the lighter. */}
        <mesh position={[0, 1.02, 0.008]}>
          <boxGeometry args={[0.88, 2.0, 0.042]} />
          <meshStandardMaterial color={C.doorPanel} roughness={0.78} />
        </mesh>

        {/* Two stiles and three rails, standing 14mm off the leaf. The gaps
            between them are the panels. */}
        {[
          { at: [-0.3825, 1.02], size: [0.115, 2.0] },
          { at: [0.3825, 1.02], size: [0.115, 2.0] },
          { at: [0, 1.95], size: [0.65, 0.14] },
          { at: [0, 1.02], size: [0.65, 0.2] },
          { at: [0, 0.16], size: [0.65, 0.28] },
        ].map(({ at, size }) => (
          <mesh
            key={`frame-${at[0]}-${at[1]}`}
            position={[at[0], at[1], 0.036]}
          >
            <boxGeometry args={[size[0], size[1], 0.014]} />
            <meshStandardMaterial color={C.door} roughness={0.72} />
          </mesh>
        ))}

        {/* Two hinges on the side the casing is closest to. */}
        {[0.42, 1.66].map((y) => (
          <mesh key={`hinge-${y}`} position={[-0.442, y, 0.012]}>
            <boxGeometry args={[0.012, 0.12, 0.03]} />
            <meshStandardMaterial
              color={C.metal}
              roughness={0.42}
              metalness={0.7}
            />
          </mesh>
        ))}

        {/* The handle, on a backplate, at the height a handle is. */}
        <mesh position={[0.33, 1.02, 0.036]}>
          <boxGeometry args={[0.055, 0.14, 0.008]} />
          <meshStandardMaterial
            color={C.metal}
            roughness={0.35}
            metalness={0.75}
          />
        </mesh>
        <mesh position={[0.33, 1.02, 0.056]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.019, 0.019, 0.045, 16]} />
          <meshStandardMaterial
            color={C.metal}
            roughness={0.28}
            metalness={0.8}
          />
        </mesh>
        {/* The lever off it, which is what a door in a room built this decade
            has instead of a knob. */}
        <mesh position={[0.29, 1.018, 0.078]}>
          <boxGeometry args={[0.075, 0.018, 0.018]} />
          <meshStandardMaterial
            color={C.metal}
            roughness={0.28}
            metalness={0.8}
          />
        </mesh>

        {/* The gap under it, which is the one part of a door you only notice
            when it is not there. */}
        <mesh position={[0, 0.01, 0.01]}>
          <boxGeometry args={[0.88, 0.02, 0.04]} />
          <meshStandardMaterial color={"#150f0c"} roughness={1} />
        </mesh>
      </group>

      {/*
        The switch on the wall beside the door, at the height a light switch
        is. Pressing it runs the whole room through a colour vision
        simulation: normal, then deuteranopia, protanopia, tritanopia, then
        back. Four presses and you are where you started.

        Nothing to read. What you see is the maroon battens and the oak behind
        them stop being two different things, and the plant stop being green.
        That is the entire argument for never letting colour carry meaning on
        its own, and it lands faster than a paragraph about it would.
      */}
      <Hot
        name="lightSwitch"
        hoverLift={hoverLift}
        onSelect={() => onSelect("lightSwitch")}
      >
        <group position={[-2.28, 1.14, -0.2]} rotation={[0, Math.PI / 2, 0]}>
          <RoundedBox args={[0.13, 0.19, 0.022]} radius={0.012} smoothness={3}>
            <meshStandardMaterial
              color={"#e8e4dc"}
              emissive={C.cream}
              {...lift(0.12, 1.3)}
              roughness={0.6}
            />
          </RoundedBox>
          {/* The rocker. It tilts one notch further for each mode, so the
              switch itself tells you how far round the cycle you are. */}
          <mesh
            position={[0, 0.03 - modeIndex * 0.02, 0.016]}
            rotation={[0.3 - modeIndex * 0.2, 0, 0]}
          >
            <boxGeometry args={[0.07, 0.085, 0.015]} />
            <meshStandardMaterial color={"#cfc9bd"} roughness={0.55} />
          </mesh>
          {/* Four pips down the side, one lit. */}
          {[0, 1, 2, 3].map((i) => (
            <mesh key={i} position={[0.048, 0.062 - i * 0.033, 0.013]}>
              <circleGeometry args={[0.006, 12]} />
              <meshStandardMaterial
                color={i === modeIndex ? C.accent : "#b9b2a6"}
                emissive={C.accent}
                {...lift(i === modeIndex ? 0.9 : 0, 0)}
                roughness={0.6}
              />
            </mesh>
          ))}
        </group>
      </Hot>

      {/*
        Right wall: the window. It is where the daylight in the room comes
        from, so the light rig and the geometry agree about the direction.

        It was a white slab with a picture on it, a metre and a half tall,
        with its head twenty centimetres above the head of the door on the
        opposite wall. Nothing in a room is built like that. It is now the
        size a sash actually is, its head lines up with the door's, the frame
        is four members with glass behind them rather than one box with a
        picture stuck on the front, and it is painted a warm off white instead
        of a white that was the brightest thing on the wall.
      */}
      <group position={[2.28, 0, -0.35]} rotation={[0, -Math.PI / 2, 0]}>
        {/* The reveal: the thickness of wall the window is set into. Without
            it the window is a sticker, because a hole in a wall has sides. */}
        {[
          { at: [-0.6, 1.52, -0.05], size: [0.03, 1.24, 0.12] },
          { at: [0.6, 1.52, -0.05], size: [0.03, 1.24, 0.12] },
          { at: [0, 2.13, -0.05], size: [1.23, 0.03, 0.12] },
        ].map(({ at, size }) => (
          <mesh key={`${at[0]}-${at[1]}`} position={at as [number, number, number]}>
            <boxGeometry args={size as [number, number, number]} />
            <meshStandardMaterial color={C.doorFrame} roughness={0.92} />
          </mesh>
        ))}

        {/* The glass. One photograph, lit from behind by its own emissive so
            the window is a source of light and not a picture on a wall. */}
        {/*
          Unlit, on purpose.

          It was a standard material, so the room's own lights fell on it and
          the photograph got darker every time anything in here dimmed,
          including the blind that is hanging in front of it. What is out of a
          window does not change because somebody drew the blind: the blind
          covers it, the weather outside carries on. A basic material takes
          the texture at its own value and ignores every light in the room,
          which is also the honest description of a window.
        */}
        <mesh position={[0, 1.52, 0.012]}>
          <planeGeometry args={[1.02, 1.08]} />
          <meshBasicMaterial map={sky.texture} color={"#cdc9c2"} />
        </mesh>

        {/* The sheen on it, so there is glass in front of the picture. */}
        <mesh position={[0, 1.52, 0.019]}>
          <planeGeometry args={[1.02, 1.08]} />
          <meshStandardMaterial
            color={C.glass}
            transparent
            opacity={0.08}
            roughness={0.12}
            metalness={0.3}
            depthWrite={false}
          />
        </mesh>

        {/* The sash: two stiles and two rails, standing in front of the
            glass. A frame is members, and members cast an edge. */}
        {[
          { at: [-0.5375, 1.52, 0.038], size: [0.055, 1.19, 0.05] },
          { at: [0.5375, 1.52, 0.038], size: [0.055, 1.19, 0.05] },
          { at: [0, 2.0875, 0.038], size: [1.13, 0.055, 0.05] },
          { at: [0, 0.9525, 0.038], size: [1.13, 0.055, 0.05] },
        ].map(({ at, size }) => (
          <mesh key={`sash-${at[0]}-${at[1]}`} position={at as [number, number, number]}>
            <boxGeometry args={size as [number, number, number]} />
            <meshStandardMaterial color={C.door} roughness={0.78} />
          </mesh>
        ))}

        {/* Glazing bars: one up and one across, which is four panes. Six was
            too many for an opening this size and read as a grid. */}
        <mesh position={[0, 1.52, 0.03]}>
          <boxGeometry args={[0.032, 1.08, 0.036]} />
          <meshStandardMaterial color={C.door} roughness={0.78} />
        </mesh>
        <mesh position={[0, 1.52, 0.03]}>
          <boxGeometry args={[1.02, 0.032, 0.036]} />
          <meshStandardMaterial color={C.door} roughness={0.78} />
        </mesh>

        {/* The casing around the outside, standing proud of the wall. */}
        {[
          { at: [-0.6, 1.52, 0.055], size: [0.07, 1.33, 0.022] },
          { at: [0.6, 1.52, 0.055], size: [0.07, 1.33, 0.022] },
          { at: [0, 2.15, 0.055], size: [1.27, 0.07, 0.022] },
        ].map(({ at, size }) => (
          <mesh key={`case-${at[0]}-${at[1]}`} position={at as [number, number, number]}>
            <boxGeometry args={size as [number, number, number]} />
            <meshStandardMaterial color={C.door} roughness={0.8} />
          </mesh>
        ))}

        {/* Sill, and the apron under it. */}
        <mesh position={[0, 0.9, 0.06]}>
          <boxGeometry args={[1.33, 0.05, 0.15]} />
          <meshStandardMaterial color={C.door} roughness={0.72} />
        </mesh>
        <mesh position={[0, 0.845, 0.04]}>
          <boxGeometry args={[1.18, 0.07, 0.02]} />
          <meshStandardMaterial color={C.door} roughness={0.85} />
        </mesh>

        {/*
          The blind, and the cord that works it.

          Pull the cord and it comes down over the glass and the daylight in
          the room goes with it. This is the one thing on this wall that is
          about something: glare and light sensitivity are access needs, and
          the fix for them is the oldest piece of hardware in the room.

          The headrail and the cord are outside the part that scales, because
          a headrail that squashes is not a headrail.
        */}
        <Hot
          name="blinds"
          hoverLift={hoverLift}
          onSelect={() => onSelect("blinds")}
        >
          {/* Headrail, across the top of the opening. */}
          <mesh position={[0, 2.07, 0.072]}>
            <boxGeometry args={[1.1, 0.055, 0.05]} />
            <meshStandardMaterial color={C.blind} roughness={0.72} />
          </mesh>

          {/* The slats, hanging off it. */}
          <group ref={blind} position={[0, 2.045, 0.072]}>
            {slats.map((y) => (
              <mesh key={y} position={[0, y, 0]} rotation={[0.28, 0, 0]}>
                <boxGeometry args={[1.06, 0.052, 0.006]} />
                <meshStandardMaterial
                  color={C.blind}
                  emissive={C.blind}
                  {...lift(0.04, 0.5)}
                  roughness={0.78}
                  side={2}
                />
              </mesh>
            ))}
          </group>

          {/* The cord down the right hand side, with a pull on the end. */}
          <mesh position={[0.5, 1.83, 0.078]}>
            <cylinderGeometry args={[0.0035, 0.0035, 0.42, 6]} />
            <meshStandardMaterial color={C.blindCord} roughness={0.9} />
          </mesh>
          <mesh position={[0.5, 1.6, 0.078]}>
            <cylinderGeometry args={[0.014, 0.011, 0.05, 10]} />
            <meshStandardMaterial
              color={C.blindCord}
              emissive={C.blindCord}
              {...lift(0.05, 0.9)}
              roughness={0.7}
            />
          </mesh>
        </Hot>
      </group>

      {/*
        The focus ring. One ring, moved to whichever object currently has
        focus, rather than a ring per object: there is only ever one focus.

        It is in the scene rather than in the DOM because focus here lands on
        an object in a room, and a rectangle drawn over the canvas would be a
        rectangle drawn over the canvas. It used to appear only during a
        contrast demonstration that is no longer here; it is on all the time
        now, which is the only setting a focus indicator has ever been
        allowed to have.

        Two rings, gold on dark brown, so it survives whatever it lands on.
      */}
      {focusRing && (
        <group
          position={focusRing.at}
          rotation={focusRing.turn ?? [-Math.PI / 2, 0, 0]}
        >
          <mesh>
            <ringGeometry args={[focusRing.r, focusRing.r + 0.012, 40]} />
            <meshStandardMaterial
              color={"#ffd88a"}
              emissive={"#ffd88a"}
              {...lift(3.2, 0)}
              transparent
              opacity={0.95}
              side={2}
            />
          </mesh>
          <mesh>
            <ringGeometry args={[focusRing.r + 0.014, focusRing.r + 0.022, 40]} />
            <meshStandardMaterial
              color={"#2a1a08"}
              emissive={"#2a1a08"}
              {...lift(0.8, 0)}
              transparent
              opacity={0.9}
              side={2}
            />
          </mesh>
        </group>
      )}

      {/* The plant in the right corner, under the window */}
      <group position={[2.02, 0, -1.42]}>
        <mesh position={[0, 0.16, 0]}>
          <cylinderGeometry args={[0.17, 0.13, 0.32, 20]} />
          <meshStandardMaterial color={C.pot} roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.325, 0]}>
          <cylinderGeometry args={[0.175, 0.175, 0.03, 20]} />
          <meshStandardMaterial color={C.pot} roughness={0.85} />
        </mesh>
        <group position={[0, 0.33, 0]}>
          {leaves.map((leaf, i) => (
            <group
              key={i}
              position={leaf.position}
              rotation={leaf.rotation}
              scale={leaf.scale}
            >
              {/* Stem */}
              <mesh position={[0, -0.1, 0]}>
                <cylinderGeometry args={[0.007, 0.012, 0.3, 6]} />
                <meshStandardMaterial color={C.leafDark} roughness={0.9} />
              </mesh>
              {/* Leaf: a cut-out on a plane, alpha tested rather than blended
                  so it writes depth and the leaves behind it are occluded
                  properly whichever way the room is turned. */}
              <mesh position={[0, 0.17, 0]}>
                <planeGeometry args={[0.26, 0.32]} />
                <meshStandardMaterial
                  map={leafMap}
                  color={leaf.dark ? C.leafDark : C.leaf}
                  transparent
                  alphaTest={0.5}
                  roughness={0.8}
                  side={2}
                />
              </mesh>
            </group>
          ))}
        </group>
      </group>

      {/* Desk. Wider and deeper than a desk needs to be, because the camera
          sits at it and the front edge is the bottom of every frame. */}
      <RoundedBox
        args={[3.5, 0.06, 1.35]}
        radius={0.014}
        smoothness={3}
        position={[0, 0.74, -0.32]}
      >
        <meshStandardMaterial map={wood} color={C.desk} roughness={0.62} />
      </RoundedBox>
      {[-1.6, 1.6].map((x) => (
        <mesh key={x} position={[x, 0.355, -0.32]}>
          <boxGeometry args={[0.07, 0.71, 1.15]} />
          <meshStandardMaterial map={wood} color={C.deskLeg} roughness={0.9} />
        </mesh>
      ))}
      {/* Modesty panel, so the desk reads as furniture and not a floating slab */}
      <mesh position={[0, 0.5, -0.87]}>
        <boxGeometry args={[3.1, 0.44, 0.03]} />
        <meshStandardMaterial map={wood} color={C.deskEdge} roughness={0.95} />
      </mesh>

      {/* Mousepad */}
      <mesh position={[0.04, 0.7705, -0.1]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.42, 0.6]} />
        <meshStandardMaterial color={C.mat} roughness={0.98} />
      </mesh>

      {/*
        Monitor. The stand used to run from 0.79 to 1.11 while the panel's
        bottom edge sat at 0.99, so the neck pushed a visible 12cm into the
        screen. The neck now stops at the panel's lower edge and sits behind it.
      */}
      <Hot name="monitor" hoverLift={hoverLift} onSelect={() => onSelect("monitor")}>
        {/* Foot: a flat plate on the desk, not a cylinder */}
        <mesh position={[0, 0.778, -0.95]}>
          <boxGeometry args={[0.42, 0.018, 0.2]} />
          <meshStandardMaterial color={C.bezel} roughness={0.42} metalness={0.5} />
        </mesh>
        {/* Neck: a flat blade, stops at the panel's bottom edge, sits behind it */}
        <mesh position={[0, 0.9, -0.99]}>
          <boxGeometry args={[0.11, 0.26, 0.05]} />
          <meshStandardMaterial color={C.bezel} roughness={0.42} metalness={0.5} />
        </mesh>
        {/* Back housing: thicker in the middle, so the panel has depth */}
        <RoundedBox
          args={[0.6, 0.34, 0.06]}
          radius={0.016}
          smoothness={3}
          position={[0, 1.34, -1.01]}
        >
          <meshStandardMaterial color={C.bezel} roughness={0.5} metalness={0.3} />
        </RoundedBox>
        {/* Panel */}
        <RoundedBox
          args={[1.62, 0.72, 0.024]}
          radius={0.012}
          smoothness={3}
          position={[0, 1.36, -0.972]}
        >
          <meshStandardMaterial color={C.bezel} roughness={0.38} />
        </RoundedBox>
        {/* Screen, inset so the bezel reads as a bezel */}
        <mesh position={[0, 1.375, -0.9595]}>
          <planeGeometry args={[1.575, 0.652]} />
          <meshStandardMaterial
            map={screen.texture}
            emissiveMap={screen.texture}
            emissive={C.cream}
            {...lift(0.5, 0.4)}
            roughness={1}
            metalness={0}
          />
        </mesh>
        {/* Chin */}
        <mesh position={[0, 1.014, -0.959]}>
          <planeGeometry args={[1.575, 0.03]} />
          <meshStandardMaterial color={C.bezel} roughness={0.5} />
        </mesh>

        {/*
          The bar light, clipped over the top edge of the monitor. It hangs
          forward of the screen and points down at the keyboard, which is the
          whole reason this kind of lamp exists. The spot light in the rig sits
          at the same place, so the lamp and the light agree.
        */}
        <mesh position={[0, 1.735, -0.99]}>
          <boxGeometry args={[0.07, 0.09, 0.07]} />
          <meshStandardMaterial color={C.bezel} roughness={0.5} />
        </mesh>
        <RoundedBox
          args={[1.12, 0.05, 0.075]}
          radius={0.02}
          smoothness={3}
          position={[0, 1.735, -0.895]}
        >
          <meshStandardMaterial color={C.bezel} roughness={0.45} metalness={0.3} />
        </RoundedBox>
        {/* The emitter strip on its underside */}
        <mesh position={[0, 1.709, -0.895]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.02, 0.045]} />
          <meshStandardMaterial
            color={C.cream}
            emissive={"#ffe6c4"}
            {...lift(2.4, 0)}
            roughness={1}
          />
        </mesh>
      </Hot>

      {/*
        Laptop on a stand. The stand is the shape the real ones are: a single
        bent arm that lifts the back of the laptop and leaves the whole space
        underneath open, resting on two feet with a lip at the front so nothing
        slides off. The first version was a solid block, which is a plinth, not
        a stand, and you could not see the slant from the side at all.
      */}
      <Hot name="laptop" hoverLift={hoverLift} onSelect={() => onSelect("laptop")}>
        <group position={[-0.86, 0.77, -0.2]} rotation={[0, 0.52, 0]}>
          {/* The two feet the arm stands on */}
          {[-0.2, 0.2].map((x) => (
            <RoundedBox
              key={x}
              args={[0.05, 0.016, 0.3]}
              radius={0.006}
              smoothness={3}
              position={[x, 0.008, -0.01]}
            >
              <meshStandardMaterial
                color={C.shellDark}
                roughness={0.45}
                metalness={0.5}
              />
            </RoundedBox>
          ))}
          {/* The uprights, leaning back with the deck */}
          {[-0.2, 0.2].map((x) => (
            <mesh key={`post-${x}`} position={[x, 0.055, -0.088]} rotation={[0.24, 0, 0]}>
              <boxGeometry args={[0.045, 0.1, 0.014]} />
              <meshStandardMaterial
                color={C.shellDark}
                roughness={0.45}
                metalness={0.5}
              />
            </mesh>
          ))}
          {/* The deck, tilted back about 12 degrees */}
          <RoundedBox
            args={[0.47, 0.014, 0.3]}
            radius={0.006}
            smoothness={3}
            position={[0, 0.082, 0.005]}
            rotation={[0.21, 0, 0]}
          >
            <meshStandardMaterial
              color={C.shellDark}
              roughness={0.45}
              metalness={0.5}
            />
          </RoundedBox>
          {/* The lip that stops the laptop sliding off the front of the slant */}
          <mesh position={[0, 0.093, 0.153]} rotation={[0.21, 0, 0]}>
            <boxGeometry args={[0.47, 0.03, 0.012]} />
            <meshStandardMaterial
              color={C.shellDark}
              roughness={0.45}
              metalness={0.5}
            />
          </mesh>

          <group position={[0, 0.098, 0.004]} rotation={[0.21, 0, 0]}>
            {/* Chassis */}
            <RoundedBox args={[0.42, 0.014, 0.29]} radius={0.007} smoothness={4}>
              <meshStandardMaterial color={C.shell} roughness={0.38} metalness={0.6} />
            </RoundedBox>
            {/* Key well */}
            <mesh position={[0, 0.0075, -0.026]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.35, 0.13]} />
              <meshStandardMaterial color={"#23232a"} roughness={0.9} />
            </mesh>
            {laptopKeys.map((key) => (
              <mesh
                key={`${key.x}-${key.z}`}
                position={[key.x, 0.0105, key.z - 0.03]}
              >
                <boxGeometry args={[0.021, 0.004, 0.018]} />
                <meshStandardMaterial color={"#3d3d46"} roughness={0.85} />
              </mesh>
            ))}
            {/* Trackpad */}
            <mesh position={[0, 0.0078, 0.082]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.15, 0.095]} />
              <meshStandardMaterial color={"#5a5a64"} roughness={0.35} metalness={0.4} />
            </mesh>
            {/* Hinge */}
            <mesh position={[0, 0.01, -0.142]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.008, 0.008, 0.4, 12]} />
              <meshStandardMaterial color={"#26262c"} roughness={0.5} metalness={0.6} />
            </mesh>
            {/*
              Lid. Rotating it -1.85 rad once put its +Y at (0, -0.28, -0.96):
              lying face down behind its own base. The stand already leans the
              whole laptop back, so the lid only has to come up off it.
            */}
            <group position={[0, 0.008, -0.14]} rotation={[-0.4, 0, 0]}>
              <RoundedBox
                args={[0.42, 0.3, 0.009]}
                radius={0.007}
                smoothness={4}
                position={[0, 0.15, 0]}
              >
                <meshStandardMaterial color={C.shell} roughness={0.38} metalness={0.6} />
              </RoundedBox>
              <mesh position={[0, 0.15, 0.0055]}>
                <planeGeometry args={[0.392, 0.272]} />
                <meshStandardMaterial color={C.bezel} roughness={0.45} />
              </mesh>
              <mesh position={[0, 0.153, 0.0062]}>
                <planeGeometry args={[0.372, 0.244]} />
                <meshStandardMaterial
                  map={lidScreen.texture}
                  emissiveMap={lidScreen.texture}
                  emissive={C.cream}
                  {...lift(0.95, 0.5)}
                  roughness={1}
                  metalness={0}
                />
              </mesh>
              {/*
                The sticky note, stuck on the top right corner of the screen
                and hanging over the bezel, which is where a note about what
                the machine does actually ends up.

                It has been on the palm rest, on the side of the stand and flat
                on the desk, and every one of those put something in front of
                it or turned it away from the chair. On the lid nothing
                overlaps it, it faces wherever the screen faces, and it is the
                first thing your eye lands on when it lands on the laptop.
              */}
              <mesh
                position={[0.128, 0.268, 0.0072]}
                rotation={[0, 0, -0.1]}
              >
                <planeGeometry args={[0.115, 0.115]} />
                <meshStandardMaterial
                  map={note}
                  emissiveMap={note}
                  emissive={C.cream}
                  {...lift(0.4, 0.8)}
                  roughness={1}
                />
              </mesh>
            </group>

          </group>
        </group>
      </Hot>

      {/* The notebook and pen at the right of the desk: the research shelf */}
      <Hot name="reader" hoverLift={hoverLift} onSelect={() => onSelect("reader")}>
        <group position={[0.88, 0.775, -0.1]} rotation={[0, -0.44, 0]}>
          {/* Cover */}
          <RoundedBox args={[0.27, 0.018, 0.35]} radius={0.008} smoothness={3}>
            <meshStandardMaterial color={C.bezel} roughness={0.72} />
          </RoundedBox>
          {/* The page sits 8.8mm above the body. At 1.5mm it was inside the
              rounded corner radius and lost the depth test from above. */}
          <mesh position={[0, 0.0098, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.235, 0.315]} />
            <meshStandardMaterial
              map={page}
              emissiveMap={page}
              emissive={C.cream}
              {...lift(0.34, 0.6)}
              roughness={1}
              metalness={0}
            />
          </mesh>
          {/* The label plate at its top edge */}
          <group position={[0, 0.028, -0.2]} rotation={[-0.2, 0, 0]}>
            <RoundedBox args={[0.2, 0.05, 0.012]} radius={0.008} smoothness={3}>
              <meshStandardMaterial color={C.bezel} roughness={0.6} />
            </RoundedBox>
            <mesh position={[0, 0, 0.0075]}>
              <planeGeometry args={[0.18, 0.038]} />
              <meshStandardMaterial
                map={readerLabel}
                emissiveMap={readerLabel}
                emissive={C.cream}
                {...lift(0.45, 0.8)}
                transparent
                roughness={1}
              />
            </mesh>
          </group>
          {/*
            The pen, held mid stroke: nib on the page, barrel up and back at
            the angle a hand holds it. Lying flat beside the notebook it read
            as a spare part. It drifts along the line it is drawing, so the
            page looks like it is being written on rather than having been.
          */}
          <group ref={pen} position={[0.026, 0.0105, 0.042]}>
            <group rotation={[-0.62, -0.5, 0.42]}>
              {/*
                The nib. A single cone off the full width of the barrel read as
                a crayon, so this is the real shape: a short metal cone down to
                a collar, and a fine dark tip out of that. The tip is what
                touches the page, so it sits at the group origin.
              */}
              <mesh position={[0, 0.0235, 0]}>
                <coneGeometry args={[0.0062, 0.021, 14]} />
                <meshStandardMaterial color={"#2a2a30"} roughness={0.35} metalness={0.6} />
              </mesh>
              <mesh position={[0, 0.0115, 0]}>
                <cylinderGeometry args={[0.0018, 0.0026, 0.005, 10]} />
                <meshStandardMaterial color={C.metal} roughness={0.25} metalness={0.85} />
              </mesh>
              <mesh position={[0, 0.0045, 0]}>
                <coneGeometry args={[0.0018, 0.009, 10]} />
                <meshStandardMaterial color={"#17171b"} roughness={0.4} metalness={0.3} />
              </mesh>
              {/* Barrel */}
              <mesh position={[0, 0.115, 0]}>
                <cylinderGeometry args={[0.0062, 0.0072, 0.18, 12]} />
                <meshStandardMaterial color={"#17171b"} roughness={0.32} metalness={0.4} />
              </mesh>
              {/* The one maroon band on it, and the clip */}
              <mesh position={[0, 0.043, 0]}>
                <cylinderGeometry args={[0.0075, 0.0075, 0.018, 12]} />
                <meshStandardMaterial color={C.accent} roughness={0.4} />
              </mesh>
              <mesh position={[0.0072, 0.175, 0]}>
                <boxGeometry args={[0.004, 0.045, 0.009]} />
                <meshStandardMaterial color={C.metal} roughness={0.3} metalness={0.7} />
              </mesh>
            </group>
          </group>
        </group>
      </Hot>

      {/*
        Desk calendar: the timeline. A wire easel, a card with a month band, a
        date and the week under it. The first version was a pale rectangle with
        a red stripe, which is a tile, not a calendar.
      */}
      <Hot name="calendar" hoverLift={hoverLift} onSelect={() => onSelect("calendar")}>
        <group position={[-0.44, 0.769, -0.74]} rotation={[0, 0.34, 0]}>
          {/* The easel leg, behind the card. It used to sit in front of it,
              which read as a pen lying across the date. */}
          <mesh position={[0, 0.05, -0.052]} rotation={[-0.5, 0, 0]}>
            <boxGeometry args={[0.012, 0.12, 0.006]} />
            <meshStandardMaterial color={C.metal} roughness={0.4} metalness={0.6} />
          </mesh>
          {/* The card, leaning back on the easel */}
          <group rotation={[-0.2, 0, 0]}>
            <RoundedBox
              args={[0.165, 0.145, 0.007]}
              radius={0.005}
              smoothness={3}
              position={[0, 0.076, 0]}
            >
              <meshStandardMaterial color={"#d8d2c6"} roughness={0.9} />
            </RoundedBox>
            <mesh position={[0, 0.076, 0.0042]}>
              <planeGeometry args={[0.155, 0.135]} />
              <meshStandardMaterial
                map={calendar}
                emissiveMap={calendar}
                emissive={C.cream}
                {...lift(0.24, 0.9)}
                roughness={1}
              />
            </mesh>
            {/* The wire binding across the top */}
            {[-0.05, -0.017, 0.017, 0.05].map((x) => (
              <mesh
                key={x}
                position={[x, 0.15, 0]}
                rotation={[Math.PI / 2, 0, 0]}
              >
                <torusGeometry args={[0.0085, 0.0018, 6, 14]} />
                <meshStandardMaterial
                  color={C.metal}
                  roughness={0.35}
                  metalness={0.7}
                />
              </mesh>
            ))}
          </group>
        </group>
      </Hot>

      {/* Keyboard: white board, white keys, maroon home row */}
      <RoundedBox
        args={[0.66, 0.018, 0.22]}
        radius={0.006}
        smoothness={3}
        position={[-0.02, 0.778, -0.1]}
      >
        <meshStandardMaterial color={C.board} roughness={0.55} />
      </RoundedBox>
      {keys.map((key) => (
        <mesh
          key={`${key.x}-${key.z}-${key.w}`}
          position={[-0.02 + key.x, 0.7905, -0.1 + key.z]}
        >
          <boxGeometry args={[key.w, 0.007, 0.026]} />
          <meshStandardMaterial
            color={key.accent ? C.keyAccent : C.key}
            roughness={0.75}
          />
        </mesh>
      ))}

      {/*
        Mouse. It used to be a rounded box with half a sphere on top of it,
        which from the chair read as a pebble with a line on it, and it was
        also facing the wrong way: the wheel was at the end nearest the chair.
        The shell is one piece now, built in makeMouseGeometry, with the two
        seams in its texture and the nose pointing at the monitor. The only
        separate part is the wheel, because a wheel has to stand proud of the
        shell and catch the bar light to read as one.
      */}
      <group position={[0.46, 0.771, -0.1]} rotation={[0, -0.06, 0]}>
        <mesh geometry={mouseShell}>
          <meshStandardMaterial map={mouseMap} roughness={0.46} metalness={0.08} />
        </mesh>
        {/* Sunk two thirds of its depth into the split, which is where a
            scroll wheel sits. The shell hides the rest of it. */}
        <mesh position={[0, 0.0228, -0.0314]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.0058, 0.0058, 0.0082, 18]} />
          <meshStandardMaterial color={"#15171c"} roughness={0.88} />
        </mesh>
      </group>

      {/*
        The rubber duck, between the laptop and the calendar.

        Prod it and it tips onto its front and rocks until it stops, and it
        squeaks, which is synthesised in the browser rather than loaded as a
        file. Nothing is being demonstrated. The mug is about undo and the
        switch by the door is about colour, and this is a duck. Every desk
        somebody actually works at has one thing on it that is there for no
        reason, and the one on this desk is the one developers put there on
        purpose, to explain the bug to.

        It is the one saturated thing in the room that is not maroon. A duck
        that is not yellow is not a duck, so the yellow is pulled toward the
        sticky note rather than toward a bath toy, and it is the size of a
        thing you could actually palm.
      */}
      <Hot name="duck" hoverLift={hoverLift} onSelect={() => onSelect("duck")}>
        <group ref={duck} position={[-0.66, 0.771, -0.52]} rotation={[0, -0.42, 0]}>
          {/* Body: wider than it is tall, and longer than it is wide. */}
          <mesh position={[0, 0.036, 0]} scale={[1, 0.82, 1.24]}>
            <sphereGeometry args={[0.042, 22, 16]} />
            <meshStandardMaterial
              color={C.duck}
              emissive={C.duck}
              {...lift(0.05, 0.7)}
              roughness={0.52}
            />
          </mesh>
          {/* The tail, tipped up at the back. */}
          <mesh position={[0, 0.05, -0.045]} rotation={[0.9, 0, 0]}>
            <coneGeometry args={[0.022, 0.038, 12]} />
            <meshStandardMaterial color={C.duck} roughness={0.52} />
          </mesh>
          {/* Head, forward and up, on no neck to speak of. */}
          <mesh position={[0, 0.072, 0.024]}>
            <sphereGeometry args={[0.026, 18, 14]} />
            <meshStandardMaterial
              color={C.duck}
              emissive={C.duck}
              {...lift(0.05, 0.7)}
              roughness={0.52}
            />
          </mesh>
          {/* Beak. Flat, wide, and orange, which is the whole silhouette. */}
          <mesh
            position={[0, 0.068, 0.049]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={[1.5, 1, 0.55]}
          >
            <coneGeometry args={[0.014, 0.026, 10]} />
            <meshStandardMaterial color={C.duckBeak} roughness={0.45} />
          </mesh>
          {/* Two eyes, which is the difference between a duck and a lump. */}
          {[-0.013, 0.013].map((x) => (
            <mesh key={x} position={[x, 0.081, 0.04]}>
              <sphereGeometry args={[0.0042, 8, 8]} />
              <meshStandardMaterial color={"#17120c"} roughness={0.3} />
            </mesh>
          ))}
        </group>
      </Hot>

      {/*
        Mug. A straight-sided cup that narrows toward the base, a squared off
        handle standing away from the wall, an indicator strip near the foot,
        and coffee with crema on it.

        The handle used to be a part torus, which meant it was cut off wherever
        its arc happened to end, so the mug had half a handle. It is a closed
        loop on two stubs now. The coffee used to be a flat near black disc,
        which read as a hole rather than as a drink.

        Knock it and it goes over: the coffee leaves the cup, a puddle spreads,
        and a few seconds later everything is upright and full again. Clicking
        anywhere else rights it immediately. Nothing about it is undoable,
        which is the only reason it is allowed to be a joke.
      */}
      <Hot name="mug" hoverLift={hoverLift} onSelect={() => onSelect("mug")}>
        <group position={[0.76, 0.771, -0.6]}>
          {/* The puddle. Flat on the desk, spreading out from under the rim. */}
          <mesh
            ref={puddle}
            position={[0.108, 0.0014, 0.052]}
            rotation={[-Math.PI / 2, 0, 0]}
            visible={false}
          >
            <circleGeometry args={[0.082, 32]} />
            {/* The same crema texture as the surface in the cup, because what
                landed on the desk is the thing that was in the cup. A flat
                brown disc read as a stain. */}
            <meshStandardMaterial
              map={coffeeMap}
              emissiveMap={coffeeMap}
              emissive={C.crema}
              {...lift(0.14, 0)}
              roughness={0.2}
              metalness={0.2}
            />
          </mesh>

          <group ref={cup}>
            {/* Outer wall, wider at the rim than at the foot */}
            <mesh position={[0, 0.058, 0]}>
              <cylinderGeometry args={[0.05, 0.043, 0.116, 32, 1, true]} />
              {/* The glaze takes no hover lift at all. It used to take a cream
                  emissive, which washed a near black mug out to grey the
                  moment the pointer crossed it: the one object in the room
                  that changed colour when you touched it. A black mug that
                  stays black is the right answer, and the hover cue moved to
                  the maroon strip near the foot, which is the part that is
                  supposed to glow. */}
              <meshStandardMaterial
                color={C.mug}
                {...lift(0, 0)}
                roughness={0.55}
                side={2}
              />
            </mesh>
            {/* Inner wall, darker so the cavity reads from above */}
            <mesh position={[0, 0.061, 0]}>
              <cylinderGeometry args={[0.0465, 0.04, 0.112, 32, 1, true]} />
              <meshStandardMaterial color={C.mugInner} roughness={0.7} side={2} />
            </mesh>
            {/* Base, and the small foot it sits on */}
            <mesh position={[0, 0.004, 0]}>
              <cylinderGeometry args={[0.043, 0.042, 0.008, 32]} />
              <meshStandardMaterial color={C.mug} roughness={0.55} />
            </mesh>
            {/* Rim */}
            <mesh position={[0, 0.116, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.0485, 0.0032, 8, 32]} />
              <meshStandardMaterial color={C.mug} roughness={0.45} />
            </mesh>
            {/*
              Handle: a rounded rectangle standing off the wall, not a ring.
              Built from four bars so the corners are square the way a moulded
              handle's are.
            */}
            <group position={[0.049, 0.058, 0]} rotation={[0, 0.3, 0]}>
              {[-0.026, 0.026].map((y) => (
                <mesh key={y} position={[0.026, y, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.006, 0.006, 0.052, 10]} />
                  <meshStandardMaterial color={C.mug} roughness={0.55} />
                </mesh>
              ))}
              <mesh position={[0.05, 0, 0]}>
                <cylinderGeometry args={[0.006, 0.006, 0.052, 10]} />
                <meshStandardMaterial color={C.mug} roughness={0.55} />
              </mesh>
            </group>
            {/* The indicator strip near the foot. Maroon, not blue. It is the
                only thing on the mug that is meant to glow, so it carries the
                hover on its own: the strip brightens, the glaze does not, and
                the cup stays the colour it is. */}
            <mesh position={[-0.041, 0.021, 0.014]} rotation={[0, -1.25, 0]}>
              <planeGeometry args={[0.03, 0.0075]} />
              <meshStandardMaterial
                color={C.accent}
                emissive={C.accent}
                {...lift(1.6, 1.4)}
                roughness={0.4}
              />
            </mesh>
            {/* Coffee, with crema on it */}
            {/*
              The drink. It used to sit 18mm down the cup, which meant that
              from the chair you saw the rim and a shadow. A full cup is full
              to about 8mm off the rim, and that is the only height at which
              the crema is visible without leaning in.
            */}
            <mesh
              ref={coffee}
              position={[0, 0.108, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <circleGeometry args={[0.0472, 40]} />
              <meshStandardMaterial
                map={coffeeMap}
                emissiveMap={coffeeMap}
                emissive={C.crema}
                {...lift(0.22, 0.1)}
                roughness={0.42}
                metalness={0.05}
              />
            </mesh>
          </group>

          {/*
            The coffee in the air. A tapered column from the rim down to the
            desk with a splash where it lands, so the pour is a thing you watch
            rather than a state you are shown the end of.
          */}
          <group ref={stream} visible={false}>
            <mesh position={[0.026, -0.03, 0]} rotation={[0, 0, -0.34]}>
              <cylinderGeometry args={[0.009, 0.016, 0.15, 12, 1, true]} />
              <meshStandardMaterial
                color={C.coffee}
                emissive={C.crema}
                {...lift(0.2, 0)}
                roughness={0.18}
                metalness={0.15}
                side={2}
              />
            </mesh>
            {/* The splash at the bottom of it. */}
            <mesh position={[0.05, -0.096, 0]} scale={[1, 0.45, 1]}>
              <sphereGeometry args={[0.026, 12, 10]} />
              <meshStandardMaterial
                color={C.coffee}
                emissive={C.crema}
                {...lift(0.24, 0)}
                roughness={0.2}
                metalness={0.15}
              />
            </mesh>
            {/* Two drops thrown clear of it. */}
            {[
              [0.082, -0.07, 0.016],
              [0.028, -0.062, -0.02],
            ].map(([x, y, z]) => (
              <mesh key={`${x}-${z}`} position={[x, y, z]}>
                <sphereGeometry args={[0.007, 8, 6]} />
                <meshStandardMaterial
                  color={C.coffee}
                  emissive={C.crema}
                  {...lift(0.2, 0)}
                  roughness={0.2}
                />
              </mesh>
            ))}
          </group>

          <group ref={steam} position={[0, 0.125, 0]}>
            {[
              [0, 0, 0.02],
              [0.012, 0.018, 0.013],
              [-0.011, 0.034, 0.009],
            ].map(([x, y, r]) => (
              <mesh key={`${x}-${y}`} position={[x, y, 0]}>
                <sphereGeometry args={[r, 8, 6]} />
                <meshStandardMaterial
                  color={C.cream}
                  transparent
                  opacity={0.06}
                  depthWrite={false}
                />
              </mesh>
            ))}
          </group>
        </group>
      </Hot>
    </group>
  );
}
