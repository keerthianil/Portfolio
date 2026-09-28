/** The fake boot sequence. Each line fills its bar, then the next starts. */
export const BOOT_LINES = [
  "Compiling Swift",
  "Running accessibility audit",
  "Attaching VoiceOver",
  "Pouring the third coffee",
];

/** Per line tick interval in ms. Faster lines read as cached, slower as work. */
export const BOOT_INTERVALS = [18, 3, 6, 11];

/**
 * ASCII art. The glyphs themselves are always aria-hidden, because read aloud
 * a box drawing character is noise; `ABOUT_ART` says what each one means.
 */
export const NAME_BANNER = [
  "█  █ ████ ████ ███  ████ █  █ ████",
  "█ █  █    █    █  █  ██  █  █  ██ ",
  "██   ███  ███  ███   ██  ████  ██ ",
  "█ █  █    █    █ █   ██  █  █  ██ ",
  "█  █ ████ ████ █  █  ██  █  █ ████",
].join("\n");

/** The rubber duck from the desk, signing off. */
export const ART_DUCK = [
  "",
  "    __",
  " __( o)>    EOF.",
  " \\ <_. )    quack.",
  "  `---'",
].join("\n");

export const ART_MUG = String.raw`
    ) ) )
   ┌───────┐──┐
   │       │  │
   │       │──┘
   └───────┘`;

/**
 * The bio. Prose only, so the paragraphs read straight through; the pictures
 * sit after it in `ABOUT_ART`.
 */
export const ABOUT_PARAGRAPHS: string[] = [
  "In 2021 I built a way to move a cursor with your face, for someone who couldn't use a mouse. The nose steered and a blink clicked, which made every sneeze a risk. It was rough, it worked, and I've been building versions of it ever since.",
  "These days it's iOS, mostly for blind and low-vision users. At the Roux Institute I built StemAlly, a math reader you can actually move around in, instead of hearing an equation once and hoping for the best. And TactileNav, street maps you read with one finger. I tested both with the people they were for, which is the fastest way I know to find out everything I got wrong.",
  "I do the whole thing: the research, the design in Figma, and the SwiftUI that ships. Not because I can't delegate, I promise. It's that the decisions that matter fall through the gaps between those jobs. A study finds nobody uses the exit gesture, the designer never hears about it, and the next build adds another gesture nobody will find. Doing all three puts the finding and the fix in the same week. It also leaves exactly one person to blame, which keeps me honest.",
  "What I care about is simple to say and annoyingly hard to do: watch someone use the thing, then change what you built. Most of what I make is for the people a default design leaves out.",
  "Off the clock: fiction most nights, which I've been disappearing into since I was a kid, and coffee before anything, which at this point is load-bearing.",
];

export interface AboutArt {
  content: string;
  /**
   * What the picture says, read in its place. Leave it out and the picture is
   * decorative and hidden from assistive tech entirely.
   */
  label?: string;
}

/**
 * The mug is decoration. The duck closes the terminal and says something while
 * it does, so it gets a text alternative.
 */
export const ABOUT_ART: AboutArt[] = [
  { content: ART_MUG },
  {
    content: ART_DUCK,
    label: "A rubber duck signing off: end of file. Quack.",
  },
];

export interface DesktopIcon {
  id: string;
  label: string;
  /** Where it sits, as a percentage of the desktop area. */
  x: number;
  y: number;
}

/**
 * Three things on the desktop. Two are real and one is a joke, and the joke is
 * the one that makes the other two read as a desktop rather than as a nav.
 */
export const DESKTOP_ICONS: DesktopIcon[] = [
  { id: "timeline", label: "Timeline", x: 50, y: 12 },
  { id: "taxes", label: "Tax documents", x: 50, y: 40 },
  { id: "resume", label: "Resume.pdf", x: 50, y: 68 },
];
