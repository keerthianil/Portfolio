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
      "It started with a cursor. In 2021 I built a way to move one with your face: the nose as an anchor, a blink to click, because somebody who could not use a mouse still needed to use a computer. Everything I have done since is a version of that.",
  },
  {
    kind: "text",
    content:
      "I came to design through code. I was the one on the team asking why the button was 22 points instead of 44, and at some point that stopped being a side interest and became the job.",
  },
  {
    kind: "art",
    label: "A worksheet equation, and what a screen reader says about it",
    content: ART_WORKSHEET,
  },
  {
    kind: "text",
    content:
      "At the Roux Institute I built StemAlly, a reader that lets a blind student move around inside an equation instead of hearing it read at them once. Six participants, two document conditions, 15,400 logged interactions. My favourite number in that study is the one that made me look bad: tactile figures beat equation navigation 43 to 1, which is to say I had spent most of my time on the wrong half of it.",
  },
  {
    kind: "art",
    label: "An intersection drawn as tactile lines",
    content: ART_MAP,
  },
  {
    kind: "text",
    content:
      "Then TactileNav, tactile street maps you read with one finger. The hard part was never the map. It was that the screen reader and the app both want single finger touches, and only one of us can have them. I solved that twice, in opposite directions, before I got it right.",
  },
  {
    kind: "text",
    content:
      "I do the whole thing. The research, the design, and the SwiftUI that actually ships, without handing it off in the middle. Partly that is stubbornness. Mostly it is that the interesting decisions live at the seams, and they get lost when the work changes hands.",
  },
  {
    kind: "text",
    content:
      "If you want to know whether I am any good, look at what I took out. Four rotors down to one. A fullscreen math mode that lasted three days. Five claims pulled out of my own write-up because I could not source them. Anybody can add.",
  },
  {
    kind: "text",
    content:
      "Before Boston I was a software engineer at Capgemini in Bengaluru, writing APIs and running UAT. Before that I ran a 200 person student club, which is where you learn project management several years before anyone calls it that.",
  },
  {
    kind: "art",
    label: "A coffee mug with steam",
    content: ART_MUG,
  },
  {
    kind: "text",
    content:
      "Off the clock: I do not function before the first coffee and I have stopped pretending otherwise. I have been disappearing into fiction since I was a kid and I still do, most nights. And I get my ten thousand steps and my gym session in, which is less about discipline than about needing somewhere to put the restlessness.",
  },
  {
    kind: "text",
    content:
      "The through line, if you want one: I would rather ship a smaller thing that measures itself than a bigger thing that claims to work.",
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
