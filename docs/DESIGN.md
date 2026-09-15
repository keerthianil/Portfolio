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

## Type

| Role | Family | Why |
|---|---|---|
| Display | Fraunces | Warm high contrast serif. Already ships in Threadline |
| Body and UI | Schibsted Grotesk | Also ships in Threadline |
| Handwriting | Patrick Hand | Sticky notes and labels |
| Mono | JetBrains Mono | Terminal, hex values, WCAG IDs |

Using the same families the apps use means the site's type system is the one the
work uses, rather than a separate set chosen to look nice.

## Motion

`src/lib/motion.ts` holds the whole vocabulary: one curve, three springs, two
durations. Nothing invents a new value per component.
`docs/MOTION-SPEC.md` has the measured numbers and the reasoning.

## Accessibility

This is the subject of the site, so it is tested rather than claimed.

- Every object in the 3D room is also a real focusable button. The canvas is an
  enhancement and never the only route to anything.
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
