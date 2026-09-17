/**
 * Every screen and clip that exists for a project, grouped the way the app is
 * grouped rather than the way the files happen to sort.
 *
 * The card shows two screens because nine cards of screenshots is a wall. This
 * is the other half of that decision: the rest of them live at the bottom of
 * the case study, under headings, where somebody who wants to see the whole app
 * can see the whole app.
 *
 * Gallery images are `.webp` only. Half of these have an `.avif` pair and half
 * do not, and a thumbnail is not where that 15% is worth a branch. The cards
 * still serve avif.
 *
 * `modes` turns a group into a light and dark pair with one toggle over it,
 * which is the honest way to show an app whose contrast work is the subject.
 */

export interface AssetItem {
  /** Base name under /images/projects/<id>/, or under /video/ for clips. */
  file: string;
  alt: string;
  caption?: string;
  /** Clips only. Base name of the poster frame, without extension. */
  poster?: string;
}

export interface AssetGroup {
  title: string;
  note?: string;
  kind?: "image" | "video";
  /**
   * Suffixes appended to each file name, offered as a toggle. Two entries
   * means the group is one set of screens in two appearances, not two sets.
   */
  modes?: { id: string; label: string }[];
  items: AssetItem[];
}

const APPEARANCES = [
  { id: "dark", label: "Dark" },
  { id: "light", label: "Light" },
];

