# keerthiaportfolio.vercel.app

My portfolio. It is one page, and the page is a room: a desk with a monitor, a
laptop, a notebook and a calendar on it, and each of those objects opens a
section of the site.

I build and research interfaces for the people that default products miss,
mostly blind and low vision users, mostly on iOS. Accessibility is the subject
of the work, so it is also the constraint the site is built under: the room is
rendered in WebGL and not one thing in it is reachable only that way.

Live at [keerthiaportfolio.vercel.app](https://keerthiaportfolio.vercel.app).

## Running it

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`. Add `?no3d=1` to any URL to see the flat
view, which is what a browser without WebGL gets.

Three checks, and all three have to pass before anything is committed:

```bash
npx tsc --noEmit && npx eslint src --max-warnings 0 && npm run build
```

## How it is put together

Next.js App Router, TypeScript, Tailwind. The room is `three` through
`@react-three/fiber`, built by hand rather than exported from a modelling tool,
and every texture in it is drawn into a 2D canvas at runtime: the wood grain,
the crema on the coffee, the screensaver on the monitor, the frost of rain on
the window.

```
src/app/         the single page, the fonts, the palette tokens
src/components/  the shell: nav, welcome card, curtain, the overlays
src/data/        the routes registry, and all the writing
src/lib/         motion tokens, the focus trap, the sub route hook
src/scene/       the room: geometry, materials, lights, camera, textures
```

**The hash is the router.** `src/data/routes.ts` is the registry and the only
place a section gets added. Four routes, three of them in the nav, and each one
is an object you can click in the room.

**The camera leads the overlay by 700ms.** A route change moves the camera
first and mounts the panel 700ms later, so you arrive at the object before its
content covers it. It is the one timing everything else is built around.

## Accessibility

The subject of the site, so it is tested rather than claimed.

- Every object in the room is also a real focusable button. The canvas is an
  enhancement and never the only route to anything, and there is a flat view
  for browsers that cannot run it.
- Focus lands on an object and the scene draws a ring on that object, because
  a control at the top of the screen that opens something across the room needs
  something connecting the two.
- Every overlay carries its own close control. `aria-modal` hides everything
  outside a dialog from a screen reader, including the close button in the nav.
- Reduced motion zeroes delays as well as durations, and takes the moving
  things out of the room rather than leaving them running slower.
- Pinch zoom stays enabled. No `user-scalable=no`, no `maximum-scale`.
- Every colour pair in the palette was measured rather than estimated, and two
  of the four tokens are documented as failing for body copy, because that is
  what they do.

`docs/DESIGN.md` has the palette ratios and the reasoning. `docs/MOTION-SPEC.md`
has the timings.

## Three things in the room that are not sections

The mug goes over when you knock it, and rights itself. The switch by the door
runs the whole room through the three dichromacies, which is the argument
against letting colour carry meaning on its own and it lands faster than a
paragraph about it would. The window rains, which is not an argument about
anything.

## Contents

The writing is mine and the projects are real. Where a project has no written
case study it says so and gives you the code instead, because a narrative
invented after the fact is the opposite of the point of the rest of it. The
numbers on the metric tiles are measured numbers or they are not there.

Keerthi Anil
