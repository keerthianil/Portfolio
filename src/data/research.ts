/**
 * Research, at full length.
 *
 * The case studies in the work section are the short versions, cut to about
 * 700 words each so the grid does not turn into a reading list. This is where
 * the long versions live, close to the write-ups they came from, including the
 * tables and the sources and the parts that make me look worse.
 *
 * `docs` are the supporting documents that sat under a write-up in its own
 * folder: the instrument, the raw corpus, the literature notes. They open from
 * the same reader, one level down, because a finding without its working is an
 * assertion.
 *
 * Nothing in here is invented. Where a claim was retracted it is recorded as
 * retracted rather than deleted, which is the only part of this I would insist
 * on if somebody asked me to cut it for length.
 */

export type Block =
  | { kind: "p"; text: string }
  | { kind: "h"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "quote"; text: string; source?: string }
  | { kind: "note"; text: string }
  | { kind: "table"; caption?: string; head: string[]; rows: string[][] }
  | { kind: "figure"; src: string; alt: string; caption?: string }
  | {
      kind: "clip";
      mp4: string;
      webm?: string;
      poster?: string;
      alt: string;
      caption?: string;
    };

export interface ResearchDoc {
  id: string;
  title: string;
  /** One line on the shelf of supporting documents. */
  summary: string;
  blocks: Block[];
}

export interface ResearchItem {
  id: string;
  title: string;
  kind: string;
  date: string;
  /** One line, for the card. */
  summary: string;
  /** Hard numbers worth pulling out. */
  facts?: { value: string; label: string }[];
  /** The write-up itself. */
  blocks: Block[];
  /** What sat under it in its own folder. */
  docs?: ResearchDoc[];
  /** A downloadable artifact, if one exists. */
  file?: { href: string; label: string };
  links?: { href: string; label: string }[];
}

