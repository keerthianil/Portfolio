"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { AnimatePresence } from "motion/react";
import {
  ROUTE_BY_ID,
  ROUTES,
  SCENE_PROPS,
  routeFromHash,
  type CameraState,
  type RouteId,
} from "@/data/routes";
import { CAMERA_LEAD_MS } from "@/lib/motion";
import { squeak } from "@/lib/squeak";
import { flatStore } from "@/lib/webgl";
import type { Hotspot } from "@/scene/Room";
import { COLOUR_VISION, type ColourVision } from "@/scene/palette";
import { BottomNav } from "./BottomNav";
import { CommandPalette } from "./CommandPalette";
import { Curtain } from "./Curtain";
import { RoomNote, type RoomNoteContent } from "./RoomNote";
import { SceneObjectButtons } from "./SceneObjectButtons";
import { SceneStage } from "./SceneStage";
import { TopBar } from "./TopBar";
import { AboutOverlay } from "./overlay/AboutOverlay";
import { ResearchOverlay } from "./overlay/ResearchOverlay";
import { Timeline } from "./overlay/Timeline";
import { WorkOverlay } from "./overlay/WorkOverlay";
import { WelcomeCard } from "./WelcomeCard";

const ARROW_GLOW_AT_MS = 3000;

/**
 * How far the room can turn, in radians. About 35 degrees each way, which is
 * enough to bring a side wall into frame and not enough to see behind the desk.
 */
const YAW_LIMIT = 0.62;

/**
 * One press of an arrow. Half the limit, so the room is two stops wide each
 * way: desk, part turn, wall. Press and hold is still continuous, and so is a
 * horizontal scroll, but a single press lands you somewhere you could have
 * predicted rather than somewhere between two things.
 */
const YAW_STEP = YAW_LIMIT / 2;

/** How far a held arrow turns per animation frame. */
const YAW_PER_FRAME = 0.012;

/** Radians per pixel of drag. */
const YAW_PER_DRAG_PX = 0.0028;

