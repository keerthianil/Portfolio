/**
 * Whether this browser can actually give us a WebGL context.
 *
 * Feature detection rather than a user-agent guess: the cases that matter are a
 * blocklisted driver, WebGL switched off in settings, and software rendering
 * being refused, and none of those are visible in a UA string.
 *
 * The probe canvas is thrown away immediately. Contexts are a limited resource
 * and leaking one to answer a yes or no question would be a poor trade.
 */
let cached: boolean | undefined;

export function supportsWebGL(): boolean {
  if (typeof window === "undefined") return false;
  // Cached because this is read on every render through a store snapshot, and
  // creating a throwaway context each time would be absurd.
  if (cached !== undefined) return cached;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ??
      canvas.getContext("webgl") ??
      canvas.getContext("experimental-webgl");
    if (!gl) {
      cached = false;
      return false;
    }
    const lose = (gl as WebGLRenderingContext).getExtension(
      "WEBGL_lose_context",
    );
    lose?.loseContext();
    cached = true;
    return true;
  } catch {
    cached = false;
    return false;
  }
}

/**
 * A documented escape hatch: `?no3d=1` forces the flat view.
 *
 * Useful for anyone whose device technically reports WebGL support and still
 * struggles with it, and it makes the fallback testable without having to find
 * a browser that refuses a context.
 */
export function forcedFlat(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("no3d") === "1";
}

/**
 * Whether the room has to be replaced by the flat view. Exposed as an external
 * store because it is a fact about the device that never changes, and because
 * the server has no answer for it: the server snapshot is null, so the first
 * client render is allowed to differ without a hydration mismatch.
 */
export const flatStore = {
  subscribe: () => () => {},
  getSnapshot: (): boolean => forcedFlat() || !supportsWebGL(),
  getServerSnapshot: (): boolean | null => null,
};
