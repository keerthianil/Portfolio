/**
 * The projects, strongest first.
 *
 * One list rather than two sections. The order is the argument: the first four
 * went in front of people who were not me, and by the time you are at the
 * bottom of the grid you are in coursework. Nobody reads a nine card grid
 * bottom up, so the ranking does the work that a heading was doing.
 *
 * `tint` is each app's own accent, taken from its shipping colour tokens rather
 * than picked to match this site. Nine burgundy cards would say nothing about
 * nine different products.
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
  /**
   * False when only `.webp` exists for this project, which is everything
   * captured from the simulator rather than run through the original
   * optimisation pass.
   */
  avif?: boolean;
  /** Up to two screens, shown angled on the card. */
  cover: ProjectShot[];
}

export const PROJECTS: Project[] = [
  {
    id: "stemally",
    avif: true,
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
    avif: true,
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
    id: "aria",
    title: "ARIA",
    summary:
      "An accessibility audit tool for designers reviewing a built product. It runs the checks that are maths on device, and refuses to guess at the rest.",
    role: "Product design and SwiftUI build, end to end",
    timeframe: "2026",
    tint: "#3b62d0",
    repo: "https://github.com/keerthianil/ARIA",
    cover: [
      {
        file: "audit",
        alt: "An ARIA audit summary: thirteen findings across five screens of Spotify iOS, split by severity.",
      },
      {
        file: "finding",
        alt: "An ARIA finding detail, showing WCAG 1.4.3, a critical severity, the failing contrast ratio and the fix.",
      },
    ],
  },
  {
    id: "ally",
    avif: true,
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
    avif: true,
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
  {
    id: "indoorexplorer",
    title: "IndoorExplorer",
    summary:
      "An indoor floor plan you read by dragging a finger across it. Rooms, corridors, stairs and lifts each get their own tone and haptic.",
    role: "Coursework, SwiftUI",
    timeframe: "2025",
    tint: "#2b7a6f",
    cover: [
      {
        file: "map",
        alt: "IndoorExplorer's floor plan, with rooms and corridors drawn as flat blocks.",
      },
      {
        file: "corridor",
        alt: "A corridor selected in IndoorExplorer, with its name and feedback pattern announced.",
      },
    ],
  },
  {
    id: "shapetracer",
    title: "ShapeTracer",
    summary:
      "Trace a shape with one finger and feel where the edge is. Haptics and a generated tone carry the whole interface.",
    role: "Coursework, SwiftUI",
    timeframe: "2025",
    tint: "#6b4ea8",
    cover: [
      {
        file: "shapes",
        alt: "ShapeTracer's shape picker, offering a circle and a square.",
      },
      {
        file: "trace-circle",
        alt: "A circle being traced in ShapeTracer, with a live accuracy percentage under it.",
      },
    ],
  },
  {
    id: "swaptitude",
    title: "Swaptitude",
    summary:
      "A skill swap marketplace: teach one thing, learn another. Firebase auth, a live post feed and matching, built by four of us.",
    role: "Coursework, SwiftUI and Firebase, team of four",
    timeframe: "2025",
    tint: "#c9971a",
    cover: [
      {
        file: "feed",
        alt: "Swaptitude's home feed, showing skill swap posts: english for piano, guitar for something else.",
      },
      {
        file: "explore",
        alt: "Swaptitude's explore tab, browsing skills by category: music, languages, technology, cooking.",
      },
    ],
  },
  {
    id: "travelplanner",
    title: "TravelPlanner",
    summary:
      "Destinations, trips and dates, backed by Core Data. The one in this set that is about persistence rather than about touch.",
    role: "Coursework, SwiftUI and Core Data",
    timeframe: "2025",
    tint: "#2d6aa8",
    cover: [
      {
        file: "destinations",
        alt: "TravelPlanner's destination list, with photographs of Paris, Tokyo and New York.",
      },
      {
        file: "destination",
        alt: "A TravelPlanner destination page for Paris, with two saved trips under it.",
      },
    ],
  },
];

export const CONTACT = {
  email: "keerthiareddy6@gmail.com",
  github: "https://github.com/keerthianil",
  linkedin: "https://linkedin.com/in/keerthiareddy",
  resume: "/KeerthiAnilResume.pdf",
} as const;
