/**
 * The projects, strongest first.
 *
 * One list rather than two sections. The order is the argument: the first two
 * came out of the research assistantship and went in front of blind and
 * low-vision users, and by the time you are at the bottom of the grid you are
 * in coursework. Nobody reads an eight card grid bottom up, so the ranking
 * does the work that a heading was doing.
 *
 * `tint` is each app's own accent, taken from its shipping colour tokens rather
 * than picked to match this site. Eight burgundy cards would say nothing about
 * eight different products.
 *
 * `role` is set on two cards only. It is a job title, and only the research
 * assistantship has one worth putting on the grid. What I actually did on each
 * project is in the case study, where there is room to be specific.
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
  /** Job title, on the two research projects only. */
  role?: string;
  timeframe: string;
  /** The app's own accent, used for the card field only. */
  tint: string;
  repo?: string;
  /** A published design file, if there is one. */
  figma?: string;
  /**
   * False when only `.webp` exists for this project, which is everything
   * captured from the simulator rather than run through the original
   * optimisation pass.
   */
  avif?: boolean;
  /**
   * Phone captures composite as two angled screens. A browser capture is
   * landscape and has to sit square on, or it reads as a broken phone.
   */
  shape?: "phone" | "wide";
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
    role: "Research assistant, Roux Institute",
    timeframe: "2025 to 2026",
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
    role: "Research assistant, Roux Institute",
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
    avif: true,
    title: "Ally",
    summary:
      "An accessibility app that failed its own rules twice, and the tests that came out of catching it.",
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
      "A wardrobe tracker that prices a purchase against what you already own. Money, never guilt.",
    timeframe: "2026",
    tint: "#4c7c96",
    repo: "https://github.com/keerthianil/Threadline",
    figma:
      "https://www.figma.com/design/8zM6wy1k9kJXzKFYKOIKfY/Threadline?node-id=0-1",
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
    id: "aria",
    title: "ARIA",
    summary:
      "An accessibility audit tool for designers. It runs the checks that are maths, and refuses to guess at the rest.",
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
    id: "portfolio",
    title: "An Interactive Desk",
    summary:
      "This site. A 3D room where every object is a route, and every object is also a real button you can tab to.",
    timeframe: "2026",
    tint: "#8b6a4c",
    shape: "wide",
    repo: "https://github.com/keerthianil/Portfolio",
    cover: [
      {
        file: "room",
        alt: "The room this site opens on: a desk with a monitor, a laptop, a mug and a rubber duck, lit from a window.",
      },
    ],
  },
  {
    id: "swaptitude",
    title: "Swaptitude",
    summary:
      "A skill swap marketplace: teach one thing, learn another. Firebase auth, a live feed and matching, built by four of us.",
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
      "Destinations, trips and dates on Core Data. The one here that is about persistence rather than touch.",
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

/**
 * `resume` is a `string` rather than a literal, and it takes either a path in
 * this site or a link to somewhere else.
 *
 * It is a path today. The resume ships in `public/` and the site serves it,
 * which is the only arrangement where the link works: the site is built from
 * this repository, so a file that is not in the repository is not on the
 * server either. It was taken out once on the grounds that a public
 * repository makes it public, which is true and is also true of the site,
 * which is the whole point of putting it there.
 *
 * Moving it to a share link later is a one line change here and nothing else,
 * because every link to it goes through `ResumeLink`. Empty it and the three
 * places that link to it disappear rather than pointing at a file that is not
 * there: the About footer, the Resume icon on the laptop's desktop, and the
 * line under the timeline.
 */
export const CONTACT: {
  email: string;
  github: string;
  linkedin: string;
  resume: string;
} = {
  email: "keerthiareddy6@gmail.com",
  github: "https://github.com/keerthianil",
  linkedin: "https://linkedin.com/in/keerthiareddy",
  resume: "/KeerthiAnilResume.pdf",
};
