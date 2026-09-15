/** The fake boot sequence. Each line fills its bar, then the next starts. */
export const BOOT_LINES = [
  "Resolving package dependencies",
  "Compiling Swift",
  "Running accessibility audit",
  "Attaching VoiceOver",
  "Pouring the third coffee",
];

/** Per line tick interval in ms. Faster lines read as cached, slower as work. */
export const BOOT_INTERVALS = [34, 18, 3, 6, 11];

/**
 * ASCII art, interleaved with the prose the way a terminal would print it.
 * Every block is aria-hidden: read aloud, a box drawing character is noise.
 */
export const NAME_BANNER = [
  "█  █ ████ ████ ███  ████ █  █ ████",
  "█ █  █    █    █  █  ██  █  █  ██ ",
  "██   ███  ███  ███   ██  ████  ██ ",
  "█ █  █    █    █ █   ██  █  █  ██ ",
  "█  █ ████ ████ █  █  ██  █  █ ████",
].join("\n");

export const ART_WORKSHEET = String.raw`
  ┌─────────────────────┐
  │  (ax + 3)² = 36     │
  │  ─────────────────  │
  │  "math equation,    │
  │   double tap to     │
  │   enter math mode"  │
  └─────────────────────┘`;

export const ART_MAP = String.raw`
   ═══╦═══════╦═══
      ║       ║
   ───╬───────╬───
      ║   ●   ║
   ═══╩═══════╩═══`;

export const ART_MUG = String.raw`
    ) ) )
   ┌───────┐──┐
   │       │  │
   │       │──┘
   └───────┘`;

export interface AboutBlock {
  kind: "text" | "art";
  content: string;
  /** For art blocks, what it is, so the screen reader gets something useful. */
  label?: string;
}

export const ABOUT_BLOCKS: AboutBlock[] = [
  {
    kind: "text",
    content:
      "I came to design through code. I was the person on the team who cared why the button was 22 points instead of 44, and eventually that stopped being a side interest and became the work.",
  },
  {
    kind: "text",
    content:
      "Now I build interfaces for people the defaults miss. Mostly that means blind and low-vision users, mostly on iOS, and mostly by testing the thing rather than asserting it works.",
  },
  {
    kind: "art",
    label: "A worksheet equation, and what a screen reader says about it",
    content: ART_WORKSHEET,
  },
  {
    kind: "text",
    content:
      "At the Roux Institute I built StemAlly, a reader that lets a blind student move around inside an equation instead of hearing it read at them once. Six participants, two document conditions, 15,400 logged interactions. The most useful number in that study was the one that told me I had spent my time on the wrong thing: tactile figures beat equation navigation 43 to 1.",
  },
  {
    kind: "art",
    label: "An intersection drawn as tactile lines",
    content: ART_MAP,
  },
  {
    kind: "text",
    content:
      "Then TactileNav, tactile street maps you read with one finger. The hard part was not the map. It was that the screen reader and the app both need single finger touches, and only one of them can have them.",
  },
  {
    kind: "text",
    content:
      "Before Boston I was a software engineer at Capgemini in Bengaluru, writing APIs and running UAT. Before that I built a facial gesture cursor so people who cannot use a mouse could move one. That was 2021 and it is still the reason I do this.",
  },
  {
    kind: "art",
    label: "A coffee mug with steam",
    content: ART_MUG,
  },
  {
    kind: "text",
    content:
      "Outside of work I read more than I finish, I take the long way home, and I have strong opinions about coffee that I will keep to myself.",
  },
  {
    kind: "text",
    content:
      "The through line, if you want one: I would rather ship a smaller thing that measures itself than a larger thing that claims to work.",
  },
];

export interface DesktopIcon {
  id: string;
  label: string;
  /** Where it sits, as a percentage of the desktop area. */
  x: number;
  y: number;
}

export const DESKTOP_ICONS: DesktopIcon[] = [
  { id: "resume", label: "Resume.pdf", x: 50, y: 12 },
  { id: "timeline", label: "Timeline", x: 50, y: 40 },
  { id: "contact", label: "Contact", x: 50, y: 68 },
];
