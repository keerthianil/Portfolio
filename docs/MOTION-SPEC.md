# Motion and interaction spec

The numbers this site animates on, in one place, so nothing gets eyeballed per
component later.

## Vocabulary

One custom curve, three springs, two durations.

| Name | Value | Used for |
|---|---|---|
| `curtain` | `cubic-bezier(0.25, 0.46, 0.45, 0.94)`, 1200ms | Full screen curtain reveal and exit. Reserved. |
| `springModal` | `{ stiffness: 300, damping: 30 }` | Case study modal enter and exit |
| `springIndicator` | `{ stiffness: 200, damping: 20 }` | Nav hover pill slide |
| `springPop` | `{ stiffness: 400, damping: 25 }` | Nav close button pop |
| hover and colour | 200ms | Every hover and colour change |
| overlay enter and exit | 300ms | Window slide, backdrop fade |

Two springs and one curve carry the whole site. That restraint is most of why it
reads as finished.

## Loading

Stage thresholds by percent: `<=25 sketching`, `<=50 voiceover`, `<=85 contrast`,
`<100 haptics`, `100 ready`.

Ring: `viewBox 0 0 100 100`, `r=45`, `strokeWidth=2`, rotated `-90deg`,
`strokeDasharray = 2*PI*45`, `strokeDashoffset = 2*PI*45*(1-pct/100)`, 300ms ease out.

The loading screen uses CSS keyframes, never JS animation. It paints during the
busiest moment of the page's life, before hydration has settled and while the 3D
canvas initialises. A JS animation there does not get a frame, and the screen
ends up invisible.

Curtain: two panels, `origin-top` and `origin-bottom`, `scaleY 1 to 0`, 1200ms,
curtain ease. Exit runs the reverse plus a black fade at `delay 1`.

## Scene navigation

- Orbit step per frame: `rotation.y += 0.05 * direction`, about 2.86 degrees,
  driven by requestAnimationFrame while an arrow is held.
- Yaw is normalised to `[-PI, PI]` every frame or it winds up.
- Yaw lives in a ref, not state. It changes every frame while an arrow is held
  and only the scene reads it.
- **The camera leads the overlay by 700ms.** A route change moves the camera
  first and mounts the overlay 700ms later, so you arrive at the object before
  its content covers it. This is the difference between a room and a menu.
- Camera uses exponential damping, `smoothTime 0.28`, which settles in about
  900ms. Damping rather than a fixed duration ease because it is interruptible:
  clicking a second object mid flight retargets from where the camera actually
  is instead of restarting from a stale origin.
- Reduced motion sets `smoothTime` to zero, which turns every move into a cut.

## Bottom nav

```
nav       fixed bottom-0 w-full h-[100px] z-[500] pointer-events-none
scrim     bottom gradient, 130px
pill      backdrop-blur-sm rounded-full h-[84px] px-4
entry     {opacity:0, y:20} to {opacity:1, y:0}, 500ms ease out
arrows    56px round, hover scale 1.10, active scale 0.95, 200ms
labels    70x48, 16px
indicator 70x48, animates x by index*(70 + gap), gap 8 at >=640px else 4
close     64px round, scale 0 to 1, springPop
```

Every button carries a focus-visible ring, an Enter and Space handler, a pressed
state, and `touch-manipulation`. Bottom padding uses
`env(safe-area-inset-bottom)` so the pill clears the home indicator.

## Overlays

- Window slides up from the bottom edge, 300ms ease out, over a blurred scrim.
- `useModalFocus` handles all of it: remember and restore focus, Escape to
  close, Tab trapped over live focusables filtered by computed `display`,
  `visibility`, `opacity` and `aria-hidden`, and a body scroll lock.
- The window carries its own close control. `aria-modal` hides everything
  outside the dialog from a screen reader, so a close button that lives in the
  nav is one they cannot find.
- The room and the nav pill go `inert` while an overlay is open, so Tab cannot
  wander behind it.

## Grid

```
grid gap-5 sm:grid-cols-2 xl:grid-cols-3
```

Cards keep two layers of hover: the card lifts on a 150ms curve and the art
scales on a 300ms one, so the art is still moving after the card has settled.

## Accessibility rules this site holds itself to

- Every object in the 3D room is also a real focusable button. The canvas is an
  enhancement, never the only route to anything.
- `prefers-reduced-motion` degrades every animated surface, and zeroes delays as
  well as durations.
- A skip link, and a visible focus style on its target.
- Pinch zoom stays enabled.
- Every image carries alt text written for that image.
- Semantic landmarks throughout.
