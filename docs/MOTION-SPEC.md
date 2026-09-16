# Motion and interaction spec

The numbers this site animates on, in one place, so nothing gets eyeballed per
component later.

## Vocabulary

One custom curve, three springs, two durations.

| Name | Value | Used for |
|---|---|---|
| `curtain` | `cubic-bezier(0.25, 0.46, 0.45, 0.94)`, 700ms | Full screen curtain reveal. Reserved. |
| `springModal` | `{ stiffness: 300, damping: 30 }` | Case study modal enter and exit |
| `springIndicator` | `{ stiffness: 200, damping: 20 }` | Nav hover pill slide |
| `springPop` | `{ stiffness: 400, damping: 25 }` | Nav close button pop |
| hover and colour | 200ms | Every hover and colour change |
| overlay enter and exit | 300ms | Window slide, backdrop fade |

Two springs and one curve carry the whole site. That restraint is most of why it
reads as finished.

## Loading

There is no loading screen, on purpose. There was one, and it counted a
percentage to a hundred against a number nobody was waiting for: the scene
chunk is lazy and the textures paint on their own, so the number was invented
and the wait belonged to the number rather than to the page.

The curtain opens 60ms after the scene reports ready, and the flat view shows
immediately because it has nothing to wait for.

Curtain: two panels, `origin-top` and `origin-bottom`, `scaleY 1 to 0`, 700ms,
curtain ease. 700 and not 1200, because every millisecond of a curtain is spent
looking at black, and a slow theatre wipe is a nice idea on the second visit and
a wait on the first.

The panels are always mounted and driven by `open`. They were wrapped in an
`AnimatePresence` keyed on `!open` once, so they opened the moment they mounted
and then ran their exit, which closed them again, when `open` finally flipped.
The curtain went up twice. They do not go back inside an `AnimatePresence`.

## Scene navigation

The room is two stops wide each way: desk, part turn, wall. It is not a 360,
because a full turn puts you behind the desk looking at the back of a monitor.

- Yaw is clamped to +/- 0.62 rad, about 35 degrees, and never wrapped.
- One press of an arrow turns half the limit, so two presses reach the wall.
  Press and hold switches to a continuous turn after 260ms, at 0.012 rad per
  frame. The delay is what keeps a single click from doing both.
- A horizontal scroll turns the room at 0.0016 rad per pixel. That listener is
  not passive, because a horizontal scroll with nothing to scroll triggers the
  browser back swipe on macOS, and it is only attached in the room.
- Positive yaw swings the view toward the left wall, so the "Look left" button
  passes `+1`. This reads backwards and is correct.
- Yaw lives in a ref, not state. It changes every frame while an arrow is held
  and only the scene reads it. The two limit flags are state, and only change
  when a limit is crossed.
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
          press = one stop, hold past 260ms = continuous
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
- Two overlays open on the device you clicked rather than over the room: the
  monitor and the laptop each draw their own bezel, and the window sits on that
  screen with the wallpaper behind it. In that form the whole screen is the
  dialog, not the window, because the files on the desktop are content and
  anything outside a dialog is invisible to a screen reader.
- The window's red dot closes and its green dot goes full bleed. The yellow one
  is drawn and does nothing, so it is a `span` and not a disabled button: a
  control with no behaviour behind it does not belong in the tab order.

## The mug

Knocking it over runs one number from 0 to 1 and back, damped at 7 going over
and 3.2 coming back, because gravity and a tidy-up are not the same speed. That
number drives the tip, the puddle and the level together. The camera leans in
for it and holds 900ms after the cup rights itself, so the last thing you see
close up is the mug full again. The whole cycle is 4.3s and nothing about it is
undoable.

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