export const RESEARCH: ResearchItem[] = [
  {
    id: "stemally-study",
    title: "StemAlly: reading a math worksheet without seeing it",
    kind: "Case study, with a user study",
    date: "Sep 2025 to Feb 2026",
    summary:
      "Six blind and low-vision participants, two document types, and 15,400 logged interactions that told me I had spent my time on the wrong half of the product.",
    facts: [
      { value: "6", label: "participants" },
      { value: "15,400", label: "logged events" },
      { value: "10 / sec", label: "sampling rate" },
      { value: "43:1", label: "figures to equations" },
    ],
    links: [
      { href: "#work/stemally", label: "The product this came out of" },
      { href: "https://github.com/keerthianil/EducationApp", label: "The code" },
    ],
    blocks: [
      {
        kind: "note",
        text: "Research assistant at the Roux Institute at Northeastern, UNAR Labs. Mine: research design, the math reading and navigation model, chart and table accessibility, and the study instrumentation.",
      },
      {
        kind: "figure",
        src: "/images/case/stemally/hero-worksheet-vs-screenreader.png",
        alt: "Two columns. On the left, a rendered fraction as it appears on a worksheet, captioned as an image with no structure a screen reader can enter. On the right, the same fraction written out as one long line of speech, captioned as one breath you cannot move around inside.",
        caption:
          "The worksheet on the left. What a screen reader says about it on the right.",
      },
      { kind: "h", text: "The question" },
      {
        kind: "p",
        text: "Blind and low-vision students get handed math worksheets that assume you can see them. The equation is an image. The triangle is an image. The bar chart has a caption that says see figure 3.",
      },
      {
        kind: "p",
        text: "Our lab had a backend that converted those PDFs into structured content, with real markup for the equations. So the information existed. That turned the problem into a design question rather than a data question: how do you present an equation, a figure, or a chart so a student can read it, and not just hear it read at them?",
      },
      {
        kind: "p",
        text: "Reading means you can move around. Go back to the denominator. Skip the choices you have ruled out. Check one bar against another. A screen reader that plays a wall of speech gives you listening, not reading.",
      },
      { kind: "h", text: "How I studied it" },
      {
        kind: "p",
        text: "Two conditions, each a document a teacher might send: one with text and equations, one with diagrams. Six blind and low-vision participants worked through both while thinking aloud, then scored the interface on a questionnaire I read to them. Sessions were compensated. I ran the sessions and took notes.",
      },
      {
        kind: "p",
        text: "The part I would defend hardest is the instrumentation. I built logging into the app that captured every touch, every screen reader focus change, and every announcement, at roughly ten samples a second, tagged by condition. That produced 15,400 events across six participants. I wanted it because think-aloud tells you what someone noticed and says nothing about where their finger actually spent its time.",
      },
      {
        kind: "p",
        text: "The task framing mattered too. I told participants explicitly that they were not solving the math, only judging whether it was readable. That single instruction changed the build: I had written code to strip answers out of the spoken text so people could not cheat, and once the task was not about answers, I deleted it.",
      },
      {
        kind: "figure",
        src: "/images/case/stemally/app-home-and-all-files.jpeg",
        alt: "Two phone screens side by side. On the left, StemAlly's Home tab with worksheets uploaded by a teacher. On the right, the All Files tab listing the seven content types built for the study.",
        caption:
          "StemAlly's Home tab with teacher-uploaded worksheets, and the All Files tab showing the seven content types built for the study.",
      },
      { kind: "h", text: "Deciding who owns the reading experience" },
      {
        kind: "p",
        text: "My first version handed the whole document to a browser view and let a math rendering engine render it. That engine has real accessibility support, so it looked like the obvious answer. I shipped it in November and pulled it out six days later.",
      },
      {
        kind: "p",
        text: "The problem was ownership. The rendering engine builds its own description of the equation, and I could not get inside that to change what a student hears or to add any way of moving through it. Either I accept whatever the engine decides, or I take responsibility for it. I removed the browser path, wrote the spoken form myself from the markup the backend already produced, and left the rendered equation on screen purely as a picture, hidden from the screen reader entirely.",
      },
      {
        kind: "p",
        text: "It cost a week. Every decision after it depended on owning that description.",
      },
      { kind: "h", text: "Not everything that looks like math is math" },
      {
        kind: "p",
        text: "Multiple choice answers in a math worksheet are strings like a. -11. They arrive tagged as math, exactly like 2x squared plus 7x minus 15 equals 0.",
      },
      {
        kind: "p",
        text: "My first build treated them the same, so every answer choice became an interactive equation and the screen reader said math equation, double tap to enter math mode four times per question. The answer list stopped reading like a list.",
      },
      {
        kind: "p",
        text: "I added a threshold. An expression has to be complex enough, at least two operators, before it earns its own interactive block. Below that it stays inline and gets spoken as part of the sentence. A crude rule that fixed the problem.",
      },
      {
        kind: "figure",
        src: "/images/case/stemally/multiple-choice-question.jpeg",
        alt: "A multiple choice question in StemAlly. The four answer options read as a plain list rather than as four separate interactive equations.",
        caption:
          "Answer choices read as a plain list, option a. negative 11, b. negative 5, c. negative 1, instead of four interactive equations.",
      },
      { kind: "h", text: "Four rotors, then one" },
      {
        kind: "p",
        text: "For real equations I built a custom rotor, the screen reader control that lets you choose what swiping moves you through, so a student could step across an expression instead of taking it in one swallow.",
      },
      {
        kind: "p",
        text: "I shipped four rotors first: character, symbol, term, structure. More granularity felt more capable. In use it was worse. Every rotor you add is another item the user twists past to reach the one they want, and three of mine were noise. I cut it to one, Equation parts, and hid it until you enter math mode so it does not clutter the list on every other screen.",
      },
      {
        kind: "p",
        text: "Then I made a bigger mistake. The rotor was easier to make reliable if the equation had the whole screen to itself, so I moved math mode into a fullscreen view and spent time tuning how the equation scaled to fit. Three days later I deleted all of it. Opening a screen to read one equation inside a sentence costs you your place in the document, and I had done it for my own convenience, not the reader's. I found the real cause of the reliability problem and fixed it there instead.",
      },
      {
        kind: "p",
        text: "Math mode is a state now, not a screen. Double tap to enter, swipe to step through parts, two finger scrub to leave.",
      },
      { kind: "h", text: "Charts carry four representations at once" },
      {
        kind: "p",
        text: "Each chart announces a computed summary when you land on it, offers a rotor to step through its elements, plays as an audio graph, and has a toggle that swaps it for a plain data table. In the tactile fullscreen view, vibration strength maps to value so taller bars feel heavier, and each kind of mark has its own texture. Pie slices feel crisp. Line segments feel smooth.",
      },
      {
        kind: "figure",
        src: "/images/case/stemally/chart-bar-pair.jpeg",
        alt: "Two phone screens side by side. On the left a bar chart in the document flow with a summary above it. On the right the same chart in a fullscreen tactile view with bold high contrast outlines.",
        caption:
          "A bar chart with its computed summary and Show Data Table toggle, and the same chart in high-contrast tactile fullscreen where vibration strength maps to value.",
      },
      {
        kind: "figure",
        src: "/images/case/stemally/chart-line-pair.jpeg",
        alt: "Two phone screens side by side. On the left a line graph with a written data description. On the right the same graph in tactile fullscreen with thick line segments and red data point markers.",
        caption:
          "On-screen summary with data description, and tactile fullscreen with thick line segments and red data-point markers.",
      },
      {
        kind: "figure",
        src: "/images/case/stemally/chart-pie-pair.jpeg",
        alt: "Two phone screens side by side. On the left a pie chart with a percentage legend. On the right the same chart in tactile fullscreen with enlarged slices labelled by percentage.",
        caption:
          "Pie chart with percentage legend and Show Data Table toggle, and tactile fullscreen with enlarged slices labelled by percentage.",
      },
      {
        kind: "figure",
        src: "/images/case/stemally/figure-rectangle-pair.jpeg",
        alt: "Two phone screens side by side. On the left a geometry figure rendered as a plain rectangle outline. On the right the same figure in tactile fullscreen with thick edges, corner markers and labelled sides.",
        caption:
          "A geometry figure gets the same treatment: rendered on screen, then explored in tactile fullscreen with labelled sides.",
      },
      {
        kind: "p",
        text: "Four sounds indulgent. It is not. Sonification reads shape quickly and exact values badly. A table is the reverse. The same student needs both, on different questions in the same worksheet.",
      },
      {
        kind: "clip",
        mp4: "/video/stemally-math-mode.mp4",
        webm: "/video/stemally-math-mode.webm",
        poster: "/video/stemally-math-mode-poster.jpg",
        alt: "A screen recording of StemAlly with VoiceOver running.",
        caption:
          "StemAlly's flow with VoiceOver on. Captions are not written yet.",
      },
      { kind: "h", text: "What the evidence changed" },
      {
        kind: "p",
        text: "Four things came out of the logs that no participant said out loud.",
      },
      {
        kind: "p",
        text: "Nobody ever left math mode on purpose. Participants entered it 41 times and used the intended exit gesture zero times. From their side nothing failed, so it never came up in think-aloud. I had built a modal state with no discoverable door. The fix is either a visible exit control, or dropping the modality entirely and letting the rotor work without an enter step. I lean toward the second, because the mode exists to keep the rotor list uncluttered, and that is my problem to solve rather than the reader's.",
      },
      {
        kind: "p",
        text: "Half the equations condition was spent listening, not acting. Idle time ran to a median of 46% there, in stretches of up to 36 seconds. Graphics came in at 31%, after excluding four pauses longer than a minute that were plainly breaks rather than listening. So the equations condition is where people sit still, and the graphics condition is where they work. That reframed the problem for me. I had assumed the difficulty was moving around an equation. The bigger cost is that hearing it once is slow and there is no way to skim. What that argues for is a short spoken form by default, with the fully bracketed reading as an explicit action.",
      },
      {
        kind: "p",
        text: "They re-read constantly. 71% of elements were returned to at least once, and one was returned to 23 times in a single session. Every navigation feature I built works inside an element. Nothing helped them get back to one, which is what they actually spent their time doing. Returning to question 3 should be one action, not eleven swipes.",
      },
      {
        kind: "p",
        text: "Tactile figures outweighed equation navigation 43 to 1 in raw interaction, in sessions that ran nearly twice as long, with an eightfold spread between participants. I had spent most of my time on math. The chart and table work in this case study exists because of that number. The spread is its own open question: exploration strategies seem to vary far more between people for figures than for equations.",
      },
      {
        kind: "p",
        text: "The three-finger back gesture belongs here too. It fired three times in the whole study, all from one participant. It worked. It was announced in a hint. Five of six people never touched it.",
      },
      {
        kind: "note",
        text: "Two caveats that matter. Six participants, sessions facilitated with help available, and every participant did equations before graphics, so order effects and condition effects are tangled. And idle time is inferred from gaps with no input, so it cannot separate listening from thinking.",
      },
      {
        kind: "figure",
        src: "/images/case/stemally/chart-interaction-split-and-idle.png",
        alt: "Two bar charts. The first shows raw interaction counts, with tactile figures at 43 against equation navigation at 1. The second shows median idle share per condition, 46% for equations and 31% for graphics.",
        caption:
          "Left: tactile figure against equation interaction, 43 to 1. Right: idle share per condition.",
      },
      { kind: "h", text: "What I would change" },
      {
        kind: "p",
        text: "Equation parts split on punctuation in the spoken string, so a part is sometimes x plus or 3 close paren. Participants averaged 6.8 steps into equations with a median of 9 parts, so they stopped about three-quarters of the way through, every time. Segment along the structure of the equation instead and there are fewer stops, each worth taking.",
      },
      {
        kind: "p",
        text: "The reader hard-codes its text sizes. Our design system supports Dynamic Type and the reader never adopted it, which fails exactly the low-vision students who are not screen reader users.",
      },
      {
        kind: "p",
        text: "And I would fix my own instrumentation before running again. I logged which equation parts people visited but never which rotor they had selected, so I can prove the equation rotor was used and cannot tell whether anyone went looking for it and failed. That is the question I most want answered and the one I made unanswerable.",
      },
    ],
  },

  {
    id: "tactilenav-case",
    title: "Tactile street maps: when the screen reader and your app want the same finger",
    kind: "Case study, field tested",
    date: "Mar 2026 to Dec 2026",
    summary:
      "Learning an intersection before you walk it, using only touch and sound, and the gesture conflict that took two reversals to resolve.",
    facts: [
      { value: "4.0mm", label: "line width at every scale" },
      { value: "643", label: "junctions from node topology" },
      { value: "1.1", label: "semitones in a 25mph pass" },
      { value: "2", label: "custom gestures that did not survive" },
    ],
    links: [
      { href: "#work/tactilenav", label: "The product this came out of" },
      { href: "https://github.com/keerthianil/TactileNav", label: "The code" },
    ],
    blocks: [
      {
        kind: "note",
        text: "Research assistant at the Roux Institute at Northeastern, UNAR Labs. Mine: the literature review, the interaction model, the feedback design, the field testing, and the shared kit both apps came out of.",
      },
      { kind: "h", text: "The question" },
      {
        kind: "p",
        text: "A blind traveller planning an unfamiliar route can find out where the streets are. What they cannot find out is what the crossing will be like: how many lanes, whether there is an audible signal, how long the walk phase lasts, whether cars turn across it.",
      },
      {
        kind: "p",
        text: "So the question I worked on was whether someone can learn an intersection before they walk it, using only touch and sound.",
      },
      {
        kind: "figure",
        src: "/images/case/tactilenav/intersection-view.jpeg",
        alt: "A single intersection drawn close up, with roadways, sidewalks, crosswalk stripes, and corner and crossing endpoint markers.",
        caption:
          "The intersection view: roadways, sidewalks, crosswalk stripes, and corner and crossing-endpoint markers, all explorable by touch before the walk.",
      },
      {
        kind: "p",
        text: "The interaction that makes it possible is simple to describe. You put a finger on a map and drag, and the map speaks and vibrates under you. Roads buzz. Intersections pulse. Landmarks pulse faster. Which is where the problem starts, because that needs raw one finger touches, and the screen reader also needs one finger touches, since that is how a blind user moves focus and activates anything. Only one of us can have them.",
      },
      {
        kind: "figure",
        src: "/images/case/tactilenav/route-map-tactile.jpeg",
        alt: "A tactile route map on a phone. Streets are thick blue lines, the active route is cyan, intersections are red squares, and the start and end are yellow dots.",
        caption:
          "Drag a finger and each street, intersection and endpoint speaks and vibrates under it.",
      },
      {
        kind: "clip",
        mp4: "/video/tactilenav-route-map.mp4",
        webm: "/video/tactilenav-route-map.webm",
        poster: "/video/tactilenav-route-map-poster.jpg",
        alt: "A screen recording of TactileNav with VoiceOver running.",
        caption:
          "The app's flow with VoiceOver turned on. Captions are not written yet.",
      },
      { kind: "h", text: "What the literature told me, and what it got wrong" },
      {
        kind: "p",
        text: "Before building, I reviewed the research on how blind pedestrians actually read traffic and wrote it up across twelve topics with about a dozen sources. Four findings became features.",
      },
      {
        kind: "list",
        items: [
          "Traffic sound is the primary input for crossing decisions, but urban ambient noise averages around 66 dBA, and above roughly 50 dBA vehicle detection becomes unreliable. So the app models a sound environment, not just a map.",
          "Judging whether a car is going straight or turning needs about 11 dB more than merely detecting it is there. That is the hardest perceptual task in a crossing, so I built a sandbox for exactly that comparison.",
          "Electric vehicles under 20 mph sit under 45 dBA, against the 65 to 70 dBA needed to read a vehicle's path. That gap is a safety hazard, so car against EV is its own demo.",
          "Touchscreen vibro-audio maps reach about 75% wayfinding accuracy against 78% for physical tactile maps. Close enough to justify the whole premise.",
        ],
      },
      {
        kind: "p",
        text: "One finding I got wrong. My own report said the platform's audio engine applies the Doppler effect for free once you position a sound in space, so no extra work was needed. On a device it was not convincing. I ended up computing the pitch shift from the vehicle's modelled position and closing speed, updated sixty times a second. A 25 mph pass produces roughly 1.1 semitones, which is subtle and, to an experienced blind traveller, real.",
      },
      {
        kind: "p",
        text: "Writing that section and then contradicting it on hardware is the most useful thing the review did for me.",
      },
      {
        kind: "figure",
        src: "/images/case/tactilenav/findings-panel-dba.png",
        alt: "A panel of findings about traffic sound, including that urban ambient noise averages 66 decibels, that detection becomes unreliable above 50, and that an electric vehicle under 20 miles per hour sits below 45.",
        caption: "Three review findings that became features.",
      },
      { kind: "h", text: "The finger conflict" },
      {
        kind: "p",
        text: "There is one setting for this: you can declare that a view wants raw touches and the system hands them over. I turned it on and one-finger exploration worked immediately.",
      },
      {
        kind: "p",
        text: "It is also all or nothing. Raw touches means every touch, including the multi-finger ones the screen reader depends on. So a rotor twist now reached the map and spun it. Pinch drifted it. Focus got stuck. And I had already disabled the swipe-back-from-the-left-edge gesture, because people exploring the left side of a map kept exiting by accident. There was now no reliable way off the screen at all.",
      },
      {
        kind: "p",
        text: "I turned raw touches off and went back to standard screen reader behaviour. Eleven minutes later I turned them back on, because standard behaviour means no drag exploration, and drag exploration is the product.",
      },
      {
        kind: "p",
        text: "The answer was to stop treating the map as a map. I switched off every gesture the map view ships with, so a stray multi-finger gesture had nothing left to grab, and then rebuilt only what I wanted: pinch zoom by hand, a three-finger swipe to go back, and the traffic controls re-exposed as screen reader actions plus a two-finger double tap. One touch surface, one set of gestures, nothing competing.",
      },
      { kind: "h", text: "I copied my own worse answer" },
      {
        kind: "p",
        text: "The route app had reached the opposite conclusion weeks earlier. Under the screen reader its gestures seemed unreliable, so it read raw touch events itself and switched the system's gesture handling off. That version went to the convention and worked.",
      },
      {
        kind: "p",
        text: "So I ported it into the map app, thresholds and all. It crashed on tap-to-open and it hung. Five days later I deleted the whole thing and went back to system gestures live in both modes.",
      },
      {
        kind: "p",
        text: "The lesson was the same both times, read backwards. The failure was never system gestures against manual handling. It was having two touch paths racing each other. Pick one, let it own everything.",
      },
      { kind: "h", text: "Two gestures I gave up on" },
      {
        kind: "p",
        text: "A three-finger swipe up and down changed zoom level. Elegant, and it did not survive contact. I replaced it with labelled buttons under the map. Same story for a custom rotor that jumped to the next landmark, which became a plain Options menu.",
      },
      {
        kind: "p",
        text: "A gesture nobody is told about does not exist. A button announces itself.",
      },
      { kind: "h", text: "Making room for a cue instead of adding one" },
      {
        kind: "p",
        text: "In the route app, crosswalks vibrated continuously, and their endpoints played a ding to mark where the crossing ended. Testers could not tell where crossings ended.",
      },
      {
        kind: "p",
        text: "I removed the crosswalk vibration. Too blunt, because that killed the crosswalk audio click too, so I put the click back and left the vibration off. Then I stopped all vibration inside the endpoint itself.",
      },
      {
        kind: "p",
        text: "The vibration had been masking the ding. You cannot fix a perception problem by adding another channel. Sometimes you clear one.",
      },
      {
        kind: "p",
        text: "That is also why texture, not strength, carries meaning in my feedback vocabulary. Streets are a deep rumble, routes a fast pulse, intersections a slow pulse with a ding, landmarks a quick tick. Strength is reserved for one quantity, traffic volume, so a busy street literally feels heavier under the finger.",
      },
      {
        kind: "figure",
        src: "/images/case/tactilenav/feedback-vocabulary-table.png",
        alt: "A table mapping what is under the finger to its haptic pattern, its sound and its spoken announcement. Streets, routes, intersections and landmarks each get a distinct texture.",
        caption:
          "Texture carries meaning. Strength is reserved for traffic volume.",
      },
      {
        kind: "figure",
        src: "/images/case/tactilenav/feedback-haptic-setup.jpeg",
        alt: "The in-app feedback tester, with each map element assigned a haptic pattern that can be previewed before exploring the map.",
        caption:
          "Each map element can be assigned and previewed as a haptic pattern before exploring the map.",
      },
      { kind: "h", text: "The shared kit" },
      {
        kind: "p",
        text: "The map rendering, the vibration engine, the spatial audio, and the touch logging came out of these two apps into one kit other teams now build on. The decision that made it reusable: a map element is pure data, and you hand in a policy that decides what a touch means. Indoor corridors and outdoor crosswalks share the same model and disagree entirely about how they should feel.",
      },
      {
        kind: "figure",
        src: "/images/case/tactilenav/app-home-nfb-test.jpeg",
        alt: "The test app's tools: CSV touch logs, the haptic feedback tester, and a map designer that draws corridors on a grid and exports JSON.",
        caption:
          "The test app's tools, each a surfaced piece of the shared kit.",
      },
      { kind: "h", text: "Honest scope, and the ask" },
      {
        kind: "p",
        text: "The street geometry is real, a proper map extract with verifiable IDs. The signal and traffic data are simulated, built to match the structure of the real sources so a real dataset drops straight in. That is deliberate, because no public accessible-signal dataset exists for Portland at all.",
      },
      {
        kind: "p",
        text: "So I wrote the ask. Nineteen downtown intersections, prioritised along the corridors that clients of the local blind services network walk daily, and about fifty fields per intersection, each with a line on why it matters to a blind pedestrian. It is with the city now.",
      },
      { kind: "h", text: "What I would change" },
      {
        kind: "p",
        text: "I would version the shared kit properly. Without releases, one team defensively froze a copy and drifted months behind the rest.",
      },
      {
        kind: "p",
        text: "And I would run a discoverability pass before the field test rather than after. Both apps ended up with four redundant ways to exit a screen, which I added because no single one proved reliable. Four is not a design. It is a hedge.",
      },
    ],
    file: { href: "/data-request.pdf", label: "The data request, as sent" },
  },

  {
    id: "tactilenav-report",
    title: "Infrastructure and data sources for non-visual outdoor navigation",
    kind: "Literature review",
    date: "July 2026",
    summary:
      "Twelve topics on what a blind pedestrian can and cannot learn about a crossing before they walk it.",
    facts: [
      { value: "75% / 78%", label: "digital against physical tactile maps" },
      { value: "66 dBA", label: "average urban ambient noise" },
      { value: "under 45 dBA", label: "an electric vehicle at low speed" },
      { value: "under 5%", label: "open map coverage of audible signals" },
    ],
    blocks: [
      {
        kind: "note",
        text: "Written with a research partner at the Roux Institute, to work out what data exists before building anything that depends on it.",
      },
      {
        kind: "p",
        text: "The headline finding is that spatial learning deficits in blind and low-vision people come from lack of information access rather than lack of vision. Vibro-audio maps on a touchscreen reach 75% wayfinding accuracy against 78% for physical tactile maps, which is close enough to make the digital version worth building.",
      },
      {
        kind: "p",
        text: "The finding that changed the product is about sound. Traffic noise is how blind pedestrians make crossing decisions, and above about 50 decibels ambient it stops being reliable. Urban environments average 66. Judging whether a vehicle is going straight or turning needs roughly 11 decibels above your detection threshold, and an electric vehicle under 20 miles an hour sits below 45 decibels. The technique itself starts to fail, which is why the crossing simulator has a traffic type control.",
      },
      {
        kind: "p",
        text: "It also says plainly what is missing. No public accessible pedestrian signal dataset exists for Portland, and coverage of audible signal tags in open map data is under 5% even in well mapped cities.",
      },
      {
        kind: "p",
        text: "And it contains the one claim I later disproved on hardware. The review states that the platform's audio engine applies the Doppler effect for free once a sound is positioned in space. On a device it was not convincing, and the pitch shift had to be computed by hand. That correction is in the case study rather than quietly edited out of here.",
      },
    ],
    links: [
      { href: "#research/tactilenav-case", label: "The case study it fed" },
    ],
  },

  {
    id: "aps-request",
    title: "Accessible pedestrian signal data request",
    kind: "Artifact, sent",
    date: "2026",
    summary:
      "Nineteen intersections and fifty fields each, with a line on every field explaining why a blind pedestrian needs it.",
    facts: [
      { value: "19", label: "intersections" },
      { value: "50", label: "fields per intersection" },
      { value: "6", label: "field groups" },
    ],
    blocks: [
      {
        kind: "p",
        text: "The literature review established that the data did not exist publicly. This is what I did about it.",
      },
      {
        kind: "p",
        text: "Nineteen downtown intersections, prioritised along the corridors that clients of the local blind services network walk daily. About fifty fields per intersection, grouped into signals, timing, geometry, pedestrian infrastructure, traffic, and planned changes.",
      },
      {
        kind: "p",
        text: "Each field carries a sentence on why it matters. Diagonal curb ramps can aim someone into the intersection rather than into the crosswalk. Bike lanes matter because bicycles are nearly silent and pose a conflict a blind pedestrian cannot hear coming. A channelised right turn means cars crossing the walk phase at speed.",
      },
      {
        kind: "p",
        text: "It closes by saying that any subset would help, including just signal locations and types, because a request that demands everything usually gets nothing.",
      },
    ],
    file: { href: "/data-request.pdf", label: "The request, as sent" },
  },

  {
    id: "onboarding-cliff",
    title: "The Onboarding Cliff",
    kind: "Research, no build",
    date: "Aug 2026",
    summary:
      "A heuristic evaluation of five fitness app onboarding flows, a reproducible score for onboarding cost, and a redesign that cuts eighteen screens to six.",
    links: [
      {
        href: "https://www.figma.com/design/Un0EwvJ568KPnA6QDOcnXe/Onboarding-Cliff?node-id=0-1",
        label: "The redesign, in Figma",
      },
    ],
    facts: [
      { value: "5", label: "apps scored" },
      { value: "100", label: "point scale, higher is worse" },
      { value: "7,275", label: "reviews and posts mined" },
      { value: "182", label: "screenshots coded" },
    ],
    blocks: [
      {
        kind: "note",
        text: "Research only. No shipped product. A heuristic evaluation of five mainstream fitness app onboarding flows, a scoring instrument for onboarding cost, and a redesign of MyFitnessPal.",
      },
      { kind: "h", text: "What I investigated" },
      {
        kind: "p",
        text: "Fitness apps lose most of their users before those users do anything. A 2024 scoping review across 525,824 participants found a median of 70% discontinuing within 100 days, with the sharpest drop right after install. I evaluated five flows against Nielsen's heuristics, built a score so the comparison was not just adjectives, and mined 7,275 reviews and posts to see whether users complain about what the evaluation flagged.",
      },
      { kind: "h", text: "The five apps and what I measured" },
      {
        kind: "p",
        text: "MyFitnessPal, Noom, Freeletics, Fitbod, Strava. Picked for range: Noom is the documented extreme at 113 screens, Freeletics walls the account at screen 3, Fitbod asks the most and lets you skip nearly all of it, Strava does no plan building, MyFitnessPal has the largest install base in the category. I could not install them, so flows came from published screen-by-screen captures, a published teardown of Noom's funnel, and current store previews. 182 screenshots.",
      },
      {
        kind: "table",
        head: ["App", "Screens in flow", "Inputs demanded", "Time to first value"],
        rows: [
          ["Noom", "113", "about 28 question screens", "10 to 15 min, to a projection. Product needs purchase."],
          ["MyFitnessPal", "18", "14", "About 120s to a calorie number. First log on screen 19."],
          ["Freeletics", "17", "12", "Never, free. Wall at 3, paywalls at 15 and 19."],
          ["Fitbod", "14", "13", "About 2 to 3 min to see a workout. Starting it needs a trial."],
          ["Strava", "13", "9", "About 2 min to a live Record screen."],
        ],
      },
      {
        kind: "p",
        text: "One premise did not survive. MyFitnessPal does not drop you into food logging. It is 18 screens with a mandatory account at screen 7 and three upsell panels before the diary. Shortest in the set, not minimal.",
      },
      { kind: "h", text: "The Cliff Index" },
      {
        kind: "p",
        text: "Screen counts are a bad proxy. Noom's 113 screens convert well. So I built a five-factor score and made it runnable. Ask Debt counts inputs before the first core action. Dead Asks counts the share with no user-visible consequence. Price Lateness is where the price lands in the flow. Wall Height counts hard gates. No Way Back counts reversibility. Higher is worse.",
      },
      {
        kind: "table",
        head: ["App", "Cliff Index", "Worst violation", "Severity"],
        rows: [
          ["Noom", "79.0", "Visibility of system status", "4"],
          ["MyFitnessPal", "61.5", "Match with real world, and flexibility", "4"],
          ["Freeletics", "60.6", "User control and freedom", "4"],
          ["Fitbod", "58.1", "Flexibility and efficiency", "4"],
          ["Strava", "48.5", "Visibility of system status", "4"],
        ],
      },
      {
        kind: "p",
        text: "The weights are my judgement, not derived, so the per-input ledger is published to make disagreement specific.",
      },
      {
        kind: "p",
        text: "Two findings worth stating in full. Noom's plan-building sequence shows seven progress bars filling toward 100% while asking yes or no questions. The published teardown annotates it directly: the answers change nothing and the questions exist to pace the loader. The bars advance on a timer. And MyFitnessPal's consent screen says please accept all of the following data consents or you will be unable to create your MyFitnessPal account, then one line later, you can withdraw consent at anytime.",
      },
      {
        kind: "p",
        text: "Ask Debt counts what a flow asks. It does not ask whether the flow needed to. Nine of MyFitnessPal's fourteen inputs are already on the phone. Sex at birth, date of birth, height and weight are health store fields. Activity level is derivable from step history and would be more accurate derived. Country is device locale. Email, password and username collapse into one sign in tap. MyFitnessPal already integrates with the platform health store.",
      },
      {
        kind: "table",
        head: ["App", "Inputs", "No visible consequence", "Already on the device", "Avoidable"],
        rows: [
          ["MyFitnessPal", "14", "4", "9", "64%"],
          ["Strava", "9", "1", "4", "44%"],
          ["Freeletics", "12", "3", "5", "42%"],
          ["Fitbod", "13", "2", "5", "38%"],
          ["Noom", "19", "6", "3", "16%"],
        ],
      },
      { kind: "h", text: "What the reviews said" },
      {
        kind: "p",
        text: "7,275 items across three corpora: 5,265 Google Play reviews, 877 App Store reviews, and 1,133 Reddit posts and comments pulled through a research archive after Reddit itself turned out to be blocked here.",
      },
      {
        kind: "p",
        text: "The main finding is a negative one. Onboarding is almost absent from user voice: 0% to 3% of a corpus deliberately weighted toward complaints, against 11% to 22% for billing. That gap is not evidence onboarding is fine. People who quit during onboarding delete the app and never review it. Everyone in these corpora cleared the flow. They are the survivors. The MyFitnessPal subreddit in 2026 is a sustained revolt about an April UI change and contains essentially nothing about signing up, because the subreddit is made of people with multi-year streaks. There is even a linguistic tell: across 1,133 Reddit items from seven fitness subreddits, onboarding almost always means a gym induction with a trainer. These communities do not have a word for app onboarding because they did not experience it as an event.",
      },
      {
        kind: "p",
        text: "The complaints that do name onboarding are all the same complaint, and they are among the most-upvoted in the set.",
      },
      {
        kind: "quote",
        text: "requires you to sign up and give your personal information before you can even check out if the app is something you would like. Great way to mine data. Uninstalled 30 seconds later.",
        source: "Freeletics, Play 1 star, 182 helpful votes",
      },
      {
        kind: "quote",
        text: "filled out the biometrics, etc only to be slapped with an enormous pay wall before I could even see my workout.",
        source: "Fitbod, Play 1 star, 31 votes",
      },
      {
        kind: "quote",
        text: "the app made me complete the entire enrollment and personality quiz again.",
        source: "Noom, iOS 1 star, from a five-year subscriber who got logged out",
      },
      {
        kind: "p",
        text: "Not one review in 7,275 says the questionnaire was too long. Length is not remembered as friction. It is remembered as the setup for the price.",
      },
      {
        kind: "p",
        text: "One finding I did not expect. A Fitbod user with a hand injury spent 90 minutes excluding 200 exercises one at a time, because onboarding asks in detail what you can do and never what you cannot, and there is no bulk select. That is a motor accessibility failure caused by a missing bulk action, and I found no literature on it at all.",
      },
      { kind: "h", text: "Five principles" },
      {
        kind: "list",
        items: [
          "The First Rep. Deliver one completed instance of the core action before asking the second question. Motivation peaks at install and ability is at its floor.",
          "Ask Nothing the Phone Knows. 64% of MyFitnessPal's asks are already on the device. Lowering the cost of the behaviour beats raising motivation, and pre-filling is endowed progress with real stamps rather than an animation.",
          "The Sunk-Cost Curtain. Peak-end rule, run backwards. If the price reveal is both the emotional peak and the final beat, it becomes the remembered experience and overwrites everything before it. This predicts the review pattern exactly.",
          "Consent Is Not a Toll Gate. Autonomy requires choices to be consequential and legible. Accept-all-or-leave, one line above a withdrawal promise, teaches the user the consent is decorative.",
          "The Returning-User Door. Four of five apps route existing users back through acquisition. Difficult or confusing to use is the most consistently cited abandonment reason across half a million participants.",
        ],
      },
      { kind: "h", text: "The redesign" },
      {
        kind: "p",
        text: "Noom has the worst cliff. I redesigned MyFitnessPal, for three reasons that are not that it is worse: it has the most avoidable cliff at 64%, it has 2.7 times Noom's install base, and version 26.16.0 dropped its update rating from 3.24 to 1.54 across roughly 991,000 reviews, so its onboarding now delivers people to a screen they are actively leaving.",
      },
      {
        kind: "p",
        text: "The thesis is one sentence. MyFitnessPal already ships a five-second logging path, meal scan and voice, and puts a fourteen-input form in front of both.",
      },
      {
        kind: "p",
        text: "So the flow opens on the camera. Log a meal in about eight seconds, no account. See the calories, macros and food-quality dots. Then one screen with one question, lose or maintain or gain, because it is the only thing the phone cannot answer, with five rows read from the health store and activity derived from seven days of steps and shown as evidence rather than asserted. Then the price at screen 4, before the account rather than after it. Then sign in, with the one required consent separated from the two that are not. Then Today, arriving with a real meal in it.",
      },
      {
        kind: "p",
        text: "18 screens to 6. 14 inputs to 3. Cliff Index 61.5 to 21.0. Built three ways: a clickable prototype with a live timer that stops when the first meal is logged, a static board, and native design layers on a system extracted from the screenshots, including the 2026 brand blue at #0066EE that replaced the previous era's #006ABA.",
      },
      {
        kind: "p",
        text: "Trial starts will probably fall. Moving the price to screen 4 removes the sunk cost that makes late pricing work, and anyone claiming otherwise is selling something. The bet is that refunds, chargebacks and one-star billing reviews fall further.",
      },
      { kind: "h", text: "What I would test next" },
      {
        kind: "p",
        text: "Whether the composition of trial starts under early pricing beats the volume of trial starts under late pricing on 30-day retention, and what share of users grant health store access at screen 4, because the whole redesign rests on that one permission.",
      },
    ],
    docs: [
      {
        id: "cliff-index",
        title: "The Cliff Index",
        summary:
          "The instrument itself: five factors, the weights, the scores, and the per-input ledger that makes disagreement specific.",
        blocks: [
          {
            kind: "p",
            text: "A score for how far an onboarding flow makes someone walk before it hands them the product. Five factors, 0 to 20 each, 100 is the worst possible. The script that produces it is published so the numbers can be reproduced.",
          },
          {
            kind: "p",
            text: "I built this because a heuristic severity table tells you an app is bad and not how bad, and because onboarding is too long is not a measurement. Screen counts are the usual proxy and they are a poor one. Noom's 113 screens convert. The question is what the screens cost.",
          },
          { kind: "h", text: "The five factors" },
          {
            kind: "table",
            head: ["Factor", "What it measures", "Scale"],
            rows: [
              ["Ask Debt", "Discrete inputs required before the first completed core action", "1 point per input, capped at 20"],
              ["Dead Asks", "Share of those inputs whose answer has no user-visible consequence anywhere in the flow", "20 times the share"],
              ["Price Lateness", "Position of the first price disclosure as a fraction of flow length", "20 times the fraction"],
              ["Wall Height", "Hard gates between the user and the core action", "account 8, payment 8, no skip 4"],
              ["No Way Back", "Reversibility and transparency of what onboarding sets", "no returning-user door 8, progress lost on abandon 6, silent defaults 6"],
            ],
          },
          {
            kind: "p",
            text: "Core action means the thing the app was downloaded for. Log a food. Start a run. Do a workout. Not see a projection, which is an artifact the app produced, not something the user did.",
          },
          { kind: "h", text: "Scores" },
          {
            kind: "table",
            head: ["App", "Ask Debt", "Dead Asks", "Price Lateness", "Wall Height", "No Way Back", "Cliff Index"],
            rows: [
              ["Noom", "19", "6.3", "19.6", "20", "14", "79.0"],
              ["MyFitnessPal", "14", "5.7", "17.8", "12", "12", "61.5"],
              ["Freeletics", "12", "5.0", "17.6", "20", "6", "60.6"],
              ["Fitbod", "13", "3.1", "20.0", "16", "6", "58.1"],
              ["Strava", "9", "2.2", "9.2", "8", "20", "48.5"],
            ],
          },
          { kind: "h", text: "The number that actually matters" },
          {
            kind: "p",
            text: "Ask Debt counts what a flow asks. It does not ask whether the flow needed to ask.",
          },
          {
            kind: "p",
            text: "Nine of MyFitnessPal's fourteen onboarding inputs are already on the phone. Sex assigned at birth, date of birth, height and weight are health store fields. Activity level is derivable from seven days of step history, and derived would be more accurate than self-reported. Country is device locale. Email, password and username collapse into one sign in tap. MyFitnessPal already integrates with the platform health store, so the permission path exists and is already built.",
          },
          {
            kind: "p",
            text: "Noom has the worst cliff. MyFitnessPal has the most avoidable one, by a wide margin, and it is the largest app in the category. Noom's number is low here for an honest reason: most of what Noom asks is genuinely un-derivable. Nobody's phone knows their relationship with food. Noom's problem is volume and sequencing. MyFitnessPal's problem is that it asks a phone-shaped question to a person.",
          },
          { kind: "h", text: "Consequence audit: MyFitnessPal" },
          {
            kind: "p",
            text: "Every input, in flow order, with what it changes and whether it had to be asked.",
          },
          {
            kind: "table",
            head: ["#", "Input", "What it changes", "Verdict"],
            rows: [
              ["1", "Goal, lose or maintain or gain", "Calorie target direction", "Ask. Only the user knows this."],
              ["2", "Activity level, 4 options", "Calorie target multiplier", "Derivable from step history, and more accurately"],
              ["3", "Sex assigned at birth", "BMR formula", "Health store field"],
              ["4", "Date of birth", "BMR formula", "Health store field"],
              ["5", "Country", "Units, legal basis", "Device locale"],
              ["6", "Postal code", "Nothing the user ever sees", "Dead"],
              ["7", "Height", "BMR formula", "Health store field"],
              ["8", "Weight", "BMR formula, starting point", "Health store field"],
              ["9", "Username", "Profile display name", "Generate it, let them edit later"],
              ["10", "Email", "Account identity", "Platform sign in"],
              ["11", "Password", "Account identity", "Platform sign in"],
              ["12", "Consent: sensitive data processing", "Nothing the user sees", "Dead, and see below"],
              ["13", "Consent: transfer outside country", "Nothing the user sees", "Dead, and see below"],
              ["14", "How did you hear about us", "Attribution reporting", "Dead for the user, valuable to the business"],
            ],
          },
          {
            kind: "p",
            text: "One artifact comes out the other end: a daily calorie number, on screen 15 of 18. Eight of the fourteen inputs feed it. Six do not feed anything the user will ever see.",
          },
          { kind: "h", text: "The consent screen is a forced-consent pattern" },
          {
            kind: "quote",
            text: "We want you to understand how we collect and use your data. Please accept all of the following data consents or you will be unable to create your MyFitnessPal account.",
            source: "Screen 14, verbatim from the capture",
          },
          {
            kind: "quote",
            text: "You can withdraw consent at anytime.",
            source: "Immediately below it, same screen",
          },
          {
            kind: "p",
            text: "Those two sentences describe different products. Consent conditioned on access to the service is not freely given, which is the specific thing GDPR Article 7(4) exists to address. Two of the three toggles are substantive: sensitive personal data processing, and transfer outside the user's country or region. The third, a marketing toggle, is genuinely optional and is presented identically to the two that are not. Separately, on the following screen, use my phone to track my steps arrives pre-checked while the other two toggles do not.",
          },
          {
            kind: "p",
            text: "I am a designer and not a lawyer, and I am not claiming MyFitnessPal is in breach of anything. The design observation stands on its own: a screen that says accept-all-or-leave, immediately followed by a line about withdrawing consent at any time, teaches the user that the consent is theatre. That is a trust cost paid at the moment of highest abandonment risk, for data whose use is never surfaced.",
          },
          { kind: "h", text: "What this instrument does not do" },
          {
            kind: "list",
            items: [
              "The weights are my judgement. Wall Height at 8, 8 and 4 is a defensible split and not a derived one. Someone who thinks a payment wall is worse than an account wall would weight it differently and get a different order. The ledger is published so the disagreement can be about a specific cell.",
              "It measures cost, not outcome. A high Cliff Index does not predict churn. Noom scores 79 and converts extremely well. No published study manipulates onboarding length and measures retention, so nobody can honestly claim the causal link.",
              "Four of the five flows were captured around 2020. Structure was cross-checked against 2025 to 2026 reviews and current store previews. Exact input counts may be off by one or two on the apps other than MyFitnessPal, whose current flow I verified against three independent walkthrough sources.",
              "The derivability coding assumes iOS and its health store. The equivalent exists on Android and the same nine fields are available, but I coded against iOS because that is where the captures come from.",
            ],
          },
        ],
      },
      {
        id: "review-mining",
        title: "Review mining: raw findings",
        summary:
          "7,275 reviews and posts across three corpora, the sampling bias stated up front, and the quotes that carry the finding.",
        blocks: [
          {
            kind: "p",
            text: "Collected 2 August 2026. Three corpora, 7,275 reviews and posts.",
          },
          {
            kind: "table",
            head: ["Corpus", "Volume", "Method"],
            rows: [
              ["Google Play reviews", "5,265", "Newest and most-helpful sorts, 4 pages each, deduplicated"],
              ["US iOS App Store reviews", "877", "Customer review feed, both sorts, deduplicated"],
              ["Reddit", "1,133 posts and comments", "Research archive API, subreddit-scoped body search across seven fitness subreddits"],
            ],
          },
          {
            kind: "note",
            text: "Reddit access. Reddit itself is blocked at the network layer here, so every route to it failed and one archive explicitly declined automated traffic. A research archive worked, scoped by subreddit. Every Reddit quote in the original carries a permalink.",
          },
          {
            kind: "note",
            text: "Sampling bias. The most-helpful sorts surface polarised reviews. 2,258 of the 5,265 Play reviews sampled are two stars or below, which is a property of the sort, not of the apps. Real averages sit between 4.64 and 4.81. Every count below is a keyword hit rate inside a deliberately negative sample.",
          },
          { kind: "h", text: "The main finding is a negative one" },
          {
            kind: "table",
            head: ["App", "Play sampled", "2 star or below", "account or signup", "onboarding or setup", "consent or privacy", "trial or billing", "delete or uninstall"],
            rows: [
              ["MyFitnessPal", "1,103", "686", "7", "13", "203", "116", "122"],
              ["Noom", "949", "317", "11", "13", "135", "138", "39"],
              ["Strava", "1,038", "485", "12", "0", "142", "179", "57"],
              ["Freeletics", "1,128", "408", "13", "11", "36", "239", "38"],
              ["Fitbod", "1,047", "362", "16", "29", "58", "226", "43"],
            ],
          },
          {
            kind: "p",
            text: "Onboarding language appears in 0% to 3% of a corpus deliberately weighted toward complaints. Billing language appears in 11% to 22%.",
          },
          {
            kind: "p",
            text: "The gap is not evidence that onboarding is fine. People who quit during onboarding delete the app and never write a review, because writing a review requires caring and caring requires having got somewhere. Everyone in these corpora cleared the flow. They are the survivors.",
          },
          {
            kind: "p",
            text: "There is a linguistic tell worth one line. Across 1,133 items from seven fitness subreddits, the word onboarding almost always means a gym induction session with a trainer, not an app flow. The top-scoring hit in the whole sweep is a post about being mocked by the onboarding guy at a gym. App onboarding is not a thing these communities have a word for, because it is not a thing they experienced as an event.",
          },
          { kind: "h", text: "MyFitnessPal" },
          {
            kind: "p",
            text: "The brief's premise, that MyFitnessPal drops you straight into food logging, is out of date. The current flow is 18 screens, a mandatory account at screen 7, 14 inputs, and three Premium panels before the diary.",
          },
          {
            kind: "p",
            text: "Version 26.16.0, released 21 April 2026, replaced the Diary tab with a card-based Today screen. The update rating fell from 3.24 to 1.54 stars across roughly 991,000 reviews and 923,000 downloads in the 30 days following, with no option to revert. Onboarding now delivers users to a destination they are actively leaving.",
          },
          {
            kind: "p",
            text: "Consent is the largest single theme, at 203 of 1,103 sampled reviews.",
          },
          {
            kind: "quote",
            text: "I bet it's a great app. I'll never know because two seconds after logging in I was hit with a huge ad in the middle of the screen.",
            source: "iOS, 2 star, v26.29.0",
          },
          {
            kind: "quote",
            text: "I've been using MFP for over a decade over multiple accounts but after waking up this morning to find the new version of the UI and all the other changes I've deleted my account and uninstalled.",
            source: "Reddit, 23 April 2026",
          },
          {
            kind: "p",
            text: "One highly-upvoted comment explains how to get the subscription for about three dollars a year by appearing to be in another country. That is a pricing finding wearing a hack's clothing. When the same product costs 80 dollars or 3 dollars depending on where you appear to be, the 80 stops reading as a price and starts reading as a test.",
          },
          { kind: "h", text: "Freeletics" },
          {
            kind: "p",
            text: "Account wall at screen 3, before a single personalisation question.",
          },
          {
            kind: "quote",
            text: "before you can see your personally selected program, you have to input data such as your stats, goals etc, then you give your email address. All of this before you can see the plans, which you can't actually see because this is a pay app. I was able to x out of that only to be booted back to the height, weight, birthdate data collecting again.",
            source: "Play, 1 star, v24.10.0, 91 votes",
          },
          {
            kind: "p",
            text: "That is a closed loop. Dismissing the paywall returns the user to data-collection screens they already completed. A separate review reports the Training Journey equipment step looping back to the start of journey selection with no error message and no exit.",
          },
          { kind: "h", text: "Fitbod" },
          {
            kind: "p",
            text: "Highest onboarding-language rate in the set, 29 of 1,047, and the complaints are specific.",
          },
          {
            kind: "quote",
            text: "I just spent 90 minutes excluding exercises one by one because I have trigger finger and can't do anything grip-heavy until it heals. That's roughly 200+ exercises. There is no bulk select. There is no exclude entire muscle group option. There is no filter by equipment requirement or grip requirement.",
            source: "iOS, 1 star, v8.17.0",
          },
          {
            kind: "p",
            text: "This is the accessibility finding the brief asked for, and it is not the one I expected. Not contrast, not screen readers. A motor-accessibility failure caused by a missing bulk action, downstream of a flow that asks in detail what you can do and never once what you cannot. A temporary injury is the most common reason a person redesigns their training, and it has no field anywhere in the setup.",
          },
          { kind: "h", text: "Strava" },
          {
            kind: "quote",
            text: "the worst part is the Share setting. It is automatically enabled to the Everyone setting and there is no way to know that, until you inadvertently post your first run by saving it. I'm coming back from an injury and am currently so slow I can't keep up with my running group. seeing my worst times posted for all the world to see made me want to give up rather than keep going.",
            source: "iOS, 1 star, v81.0.0",
          },
          {
            kind: "p",
            text: "The most consequential setting in the product is configured during onboarding and never shown to the person it affects.",
          },
          { kind: "h", text: "Noom" },
          {
            kind: "quote",
            text: "I've used Noom for 5 years. I got logged out of the app and when I went to sign back in the app made me complete the entire enrollment and personality quiz again. I couldn't get back to my old info without completing it.",
            source: "iOS, 1 star, v13.24.0",
          },
          {
            kind: "p",
            text: "From the teardown rather than reviews: the plan-building sequence displays seven category progress bars filling toward 100% while interleaving yes or no questions. The teardown's own annotation notes that no matter the answers, the questions stay the same, and exist to break up the loading. The bars advance on a timer.",
          },
          { kind: "h", text: "What the three corpora agree on" },
          {
            kind: "list",
            items: [
              "Money and access dominate. Billing language outnumbers onboarding language by roughly ten to one in every corpus, for every app.",
              "The complaints that do name onboarding are all the same complaint. Data collected before value delivered, price disclosed after. Different apps, one shape.",
              "Nobody complains about length. Not one review in 7,275 says the questionnaire was too long. They say they handed over their data and got a paywall.",
              "The returning user is systematically neglected. Noom's forced re-quiz, Strava's login-into-signup loop, Freeletics' post-paywall bounce back to data collection, MyFitnessPal's re-installers finding a different product. Four apps, four versions of the same missing door.",
            ],
          },
        ],
      },
      {
        id: "literature-notes",
        title: "Literature notes: habit formation and onboarding friction",
        summary:
          "The sources behind the five principles, including the three claims I went looking for and could not stand behind.",
        blocks: [
          { kind: "h", text: "Verifying the sources named in the brief" },
          {
            kind: "p",
            text: "One trade blog article was real but misdated in the brief, and its headline statistic, nearly 90% of users abandon fitness apps within 30 days, is uncited. It is a development agency's marketing blog. The framing is useful and matches what I observed. The number is not evidence, so I use the framing and cite academic sources for the numbers.",
          },
          {
            kind: "p",
            text: "Sheen et al. 2025 in the British Journal of Health Psychology is real but is not a churn study. It analysed 58,881 posts referencing the five most profitable fitness apps, filtered to 13,799 negative-sentiment posts. Its themes are difficulty quantifying diet and activity, oversimplified tracking, technical malfunction, aversive response to notifications, and shame.",
          },
          {
            kind: "quote",
            text: "some users noted feelings of shame, disappointment and demotivation, and subsequent disengagement with apps and health behaviors.",
            source: "Sheen et al. 2025",
          },
          {
            kind: "p",
            text: "The honest read: this is a study of in-product harm, not of onboarding churn. It is relevant for exactly one reason, and it is a good one. It establishes that disengagement in this category is emotionally mediated, not just friction-mediated. People do not only quit because something is hard. They quit because it made them feel bad. That matters for how you sequence weight and body questions. It does not support any claim about screen counts.",
          },
          {
            kind: "p",
            text: "Kidman, Curtis, Watson and Maher 2024, a scoping review in the Journal of Medical Internet Research, is the breakdown the brief was looking for. 18 studies, 525,824 participants, published 2014 to 2022.",
          },
          {
            kind: "table",
            head: ["Domain", "Abandonment"],
            rows: [
              ["Smoking", "40%"],
              ["Physical activity", "54 to 75%"],
              ["Diet", "86%"],
              ["Mental health", "89 to 92%"],
              ["Alcohol", "95 to 97%"],
            ],
          },
          {
            kind: "quote",
            text: "a median of 70% of users discontinued use within the first 100 days.",
            source: "Kidman et al. 2024",
          },
          {
            kind: "quote",
            text: "User experience issues such as being difficult or confusing to use were most consistently identified as being crucial to app abandonment.",
            source: "Kidman et al. 2024",
          },
          {
            kind: "p",
            text: "Note that it breaks down by domain and reason, not by named app. No peer-reviewed study I found breaks abandonment down by named commercial app, and I would be suspicious of one that claimed to.",
          },
          { kind: "h", text: "The most useful number in the whole review" },
          {
            kind: "p",
            text: "Zakrzewska et al. 2025 ran survival analysis on 3,034 users of a fitness app over six months. Peak hazard occurred within 1 to 2 weeks, after which dropout probability stabilised, and retention differed significantly by activity level, with sedentary users disengaging earliest.",
          },
          {
            kind: "p",
            text: "The people most likely to quit in week one are the sedentary ones. Those are also the people every one of these five onboarding flows interrogates most heavily, because low reported fitness triggers more clarifying questions. The flow puts the most friction in front of the users with the least tolerance for it.",
          },
          { kind: "h", text: "The behavioural science frameworks" },
          {
            kind: "p",
            text: "Fogg's behaviour model. Behaviour equals motivation times ability times prompt, and occurs only when all three converge above the action line. Applied to install day: motivation is at its lifetime peak at the moment of install and decays from there, while ability is at its lifetime floor. Standard onboarding spends the motivation peak on tasks that do not raise ability. The sharpest version of this in my sample is MyFitnessPal, which ships two logging paths that take about five seconds and puts a fourteen-input form in front of both.",
          },
          {
            kind: "p",
            text: "Eyal's Hook Model. Trigger, action, variable reward, investment. The order is load-bearing. Investment is the fourth step, and its function is to load the next trigger, not to gate the first action. Every flow in my sample inverts this. An onboarding questionnaire is investment, and investment placed before the first action has nothing to compound.",
          },
          {
            kind: "p",
            text: "Self-Determination Theory. The non-obvious corollary, and the one I build a principle on: autonomy requires that a choice be consequential. A choice that does not change the output is not neutral. It is worse than no choice, because it teaches the user that their input does not matter, which is a competence violation on top of an autonomy violation. Noom's plan-building loader is a clean instance: questions asked, answers ignored, progress bars advancing on a timer.",
          },
          {
            kind: "p",
            text: "The Fresh Start Effect, from Dai, Milkman and Riis 2014. Temporal landmarks drive aspirational behaviour, and fitness apps are downloaded disproportionately at landmarks. Every flow in my sample then routes the user to now as the only start time, and every one requests notification permission with no reason attached. This did not become a principle because it is a gap rather than a failure: I can show that none of the five apps does it and that the effect exists, but I have no evidence that any app tried it and gained anything.",
          },
          {
            kind: "p",
            text: "The Peak-End Rule. Duration neglect is good news for long onboarding, and every growth team knows it. It is why 113 screens can convert. But the rule cuts both ways, and the second edge is the one that gets ignored: if the price reveal is both the emotional peak and the end of the flow, then the price reveal becomes the remembered experience. This predicts exactly the review pattern I found.",
          },
          {
            kind: "p",
            text: "The Endowed Progress Effect, from Nunes and Dreze 2006. The car wash study: 300 customers, two loyalty cards requiring identical real effort. An 8-stamp card, or a 10-stamp card with 2 stamps pre-filled. Completion over 9 months was 19% against 34%. Endowed progress works when the endowment is real. Noom's loader is the counterfeit version. The car wash actually stamped the card. It did not display a stamp animation while recording nothing.",
          },
          { kind: "h", text: "What the literature does not support" },
          {
            kind: "list",
            items: [
              "A published per-app abandonment breakdown. Does not exist in peer-reviewed form. Vendor benchmarks are unaudited and self-interested.",
              "A causal link between onboarding length and churn. Nobody has run it. Noom's 113 screens demonstrably convert. Anyone claiming shorter onboarding causes higher retention is extrapolating.",
              "Accessibility-specific onboarding research for fitness apps. I found none. The Fitbod 200-tap finding is, as far as I can tell, undocumented in any literature. That is a gap, and a reasonable thing to test next.",
            ],
          },
          {
            kind: "table",
            caption: "Which framework backs which principle",
            head: ["Principle", "Primary source", "Secondary"],
            rows: [
              ["1. The First Rep", "Fogg, behaviour equals motivation times ability times prompt", "Eyal, Hook Model step order"],
              ["2. Ask Nothing the Phone Knows", "Fogg, ability axis", "Nunes and Dreze, endowed progress"],
              ["3. The Sunk-Cost Curtain", "Kahneman, peak-end rule", "The review corpus, where billing outnumbers onboarding roughly ten to one"],
              ["4. Consent Is Not a Toll Gate", "Deci and Ryan, autonomy", "Kidman et al., privacy as one of six abandonment categories"],
              ["5. The Returning-User Door", "Nielsen heuristic 7, accelerators", "Kidman et al., difficult or confusing to use"],
            ],
          },
        ],
      },
      {
        id: "evaluation-tables",
        title: "All evaluation tables",
        summary:
          "The heuristic evaluation itself: every app, every violation, its severity, and the evidence behind it.",
        blocks: [
          {
            kind: "p",
            text: "Five mainstream fitness apps. Heuristic evaluation of onboarding, August 2026. Nielsen's severity scale, 0 not a problem through 4 catastrophe. Three to four heuristics per app, chosen for relevance rather than swept across all ten.",
          },
          { kind: "h", text: "Selection" },
          {
            kind: "table",
            head: ["App", "Why it is in the set", "US iOS ratings"],
            rows: [
              ["MyFitnessPal", "Largest install base in the category. Shipped a redesign in April 2026 that dropped its update rating from 3.24 to 1.54.", "4.71 / 2,347,805"],
              ["Noom", "The documented extreme. A published April 2026 teardown puts the flow at up to 113 screens.", "4.70 / 869,376"],
              ["Freeletics", "Account wall at screen 3, before any personalisation. The opposite sequencing choice from Noom.", "4.64 / 22,228"],
              ["Fitbod", "Question-heavy but skippable throughout, and it produces a real artifact at the end.", "4.81 / 279,192"],
              ["Strava", "Not a plan builder. Onboarding is permissions, social graph and privacy defaults.", "4.81 / 365,807"],
            ],
          },
          {
            kind: "note",
            text: "No swap was needed. Two apps were pulled in and dropped before evaluation: one had no screen-by-screen flow findable across three source types, and the other yielded four usable screens. Both were dropped rather than evaluated on partial evidence, and their assets deleted.",
          },
          {
            kind: "note",
            text: "On the time estimates. Derived from screen counts, not stopwatched, since I could not install the apps. Tap-only screens costed at 6 to 8 seconds, text entry at 15 to 20, reading-heavy interstitials at 10. Noom's figure is the teardown's measured 10 to 15 minutes across roughly 20 tested paths, and is the only measured number in the column. Treat the rest as ranked ordinals.",
          },
          { kind: "h", text: "MyFitnessPal" },
          {
            kind: "table",
            head: ["Heuristic violated", "What happens", "Severity"],
            rows: [
              ["H2. Match between system and real world", "The Data Consents screen demands acceptance of all consents to create an account, then one line later states consent can be withdrawn at any time. Two substantive consents and one marketing toggle are styled identically. On the next screen, step tracking arrives pre-checked while the other two toggles do not.", "4"],
              ["H7. Flexibility and efficiency of use", "Fourteen inputs before the first logged food. Nine of them are already on the phone. The app already integrates with the platform health store.", "4"],
              ["H8. Aesthetic and minimalist design", "Three consecutive full-screen Premium panels between account creation and the diary, each with the same call to action. Five value-carousel panels before it. Roughly 500px of empty space on every question screen, where three questions would fit on one.", "3"],
              ["H3. User control and freedom", "Mandatory account at screen 7 of 18. No guest mode, no path to log one food or search the database before handing over an email.", "3"],
            ],
          },
          { kind: "h", text: "Noom" },
          {
            kind: "table",
            head: ["Heuristic violated", "What happens", "Severity"],
            rows: [
              ["H1. Visibility of system status", "The plan-building sequence displays seven category progress bars filling toward 100% while interleaving yes or no questions. The bars advance on a timer. The answers are discarded.", "4"],
              ["H7. Flexibility and efficiency of use", "Skip exists only on peripheral steps. The core question spine has none, no accelerator, and no returning-user bypass: an authenticated five-year subscriber was forced through the full enrollment quiz to reach their own data.", "4"],
              ["H3. User control and freedom", "Email gated roughly one third in, before any personalised result. Price disclosed only at the end, after 10 to 15 minutes. Abandoning discards everything.", "3"],
              ["H8. Aesthetic and minimalist design", "Multiple full screens carry no input and no new information. A trust screen cites a number of people helped, footnoted as of October 2021, in a flow captured April 2026.", "3"],
            ],
          },
          { kind: "h", text: "Freeletics" },
          {
            kind: "table",
            head: ["Heuristic violated", "What happens", "Severity"],
            rows: [
              ["H3. User control and freedom", "Account creation at screen 3, before any personalisation question and before any product exposure. No guest path, no skip, and no free tier behind the wall.", "4"],
              ["H5. Error prevention", "The Training Journey equipment step loops back to the start of journey selection on any input, with no error message and no exit. Dismissing the paywall returns the user to data-collection screens already completed. The age gate rejects birth years after 2007 only after the date is entered, on an app the store lists as suitable for 4 and up.", "4"],
              ["H1. Visibility of system status", "No step counter anywhere. Loading Coach information is an indeterminate spinner. Two full-screen paywalls appear without warning at 15 and 19.", "3"],
              ["H4. Consistency and standards", "Notification permission requested twice in one session with identical copy, plus a separate tracking prompt.", "2"],
            ],
          },
          { kind: "h", text: "Fitbod" },
          {
            kind: "table",
            head: ["Heuristic violated", "What happens", "Severity"],
            rows: [
              ["H7. Flexibility and efficiency of use", "Onboarding collects what the user can do and never what they cannot. No injury or restriction input exists. Correcting the plan requires excluding exercises one at a time: no bulk select, no muscle-group exclusion, no grip or equipment filter. One user reported 200 plus toggles across 90 minutes.", "4"],
              ["H3. User control and freedom", "The generated workout is displayed and then gated. An account wall at 13 and a modal terms acceptance at 14 sit between here is your workout and starting it.", "3"],
              ["H2. Match between system and real world", "The main reason for joining question offers six aspirational options. None matches the two most common real triggers: an injury to train around, and a program that stopped working.", "2"],
            ],
          },
          {
            kind: "note",
            text: "Fitbod is the best-behaved flow in the set on progressive disclosure: skip is present on nearly every question screen, progression dots are visible, and the flow ends in a real artifact rather than a promise. Its severity 4 failure is about what the flow declines to ask.",
          },
          { kind: "h", text: "Strava" },
          {
            kind: "table",
            head: ["Heuristic violated", "What happens", "Severity"],
            rows: [
              ["H1. Visibility of system status", "Activity privacy defaults to Everyone. Set during onboarding, never displayed. Discovered by saving a first run and finding it published.", "4"],
              ["H3. User control and freedom", "An existing user attempting to log in is routed into account creation with no exit and no account not found message. Deletion cannot be completed in-app.", "3"],
              ["H9. Help users recognise, diagnose and recover from errors", "The login versus signup failure produces no diagnosis. One user deleted and reinstalled to escape the signup flow, then landed back on the same tab.", "3"],
              ["H4. Consistency and standards", "Full-screen subscription offer at screen 6, mid-setup, before location permission and before anything is recorded. Its dismissal is a small nav-bar Skip, styled unlike every other secondary action in the flow.", "2"],
            ],
          },
          { kind: "h", text: "Cross-app summary" },
          {
            kind: "table",
            head: ["App", "Worst violation", "Cliff Index", "Core problem in one sentence"],
            rows: [
              ["Noom", "H1. Visibility of system status", "79.0", "Fifteen minutes of questions produce a projection rather than the product, and some of the progress shown is fabricated."],
              ["MyFitnessPal", "H2 and H7", "61.5", "It asks fourteen things, nine of which the phone already knows, and gates the account on accepting every consent."],
              ["Freeletics", "H3. User control and freedom", "60.6", "The account wall lands at screen 3 and there is nothing free behind it."],
              ["Fitbod", "H7. Flexibility and efficiency", "58.1", "Setup asks exhaustively what you can do and never what you cannot, so correcting it costs 200 taps."],
              ["Strava", "H1. Visibility of system status", "48.5", "The most consequential setting in the product is configured during onboarding and never shown."],
            ],
          },
          { kind: "h", text: "Worst offender, and why I redesigned a different one" },
          {
            kind: "p",
            text: "Noom has the worst cliff. 79.0 on the Cliff Index, two severity 4 violations, and the only case where a violation is deliberate rather than neglectful: the plan-building loader shows progress that is not real and asks questions whose answers are discarded.",
          },
          {
            kind: "p",
            text: "I redesigned MyFitnessPal. Three reasons, and none of them is that it is worse. It is the most avoidable cliff in the set, at 64% against 42, 38 and 16 for the others. It is the largest app in the category, at 2.35 million US iOS ratings against Noom's 869 thousand, so the same percentage improvement is worth roughly 2.7 times as much. And its destination is on fire: version 26.16.0 dropped the update rating from 3.24 to 1.54 across roughly 991,000 reviews.",
          },
        ],
      },
      {
        id: "design-system-extraction",
        title: "Design system extraction: MyFitnessPal",
        summary:
          "Colour, type, spacing and components reconstructed from screenshots so the redesign could be drawn in the app's own language.",
        blocks: [
          {
            kind: "note",
            text: "Reconstructed from captured screenshots, not from published documentation. Colours are sampled from pixel data. Type and spacing are measured off renders and are approximate. Enough to build convincing high-fidelity work. Not a spec.",
          },
          { kind: "h", text: "The brand blue changed" },
          {
            kind: "table",
            head: ["Era", "Hex", "Where sampled"],
            rows: [
              ["2020", "#006ABA", "Onboarding flow captures"],
              ["2026, current", "#0066EE", "Current store previews"],
            ],
          },
          {
            kind: "p",
            text: "Same family, different temperature. The current blue is brighter and more saturated, and it reads as electric rather than corporate. Most reconstructions still use the old one.",
          },
          { kind: "h", text: "Colour" },
          {
            kind: "table",
            head: ["Token", "Hex", "Use"],
            rows: [
              ["blue", "#0066EE", "Primary action, active tab, accent, full-bleed marketing"],
              ["blue-tint", "#3576F4", "Overlay variant on imagery"],
              ["blue-wash", "#EAF1FE", "Selected row fill, info surface"],
              ["ink", "#0D0D0D", "Primary text. Neutral near-black, no warmth"],
              ["ink-60", "rgba(13,13,13,0.60)", "Secondary text, units, captions"],
              ["ink-40", "rgba(13,13,13,0.40)", "Placeholder, disabled label"],
              ["canvas", "#F6F7F9", "Screen background behind cards"],
              ["surface", "#FFFFFF", "Card and sheet fill"],
              ["border", "#E5E5E5", "Card border, divider, input rest state"],
              ["good", "#12A150", "Food quality indicator, positive delta"],
              ["carbs / fat / protein", "#7C5CFF / #F2A93B / #E5484D", "Macro bars"],
            ],
          },
          {
            kind: "p",
            text: "Contrast. White on the brand blue is about 4.4:1, which passes AA for normal text and fails AAA. Ink on canvas is about 18:1. The one real risk in the system is the 40% ink used for placeholder text on white, at roughly 2.6:1, which fails AA. The redesign avoids relying on placeholders to carry meaning.",
          },
          { kind: "h", text: "Typography" },
          {
            kind: "p",
            text: "Not published, and font metadata is not readable from a screenshot. Measured from glyph shapes: a tight geometric grotesque with a large x-height and short descenders. Line height around 1.4 on body, 1.2 on headings and metrics.",
          },
          {
            kind: "table",
            head: ["Role", "Size", "Weight", "Tracking"],
            rows: [
              ["Marketing display", "34 to 40px", "700", "-0.02em"],
              ["Screen title", "24px", "700", "-0.02em"],
              ["Question or H1", "22px", "700", "-0.015em"],
              ["Card heading", "15px", "600", "-0.01em"],
              ["Body", "15px", "400", "0"],
              ["Metric, large", "28px", "700, tabular", "-0.01em"],
              ["Label, uppercase", "11px", "600", "+0.06em"],
              ["Caption", "12px", "400", "0"],
            ],
          },
          { kind: "h", text: "The question screen pattern the redesign replaces" },
          {
            kind: "p",
            text: "Nav bar with a back chevron, a centred title, and a forward arrow at top right. Segmented progress under it. One question, centred, 17px. Two to four full-width option rows or one input. Then roughly 500px of empty space. No footer button, no skip, no explanation of what the answer does. The empty space is the finding: three of these screens fit comfortably on one.",
          },
          {
            kind: "p",
            text: "The onboarding progress bar fill is green, not brand blue, which is the only place in the flow where green is not a food-quality signal. And selected option rows fill the whole row with brand blue, so chosen reads as pressed.",
          },
          { kind: "h", text: "What the redesign keeps and changes" },
          {
            kind: "p",
            text: "Keeps: the palette, the 50px blue pill, the 16px card on canvas, the tabular metric treatment, the day strip, the food-quality dot, the macro colours, the tab bar.",
          },
          {
            kind: "p",
            text: "Changes: the green onboarding progress bar goes, because green means food quality everywhere else in the product. Selected option rows go from full blue fill to a blue border with a wash fill, so chosen stops looking like pressed. Placeholder text stops carrying meaning, for contrast reasons. The eight-segment progress bar becomes a plain step count, because six steps do not need segmenting.",
          },
          {
            kind: "note",
            text: "The central fact the redesign turns on: MyFitnessPal already ships a logging path that takes about five seconds, meal scan and voice, both reachable in two taps once you are inside the app. Onboarding puts a fourteen-input form in front of it.",
          },
        ],
      },
    ],
  },

  {
    id: "threadline-research",
    title: "Threadline: what the evidence said, including where it contradicted me",
    kind: "Secondary research and competitive audit",
    date: "2026",
    summary:
      "Eight apps audited hands on, one peer-reviewed study of 5,953 reviews, and five claims I retracted from my own write-up.",
    facts: [
      { value: "5,953", label: "reviews in the study I leaned on" },
      { value: "34%", label: "of negative reviews were about pricing" },
      { value: "8", label: "apps audited hands on" },
      { value: "5", label: "claims retracted" },
    ],
    links: [
      { href: "#work/threadline", label: "The product this came out of" },
      {
        href: "https://www.figma.com/design/8zM6wy1k9kJXzKFYKOIKfY/Threadline?node-id=0-1",
        label: "The design file",
      },
    ],
    blocks: [
      { kind: "h", text: "Cost per wear as an interface, validated" },
      {
        kind: "p",
        text: "Eckmann and Reisch, Shifting Toward Quality: How Communicating Cost per Wear Influences Consumer Preference for Clothing, in Psychology and Marketing, 2026. Six online experiments. The release does not state a participant count, so I do not quote one.",
      },
      {
        kind: "p",
        text: "Showing cost per wear increased preference for higher-quality clothing even at higher upfront prices, with the effect strongest when items could be compared side by side. The authors propose cost per wear as an analogue to supermarket unit pricing.",
      },
      {
        kind: "quote",
        text: "Cheap fast fashion suddenly appears more expensive due to its higher cost per wear and quality pieces are viewed as better financial investments, not just greener choices.",
        source: "University of Bath announcement, 29 October 2025",
      },
      {
        kind: "note",
        text: "Why it matters for Threadline. This is peer-reviewed validation of the app's core mechanic, and specifically of the comparison framing, which is exactly what the purchase check does when it projects cost per wear at 10 and 30 wears against your category average. Coverage of the paper also notes that many consumers still choose the higher cost per wear option because they cannot afford the better upfront price, which is the honest ceiling on what this interface can do.",
      },
      { kind: "h", text: "What wardrobe apps actually get criticised for" },
      {
        kind: "p",
        text: "Jiang and Macintyre, Wardrobe Management Apps and Their Unintended Benefits for Fashion Sustainability and Well-Being, in Sustainability 2025. A content analysis of 27 wardrobe apps plus a thematic analysis of all 5,953 user reviews. The only peer-reviewed study of this app category I could find.",
      },
      {
        kind: "list",
        items: [
          "Dominant complaint: 34% of all 466 negative user reviews criticised high subscription costs, hidden paywalls, and limited access to essential features.",
          "Behaviour change is real: 470 of 5,953 users reported behavioural shifts related to reduced overconsumption and increased garment utilisation. Within that, 194 formed sustainability habits, 123 increased use of existing garments, and 78 reduced impulse buying.",
          "Cost per wear metrics and second-hand marketplace integrations particularly motivated users to make intentional fashion choices.",
        ],
      },
      {
        kind: "note",
        text: "It cuts against my own framing. I assumed setup friction was the category's main failure. The data says pricing is. It also supports the feature I built: cost per wear is named as a motivating metric.",
      },
      { kind: "h", text: "Found but not verified" },
      {
        kind: "p",
        text: "A second peer-reviewed paper on this category exists and I have read only search-engine snippets of the abstract, because the publisher page refuses automated fetching and the full text is paywalled. Two searches returned the same twelve-name author list, and I could not confirm it against the publisher, so I do not trust it second-hand. Listed here as unverified on purpose. If asked about research in this space, the honest answer is that there is one paper I have read in full and one I have only located. Naming the difference is worth more than pretending to two.",
      },
      { kind: "h", text: "Industry data" },
      {
        kind: "p",
        text: "Indyx, from 10 million plus digitised items in tracked closets: the average wardrobe has 166 total items, with 25% going totally unworn in the past year, and the average item has only been worn 10 times, or just 7 times for clothing. Caveat to state out loud: this is first-party data from a competitor's app, published on their own blog. Cite it as such.",
      },
      {
        kind: "p",
        text: "Ellen MacArthur Foundation, 2017: clothing utilisation, the average number of times a garment is worn before it ceases to be used, has decreased by 36% compared to fifteen years earlier. More than 500 billion dollars of value is lost annually to clothing barely worn and rarely recycled.",
      },
      {
        kind: "p",
        text: "WRAP, 2012: around 30% of clothing in the average wardrobe has not been worn for at least a year, and the average UK household owns around 4,000 pounds worth of clothes.",
      },
      {
        kind: "p",
        text: "US Bureau of Labor Statistics, Consumer Expenditures 2024: average annual expenditure per consumer unit is 78,535 dollars, of which apparel and services is 2,001 dollars, or 2.5%, and roughly seventh. Apparel is a small share of household spending. That is the argument for Threadline, not against it: the waste is invisible at the per-item level, which is why the app measures cost per wear rather than a monthly clothing budget.",
      },
      { kind: "h", text: "A year of tracking every item worn" },
      {
        kind: "p",
        text: "A developer tracked every garment she wore for a full year and wrote it up. The most directly relevant account I found, and genuinely two-sided.",
      },
      {
        kind: "quote",
        text: "In hindsight, tracking everything constrained my creativity and expression a little.",
        source: "Alam-Naylor, January 2026",
      },
      {
        kind: "quote",
        text: "If I was in a rush and I didn't have the time to create a new outfit in the app, I would instead reach for an outfit that already existed in the app so I could assign it to the day in a couple of clicks, rather than wear what I actually wanted to wear.",
        source: "Alam-Naylor, January 2026",
      },
      {
        kind: "p",
        text: "The benefit: she wore 90% of her wardrobe during the year and spent 45% less on clothes than the year before. So the honest reading is that it worked and cost something.",
      },
      {
        kind: "note",
        text: "This is the sharpest available critique of the product category Threadline is in, that logging can flatten the thing it measures. It should be quoted against the product, not for it.",
      },
      { kind: "h", text: "Setup effort" },
      {
        kind: "quote",
        text: "I've spent at least 10 hours photographing my entire wardrobe, and I'm not even halfway done.",
        source: "A blogger reviewing Stylebook, 2014",
      },
      {
        kind: "p",
        text: "One blogger, from 2014. It is the only concrete setup-time figure I could find anywhere, and it is an anecdote, not a range and not a study.",
      },
      { kind: "h", text: "The competitive audit" },
      {
        kind: "table",
        head: ["App", "Pricing", "Key insight", "Weakness"],
        rows: [
          ["Stylebook", "4.99 one-time", "Cost per wear is a wanted metric but manual cataloging kills adoption.", "Setup takes 1 to 3 hours. UI feels dated. No incentive to update."],
          ["Indyx", "12.99/mo or 74.99/yr", "Analytics without action is useless. Data alone does not change behaviour.", "Paid analytics provide no actionable insights. Expensive."],
          ["Whering", "Free, ad-supported", "Widest adoption of any direct competitor, so friction here is friction at scale. Sustainability framing has not translated into an intervention at the point of purchase.", "Recurring reports of crashes and slow performance during bulk uploads."],
          ["Cladwell", "7.99/mo", "Opinionated about capsule lifestyle, which alienates users with larger wardrobes.", "50 to 100 item limit. Free tier gives one outfit a day."],
          ["Acloset", "4.99/mo", "Feature breadth without depth. Doing ten things at 60% loses to three things at 95%.", "AI outfit recommendations are nonsensical. Marketplace has no activity."],
          ["Smart Closet", "Free with in-app purchases", "Social features distract from the core problem. Users want to dress better, not post about it.", "Heavy social focus over utility. No analytics or cost tracking."],
          ["Alta", "Free, affiliate funded", "Affiliate-funded wardrobe apps will always push consumption over conservation.", "Business model conflict: it makes money when you buy more."],
          ["Wardrowbe", "Free, open source", "Privacy and family features are underexplored. Household wardrobe management is a real opportunity.", "Requires technical knowledge. Small user base. Basic feature set."],
        ],
      },
      { kind: "h", text: "Designer observations, not findings" },
      {
        kind: "p",
        text: "Stated separately so they are never mistaken for evidence. Every wardrobe app I tried required photographing garments before becoming useful. Cataloguing apps show you a dashboard but do not intervene at the moment of purchase. A pre-purchase check is the gap none of them fill. All three come from my own trial of the eight apps above, and none of them is sourced to anything else.",
      },
      { kind: "h", text: "The search results for this category are almost entirely marketing" },
      {
        kind: "p",
        text: "Re-scanned August 2026. A query for the state of the wardrobe-app market returns, on the first page, ten best wardrobe apps listicles, and nine of them are published on the blog of a wardrobe app that appears in its own ranking.",
      },
      {
        kind: "p",
        text: "This is not a throwaway observation. It is the most likely mechanism for the fabricated claims recorded below: the phrasing of the number one reason users abandon wardrobe apps reads exactly like these pages, none of which cite anything. The category has a large volume of confident, uncited, commercially motivated writing and almost no primary research, so anything absorbed from a general search of it should be treated as marketing copy until traced to a source.",
      },
      {
        kind: "p",
        text: "Practical rule for this project: for competitor facts, use the app's own pricing page or store listing and date the check. For anything about user behaviour, use the peer-reviewed papers above or say there is no source.",
      },
      { kind: "h", text: "Retracted claims" },
      {
        kind: "p",
        text: "Recorded rather than deleted, because these are the ones an interviewer would probe.",
      },
      {
        kind: "table",
        head: ["Claim previously made", "Status"],
        rows: [
          ["The number one reason users abandon wardrobe apps is the setup wall", "Retracted, contradicted. No published data ranks causes of wardrobe-app abandonment. Jiang and Macintyre found pricing was the top complaint. The phrasing also closely matches unsourced marketing blogs run by competing wardrobe apps, which is where I most likely absorbed it."],
          ["Digital tracking users wear 69% of their wardrobe against a 30% average", "Retracted, fabricated. Neither figure appears in the paper it was attributed to. The popular we only wear 20 to 30% of our wardrobe line is folklore and inverted: WRAP found about 30% goes unworn, so about 70% is worn."],
          ["Setup times range from 15 minutes to 3 plus hours", "Retracted, invented, and it understated the only real evidence, which is 10 plus hours."],
          ["A verbatim quote attributed to a blogger about defaulting to pre-logged outfits", "Retracted, fabricated. She never wrote that sentence. Her real post says something close in her own words, and that is quoted above with a link."],
          ["Utilization has the strongest correlation with behaviour change, used to justify the health score's 40% weighting", "Retracted, no such study. Found in the August 2026 audit, in both the requirements document and the case study, stated as a finding. The 40, 35, 25 split is an untested prior. The defensible argument for it is that utilization is the only one of the three a user can act on directly, which is a judgement and is now written as one."],
        ],
      },
    ],
    docs: [
      {
        id: "threadline-drd",
        title: "Design requirements: the parts that were measured",
        summary:
          "The principles, the three contrast rules that came out of measuring, and an audit of what the spec claimed against what shipped.",
        blocks: [
          { kind: "h", text: "Design principles" },
          {
            kind: "list",
            items: [
              "Effortless first. If an interaction takes more than 5 seconds, it is too slow. Logging and browsing must feel instant.",
              "Patterns over numbers. Show trends, relationships and gaps, not just raw data points.",
              "Warm, not clinical. This is a personal tool, not a spreadsheet. It should feel like a well-designed notebook.",
              "Financial clarity. Money is always shown in dollars, not abstract scores. Specificity builds trust.",
              "No guilt. The app observes and suggests. It never shames. This item has not been worn in 3 months, not you are wasting this item.",
            ],
          },
          { kind: "h", text: "The visual direction" },
          {
            kind: "p",
            text: "Butter yellow and denim blue on cream. Both are clothing references, so the palette argues for the product rather than decorating it. Warm, editorial, considered. Paper rather than software. Item photos are the primary visual element, but photoless is the common case, so placeholders are tinted with the garment's recorded colour instead of rendering as identical grey squares.",
          },
          {
            kind: "p",
            text: "The ink rule. Pastels are high-lightness by definition, so they can only ever be fills. Every text-bearing colour ships a darkened or lightened ink variant. Every ratio is measured, and a test recomputes all of them from the shipping token values on every run, so a regression fails the build.",
          },
          { kind: "h", text: "Three rules that came out of measuring" },
          {
            kind: "list",
            items: [
              "Accent inks never sit on pastel fills. Measured 3.40:1 on butter and 2.65:1 on sky. Pastel fills carry primary text; inks are for neutral surfaces only.",
              "A fill identical in both appearances gets a fixed ink. Adaptive primary text on mustard measured 1.49:1 in dark mode, because the text flipped while the fill did not.",
              "Three graphical values in a two-hue palette top out at 2.09:1 against each other while also clearing a subtle track. So the score is three concentric arcs with individual tracks, each clearing at least 4.75:1 against its own track, and identification comes from position and the legend rather than from hue. Colour is redundant, not load-bearing.",
            ],
          },
          { kind: "h", text: "Accessibility requirements" },
          {
            kind: "list",
            items: [
              "Item photos: VoiceOver reads black wool coat, worn 12 times, 8 dollars per wear.",
              "Health score ring: VoiceOver reads wardrobe health score, 72 out of 100, good.",
              "Filter chips: VoiceOver reads filter by tops, currently showing all categories.",
              "All charts accessible via the platform audio graph.",
              "Dynamic Type tested at default, large and the first accessibility size.",
              "All touch targets at least 44 by 44 points.",
            ],
          },
          { kind: "h", text: "Specified but not shipped" },
          {
            kind: "p",
            text: "Audited August 2026 by reading each claim in the requirements document back against the code. Recorded rather than quietly corrected, because a spec that overstates the build is the same failure as a citation that overstates a source.",
          },
          {
            kind: "table",
            head: ["Documented", "What actually ships"],
            rows: [
              ["A seasons field on the clothing model, with seasonal items handled separately", "The property exists and the seeder sets it. No view reads it. Nothing in the UI filters, groups or explains anything by season."],
              ["Stored items are excluded from utilization calculations", "True in the sense that analytics filter to active items, but nothing in the app can set the stored status. The status has a display name and no route to it, so the exclusion never fires."],
            ],
          },
          {
            kind: "p",
            text: "The seasons gap is the one worth acting on. The demo data leans on it implicitly: the wool overcoat reads as an underperformer at 95 days unworn when the real explanation is that it is August, and the app has the data to say so and does not. That is the most obvious next design problem in this product, and it is a better answer to what would you do next than any of the features that were cut.",
          },
          {
            kind: "note",
            text: "The same audit also corrected roughly a dozen places where the document still described an earlier build: indigo selection borders, a native alert on the outfit-logged path, a full-screen overlay on archive, a last-ten wear list where the heatmap now is, the purchase check as a card on Today, and a four-card stats row. Those were fixed in place rather than listed, because unlike the rows above they were out of date rather than overstated.",
          },
        ],
      },
    ],
  },

  {
    id: "kyros-audit",
    title: "Heuristic audit of a two-sided booking app",
    kind: "Design audit",
    date: "June 2026",
    summary:
      "Seventy findings across a consumer app and a partner app, sorted into four severity tiers.",
    facts: [
      { value: "70", label: "findings documented" },
      { value: "2 / 16", label: "critical and major" },
      { value: "35 / 17", label: "moderate and minor" },
      { value: "2", label: "apps, consumer and partner" },
    ],
    blocks: [
      {
        kind: "p",
        text: "A friend is building Kyros, a fitness booking platform with two companion apps. The consumer app is for finding and booking gym sessions: you browse centres near you, open a gym, pick a session, and get a QR code to show at the door. The partner app is for the gym owners on the other side of that booking, who scan the code to check you in, manage the day's arrivals, and track earnings. It is still in development.",
      },
      {
        kind: "p",
        text: "They asked me to audit it before release, so I ran a heuristic evaluation alongside functional QA across both apps: onboarding and sign-in, the home and discovery screens, the booking flow, notifications, settings, theming, and the partner dashboard.",
      },
      {
        kind: "p",
        text: "Every finding is tagged to the principle it breaks, mostly Nielsen's heuristics plus the platform guidelines, and sorted into four tiers. Critical means a crash or a blocked flow and has to be fixed before release. Major means a broken feature or something that erodes trust. Moderate is inconsistency and missing feedback. Minor is backlog.",
      },
      {
        kind: "p",
        text: "The pattern that mattered more than any single finding was that the app is largely silent. Actions happen with no visual, haptic, or audible acknowledgement, so you are never sure whether a tap registered. That is one fix applied in one place and it improves a dozen findings at once, which is why the recommended sequence puts the global changes first and the individual screens second.",
      },
      {
        kind: "note",
        text: "The findings themselves stay between me and them while the app is unreleased. What is here is the method: the severity rubric, the discipline of naming the principle behind every issue, and a fix order built around the changes that resolve the most at once.",
      },
    ],
  },
];
