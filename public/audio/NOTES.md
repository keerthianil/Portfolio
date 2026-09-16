# Audio

`coffee-spill.mp3` plays when the mug in the room is clicked or activated: the
cup goes over, the coffee spreads across the desk, and a few seconds later
everything is upright and full again.

The file is **synthesised, not recorded**. It is two shaped noise bursts, a low
thud for the cup going over and a brighter one that darkens as it decays for the
liquid, with three short sine drips in the tail. It is deliberately quiet,
because it fires without being asked for.

Replace it with a real recording when there is one. Nothing breaks if the file
is missing: the cup still goes over and the state is still announced, because
the sound was never the only feedback.
