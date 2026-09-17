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

/**
 * Six blocks, about two hundred words.
 *
 * It was four hundred and read like a bio somebody else had written. The cut
 * is the point: everything that was an achievement is in the work section
 * already, and a terminal that scrolls is a terminal nobody finishes.
 *
 * Two pieces of art, not three. The map went with the paragraph it belonged to.
 */
export const ABOUT_BLOCKS: AboutBlock[] = [
  {
    kind: "text",
    content:
      "I tell people I work in accessibility and then change the subject, because the long version takes a while. The short version is that in 2021 I built a way to move a cursor with your face, for somebody who could not use a mouse, and I have been doing a version of that ever since.",
  },
  {
    kind: "art",
    label: "A worksheet equation, and what a screen reader says about it",
    content: ART_WORKSHEET,
  },
  {
    kind: "text",
    content:
      "Mostly iOS, mostly for blind and low-vision users. At the Roux Institute I built StemAlly, a reader that lets a student move around inside an equation instead of hearing it read at them once, and TactileNav, street maps you read with one finger. Six participants, 15,400 logged interactions, and the most useful number in that study was the one that told me I had spent my time on the wrong half of it.",
  },
  {
    kind: "text",
    content:
      "What bothers me about how software gets built is that almost nobody talks to the person who will use it. Teams design for somebody they have never met and never watched. So I do the whole thing, research through design through the SwiftUI that ships, without handing it off in the middle, because the interesting decisions live at the seams and that is exactly where they get lost.",
  },
  {
    kind: "art",
    label: "A coffee mug with steam",
    content: ART_MUG,
  },
  {
    kind: "text",
    content:
      "Off the clock: nothing happens before the first coffee. I have been disappearing into fiction since I was a kid and I still do, most nights. And I get my ten thousand steps and my gym session in, which is less about discipline than about needing somewhere to put the restlessness.",
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
