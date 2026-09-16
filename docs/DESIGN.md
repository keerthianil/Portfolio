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
blank walls is a set. Beside the door is a switch that runs the room through
the three dichromacies, which is the argument against letting colour carry
meaning on its own and it lands faster than a paragraph about it would. The
window is where the daylight comes from, and that is all it does.

Both of them are built the way joinery is built rather than as slabs with
detail painted on. The window is a sash of two stiles and two rails standing
in front of the glass, in a casing, on a sill, in a reveal that gives the hole
sides. Its head lines up with the head of the door, which is the thing that
was most wrong with the version before it: it was a metre and a half tall with
its top twenty centimetres above the door's, and painted the brightest colour
in the room. The door is a leaf with two stiles and three rails standing proud
of it, and the panels are the leaf showing through between them.

Four things you can touch. The mug goes over and rights itself. The switch by
the door runs the simulation. The lamp swings its arm across the desk and the
light goes with it. The rubber duck between the laptop and the calendar tips
over, rocks, and squeaks.

The duck is not making a point. Everything else you can touch here is an
argument and one of them is allowed to just be nice, and a portfolio that
cannot afford one of those is making a claim about its author that it does not
intend to make. It is also the one saturated thing in this room that is not
maroon, which is a rule broken on purpose: a duck that is not yellow is not a
duck. The yellow is pulled toward the sticky note rather than toward a bath
toy, so it sits in the room's own family of warm yellows.

Its squeak is synthesised in the browser with two oscillators rather than
loaded as a file. A rubber duck makes two noises and not one, the squeeze
rising and the release falling, and a fifth of a second of that is an envelope
and two pitch bends. It does not need to be an asset.

There was no lamp for a long time and there was still a light on the desk: it
came from a bar clipped to the top of the monitor, which is a real object and
is also not a lamp, so the brightest thing on the desk came from something
nobody could see. The lamp's arm is laid out by where its joints are rather
than as a chain of nested rotations, because nested rotations compound and the
first version summed to about ninety degrees and shone at the viewer. Its
spot light is a child of the head, so nothing in the code moves the light: the
arm turns and the light is bolted to it.

Each of the four puts a two line card up for six seconds. None of them is
undoable, which is the only reason a portfolio is allowed to have any of them.

The photograph in the window has its saturation pushed and its emissive pulled
down. An emissive map is what makes a window read as a source of light instead
of a picture hung on a wall, and it washes a photograph toward white as it
brightens. Asking it to glow less and asking the canvas for more colour gets a
window that is bright and is still a sunset.

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
