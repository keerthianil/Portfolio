export interface ResearchItem {
  id: string;
  title: string;
  kind: string;
  date: string;
  /** One line, for the card. */
  summary: string;
  /** The body, for the reader view. */
  body: string[];
  /** Hard numbers worth pulling out. */
  facts?: { value: string; label: string }[];
  /** A downloadable artifact, if one exists. */
  file?: { href: string; label: string };
  link?: { href: string; label: string };
}

export const RESEARCH: ResearchItem[] = [
  {
    id: "onboarding-cliff",
    title: "The Onboarding Cliff",
    kind: "Research, no build",
    date: "2026",
    summary:
      "A reproducible score for how far an onboarding flow makes you walk before it hands over the product.",
    body: [
      "Five health and fitness apps, coded screen by screen from their own onboarding flows. The question was not whether onboarding is too long, which everyone already says. It was whether you can measure it in a way somebody else could reproduce and disagree with precisely.",
      "So I built an instrument. Five factors, twenty points each, a hundred being the worst possible. Higher is worse. Every input is coded from screenshots, and every cell of the coding is published, so you can argue with a specific judgement rather than with the number.",
      "The most useful category in it turned out to be the one I called dead: a question the app asks, stores, and then never surfaces to the user or uses in any calculation. A postal code that feeds nothing. An activity level that could have come from seven days of step history the phone already had.",
      "Alongside the index there is a review corpus, a set of literature notes on habit formation, and a design system extracted from one of the five apps so the redesign could be drawn in the app's own language rather than in mine.",
    ],
    facts: [
      { value: "5", label: "apps scored" },
      { value: "100", label: "point scale, higher is worse" },
      { value: "14", label: "inputs in the consequence ledger" },
      { value: "22", label: "heuristic violations logged" },
    ],
  },
  {
    id: "tactilenav-report",
    title: "Infrastructure and data sources for non-visual outdoor navigation",
    kind: "Literature review",
    date: "July 2026",
    summary:
      "Twelve topics on what a blind pedestrian can and cannot learn about a crossing before they walk it.",
    body: [
      "Written with Vatsalya Rohitbhai Dabhi at the Roux Institute, to work out what data exists before building anything that depends on it.",
      "The headline finding is that spatial learning deficits in blind and low-vision people come from lack of information access rather than lack of vision. Vibro-audio maps on a touchscreen reach 75% wayfinding accuracy against 78% for physical tactile maps, which is close enough to make the digital version worth building.",
      "The finding that changed the product is about sound. Traffic noise is how blind pedestrians make crossing decisions, and above about 50 decibels ambient it stops being reliable. Urban environments average 66. Judging whether a vehicle is going straight or turning needs roughly 11 decibels above your detection threshold, and an electric vehicle under 20 miles an hour sits below 45 decibels. The technique itself starts to fail, which is why the crossing simulator has a traffic type control.",
      "It also says plainly what is missing. No public accessible pedestrian signal dataset exists for Portland, and coverage of audible signal tags in open map data is under 5% even in well mapped cities.",
    ],
    facts: [
      { value: "75% / 78%", label: "digital against physical tactile maps" },
      { value: "66 dBA", label: "average urban ambient noise" },
      { value: "under 45 dBA", label: "an electric vehicle at low speed" },
      { value: "under 5%", label: "open map coverage of audible signals" },
    ],
  },
  {
    id: "aps-request",
    title: "Accessible pedestrian signal data request",
    kind: "Artifact, sent",
    date: "2026",
    summary:
      "Nineteen intersections and fifty fields each, with a line on every field explaining why a blind pedestrian needs it.",
    body: [
      "The literature review established that the data did not exist publicly. This is what I did about it.",
      "Nineteen downtown intersections, prioritised along the corridors that clients of the local blind services network walk daily. About fifty fields per intersection, grouped into signals, timing, geometry, pedestrian infrastructure, traffic, and planned changes.",
      "Each field carries a sentence on why it matters. Diagonal curb ramps can aim someone into the intersection rather than into the crosswalk. Bike lanes matter because bicycles are nearly silent and pose a conflict a blind pedestrian cannot hear coming. A channelised right turn means cars crossing the walk phase at speed.",
      "It closes by saying that any subset would help, including just signal locations and types, because a request that demands everything usually gets nothing.",
    ],
    facts: [
      { value: "19", label: "intersections" },
      { value: "50", label: "fields per intersection" },
      { value: "6", label: "field groups" },
    ],
    file: { href: "/data-request.pdf", label: "The request, as sent" },
  },
  {
    id: "stemally-study",
    title: "Reading math without seeing it: a two condition study",
    kind: "User study",
    date: "Feb 2026",
    summary:
      "Six blind and low-vision participants, two document types, and 15,400 logged interactions.",
    body: [
      "Run at the Roux Institute against the StemAlly build. Two conditions, each a document a teacher might actually send: one with text and equations, one with diagrams. Participants worked through both while thinking aloud, then scored the interface on a questionnaire read to them.",
      "The instrumentation is the part worth talking about. Every touch, every screen reader focus change and every announcement, at roughly ten samples a second, tagged by condition. Think-aloud tells you what someone noticed and says nothing about where their finger actually spent its time.",
      "It found three things I would not have got any other way. Nobody ever left math mode deliberately, in 41 entries. Half the equations condition was spent idle, listening rather than acting. And tactile figures outweighed equation navigation 43 to 1, which told me I had spent my time on the wrong half of the product.",
      "The caveats belong next to the findings: six participants, facilitated sessions, and a fixed condition order, so order effects and condition effects are tangled together.",
    ],
    facts: [
      { value: "6", label: "participants" },
      { value: "15,400", label: "logged events" },
      { value: "10 / sec", label: "sampling rate" },
      { value: "43:1", label: "figures to equations" },
    ],
    link: {
      href: "#work/stemally",
      label: "The product this came out of",
    },
  },
  {
    id: "kyros-audit",
    title: "Heuristic audit of a two-sided booking app",
    kind: "Design audit",
    date: "June 2026",
    summary:
      "Seventy findings across a consumer app and a partner app, sorted into four severity tiers.",
    body: [
      "A friend is building Kyros, a fitness booking platform with two companion apps. The consumer app is for finding and booking gym sessions: you browse centres near you, open a gym, pick a session, and get a QR code to show at the door. The partner app is for the gym owners on the other side of that booking, who scan the code to check you in, manage the day's arrivals, and track earnings. It is still in development.",
      "They asked me to audit it before release, so I ran a heuristic evaluation alongside functional QA across both apps: onboarding and sign-in, the home and discovery screens, the booking flow, notifications, settings, theming, and the partner dashboard.",
      "Every finding is tagged to the principle it breaks, mostly Nielsen's heuristics plus the platform guidelines, and sorted into four tiers. Critical means a crash or a blocked flow and has to be fixed before release. Major means a broken feature or something that erodes trust. Moderate is inconsistency and missing feedback. Minor is backlog.",
      "The pattern that mattered more than any single finding was that the app is largely silent. Actions happen with no visual, haptic, or audible acknowledgement, so you are never sure whether a tap registered. That is one fix applied in one place and it improves a dozen findings at once, which is why the recommended sequence puts the global changes first and the individual screens second.",
      "The findings themselves stay between me and them while the app is unreleased. What is here is the method: the severity rubric, the discipline of naming the principle behind every issue, and a fix order built around the changes that resolve the most at once.",
    ],
    facts: [
      { value: "70", label: "findings documented" },
      { value: "2 / 16", label: "critical and major" },
      { value: "35 / 17", label: "moderate and minor" },
      { value: "2", label: "apps, consumer and partner" },
    ],
  },
];
