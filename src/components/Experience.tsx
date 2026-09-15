"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
import { BottomNav } from "./BottomNav";
import { Curtain } from "./Curtain";
import { LoadingScreen } from "./LoadingScreen";
import { SceneObjectButtons } from "./SceneObjectButtons";
import { SceneStage } from "./SceneStage";
import { TopBar } from "./TopBar";
import { BeforeAfter } from "./overlay/BeforeAfter";
import { PlaceholderOverlay } from "./overlay/PlaceholderOverlay";
import { TabOrderGame } from "./overlay/TabOrderGame";
import { Timeline } from "./overlay/Timeline";
import { WorkOverlay } from "./overlay/WorkOverlay";
import { WelcomeCard } from "./WelcomeCard";

const ARROW_GLOW_AT_MS = 3000;

/**
 * How far the room can turn, in radians. About 35 degrees each way, which is
 * enough to bring a side wall into frame and not enough to see behind the desk.
 */
const YAW_LIMIT = 0.62;

export function Experience() {
  const [percent, setPercent] = useState(0);
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
  const overlayTimer = useRef<number | undefined>(undefined);

  // Fake determinate progress. It rises on its own and is held under 100 until
  // the scene actually reports ready, so the bar never lies about being done.
  useEffect(() => {
    const id = window.setInterval(() => {
      setPercent((value) => {
        if (sceneReady) return Math.min(100, value + 6);
        return Math.min(92, value + 3);
      });
    }, 45);
    return () => window.clearInterval(id);
  }, [sceneReady]);

  useEffect(() => {
    if (percent < 100) return;
    const id = window.setTimeout(() => setRevealed(true), 250);
    return () => window.clearTimeout(id);
  }, [percent]);

  useEffect(() => {
    if (!revealed || welcomeOpen) return;
    const id = window.setTimeout(() => setShowArrowGlow(true), ARROW_GLOW_AT_MS);
    return () => window.clearTimeout(id);
  }, [revealed, welcomeOpen]);

  /**
   * The camera leads the overlay by 700ms. You arrive at the object before its
   * content covers it, which is what makes the scene feel like a place rather
   * than a menu.
   */
  const applyRoute = useCallback((route: RouteId | null) => {
    window.clearTimeout(overlayTimer.current);
    setCamera(route ?? "room");
    setShowArrowGlow(false);

    if (!route) {
      setActiveRoute(null);
      setAnnouncement("Back in the room.");
      return;
    }

    const definition = ROUTE_BY_ID[route];
    setAnnouncement(definition.loadingMessage);
    overlayTimer.current = window.setTimeout(() => {
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
  const rotate = useCallback((direction: 1 | -1) => {
    const next = Math.max(
      -YAW_LIMIT,
      Math.min(YAW_LIMIT, yaw.current + 0.05 * direction),
    );
    yaw.current = next;
    const reached =
      next >= YAW_LIMIT - 1e-4
        ? "left"
        : next <= -YAW_LIMIT + 1e-4
          ? "right"
          : null;
    setLimit((current) => (current === reached ? current : reached));
  }, []);

  // Arrow keys drive the same rotation, and stop while an overlay is open so
  // they stay available for scrolling the overlay's own content.
  useEffect(() => {
    if (activeRoute) return;
    const pressed = { left: false, right: false };
    const onDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") pressed.left = true;
      if (event.key === "ArrowRight") pressed.right = true;
    };
    const onUp = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") pressed.left = false;
      if (event.key === "ArrowRight") pressed.right = false;
    };
    let frame = 0;
    const tick = () => {
      if (pressed.left) rotate(1);
      if (pressed.right) rotate(-1);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, [activeRoute, rotate]);

  /**
   * The mug. Three sips empty it, and a fourth click fills it again. The sound
   * is optional: if the file is missing, or the browser refuses to play without
   * a gesture it recognises, the level still drops and the announcement still
   * fires, because the sound was never the only feedback.
   */
  const [sips, setSips] = useState(0);
  const drink = useCallback(() => {
    setSips((count) => {
      const next = count >= 3 ? 0 : count + 1;
      setAnnouncement(
        next === 0
          ? "Mug refilled."
          : next === 3
            ? "Empty."
            : `Sip ${next} of 3.`,
      );
      return next;
    });
    const prop = SCENE_PROPS.find((item) => item.object === "mug");
    if (prop?.sound) new Audio(prop.sound).play().catch(() => {});
  }, []);

  const playProp = useCallback(
    (object: string) => {
      if (object === "mug") drink();
    },
    [drink],
  );

  return (
    <>
      {percent < 100 && <LoadingScreen percent={percent} />}
      <Curtain open={revealed} />

      <TopBar onHome={close} hidden={!revealed} inert={activeRoute !== null} />

      <main id="main" ref={mainRef} tabIndex={-1} className="fixed inset-0">
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
          sips={sips}
        />
      </main>

      <SceneObjectButtons
        onNavigate={navigate}
        onProp={playProp}
        inert={activeRoute !== null || welcomeOpen || !revealed}
      />

      <AnimatePresence>
        {revealed && welcomeOpen && (
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
          activeRoute={activeRoute}
          overlayOpen={activeRoute !== null}
          onNavigate={navigate}
          onClose={close}
          onRotate={rotate}
          showArrowGlow={showArrowGlow && !welcomeOpen}
          limit={limit}
        />
      )}

      <AnimatePresence>
        {activeRoute === "work" && (
          <WorkOverlay
            key="work"
            onClose={close}
            onOpenProject={(id) => setAnnouncement(`${id} case study, coming next phase.`)}
          />
        )}
        {activeRoute === "about" && (
          <PlaceholderOverlay key="about" label="About" onClose={close} />
        )}
        {activeRoute === "research" && (
          <PlaceholderOverlay key="research" label="Research" onClose={close} />
        )}
        {activeRoute === "timeline" && <Timeline key="timeline" onClose={close} />}
        {activeRoute === "taborder" && (
          <TabOrderGame key="taborder" onClose={close} />
        )}
        {activeRoute === "beforeafter" && (
          <BeforeAfter key="beforeafter" onClose={close} />
        )}
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

