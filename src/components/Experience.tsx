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
import { WelcomeCard } from "./WelcomeCard";

const ARROW_GLOW_AT_MS = 3000;

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
  const rotate = useCallback((direction: 1 | -1) => {
    let next = yaw.current + 0.05 * direction;
    while (next > Math.PI) next -= 2 * Math.PI;
    while (next < -Math.PI) next += 2 * Math.PI;
    yaw.current = next;
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
      if (pressed.left) rotate(-1);
      if (pressed.right) rotate(1);
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

  const playProp = useCallback((object: string) => {
    const prop = SCENE_PROPS.find((item) => item.object === object);
    if (!prop) return;
    setAnnouncement(prop.announcement);
    const audio = new Audio(prop.sound);
    // Missing file, or a browser that refuses without a gesture. Either way the
    // prop is decorative, so failing silently is the right outcome.
    audio.play().catch(() => {});
  }, []);

  return (
    <>
      {percent < 100 && <LoadingScreen percent={percent} />}
      <Curtain open={revealed} />

      <TopBar onHome={close} hidden={!revealed} />

      <main id="main" ref={mainRef} tabIndex={-1} className="fixed inset-0 outline-none">
        <h1 className="sr-only">
          Keerthi Anil, designer, developer and researcher. I design, build, and
          research interfaces for the people default products miss.
        </h1>
        <SceneStage camera={camera} yawRef={yaw} onNavigate={navigate} onProp={playProp} />
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
        />
      )}

      {/* Overlays mount here in phases 3 to 5. */}
      {activeRoute && (
        <section
          className="bg-bg/80 fixed inset-0 z-[400] flex items-center justify-center backdrop-blur-sm"
          aria-label={ROUTE_BY_ID[activeRoute].label}
        >
          <p className="font-mono text-text-muted text-sm">
            {ROUTE_BY_ID[activeRoute].label} overlay lands in a later phase
          </p>
        </section>
      )}

      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>

      <SceneReadySignal onReady={() => setSceneReady(true)} />

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

/**
 * Phase 1 has no scene to wait for, so readiness is a frame after mount. Phase
 * 2 replaces this with the R3F canvas reporting its own load.
 */
function SceneReadySignal({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    const id = window.setTimeout(onReady, 600);
    return () => window.clearTimeout(id);
  }, [onReady]);
  return null;
}
