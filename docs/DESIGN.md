# Design notes

## Palette

Defined once in `src/app/globals.css`. Every ratio below is computed against the
page background `#0C0A09`, not estimated.

| Token | Hex | Ratio | Where it is allowed |
|---|---|---|---|
| `text` | `#F2EAE1` | 16.59:1 | Body copy, headings |
| `highlight` | `#D4A0A0` | 8.78:1 | Any text that needs to read as accent |
| `text-muted` | `#7A706A` | 4.10:1 | Large text and non text UI only |
| `accent` | `#8B2332` | 2.24:1 | Surfaces and glows. Never text on the page |

Cream on burgundy is 7.40:1, so burgundy surfaces carrying cream text are safe.
Two rules fall out of those numbers:

1. `text-muted` never carries body copy. Body that needs to recede uses `text`
   at a lower weight, not a lighter colour.
2. The burgundy is a fill and a glow. Text that wants to look like the accent
   uses `highlight`.

The Research overlay inverts to e-ink: `#F2EAE1` paper, `#0C0A09` ink.

If those ratios are ever recomputed, linearise all three channels first. A
version of the contrast maths shipped with the blue channel left in gamma space
and every ratio came out inflated: 24.29 where the real number is 16.59.

## The room

Warm oak, a panel of maroon battens standing proud of more oak, and one
saturated hue. Maroon is on the battens, the felt behind them, the home row of
the keyboard and the band on the pen, and nowhere else. Everything not maroon is
wood, paper, or a grey that leans warm.

A door on the left wall and a window on the right, because a room with three
blank walls is a set. Both do something. Beside the door is a switch that runs
the room through the three dichromacies, which is the argument against letting
colour carry meaning on its own and it lands faster than a paragraph about it
would. The window is where the daylight comes from, and clicking it takes the
daylight away: the sun finishes going down, the stars come out in the
photograph, and the room drops to the desk lamp and the monitor. Nothing you
made gets looked at in one light.

Three things on the walls, and the third is the mug. Each is one click and puts
a two line card up for six seconds. None of them is undoable, which is the only
reason a portfolio is allowed to have any of them.

The monitor is a screensaver: one project, held 3.4s, then changed over 0.7s.
The canvas behind it is only repainted while that change is in flight and only
at 24fps, because each repaint is a texture upload and nothing on a held slide
is moving. The two slides do not cross dissolve. Both titles sit at the same
point on the panel, so a cross dissolve printed two project names over each
other for a third of a second and neither was readable. The outgoing slide
leaves before the incoming one arrives.

## Type

| Role | Family | Why |
|---|---|---|
| Display | Newsreader | Drawn for reading at length on a screen |
| Body and UI | Public Sans | The US design system's face, drawn for services people have no choice about using |
| Handwriting | Patrick Hand | Sticky notes and labels |
| Mono | JetBrains Mono | Terminal, hex values, WCAG IDs |

Public Sans is an argument rather than a decoration on a site about
accessibility: it was drawn to be legible to everyone required to read it.

The font variables go on `<html>`, not `<body>`. The `@theme` tokens that point
at them are emitted at `:root`, so a variable defined further down the tree
resolves to nothing and every family silently falls back to the system stack.

## Motion

`src/lib/motion.ts` holds the whole vocabulary: one curve, three springs, two
durations. Nothing invents a new value per component.
`docs/MOTION-SPEC.md` has the measured numbers and the reasoning.

## Accessibility

This is the subject of the site, so it is tested rather than claimed.

- Every object in the 3D room is also a real focusable button. The canvas is an
  enhancement and never the only route to anything.
- Focus lands on an object, so the scene draws a ring on it. The mirror buttons
  are pills at the top of the screen and the things they open are across the
  room, so without the ring nothing connects the two. It is on whenever the room
  is, which is the only setting a focus indicator has ever been allowed to have.
- A panel that opens inside a panel is a second level of the hash, and opening
  one pushes a history entry rather than replacing it. Back closes it. On a
  phone that gesture is how most people close most things.
- `prefers-reduced-motion` degrades every animated surface, and zeroes delays as
  well as durations. A `both` filled animation with a 0.4s delay holds its
  element invisible even when the duration is zeroed.
- Every overlay carries its own close control, because `aria-modal` hides
  everything outside a dialog from a screen reader.
- Every image gets alt text written for that image.
- Pinch zoom stays enabled. No `user-scalable=no`.
- Never animate `width`, `height`, `top`, `left`, `margin` or `padding`.

## The flat view

The 3D room is an enhancement, never the only route to anything. Every object in
it is also a real focusable button, so the page works with the canvas removed.

It is replaced automatically when the browser cannot give the page a WebGL
context, or when the scene throws at runtime, and `?no3d=1` forces it. The
replacement is not a photograph of the room: a picture of a room you cannot
touch is worse than no room, so it is the same set of links as a list.

## Copy

Zero em dashes, zero italics. Short declarative sentences. Word counts are
ceilings, not targets.

Two claims are banned because they are false: the "WebAIM 2025 found 87%"
statistic does not exist, and the European Accessibility Act does not mandate
accessible venues.

## Checks before committing

```bash
npx tsc --noEmit && npx eslint src --max-warnings 0 && npm run build
```