export function Experience() {
  const [sceneReady, setSceneReady] = useState(false);
  const [revealed, setRevealed] = useState(false);
  /**
   * Landing on a deep link means you already know where you are going, so the
   * welcome card would just be a door to close. It only shows at the root.
   *
   * Reading `location` in the initialiser is safe here because the card is also
   * gated on `revealed`, which is false on the server and on the first client
   * render, so both agree on rendering nothing.
   */
  const [welcomeOpen, setWelcomeOpen] = useState(
    () => typeof window === "undefined" || !window.location.hash,
  );
  const [showArrowGlow, setShowArrowGlow] = useState(false);

  /** Where the camera is going. Changes immediately on navigation. */
  const [camera, setCamera] = useState<CameraState>("room");
  /** Which overlay is mounted. Follows the camera by CAMERA_LEAD_MS. */
  const [activeRoute, setActiveRoute] = useState<RouteId | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const yaw = useRef(0);
  const mainRef = useRef<HTMLElement>(null);

  const markSceneReady = useCallback(() => setSceneReady(true), []);

  /**
   * Whether the room has to be replaced by the flat view. Read through a store
   * rather than an effect, so there is no cascading render and no moment where
   * the value is unknown on the client.
   */
  const flat = useSyncExternalStore(
    flatStore.subscribe,
    flatStore.getSnapshot,
    flatStore.getServerSnapshot,
  );
  const overlayTimer = useRef<number | undefined>(undefined);

  /**
   * The curtain opens as soon as there is a room behind it.
   *
   * There used to be a progress ring in front of this, counting to a hundred.
   * It was counting to nothing: the scene chunk is lazy and the textures paint
   * on their own, so the number was invented and the wait was the number's,
   * not the page's. The room now shows the moment it can, and the flat view
   * shows immediately because it has nothing to wait for.
   */
  useEffect(() => {
    if (!sceneReady && !flat) return;
    const id = window.setTimeout(() => setRevealed(true), 60);
    return () => window.clearTimeout(id);
  }, [sceneReady, flat]);

  /**
   * The curtain comes up after six seconds whatever the scene has to say.
   *
   * It waits for the scene to report ready, and a scene that never reports is
   * a black rectangle over a working site for as long as the visitor is
   * willing to look at it. That is not hypothetical: a tab opened in the
   * background gets its animation frames throttled to nothing until it is
   * looked at, and a phone that is slow to hand over a WebGL context takes
   * whatever time it takes. Both end with the page loaded, the nav mounted,
   * every route reachable, and none of it visible.
   *
   * Six seconds is past the point where the room normally arrives and short
   * of the point where somebody leaves. If the room turns up later it just
   * fades in behind an open curtain, which is a worse first frame and an
   * enormously better failure.
   */
  useEffect(() => {
    const id = window.setTimeout(() => setRevealed(true), 6000);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!revealed || welcomeOpen) return;
    const id = window.setTimeout(() => setShowArrowGlow(true), ARROW_GLOW_AT_MS);
    return () => window.clearTimeout(id);
  }, [revealed, welcomeOpen]);

  /**
   * The camera leads the overlay by 700ms. You arrive at the object before its
   * content covers it, which is what makes the scene feel like a place rather
   * than a menu.
   *
   * Routes only. A case study opening inside Projects, or the timeline opening
   * inside About, changes the hash to a second level of the same route, and
   * this used to run again on every one of those: it re-announced the route as
   * loading and then as opened while the panel had never moved. The guard also
   * takes out an announcement of "Back in the room" fired at every page load,
   * before anybody had been anywhere to come back from.
   *
   * It takes two refs, not one. `asked` is the route the hash last asked for,
   * `shown` is the one the overlay actually got, set 700ms later when the
   * timer fires. A guard on `asked` alone breaks the first paint in
   * development, where effects mount twice: the first mount schedules the
   * overlay, its cleanup cancels the timer, and the second mount is turned
   * away for asking for a route that is already pending and now never
   * arrives.
   */
  const asked = useRef<RouteId | null>(null);
  const shown = useRef<RouteId | null>(null);
  const applyRoute = useCallback((route: RouteId | null) => {
    if (asked.current === route && shown.current === route) return;
    asked.current = route;
    window.clearTimeout(overlayTimer.current);
    setCamera(route ?? "room");
    setShowArrowGlow(false);

    if (!route) {
      shown.current = null;
      setActiveRoute(null);
      setAnnouncement("Back in the room.");
      return;
    }

    // Whatever opened this route, the welcome card is done. The card is
    // suppressed on a deep link by reading the hash at mount, but a hash that
    // arrives after mount, which is what a link from another tab does, used to
    // leave the card sitting on top of the panel it had just opened.
    setWelcomeOpen(false);

    const definition = ROUTE_BY_ID[route];
    setAnnouncement(definition.loadingMessage);
    overlayTimer.current = window.setTimeout(() => {
      shown.current = route;
      setActiveRoute(route);
      setAnnouncement(`${definition.label} opened.`);
    }, CAMERA_LEAD_MS);
  }, []);

  // Hash is the source of truth, so deep links and the back button both work.
  useEffect(() => {
    const sync = () => applyRoute(routeFromHash(window.location.hash)?.id ?? null);
    sync();
    window.addEventListener("hashchange", sync);
    return () => {
      window.removeEventListener("hashchange", sync);
      window.clearTimeout(overlayTimer.current);
    };
  }, [applyRoute]);

  const navigate = useCallback((id: RouteId) => {
    setWelcomeOpen(false);
    window.location.hash = ROUTE_BY_ID[id].path;
  }, []);

  const close = useCallback(() => {
    if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname);
    }
    applyRoute(null);
  }, [applyRoute]);

  /**
   * One frame of orbit. Yaw is normalised each step so holding an arrow never
   * winds the value up past a full turn.
   *
   * It stays in a ref rather than state on purpose: this runs every animation
   * frame while an arrow is held, and putting it in state would re-render the
   * whole tree sixty times a second. The scene reads the ref directly.
   */
  /**
   * Clamped, not wrapped. A full turn puts you behind the desk looking at the
   * back of a monitor, which is nothing. The limit is set so panning all the
   * way brings one side wall into frame and stops there.
   *
   * The limit flags are state because the arrows disable at the end of the
   * travel, and a ref read during render would be stale. They only change when
   * the limit is actually crossed, so this is two renders per pan rather than
   * sixty a second.
   */
  const [limit, setLimit] = useState<"left" | "right" | null>(null);

  /** Adds to the yaw and clamps it. Everything that turns the room goes here. */
  const turn = useCallback((delta: number) => {
    const next = Math.max(-YAW_LIMIT, Math.min(YAW_LIMIT, yaw.current + delta));
    yaw.current = next;
    const reached =
      next >= YAW_LIMIT - 1e-4
        ? "left"
        : next <= -YAW_LIMIT + 1e-4
          ? "right"
          : null;
    setLimit((current) => (current === reached ? current : reached));
  }, []);

  /** One frame of a held arrow. */
  const rotate = useCallback(
    (direction: 1 | -1) => turn(YAW_PER_FRAME * direction),
    [turn],
  );

  /** One press of an arrow: a whole stop, not a nudge. */
  const rotateStep = useCallback(
    (direction: 1 | -1) => turn(YAW_STEP * direction),
    [turn],
  );

  /**
   * Arrow keys drive the same two stops: tap for a stop, hold past a beat for
   * a continuous turn. They stop while an overlay is open so they stay
   * available for scrolling the overlay's own content.
   */
  useEffect(() => {
    if (activeRoute || welcomeOpen) return;
    const HOLD_AFTER_MS = 260;
    const pressed = { left: false, right: false };
    const holding = { left: false, right: false };
    const timers: Record<"left" | "right", number | undefined> = {
      left: undefined,
      right: undefined,
    };

    const press = (side: "left" | "right") => {
      if (pressed[side]) return;
      pressed[side] = true;
      rotateStep(side === "left" ? 1 : -1);
      timers[side] = window.setTimeout(() => {
        holding[side] = true;
      }, HOLD_AFTER_MS);
    };
    const release = (side: "left" | "right") => {
      pressed[side] = false;
      holding[side] = false;
      window.clearTimeout(timers[side]);
    };

    const onDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") press("left");
      if (event.key === "ArrowRight") press("right");
    };
    const onUp = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") release("left");
      if (event.key === "ArrowRight") release("right");
    };
    // A key held down while the tab loses focus never fires keyup, which would
    // leave the room spinning when you came back.
    const onBlur = () => {
      release("left");
      release("right");
    };

    let frame = 0;
    const tick = () => {
      if (holding.left) rotate(1);
      if (holding.right) rotate(-1);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", onBlur);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timers.left);
      window.clearTimeout(timers.right);
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", onBlur);
    };
  }, [activeRoute, welcomeOpen, rotate, rotateStep]);

  /**
   * Drag to look, instead of scrolling to look.
   *
   * A horizontal wheel or trackpad swipe used to turn the room. On macOS a
   * horizontal scroll with nothing to scroll is also the browser's back
   * gesture, and the browser wins that race often enough that looking at the
   * left wall would sometimes leave the site. There is no flag that reliably
   * turns that off from inside the page, so the gesture is gone and a drag
   * does the job: press anywhere in the room and pull.
   *
   * It is pointer events rather than mouse events so a touch drag works too,
   * and it ignores drags that start on a control, so the nav arrows still
   * behave like buttons.
   */
  useEffect(() => {
    if (activeRoute || welcomeOpen || flat !== false) return;
    let last: number | null = null;
    let id: number | null = null;

    const down = (event: PointerEvent) => {
      if (event.button !== 0) return;
      if ((event.target as HTMLElement | null)?.closest("button, a, input")) return;
      last = event.clientX;
      id = event.pointerId;
    };
    const move = (event: PointerEvent) => {
      if (last === null || event.pointerId !== id) return;
      const delta = event.clientX - last;
      last = event.clientX;
      // Dragging right pulls the room right, which means the view goes left.
      turn(delta * YAW_PER_DRAG_PX);
      if (Math.abs(delta) > 0) document.body.style.cursor = "grabbing";
    };
    const up = () => {
      last = null;
      id = null;
      document.body.style.cursor = "";
    };

    window.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      document.body.style.cursor = "";
    };
  }, [activeRoute, welcomeOpen, flat, turn]);

  /**
   * The mug. Knock it and the camera leans in, the cup goes over, the coffee
   * spreads across the desk, and three and a half seconds later everything is
   * upright and full again and you are back where you were looking.
   *
   * Nothing about it is undoable, which is the only reason a portfolio is
   * allowed to have a joke in it. The sound is optional: if the file is
   * missing, or the browser refuses to play without a gesture it recognises,
   * the cup still goes over and the announcement still fires, because the
   * sound was never the only feedback.
   */
  const [spilled, setSpilled] = useState(false);
  const spillTimer = useRef<number | undefined>(undefined);
  const spillReturn = useRef<number | undefined>(undefined);

  useEffect(
    () => () => {
      window.clearTimeout(spillTimer.current);
      window.clearTimeout(spillReturn.current);
    },
    [],
  );

  /**
   * Any click or key while the coffee is on the desk puts it back. Watching a
   * spill you did not ask to keep watching is a modal with no close button.
   */
  useEffect(() => {
    if (!spilled) return;
    const rightIt = () => {
      window.clearTimeout(spillTimer.current);
      window.clearTimeout(spillReturn.current);
      setSpilled(false);
      setCamera("room");
      setAnnouncement("Mug upright and refilled.");
    };
    // Deferred to the next frame, or the click that knocked it over would be
    // the same click that rights it.
    const id = window.setTimeout(() => {
      window.addEventListener("pointerdown", rightIt);
      window.addEventListener("keydown", rightIt);
    }, 0);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("pointerdown", rightIt);
      window.removeEventListener("keydown", rightIt);
    };
  }, [spilled]);

  const knockOver = useCallback(() => {
    if (spilled) return;
    window.clearTimeout(spillTimer.current);
    window.clearTimeout(spillReturn.current);

    setSpilled(true);
    setCamera("mug");
    setAnnouncement("The coffee is on the desk. It will be fine in a moment.");

    const prop = SCENE_PROPS.find((item) => item.object === "mug");
    if (prop?.sound) new Audio(prop.sound).play().catch(() => {});

    spillTimer.current = window.setTimeout(() => {
      setSpilled(false);
      setAnnouncement("Mug upright and refilled.");
      // The camera holds a beat after the cup rights itself, so the last thing
      // you see close up is the mug full again rather than the tidy-up.
      spillReturn.current = window.setTimeout(() => setCamera("room"), 900);
    }, 3400);
  }, [spilled]);

  /**
   * The card the wall interactions put up. Two lines, gone in six seconds,
   * never focusable: it is a caption on something you are already looking at.
   */
  const [note, setNote] = useState<RoomNoteContent | null>(null);
  useEffect(() => {
    if (!note) return;
    const id = window.setTimeout(() => setNote(null), 6000);
    return () => window.clearTimeout(id);
  }, [note]);

  /**
   * The switch by the door. Four presses walk the room through normal,
   * deuteranopia, protanopia and tritanopia and back to normal. It recolours
   * the scene's own materials rather than putting a filter over the canvas,
   * because a filter would recolour the interface on top of it too, and the
   * interface is not what is being demonstrated.
   */
  const [vision, setVision] = useState<ColourVision>("normal");
  const cycleVision = useCallback(() => {
    setVision((current) => {
      const next =
        COLOUR_VISION[(COLOUR_VISION.indexOf(current) + 1) % COLOUR_VISION.length];
      setNote(
        next === "normal"
          ? {
              title: "Normal colour vision",
              body: "About one man in twelve does not see the room the way it just went back to.",
            }
          : {
              title: next,
              body: "Look at the wall and the plant. If colour is the only thing separating two things, for these viewers there is nothing separating them.",
            },
      );
      setAnnouncement(
        next === "normal"
          ? "Colour vision back to normal."
          : `Simulating ${next}.`,
      );
      return next;
    });
  }, []);

  /**
   * The window, and the sun going down behind it.
   *
   * Prod it and it tips onto its front and rocks until it stops, and it
   * squeaks. The squeak is synthesised rather than loaded: a fifth of a
   * second of sound that is two pitch bends does not need to be a file in the
   * repo.
   *
   * Nothing is being demonstrated by it. The mug is about undo and the switch
   * by the door is about colour, and this is a duck. Every desk somebody
   * actually works at has one thing on it that is there for no reason, and a
   * portfolio that cannot afford one of those is making a claim about its
   * author that it does not intend to make.
   */
  const [prodded, setProdded] = useState(false);
  const settleTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(settleTimer.current), []);

  const prodDuck = useCallback(() => {
    if (prodded) return;
    setProdded(true);
    squeak();
    // No card. The other things in this room put two lines up because they
    // are making a point and the point needs saying. This one squeaks, and a
    // caption explaining the joke is the surest way to kill it. The live
    // region still gets a line, because the squeak is the whole feedback and
    // somebody may not be able to hear it.
    setAnnouncement("The duck squeaks and rocks.");
    settleTimer.current = window.setTimeout(() => setProdded(false), 1500);
  }, [prodded]);

  /**
   * The blind over the window.
   *
   * Pull the cord and it comes down and the daylight in the room goes with
   * it. This is the one thing on that wall that is about something. Glare and
   * light sensitivity are access needs rather than preferences, they are the
   * reason a lot of people read everything you make with the lights off, and
   * the fix for them is the oldest piece of hardware in the room.
   *
   * It is a number rather than a boolean because the slats take a moment to
   * come down and the light has to come down with them at the same rate.
   */
  const [blindsDown, setBlindsDown] = useState(0);
  const pullBlind = useCallback(() => {
    setBlindsDown((value) => {
      const next = value === 0 ? 1 : 0;
      // No card. A blind coming down and a room going dark with it is the
      // whole of the point, and a caption underneath explaining that glare is
      // an access need is the site telling you what you just watched it do.
      // The live region still gets a line, because somebody who cannot see
      // the room go dark is owed the same information.
      setAnnouncement(
        next === 1
          ? "The blind is down. The daylight in the room has dropped."
          : "The blind is up. Daylight back through the window.",
      );
      return next;
    });
  }, []);

  /**
   * Which object's mirror button has focus, so the scene can put a ring on it
   * in the room. The mirror buttons are pills at the top of the screen and the
   * objects they open are across the room, so the browser's ring on the button
   * says which control has focus and this says what it is attached to.
   */
  const [focused, setFocused] = useState<Hotspot | null>(null);

  const playProp = useCallback(
    (object: string) => {
      if (object === "mug") knockOver();
      if (object === "lightSwitch") cycleVision();
      if (object === "duck") prodDuck();
      if (object === "blinds") pullBlind();
    },
    [knockOver, cycleVision, prodDuck, pullBlind],
  );

  return (
    <>
      <Curtain open={revealed} />

      {/* Mounted only once the room is up, so the first thing a visitor sees
          is not a light hanging over a black curtain. It takes itself off on
          a coarse pointer and under reduced motion. */}
      {/* Outside every overlay, because it goes over all of them. It renders
          nothing until Cmd+K, and the shortcut is announced in the help menu. */}
      {revealed && <CommandPalette />}

      <TopBar hidden={!revealed} overlayOpen={activeRoute !== null} />

      {revealed && activeRoute === null && <RoomNote note={note} />}

      {/*
        The welcome card is the only live thing on screen until it is
        dismissed. The room, the nav and the object buttons all go inert
        behind it, so a click on the desk cannot open a panel underneath a
        card that is still asking you to start.
      */}
      <main
        id="main"
        ref={mainRef}
        tabIndex={-1}
        className={[
          "fixed inset-0",
          welcomeOpen && revealed ? "pointer-events-none" : "",
        ].join(" ")}
        inert={welcomeOpen && revealed}
      >
        <h1 className="sr-only">
          Keerthi Anil, designer, developer and researcher. I design, build, and
          research interfaces for the people default products miss.
        </h1>
        <SceneStage
          camera={camera}
          yawRef={yaw}
          onNavigate={navigate}
          onProp={playProp}
          onReady={markSceneReady}
          spilled={spilled}
          prodded={prodded}
          blindsDown={blindsDown}
          vision={vision}
          focused={focused}
          flat={flat}
        />
      </main>

      <SceneObjectButtons
        onNavigate={navigate}
        onProp={playProp}
        onFocusObject={setFocused}
        inert={activeRoute !== null || welcomeOpen || !revealed || !!flat}
      />


      <AnimatePresence>
        {revealed && welcomeOpen && flat === false && (
          <WelcomeCard
            onDismiss={() => {
              setWelcomeOpen(false);
              // The button that had focus is about to unmount. Park focus on
              // main so the next Tab continues from the room rather than
              // restarting at the top of the document.
              mainRef.current?.focus();
            }}
          />
        )}
      </AnimatePresence>

      {revealed && (
        <BottomNav
          inert={welcomeOpen}
          activeRoute={activeRoute}
          overlayOpen={activeRoute !== null}
          onNavigate={navigate}
          onClose={close}
          onRotate={rotate}
          onRotateStep={rotateStep}
          showArrowGlow={showArrowGlow && !welcomeOpen && !flat}
          limit={limit}
          canRotate={flat === false}
        />
      )}

      <AnimatePresence>
        {activeRoute === "work" && (
          <WorkOverlay key="work" onClose={close} />
        )}
        {activeRoute === "about" && <AboutOverlay key="about" onClose={close} />}
        {activeRoute === "research" && (
          <ResearchOverlay key="research" onClose={close} />
        )}
        {activeRoute === "timeline" && <Timeline key="timeline" onClose={close} />}
      </AnimatePresence>

      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>

      {/* Routes are listed for crawlers and for anyone who lands with no JS. */}
      <noscript>
        <ul>
          {ROUTES.map((route) => (
            <li key={route.id}>
              <a href={`#${route.path}`}>{route.label}</a>
            </li>
          ))}
        </ul>
      </noscript>
    </>
  );
}

