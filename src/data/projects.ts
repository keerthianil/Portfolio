/**
 * The four projects, in the order they should be read.
 *
 * `tint` is each app's own accent, taken from its shipping colour tokens rather
 * than picked to match this site. The cards are previews of the work, and four
 * burgundy cards would say nothing about four different products.
 */

export interface ProjectShot {
  /** Base name under /images/projects/<id>/. Both .avif and .webp exist. */
  file: string;
  alt: string;
}

export interface Project {
  id: string;
  title: string;
  /** One line. What changed, not what it contains. */
  summary: string;
  role: string;
  timeframe: string;
  /** The app's own accent, used for the card field only. */
  tint: string;
  repo?: string;
  /** Up to two screens, shown angled on the card. */
  cover: ProjectShot[];
}

export const PROJECTS: Project[] = [
  {
    id: "stemally",
    title: "StemAlly",
    summary:
      "A STEM reader for blind students. Equations you move around inside, and figures you explore by touch.",
    role: "Research assistant and iOS developer, Roux Institute",
    timeframe: "2025 to now",
    tint: "#1c636f",
    repo: "https://github.com/keerthianil/EducationApp",
    cover: [
      {
        file: "home",
        alt: "StemAlly home screen, with an upload card and a carousel of files uploaded by a teacher.",
      },
      {
        file: "chart-bar-a",
        alt: "A bar chart open in StemAlly's fullscreen tactile view, with bold raised outlines.",
      },
    ],
  },
  {
    id: "tactilenav",
    title: "TactileNav",
    summary:
      "Tactile street maps you read with one finger. Every line is a physical millimetre, so the scale never lies.",
    role: "Research assistant, Roux Institute, with Vatsalya Rohitbhai Dabhi",
    timeframe: "2026",
    tint: "#023e8a",
    repo: "https://github.com/keerthianil/TactileNav",
    cover: [
      {
        file: "map-congress",
        alt: "A tactile street map of Congress Square, Portland, drawn as thick blue lines on a dark field.",
      },
      {
        file: "intersection",
        alt: "A single intersection drawn close up, with sidewalks, roadway and crossing markings at their true angles.",
      },
    ],
  },
  {
    id: "ally",
    title: "Ally",
    summary:
      "An accessibility app that failed its own rules twice, and the tests that came out of catching it.",
    role: "Product design, research and SwiftUI build, end to end",
    timeframe: "2026",
    tint: "#b3338b",
    repo: "https://github.com/keerthianil/Ally",
    cover: [
      {
        file: "learn-home-dark",
        alt: "Ally's Learn tab in dark mode, showing accessibility topics grouped by who they affect.",
      },
      {
        file: "check-result-dark",
        alt: "Ally's score result screen in dark mode, with a large ring showing a score band.",
      },
    ],
  },
  {
    id: "threadline",
    title: "Threadline",
    summary:
      "A wardrobe tracker that prices a purchase against what you already own. Financial framing, never guilt.",
    role: "Product design and SwiftUI build, end to end",
    timeframe: "2026",
    tint: "#4c7c96",
    repo: "https://github.com/keerthianil/Threadline",
    cover: [
      {
        file: "wardrobe",
        alt: "Threadline's closet grid, showing clothing items with their cost per wear.",
      },
      {
        file: "check-result",
        alt: "Threadline's purchase check verdict screen, weighing a new item against the existing wardrobe.",
      },
    ],
  },
];

export const CONTACT = {
  email: "anil.ke@northeastern.edu",
  github: "https://github.com/keerthianil",
  linkedin: "https://linkedin.com/in/keerthiareddy",
  resume: "/KeerthiAnil_Resume.pdf",
} as const;
