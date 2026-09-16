/**
 * The overlay registry. Hash drives everything: `#work` opens the work overlay
 * and moves the camera to `work`. Adding a section means adding a row here.
 */

export type RouteId = "work" | "about" | "research" | "timeline";

/**
 * Camera states that are not routes. `mug` is where the camera goes to watch
 * the coffee go over, and it comes straight back.
 */
export type SceneCamera = "room" | "mug";

export type CameraState = RouteId | SceneCamera;

export interface RouteDefinition {
  id: RouteId;
  /** The hash, without the `#`. */
  path: string;
  /** Used in the nav and as the accessible name. */
  label: string;
  /** Title shown in the window chrome. */
  title: string;
  /** Announced while the overlay's chunk loads. */
  loadingMessage: string;
  /** Name of the object in the 3D scene that opens this route. */
  sceneObject: string;
  /** What that object is, for the screen reader label on its mirror button. */
  sceneObjectLabel: string;
  /** Whether it appears in the bottom nav. */
  inNav: boolean;
}

export const ROUTES: RouteDefinition[] = [
  {
    id: "work",
    path: "work",
    label: "work",
    title: "Projects",
    loadingMessage: "Loading projects...",
    sceneObject: "monitor",
    sceneObjectLabel: "the monitor",
    inNav: true,
  },
  {
    id: "about",
    path: "about",
    label: "about",
    title: "Keerthi - About",
    loadingMessage: "System booting...",
    sceneObject: "laptop",
    sceneObjectLabel: "the laptop",
    inNav: true,
  },
  {
    id: "research",
    path: "research",
    label: "research",
    title: "Research",
    loadingMessage: "Loading research...",
    sceneObject: "reader",
    sceneObjectLabel: "the notebook",
    inNav: true,
  },
  {
    id: "timeline",
    path: "timeline",
    label: "timeline",
    title: "Timeline",
    loadingMessage: "Loading timeline...",
    sceneObject: "calendar",
    sceneObjectLabel: "the desk calendar",
    inNav: false,
  },
];

export const NAV_ROUTES = ROUTES.filter((route) => route.inNav);

export const ROUTE_BY_ID = Object.fromEntries(
  ROUTES.map((route) => [route.id, route]),
) as Record<RouteId, RouteDefinition>;

export function routeFromHash(hash: string): RouteDefinition | null {
  const path = hash.replace(/^#/, "").split("/")[0];
  return ROUTES.find((route) => route.path === path) ?? null;
}

/**
 * Props in the scene that do something but do not open a panel. The mug is the
 * only one: there used to be a speaker here for a voice assistant, and that is
 * gone along with every other voice feature.
 */
export interface SceneProp {
  object: string;
  label: string;
  /** The verb on its mirror button, so "Squash the bug" reads as a sentence. */
  action: string;
  sound?: string;
}

export const SCENE_PROPS: SceneProp[] = [
  {
    object: "mug",
    label: "the coffee mug",
    action: "Knock over",
    sound: "/audio/coffee-spill.mp3",
  },
  {
    object: "lightSwitch",
    label: "the colour vision switch by the door",
    action: "Press",
  },
  {
    object: "plane",
    label: "the paper plane on the desk",
    action: "Throw",
  },
];