export const ASSETS: Record<string, AssetGroup[]> = {
  stemally: [
    {
      title: "The document",
      items: [
        {
          file: "home",
          alt: "StemAlly's Home tab: an upload card, a row of files uploaded by a teacher, and a recent files list under it.",
        },
        {
          file: "all-files",
          alt: "StemAlly's All Files tab, listing the seven documents built for the study: a math practice test, geometric shapes, bar charts, line graphs, pie charts, data tables, and mixed charts.",
        },
        {
          file: "multiple-choice",
          alt: "A multiple choice question. The equation sits in its own block and the four answer options read as a plain list rather than as four things to enter.",
          caption:
            "After the complexity threshold. Only the equation is interactive.",
        },
      ],
    },
    {
      title: "Charts, on screen and by touch",
      note: "Each pair is the same chart twice: in the document flow with a computed summary and a data table toggle, then in the fullscreen tactile view where vibration strength maps to value.",
      items: [
        {
          file: "chart-bar-a",
          alt: "A bar chart in the document flow, with a written description above it and a Show Data Table toggle below.",
        },
        {
          file: "chart-bar-b",
          alt: "The same bar chart in fullscreen tactile view: five thick teal bars with their values printed above them.",
        },
        {
          file: "chart-line-a",
          alt: "A line graph in the document flow, under the question text, with a Show Data Table toggle.",
        },
        {
          file: "chart-line-b",
          alt: "The same line graph in fullscreen tactile view: one thick line with large red markers at every data point.",
        },
        {
          file: "chart-pie-a",
          alt: "A pie chart in the document flow, with a legend listing seven categories and their percentages.",
        },
        {
          file: "chart-pie-b",
          alt: "The same pie chart in fullscreen tactile view, slices enlarged and pulled apart, each labelled with its percentage.",
        },
      ],
    },
    {
      title: "Geometry figures",
      items: [
        {
          file: "figure-rectangle-a",
          alt: "A geometry question asking for the area of a rectangle. The rectangle is drawn as a thin unlabelled outline.",
        },
        {
          file: "figure-rectangle-b",
          alt: "The same rectangle in fullscreen tactile view: thick black edges, red markers at the corners and midpoints, and the sides labelled six metres and four metres.",
        },
      ],
    },
    {
      title: "Instrumentation",
      items: [
        {
          file: "instrumentation-logs",
          alt: "StemAlly's settings sheet, showing the interaction log export with Excel and PDF options and a clear all data control.",
          caption: "Where the 15,400 events came out.",
        },
      ],
    },
    {
      title: "With VoiceOver running",
      kind: "video",
      items: [
        {
          file: "stemally-math-mode",
          poster: "stemally-math-mode-poster",
          alt: "A screen recording of StemAlly with VoiceOver running.",
          caption:
            "Focus is inside an equation and each swipe steps to the next part of it, one term at a time.",
        },
      ],
    },
  ],

  tactilenav: [
    {
      title: "The maps",
      items: [
        {
          file: "home",
          alt: "TactileNav's home screen: two maps, Congress Square and Street Crossing Audio, plus the feedback tester and the data files.",
        },
        {
          file: "map-congress",
          alt: "The tactile street map of Congress Square, Portland. Streets are thick blue lines labelled along their length, and intersections are red squares.",
        },
        {
          file: "intersection",
          alt: "One intersection close up, with roadways, grey sidewalks, crosswalk stripes, and red markers at the corners and crossing endpoints.",
          caption:
            "Nothing is schematic. A junction that meets at 43 degrees is drawn at 43 degrees.",
        },
      ],
    },
    {
      title: "The crossing simulator",
      note: "Built for one perceptual task: telling whether a vehicle is going straight or turning across your path.",
      items: [
        {
          file: "crossing-idle",
          alt: "The crossing simulator before it starts, with a start listening button and the question asking which street has the green.",
        },
        {
          file: "crossing-active",
          alt: "The crossing simulator listening, with the traffic controls set to gas engines at normal speed and a stop button.",
          caption:
            "Gas, electric or mixed. An all electric fleet is quiet enough that the technique itself starts to fail.",
        },
      ],
    },
    {
      title: "The feedback vocabulary",
      items: [
        {
          file: "haptics",
          alt: "The haptic tester, assigning a pattern to each kind of map element. Corridors are set to medium and intersections to pulse.",
          caption:
            "Texture carries meaning. Strength is reserved for one quantity, traffic volume.",
        },
      ],
    },
    {
      title: "With VoiceOver running",
      kind: "video",
      items: [
        {
          file: "tactilenav-route-map",
          poster: "tactilenav-route-map-poster",
          alt: "A screen recording of TactileNav with VoiceOver running.",
          caption:
            "Focus steps along a route from one intersection to the next, each announced with the streets that meet there.",
        },
      ],
    },
  ],

  ally: [
    {
      title: "Onboarding",
      modes: APPEARANCES,
      items: [
        {
          file: "onboarding",
          alt: "Ally's onboarding: four coloured category shapes, the line A dictionary, not a course, and a note that there are no streaks and no progress bar.",
          caption: "It says what it is not, before it says what it is.",
        },
      ],
    },
    {
      title: "Learn",
      note: "55 topics, sorted by who they affect rather than by spec section.",
      modes: APPEARANCES,
      items: [
        {
          file: "learn-home",
          alt: "Ally's Learn tab, browsing topics by who they affect: Vision, Motor, Cognitive and Navigation.",
        },
        {
          file: "learn-category",
          alt: "The Vision category, listing fifteen topics from colour contrast through to captions for video.",
        },
        {
          file: "learn-search",
          alt: "Searching Learn for contrast, which returns the colour contrast and non-text contrast topics with their WCAG numbers.",
        },
        {
          file: "learn-topic-detail",
          alt: "The Colour Contrast topic: who it is for, why it matters, a red flag example of grey on grey, and a before and after comparison.",
        },
      ],
    },
    {
      title: "Check",
      note: "Twenty plain questions and a score. It celebrates before it analyses, because a low score met with silence reads as a verdict.",
      modes: APPEARANCES,
      items: [
        {
          file: "check-home",
          alt: "Ally's Check tab, described as a self-assessment rather than an audit, with one saved check scoring 66.",
        },
        {
          file: "check-newproject",
          alt: "Starting a new check: a project name field and a platform picker offering iOS, Android, Web and Other.",
        },
        {
          file: "check-flow-question",
          alt: "One of the twenty questions, asking whether text has enough contrast against its background, answered with yes, partially, no, or not sure.",
        },
        {
          file: "check-celebration-starting",
          alt: "The celebration screen for a low score: 26 out of 100, headed You measured it.",
        },
        {
          file: "check-celebration-building",
          alt: "The celebration screen for a middling score: 66 out of 100, headed Real momentum.",
        },
        {
          file: "check-celebration-strong",
          alt: "The celebration screen for a high score: 90 out of 100, headed Amazing work.",
        },
        {
          file: "check-result",
          alt: "The result: 66 out of 100 as a ring, broken down by Vision, Motor, Cognitive and Navigation, with a progress over time chart under it.",
          caption:
            "The ring that was drawing each arc at 1.75 to 1 against its own track until a test caught it.",
        },
      ],
    },
    {
      title: "Toolkit",
      modes: APPEARANCES,
      items: [
        {
          file: "toolkit-home",
          alt: "Ally's Toolkit tab: a contrast checker, a colour blindness simulator, a text readability tool, a touch target calculator, and the WCAG quick reference.",
        },
        {
          file: "tool-contrast",
          alt: "The contrast checker, showing a measured ratio of 5.33 to 1 with a pass or fail against each WCAG level.",
        },
        {
          file: "tool-cvd",
          alt: "The colour blindness simulator, showing a row of success and error swatches under normal vision, with protanopia and protanomaly to switch to.",
        },
        {
          file: "tool-readability",
          alt: "The readability tool, grading a sentence of jargon at 21.5 and offering a plainer word for each flagged term.",
        },
        {
          file: "tool-touchtarget",
          alt: "The touch target calculator, with width and height sliders at 32 points and a verdict against the Apple, Android and WCAG minimums.",
        },
        {
          file: "tool-wcag",
          alt: "The WCAG quick reference as a deck of cards, showing criterion 1.1.1 Non-text Content on the front of a card.",
        },
        {
          file: "tool-wcag-back",
          alt: "The same card flipped over, showing what to do and the red flag to watch for.",
          caption: "The rule on the front, the fix on the back.",
        },
      ],
    },
    {
      title: "Ask Ally",
      modes: APPEARANCES,
      items: [
        {
          file: "assistant",
          alt: "Ask Ally, which answers only from Ally's own topics and names its source, with three suggested questions under the field.",
          caption:
            "Retrieval runs before the model and decides whether it is called at all, so it cannot invent a threshold.",
        },
      ],
    },
    {
      title: "Motion",
      kind: "video",
      items: [
        {
          file: "ally/ally-ring-sweep",
          poster: "ally/ally-ring-sweep-poster",
          alt: "The score ring drawing itself, three arcs sweeping out to their values.",
        },
        {
          file: "ally/ally-celebration-building",
          poster: "ally/ally-celebration-building-poster",
          alt: "The celebration screen arriving at 66 out of 100.",
        },
        {
          file: "ally/ally-celebration-strong",
          poster: "ally/ally-celebration-strong-poster",
          alt: "The celebration screen arriving at 90 out of 100, with confetti.",
        },
        {
          file: "ally/ally-card-flip",
          poster: "ally/ally-card-flip-poster",
          alt: "A WCAG reference card turning over from the rule to the fix.",
        },
        {
          file: "ally/ally-before-after",
          poster: "ally/ally-before-after-poster",
          alt: "The before and after slider on the colour contrast topic, dragged across to reveal the failing version.",
        },
        {
          file: "ally/ally-living-art",
          poster: "ally/ally-living-art-poster",
          alt: "The four category cards on the Learn tab, drifting slowly against each other.",
        },
      ],
    },
  ],

  threadline: [
    {
      title: "Today",
      items: [
        {
          file: "add-item",
          alt: "Threadline's Today tab: what are you wearing, a streak counter at zero days, and insights naming the most worn and least worn items.",
        },
        {
          file: "quick-log",
          alt: "The log outfit sheet: a three column grid of clothing to tap, with no typing and nothing to scroll through.",
          caption: "The core loop, and it has to cost less than five seconds.",
        },
      ],
    },
    {
      title: "The pre-purchase check",
      note: "The interaction that does not exist in any competitor. Category, then price, then verdict, one question at a time.",
      items: [
        {
          file: "check-input",
          alt: "Step one of the check: a grid of categories, each tile showing how many of that category you already own.",
        },
        {
          file: "check-result",
          alt: "The verdict, think twice. It says you already own four tops, and projects cost per wear at ten wears and thirty wears against your category average.",
        },
      ],
    },
    {
      title: "The closet and the numbers",
      items: [
        {
          file: "wardrobe",
          alt: "The closet: ten items in a grid, each with its cost per wear and its wear count.",
        },
        {
          file: "utilization",
          alt: "The Insights tab: a wardrobe health score of 67 drawn as three concentric arcs, with utilization, cost per wear and category balance listed under it.",
          caption:
            "Three arcs rather than one ring, because the parts do not sum to the total.",
        },
      ],
    },
  ],

  aria: [
    {
      title: "Audits",
      items: [
        {
          file: "audits",
          alt: "ARIA's audit list: a booking flow review of Airbnb iOS and a Q2 accessibility review of Spotify iOS, each with its screen and finding counts.",
        },
        {
          file: "audit",
          alt: "One audit open: thirteen findings across five screens, all still open, with the screens listed under the summary.",
        },
      ],
    },
    {
      title: "Findings",
      items: [
        {
          file: "findings",
          alt: "Every finding in the audit, filterable by resolution and by severity, each one tagged with the WCAG criterion it breaks.",
        },
        {
          file: "finding",
          alt: "One finding: WCAG 1.4.3 contrast, critical severity, the measured 2.8 to 1 ratio, and the exact colour that fixes it.",
          caption:
            "Contrast is arithmetic, so the app computes it. Everything it cannot compute, it asks about instead of guessing.",
        },
      ],
    },
  ],

  swaptitude: [
    {
      title: "The app",
      items: [
        {
          file: "feed",
          alt: "Swaptitude's home feed: skill swap posts offering english for piano and guitar for something else, each with a match state.",
        },
        {
          file: "explore",
          alt: "Swaptitude's explore tab, browsing skills by category: music, languages, technology, cooking, art and crafts, sports and fitness.",
        },
      ],
    },
  ],

  travelplanner: [
    {
      title: "The app",
      items: [
        {
          file: "destinations",
          alt: "TravelPlanner's destination list: Paris, Tokyo and New York, each with a photograph and a one line description.",
        },
        {
          file: "destination",
          alt: "The Paris page, with a photograph of the Eiffel Tower and two saved trips under it with their dates.",
        },
      ],
    },
  ],

  portfolio: [
    {
      title: "The room",
      items: [
        {
          file: "room",
          alt: "The room the site opens on: a desk with a monitor, an open laptop, a mug, a rubber duck and a desk calendar, lit from a window on the left.",
        },
        {
          file: "room-blind",
          alt: "The same room with the blind drawn down over the window, and the daylight gone with it.",
          caption:
            "Glare is an access need. The room going dark is the argument.",
        },
        {
          file: "room-focus",
          alt: "The room with keyboard focus on the monitor, which draws a ring around the object in the scene itself.",
          caption:
            "Every object in the room is also a real button. Focus lands on the object, so the scene rings it.",
        },
      ],
    },
    {
      title: "The routes",
      items: [
        {
          file: "work",
          alt: "The projects grid, opened on the monitor's own screen inside the scene.",
        },
        {
          file: "about",
          alt: "The about page, running as a terminal on the laptop's own screen.",
        },
        {
          file: "research",
          alt: "The research section, drawn as a ruled notebook page with a torn top edge.",
        },
      ],
    },
    {
      title: "Without WebGL",
      items: [
        {
          file: "fallback",
          alt: "The flat view the site falls back to when WebGL is unavailable: the same routes as a plain list of links.",
          caption:
            "Not a picture of the room. Every object in the room was a link anyway.",
        },
      ],
    },
  ],
};
