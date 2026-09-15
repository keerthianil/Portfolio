# Audio

Two files, and they are the only sound on the site.

| File | Plays when | Status |
|---|---|---|
| `coffee-sip.mp3` | The mug in the room is clicked or activated | **needed** |
| `screen-reader.mp3` | The speaker in the room is clicked or activated | **needed** |

Both fail silently if absent, so the props are safe to ship without them.

`screen-reader.mp3` should be a real VoiceOver pass over the home screen rather
than a generic beep. The point of the prop is to let a sighted visitor hear what
the site sounds like, which only works if it is the actual output.
