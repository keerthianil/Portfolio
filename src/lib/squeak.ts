"use client";

/**
 * The duck's squeak, synthesised in the browser.
 *
 * It is not a file. An mp3 of a squeak would be one more asset in the repo
 * and one more request, for about a fifth of a second of sound that is two
 * pitch bends and an envelope. The Web Audio API has an oscillator and a
 * filter in it already.
 *
 * A rubber duck makes two noises and not one: the squeeze, which rises as the
 * air is forced out, and the release, which falls as the air comes back in.
 * One tone on its own reads as a beep from a microwave.
 */
let context: AudioContext | null = null;

/** Lazily made, and made once. A context per click leaks a context per click. */
function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!context) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    context = new Ctor();
  }
  return context;
}

function chirp(
  ctx: AudioContext,
  at: number,
  from: number,
  to: number,
  length: number,
  level: number,
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  // A band pass around the tone is what makes it rubber rather than a synth:
  // it takes the edge off the top and the body out of the bottom.
  const band = ctx.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = (from + to) / 2;
  band.Q.value = 1.4;

  osc.type = "triangle";
  osc.frequency.setValueAtTime(from, at);
  osc.frequency.exponentialRampToValueAtTime(to, at + length);

  // Exponential ramps cannot touch zero, hence the very small floor values.
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(level, at + Math.min(0.02, length / 4));
  gain.gain.exponentialRampToValueAtTime(0.0001, at + length);

  osc.connect(band).connect(gain).connect(ctx.destination);
  osc.start(at);
  osc.stop(at + length + 0.02);
}

/**
 * Plays it. Safe to call from a click and safe to call when the browser has
 * decided it would rather not: everything here is optional, and the duck
 * still tips over without it.
 */
export function squeak() {
  const ctx = audio();
  if (!ctx) return;
  // Autoplay rules park a context created before the first gesture. A click
  // is a gesture, so this resolves on the first prod and is a no-op after.
  if (ctx.state === "suspended") void ctx.resume();

  const now = ctx.currentTime + 0.01;
  chirp(ctx, now, 980, 1680, 0.11, 0.14);
  chirp(ctx, now + 0.13, 1480, 820, 0.14, 0.1);
}
