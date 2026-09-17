/**
 * Case study content.
 *
 * Every project has one, and every one has the same four sections, so the grid
 * does not quietly rank itself by how much was written. The long versions live
 * in the research section, which is where somebody who wants 2,000 words should
 * be sent. These are the short ones.
 *
 * `metrics` are only ever real measured numbers. The projects with a study
 * behind them have four tiles. The ones without say so in `metricsNote` rather
 * than filling the row with something that sounds like a result.
 */

export interface Metric {
  value: string;
  label: string;
}

export interface Figure {
  /** Path under /images/case/<project>/ including the extension. */
  src: string;
  alt: string;
  caption?: string;
}

export interface Clip {
  mp4: string;
  webm: string;
  poster: string;
  /** Described, not decorative: the audio is the content. */
  description: string;
}

export interface Section {
  id: "summary" | "challenge" | "approach" | "results";
  title: string;
  /** Paragraphs. */
  body: string[];
  /** An optional list rendered under the prose. */
  points?: string[];
  figures?: Figure[];
}

export interface CaseStudy {
  id: string;
  title: string;
  subtitle: string;
  /** What I actually did. The grid card carries a job title; this carries the work. */
  role: string;
  timeframe: string;
  repo?: string;
  /** Published design file, when there is one. */
  figma?: { href: string; label: string };
  /** The long version, in the research section. */
  research?: { id: string; label: string }[];
  hero?: Figure;
  clip?: Clip;
  metrics?: Metric[];
  metricsNote?: string;
  sections: Section[];
}

export const CASE_STUDIES: Record<string, CaseStudy> = {
  stemally: {
    id: "stemally",
    title: "StemAlly",
    subtitle: "Reading a math worksheet without seeing it",
    role: "Research design, the math reading and navigation model, chart and table accessibility, and the study instrumentation.",
    timeframe: "Sep 2025 to Feb 2026, Roux Institute at Northeastern",
    repo: "https://github.com/keerthianil/EducationApp",
    research: [
      { id: "stemally-study", label: "The full case study, with the numbers" },
    ],
    hero: {
      src: "hero-worksheet-vs-screenreader.png",
      alt: "Two columns. On the left, a rendered fraction as it appears on a worksheet, captioned as an image with no structure a screen reader can enter. On the right, the same fraction written out as one long line of speech, captioned as one breath you cannot move around inside.",
      caption:
        "The worksheet on the left. What a screen reader says about it on the right.",
    },
    clip: {
      mp4: "/video/stemally-math-mode.mp4",
      webm: "/video/stemally-math-mode.webm",
      poster: "/video/stemally-math-mode-poster.jpg",
      description:
        "A screen recording with VoiceOver running. Focus is inside an equation and each swipe steps to the next part of it, which VoiceOver speaks one term at a time.",
    },
    metrics: [
      { value: "6", label: "blind and low-vision participants" },
      { value: "15,400", label: "logged interactions" },
      { value: "43:1", label: "tactile figures to equation navigation" },
      { value: "0", label: "uses of the exit gesture I built" },
    ],
    sections: [
      {
        id: "summary",
        title: "Summary",
        body: [
          "Blind and low-vision students get handed math worksheets that assume you can see them. The equation is an image. The triangle is an image. The bar chart has a caption that says see figure 3.",
          "The lab already had a backend that turned those PDFs into structured content with real markup for the equations, so the information existed. That made this a design question rather than a data question: how do you present an equation, a figure or a chart so a student can read it, and not just hear it read at them?",
          "Reading means you can move around. Go back to the denominator. Skip the choices you have ruled out. Check one bar against another. A screen reader that plays a wall of speech gives you listening, not reading.",
        ],
      },
      {
        id: "challenge",
        title: "Challenge",
        body: [
          "The first build handed the whole document to a browser view and let a math rendering engine speak it. I shipped that in November and pulled it out six days later. The engine writes its own description of the equation and there was no way inside it. Either I accept whatever it decides to say, or I take responsibility for it. I wrote the spoken form myself from the markup the backend already produced, and left the rendered equation on screen purely as a picture, hidden from the screen reader.",
          "Then everything that looked like math became math. An answer choice like a. -11 arrives tagged exactly the same as a quadratic, so every option became an interactive equation and the screen reader said math equation, double tap to enter math mode four times per question. An expression now has to be complex enough, at least two operators, before it earns its own block.",
        ],
      },
      {
        id: "approach",
        title: "Approach",
        body: [
          "Two conditions, each a document a teacher might actually send: one with text and equations, one with diagrams. Six blind and low-vision participants worked through both while thinking aloud, then scored the interface on a questionnaire I read to them.",
          "The part I would defend hardest is the instrumentation. Every touch, every screen reader focus change and every announcement, at roughly ten samples a second, tagged by condition. That produced 15,400 events. Think-aloud tells you what someone noticed and nothing about where their finger actually spent its time.",
          "The task framing changed the build. I told participants they were not solving the math, only judging whether it was readable. I had written code to strip answers out of the spoken text so nobody could cheat, and once the task was not about answers, I deleted it.",
        ],
        points: [
          "Four rotors shipped first: character, symbol, term, structure. More granularity felt more capable and in use it was worse. It is one rotor now, Equation parts, hidden until you enter math mode.",
          "Fullscreen math mode lasted three days. Opening a screen to read one equation inside a sentence costs you your place in the document, and I had built it for my own convenience. Math mode is a state now, not a screen.",
          "Charts carry four representations at once: a spoken summary, a sonified audio graph, a tactile fullscreen view, and a data table. Sonification reads shape quickly and exact values badly. A table is the reverse. The same student needs both, on different questions in the same worksheet.",
        ],
        figures: [
          {
            src: "multiple-choice-question.jpeg",
            alt: "A multiple choice question in StemAlly. The four answer options read as a plain list rather than as four separate interactive equations.",
            caption:
              "After the threshold. The answer choices are a plain list, not four things to enter.",
          },
          {
            src: "chart-bar-pair.jpeg",
            alt: "Two phone screens side by side. On the left a bar chart in the document flow with a summary above it. On the right the same chart in a fullscreen tactile view with bold high contrast outlines.",
            caption:
              "A chart in the document, and the same chart opened to explore by touch.",
          },
        ],
      },
      {
        id: "results",
        title: "Results",
        body: [
          "Nobody ever left math mode on purpose. Participants entered it 41 times and used the exit gesture I had built zero times. I had shipped a modal state with no discoverable door.",
          "Half of the equations condition was spent listening rather than acting, with a median idle share of 46% and the longest stretches running to 36 seconds. I had assumed the difficulty was moving around inside an equation. The bigger cost is that hearing it once is slow and there is no way to skim.",
          "They re-read constantly. 71% of elements were returned to at least once, and one element 23 times in a single session. Every navigation feature I built works inside an element. Nothing helped anyone get back to one, which is what they actually spent their time doing.",
          "And tactile figures outweighed equation navigation 43 to 1. I had spent most of my time on the math. The chart and table work in this project exists because of that number.",
        ],
        points: [
          "Caveats worth stating: six participants, sessions facilitated with help available, and everyone did equations before graphics, so order effects and condition effects are tangled. Idle time is inferred from gaps with no input, so it cannot separate listening from thinking.",
          "What I would change: the equation parts split on punctuation and should split on structure. The reader hard-codes its text sizes, which fails exactly the low-vision students who are not screen reader users. And I logged which equation parts people visited but never which rotor they had selected, which is the question I most wanted answered and the one I made unanswerable.",
        ],
        figures: [
          {
            src: "chart-interaction-split-and-idle.png",
            alt: "Two bar charts. The first shows raw interaction counts, with tactile figures at 43 against equation navigation at 1. The second shows median idle share per condition, 46% for equations and 31% for graphics.",
            caption: "The two numbers that changed what I worked on next.",
          },
        ],
      },
    ],
  },

  tactilenav: {
    id: "tactilenav",
    title: "TactileNav",
    subtitle: "When the screen reader and your app want the same finger",
    role: "Literature review, interaction model, feedback design, field testing, and the shared kit the two apps came out of.",
    timeframe: "Mar 2026 to Dec 2026, Roux Institute at Northeastern",
    repo: "https://github.com/keerthianil/TactileNav",
    research: [
      { id: "tactilenav-case", label: "The full case study" },
      { id: "tactilenav-report", label: "The literature review behind it" },
      { id: "aps-request", label: "The data request sent to the city" },
    ],
    hero: {
      src: "route-map-tactile.jpeg",
      alt: "A tactile route map on a phone. Streets are thick blue lines, the active route is cyan, intersections are red squares, and the start and end are yellow dots.",
      caption: "A route drawn to be traced with a finger rather than looked at.",
    },
    clip: {
      mp4: "/video/tactilenav-route-map.mp4",
      webm: "/video/tactilenav-route-map.webm",
      poster: "/video/tactilenav-route-map-poster.jpg",
      description:
        "A screen recording with VoiceOver running. Focus steps along a route from one intersection to the next, and each one is announced with the streets that meet there.",
    },
    metrics: [
      { value: "19", label: "intersections in the data request to the city" },
      { value: "50", label: "fields requested per intersection" },
      { value: "4.0mm", label: "line width, held constant at every scale" },
      { value: "643", label: "junctions found from map node topology" },
    ],
    metricsNote:
      "No user study numbers here. This project was tested in the field but not instrumented the way StemAlly was, so there is nothing measured to report.",
    sections: [
      {
        id: "summary",
        title: "Summary",
        body: [
          "A blind traveller planning an unfamiliar route can find out where the streets are. What they cannot find out is what the crossing will be like: how many lanes, whether there is an audible signal, how long the walk phase lasts, whether cars turn across it.",
          "So the question was whether someone can learn an intersection before they walk it, using only touch and sound.",
          "The interaction is simple to describe. You put a finger on the map and drag, and the map speaks and vibrates under you. Roads buzz. Intersections pulse. Landmarks pulse faster.",
        ],
      },
      {
        id: "challenge",
        title: "Challenge",
        body: [
          "Which is where the problem starts, because that needs raw one finger touches, and the screen reader also needs one finger touches, since that is how a blind user moves focus and activates anything. Only one of us can have them.",
          "There is one setting for it and it is all or nothing. I turned it on and exploration worked immediately, and every multi finger gesture the screen reader depends on started reaching the map instead. A rotor twist spun it. Pinch drifted it. I had already disabled swipe from the left edge, because people exploring the left of a map kept exiting by accident, so there was now no reliable way off the screen at all.",
          "I turned raw touches off and went back to standard screen reader behaviour. Eleven minutes later I turned them back on, because standard behaviour means no drag exploration, and drag exploration is the product.",
          "The answer was to stop treating the map as a map. I switched off every gesture the map view ships with, then rebuilt only what I wanted: pinch zoom by hand, a three finger swipe to go back, and the traffic controls re-exposed as screen reader actions plus a two finger double tap. One touch surface, one set of gestures, nothing competing.",
        ],
      },
      {
        id: "approach",
        title: "Approach",
        body: [
          "Line width and map scale are two independent numbers, and keeping them independent is the whole trick. A road is 4.0mm wide at every zoom level, because that is roughly the narrowest line a fingertip can reliably follow. It is a perceptual constant, not a measurement of asphalt. Deriving it from lane width sounds principled and makes the drawing life size: about 55 metres of street fits on a phone and the extract becomes 67 screens across.",
          "Intersections come from map node topology rather than from guessing at geometry. Two ways that genuinely meet share a node, and two ways that merely cross on a bridge do not. That is both the real definition of a junction and what keeps an overpass from being reported as one.",
          "Silence off the streets is the point: it is how a blank block reads as blank. Haptics change the instant the thing under the finger changes, and speech waits for a 0.2 second dwell with any newer request cancelling the pending one. Sweep across six streets and you feel all six but hear only the one you stop on.",
        ],
        points: [
          "I copied my own worse answer once. I ported the route app's manual touch handling across, it crashed on tap to open and hung, and five days later I deleted the whole thing. The failure was never system gestures against manual handling. It was two touch paths racing each other.",
          "Two custom gestures did not survive. A three finger swipe changed zoom level, which was elegant and undiscoverable, and a custom rotor jumped to the next landmark. Both became labelled buttons. A gesture nobody is told about does not exist.",
          "One fix was removing a channel rather than adding one. Testers could not tell where crossings ended, and the vibration turned out to be masking the audio cue. You cannot fix a perception problem by adding another channel. Sometimes you clear one.",
          "Texture carries meaning, not strength. Streets are a deep rumble, routes a fast pulse, intersections a slow pulse with a ding, landmarks a quick tick. Strength is reserved for one quantity, traffic volume, so a busy street literally feels heavier.",
        ],
        figures: [
          {
            src: "intersection-view.jpeg",
            alt: "A single intersection drawn close up, with sidewalks, roadway and crossing markings at their real angles rather than squared off.",
            caption:
              "Nothing is schematic. A junction that meets at 43 degrees is drawn at 43 degrees.",
          },
          {
            src: "feedback-vocabulary-table.png",
            alt: "A table mapping what is under the finger to its haptic pattern, its sound and its spoken announcement. Streets, routes, intersections and landmarks each get a distinct texture.",
            caption: "The feedback vocabulary, written down so it stays consistent.",
          },
        ],
      },
      {
        id: "results",
        title: "Results",
        body: [
          "The street geometry is real, a proper map extract with verifiable IDs. The signal and traffic data are simulated, built to match the structure of the real sources so a real dataset drops straight in. That is deliberate, because no public accessible signal dataset exists for Portland at all.",
          "So I wrote the ask. Nineteen downtown intersections, prioritised along the corridors that clients of the local blind services network walk daily, and about fifty fields per intersection, each with a line on why it matters to a blind pedestrian. It is with the city now.",
          "The literature review did one genuinely useful thing, and it was to contradict itself. My own report said the platform's audio engine applies the Doppler effect for free once a sound is positioned in space, so no extra work was needed. On a device it was not convincing, and I had to build the pitch shift by hand from the vehicle's modelled position and closing speed, updated sixty times a second. Writing that section and then disproving it on hardware was worth more than the rest of the review.",
        ],
        points: [
          "What I would change: I would version the shared kit properly. Without releases, one team defensively froze a copy and drifted months behind.",
          "And I would run a discoverability pass before the field test rather than after. Both apps ended up with four redundant ways to exit a screen, which I added because no single one proved reliable. Four is not a design. It is a hedge.",
        ],
        figures: [
          {
            src: "findings-panel-dba.png",
            alt: "A panel of findings about traffic sound, including that urban ambient noise averages 66 decibels, that detection becomes unreliable above 50, and that an electric vehicle under 20 miles per hour sits below 45.",
            caption:
              "Why the crossing simulator has a traffic type control. An all electric fleet is quiet enough that the technique itself starts to fail.",
          },
        ],
      },
    ],
  },

  ally: {
    id: "ally",
    title: "Ally",
    subtitle: "An accessibility app that failed its own rules twice",
    role: "Product design, research and SwiftUI build, end to end.",
    timeframe: "2026",
    repo: "https://github.com/keerthianil/Ally",
    metrics: [
      { value: "18", label: "contrast assertions that failed when measured" },
      { value: "1.75:1", label: "what the score ring was actually drawing at" },
      { value: "98", label: "tests, 80 unit and 18 UI" },
      { value: "55", label: "topics in Learn" },
    ],
    sections: [
      {
        id: "summary",
        title: "Summary",
        body: [
          "Ally teaches accessibility, scores your own work against a plain English self check, and hands you the tools to fix what it finds. Designed in Figma first, then built in SwiftUI.",
          "95.9% of the top million home pages fail WCAG, and that number went up in 2026 for the first time in six years. Meanwhile the share of teams that address accessibility during design fell nearly five points in a single year. Both leading indicators are moving the wrong way, and every tool that exists detects problems for people who already know what the results mean. Nothing is built for the person learning this for the first time.",
        ],
      },
      {
        id: "challenge",
        title: "Challenge",
        body: [
          "Ally started as a different app. ARIA was a screenshot annotation audit tool, and building it I hit a truth that killed it: nobody audits accessibility on their phone. Auditing is desk work, and ARIA was competing with mature free tools while adding nothing they did better.",
          "So I asked where the gap actually was, and the research pointed at understanding rather than detection. Even on the most favourable industry figure, more than 40% of accessibility issues need a human who grasps the intent behind the rule. Practitioners kept reporting the same three things: the language is impenetrable, they do not know where to start, and it gets bolted on at the end. None of that is a tooling gap.",
          "So the most important decision in the project was what Ally refuses to be. It never scans your code, never grades your app, and never claims to be a certificate. It is the thing you open before the professional tools, to build the mental model that makes them useful.",
        ],
      },
      {
        id: "approach",
        title: "Approach",
        body: [
          "Three tabs carry it. Learn is a dictionary of 55 topics sorted by who is affected rather than by spec section, each one leading with a plain sentence, a real person, and a demo you drag until the barrier is something you feel. Check turns twenty plain questions into a score, and celebrates before it analyses, because a low score met with silence reads as a verdict and accessibility guilt is the exact thing keeping people out. Toolkit holds five utilities, including a WCAG reference rebuilt as a deck of cards: the rule on the front, the fix on the back.",
          "The visual system was explored in Figma before it was built, including the directions that lost. The first palette was five saturated hues and read as a carnival. The reference was a searchable list before it became a deck. The celebration had four bands before three made a legible traffic light. Those rejected directions are still in the file, which is what makes designed first a process rather than a claim.",
          "The on-device AI got the same discipline. Ask Ally answers only from Ally's own corpus, and retrieval runs before the model and decides whether it is called at all, so it physically cannot invent a WCAG threshold. Most users are on hardware without the model, so the unavailable state is the main experience and it got designed first, not bolted on.",
        ],
      },
      {
        id: "results",
        title: "Results",
        body: [
          "Ally's whole credibility rests on passing what it teaches, and it did not.",
          "The README claimed every colour pair cleared WCAG AA. Nobody had ever computed it, because the automated audit skips contrast. When I finally measured it, eighteen assertions failed. The signature score ring was drawing each arc at 1.75:1 against its own track: the most prominent animation in the app was, in light mode, invisible. The fix was systemic rather than cosmetic, and then I made the claim enforceable. A test now recomputes every pair in both appearances and fails the build on a regression.",
          "Months later I wrote a second test, one that reads the accessibility tree the way a person would rather than checking that labels exist. It found that every text input in the app had an empty label and was leaning on its placeholder. Ally has a Learn topic called Labels, Not Just Placeholders that tells you exactly not to do this. The app was breaking a rule it had written down, in its own words, in five places.",
          "That second one is the more useful finding, because it says the gap between knowing a rule and following it survives even when you are the person who wrote the guidance. Which is the thesis of the app, demonstrated on the app.",
        ],
        points: [
          "Known gap, stated rather than quietly shipped: the exported PDF report has no text layer. It rasterizes a view, so the report is an image and is not screen reader accessible. A real text layer is the fix.",
        ],
      },
    ],
  },

  threadline: {
    id: "threadline",
    title: "Threadline",
    subtitle: "Your closet, priced per wear",
    role: "Product design, research and SwiftUI build, end to end.",
    timeframe: "2026",
    repo: "https://github.com/keerthianil/Threadline",
    figma: {
      href: "https://www.figma.com/design/8zM6wy1k9kJXzKFYKOIKfY/Threadline?node-id=0-1",
      label: "Design file",
    },
    research: [
      { id: "threadline-research", label: "The research behind it" },
    ],
    metrics: [
      { value: "5,953", label: "app reviews in the study I leaned on" },
      { value: "34%", label: "of negative reviews were about pricing" },
      { value: "5", label: "claims I retracted from my own write-up" },
      { value: "20", label: "tests, passing in both appearances" },
    ],
    sections: [
      {
        id: "summary",
        title: "Summary",
        body: [
          "Existing wardrobe apps track inventory. Threadline tracks decisions.",
          "People who care about spending wisely have sophisticated tools for their finances and nothing for their wardrobe, a category where about a quarter of an average closet goes unworn in a year and the average garment is worn seven times.",
          "The real question is not why people do not organise their closets. It is why people who already track their spending still make bad clothing purchases. Knowing your cost per wear is twelve dollars means nothing while you are standing in a shop holding a sweater. The data is in a dashboard you last opened three weeks ago. The decision is happening now.",
        ],
      },
      {
        id: "challenge",
        title: "Challenge",
        body: [
          "I audited eight wardrobe apps hands on, then went looking for published evidence rather than trusting my own impressions. A thematic analysis of all 5,953 reviews across 27 wardrobe apps did most of the work.",
          "It also told me I was wrong. I went in assuming setup friction was the category's main failure. The review data says otherwise: 34% of 466 negative reviews were about subscription pricing and paywalls, and setup barely features. Setup friction is still my hypothesis and it still shaped the design, but it is a hypothesis, and an earlier version of this write-up stated it as a ranked finding it never was.",
          "Wardrobe apps fail at the same point budgeting apps failed before YNAB. They report, and they do not guide. Cost per wear alone is not enough either. You already own four black tops and wear them once a month is more useful than eight dollars fifty per wear.",
        ],
      },
      {
        id: "approach",
        title: "Approach",
        body: [
          "The pre-purchase check is the hero, and it is the interaction that does not exist in any competitor. Category, then price, then verdict, one question at a time. The count sits inside the input, so each tile shows how many you already own while you are still answering. No model and no network: it runs on device with no latency.",
          "Category is the matching axis because the alternatives do not work. Name matching is unreliable without a model, and image matching is a research problem. Category is also the axis that actually matters when you are weighing a gap against redundancy.",
          "Financial framing, never sustainability framing. Utilization, cost per wear, underperformers. Behaviour change through self interest rather than guilt. The app observes and suggests, and it never shames.",
          "Logging an outfit is a daily five second action, so it cannot end in a dialog. One banner appears and leaves, with a VoiceOver announcement alongside it. An earlier version defended alert over overlay as a principle while shipping both.",
        ],
        points: [
          "Three arcs, not one ring. The score is 0.4 utilization plus 0.35 cost per wear plus 0.25 balance. A ring split into those wedges draws the weights while implying the parts sum to the total. They do not: each is an independent score out of 100.",
          "Butter and denim on cream, because both are clothing references, so the palette argues for the product. Three constraints came out of measuring and each changed the design: accent inks on pastel fills reach only 3.40:1, adaptive text on mustard measured 1.49:1 in dark mode, and three graphical values in a two hue palette top out at 2.09:1 against each other.",
        ],
      },
      {
        id: "results",
        title: "Results",
        body: [
          "The most useful output of this project was a list of things I had asserted and could not support. Five claims came out of the write-up: that setup was the number one reason people abandon these apps, a wear-rate comparison I could not source, a range of setup times I had invented, a quote I had attributed to a blogger who never said it, and a correlation between utilization and behaviour change that no study establishes.",
          "The forty, thirty-five, twenty-five weighting on the score is an untested prior. The honest answer to why those numbers is that they have never been validated against outcomes, and an earlier version of this page said they had.",
          "Two things are specified and not shipped, and both are in the docs rather than hidden. The model carries a seasons field that no view reads, so a wool overcoat reads as an underperformer at 95 days unworn when the real explanation is that it is August. And stored items are documented as excluded from utilization, which is true in code, except nothing in the app can mark an item as stored, so the exclusion never fires.",
          "The question I am still sitting with is whether the pre-purchase check creates decision confidence or decision anxiety. Showing someone they already own four similar things before every purchase might just make them overthink everything. The answer probably involves a threshold, and that is something I would want to test with real users rather than decide.",
        ],
      },
    ],
  },

  aria: {
    id: "aria",
    title: "ARIA",
    subtitle: "An accessibility lens for a product that already shipped",
    role: "Product design and SwiftUI build, end to end.",
    timeframe: "2026",
    repo: "https://github.com/keerthianil/ARIA",
    metricsNote:
      "No study behind this one. What is measurable here is what the app computes on device, not anything about how people used it.",
    sections: [
      {
        id: "summary",
        title: "Summary",
        body: [
          "Designers annotate accessibility in Figma. Developers build the product. Somewhere between those two steps accessibility breaks, and nobody has a structured way to find out what survived.",
          "The tools that exist sit at one end or the other: design-phase plugins, or developer tooling priced for a company rather than a person. ARIA is for the gap in the middle, a designer reviewing the built thing on the device it ships on.",
          "Everything hangs off one spine. An audit holds screens, a screen collects findings, and the findings roll up into a report you can send someone.",
        ],
      },
      {
        id: "challenge",
        title: "Challenge",
        body: [
          "A screenshot is a picture. It has no accessibility tree, no focus order, no labels, and the platform will not let one app read another app's tree. So most of what an audit wants to know is simply not in the file you imported.",
          "The temptation is to guess. Plenty of tools will look at an image and tell you the touch targets are too small, and they are inferring that from pixel measurements of something that may not be a button at all. A confident wrong finding in an accessibility report is worse than no finding, because somebody acts on it.",
          "So the hard decision was where to draw the line, and then to hold it. Contrast and colour distinguishability are arithmetic, so the app does them itself and shows its working. Everything that needs the semantic layer a screenshot does not carry stays manual, in a lens where a human puts a pin on the screen and picks the criterion. Knowing where that line sits is the product.",
        ],
      },
      {
        id: "approach",
        title: "Approach",
        body: [
          "Three lenses write into one findings list. Annotate is a pin you drop on the screenshot, with a WCAG criterion and a severity. Contrast runs on-device text recognition, samples the foreground and background of every text run, and flags the ones that fail their threshold. Colour Vision simulates eight colour vision deficiencies and tests whether two colours stay distinguishable, which is the relying on colour alone check that contrast maths cannot catch.",
          "Pins rather than a list, because a violation's position on screen matters as much as its description. Telling someone the contrast fails is a bug report. Showing them where is a fix.",
          "The criterion picker is written in plain language, so it teaches while you use it. Most designers do not know WCAG numbers by heart and there is no reason they should.",
          "Nothing leaves the device. No account, no upload, no model. The screenshots people audit are of unreleased products.",
        ],
      },
      {
        id: "results",
        title: "Results",
        body: [
          "It ships with a real audit in it: five screens of a music app, thirteen findings across four severity levels, so the workflow is visible the moment you open it rather than after you have done twenty minutes of setup.",
          "ARIA is also the reason Ally exists. Building this one taught me the thing that killed it: nobody audits accessibility on their phone. Auditing is desk work. The app is good and the premise was wrong, and the useful part was working out that the real gap is understanding rather than detection.",
          "The lens model survived the move. Ally's Toolkit is the same contrast checker and the same colour vision simulator, aimed at someone learning rather than someone reporting.",
          "What I would change: the report is a rendered view rather than a text layer, which is the same flaw Ally shipped. An accessibility report that a screen reader cannot read is an embarrassing thing to hand anyone.",
        ],
      },
    ],
  },

  portfolio: {
    id: "portfolio",
    title: "An Interactive Desk",
    subtitle: "A portfolio you walk into, that also works with the screen off",
    role: "Design, build and direction, with AI assistance.",
    timeframe: "2026",
    repo: "https://github.com/keerthianil/Portfolio",
    hero: {
      src: "room.webp",
      alt: "The room this site opens on: a desk with a wide monitor, an open laptop, a keyboard, a mug, a rubber duck and a desk calendar, lit from a window to the left.",
      caption:
        "Hand built rather than exported from a modelling tool. Every object on this desk is a route, and every one of them is also a button you can tab to.",
    },
    metrics: [
      { value: "4", label: "routes, all driven by the URL hash" },
      { value: "0", label: "objects in the room that are not also buttons" },
      { value: "16.59:1", label: "body text contrast, measured not assumed" },
      { value: "6s", label: "watchdog on the opening curtain" },
    ],
    sections: [
      {
        id: "summary",
        title: "Summary",
        body: [
          "This site. A desk in a room, built by hand in WebGL rather than exported from a modelling tool, where every object is a route: the monitor is the work, the laptop is about me, the notebook is research, the calendar is the timeline.",
          "It was built with AI assistance, which I want to be plain about because the interesting part is what that does and does not do. It writes quickly and it will happily produce a confident, broken, inaccessible version of anything you ask for. Directing it is the work: deciding what the room is for, setting the rules it has to hold to, and rejecting what does not survive a real check.",
          "So the brief I gave myself was the same one I give a client project. A portfolio about accessibility that is not accessible is an argument against its author.",
        ],
      },
      {
        id: "challenge",
        title: "Challenge",
        body: [
          "Almost every 3D portfolio is unusable with a keyboard, invisible to a screen reader, and a black rectangle on a machine without WebGL. The whole genre is a demonstration that the author has not thought about anyone whose setup is different from theirs, which made it exactly the wrong thing for me to build and exactly the right thing to fix.",
          "A canvas has no structure. There is nothing to tab to, nothing to announce, and nothing for a focus ring to sit on, because it is one element with a picture painted on it.",
          "And a scene that fails has to fail into something. A slow context, a throttled background tab, or a shader that throws all produced the same result in testing: a working site sitting under a black rectangle that never lifted.",
        ],
      },
      {
        id: "approach",
        title: "Approach",
        body: [
          "Every object in the room is also a real button, visually hidden until it is focused, so tabbing through the page moves through the room in a sensible order. Focus lands on the object and the scene draws a ring around it in 3D, standing against the wall for wall objects rather than lying flat in mid air. That ring is on whenever the room is, not behind an accessibility mode.",
          "The hash is the router, so every view has a URL. The two panels that go a level deeper push a history entry rather than replacing one, which means the browser Back button closes the panel instead of leaving the site. On a phone that gesture is how most people close things.",
          "The camera leads the overlay by 700ms. A route change moves the camera first and mounts the content 700ms later, so you arrive at the object before its content covers it.",
          "Without WebGL you get a flat view that is not a picture of the room. Every object in the room was a link anyway, so the fallback is those links. One quality level, no adaptive tiers.",
          "Four things in the room do something rather than say something. Knock the mug and coffee pours out of it. Flip the switch by the door and the scene recolours itself for three kinds of colour vision deficiency, recolouring its own materials rather than filtering the canvas, because a filter over the canvas would recolour the interface too. Pull the blind and the daylight goes with it, because glare is an access need and a room going dark is a better argument than a caption about it. Prod the duck and it squeaks, which is synthesised in the browser from two oscillators because a fifth of a second of sound does not need to be a file.",
        ],
        points: [
          "The palette is measured against the background, not eyeballed. One token is 4.10:1 and is therefore allowed on large text and non-text UI only, and one is 2.24:1 and is never allowed on text at all. A version shipped with the blue channel left in gamma space and every ratio came out inflated, which is the kind of mistake that only shows up if you compute it twice.",
          "Reduced motion zeroes delays as well as durations. For the duck it changes what happens rather than how fast: it tips once and holds instead of rocking.",
          "The window's yellow traffic light is a span, not a button. A dead control is worse than a picture of one. The red and green ones are real, and all of them are 24px targets drawn as 12px dots.",
          "There is no scroll to look. On macOS a horizontal scroll with nothing to scroll is the browser's back gesture, and the browser wins.",
        ],
      },
      {
        id: "results",
        title: "Results",
        body: [
          "It works with a keyboard, it works with a screen reader, it works without WebGL, and it works at 320px. The curtain that covers the scene while it loads has two independent guards on it, both added after a real black screen: a six second watchdog that lifts it regardless, and an error boundary that reports failure upward instead of swallowing it.",
          "The parts that took longest were not the 3D. They were the second-order failures: a modal inside a modal that sized itself to its animating parent instead of the viewport, two Escape handlers on the same window closing two dialogs at once, and an opening animation that ran twice because the panels were inside a presence wrapper that played their exit when they were told to open.",
          "What AI assistance actually changed: it made the expensive version affordable. A hand-built room, a flat fallback, a motion spec and a measured palette is more work than a portfolio deserves, and it got built because the drafting was cheap. What it did not change is that every one of those decisions still had to be made by somebody, and every claim on this page still had to be checked by somebody, because it will assert a contrast ratio it has not computed just as readily as I did in Ally.",
          "Still open, and stated rather than quietly left out: this has been measured in an emulator at six phone widths and never opened on a real device, and no automated accessibility scan has been run against it. Both are the next thing.",
        ],
      },
    ],
  },

  swaptitude: {
    id: "swaptitude",
    title: "Swaptitude",
    subtitle: "Teach one thing, learn another",
    role: "SwiftUI and Firebase, in a team of four.",
    timeframe: "2025",
    metricsNote:
      "Coursework, built in a team of four. Nothing here was measured with users, so there are no numbers to put in a row of tiles.",
    sections: [
      {
        id: "summary",
        title: "Summary",
        body: [
          "A skill swap marketplace. You post what you can teach and what you want to learn, and the app looks for the person whose post is the mirror of yours.",
          "No money moves. The exchange is the point: an hour of guitar for an hour of Spanish, matched, chatted about, and scheduled in the app.",
          "Firebase behind all of it, so posts, matches, chat and notifications are live for four people at once rather than four copies of a local database.",
        ],
      },
      {
        id: "challenge",
        title: "Challenge",
        body: [
          "A two sided match is not a search. Both sides have to want what the other has, which means the interesting query is not what skills exist but which pairs of posts complement each other, and that is a different shape of problem from a feed.",
          "The harder thing was four people on one codebase for the first time. Everybody wanted to own a tab, and tabs share models, so the same user object got defined three slightly different ways inside a week.",
          "We settled it with structure rather than with a meeting. One model layer, one service layer for everything that talks to Firebase, and a view model per feature. After that the merge conflicts were in views, which are cheap to resolve, rather than in models, which are not.",
        ],
      },
      {
        id: "approach",
        title: "Approach",
        body: [
          "Services own the network and nothing else does. Auth, posts, matching, chat, meetings and notifications each get a service, and views never touch the database directly. It made the parts testable and, more usefully for a team of four, it made them assignable.",
          "Matching runs on the post rather than on the profile. What you want this month is not who you are, and a match built from a post expires with the post.",
          "The feed says why you cannot swap with someone, not just that you cannot. A post you do not match shows skills do not match rather than a disabled button with no explanation.",
          "Explore is browse by category, because the cold start problem in a marketplace is real. With no posts near you, a list of categories is still something to read.",
        ],
      },
      {
        id: "results",
        title: "Results",
        body: [
          "The whole loop works end to end: sign up, post, get matched, chat, schedule, review.",
          "What I took from it was mostly about working in a team. Naming the boundaries early is worth more than agreeing on style, and the architecture decision we made in week two is the reason the last two weeks were not spent merging.",
          "What I would change: matching is a query run on the client, which is fine for a class project and would fall over immediately at any real number of posts. It belongs on the server.",
          "And it needs an accessibility pass. This was built before I started working on accessibility properly, and it shows: the custom tab bar and the card stack are the two places I would start.",
        ],
      },
    ],
  },

  travelplanner: {
    id: "travelplanner",
    title: "TravelPlanner",
    subtitle: "The one that is about persistence rather than touch",
    role: "SwiftUI and Core Data, solo.",
    timeframe: "2025",
    metricsNote:
      "Coursework, and the honest description is a competent CRUD app. Nothing measured, nothing to put in tiles.",
    sections: [
      {
        id: "summary",
        title: "Summary",
        body: [
          "Destinations, trips inside them, activities and expenses inside those. A planner where the whole point is that it is still there tomorrow.",
          "It is in this list because it is the one project here that is about data rather than about interaction, and because a lot of what I know about modelling relationships came out of it.",
          "Built twice, in fact. There is a storyboard version and a SwiftUI version of the same app, which was the assignment and turned out to be the most useful part of it.",
        ],
      },
      {
        id: "challenge",
        title: "Challenge",
        body: [
          "Nested ownership is easy to draw and easy to get wrong. A trip belongs to a destination, an activity belongs to a trip, an expense belongs to a trip, and deleting a destination has to take all of that with it or leave orphans in the store forever.",
          "The other one was the network. The app enriches destinations from a remote source, and the first version assumed that call succeeds. On a plane, which is exactly where you would open a travel planner, it does not.",
          "So reachability had to become part of the model rather than an error dialog. What is stored locally is the truth, and the remote data is a decoration on top of it that may or may not arrive.",
        ],
      },
      {
        id: "approach",
        title: "Approach",
        body: [
          "One data manager owns the store and every view goes through it. Delete rules are declared on the model rather than implemented in each view, so removing a destination cascades once, in one place.",
          "The API layer is separate from the store and never writes to it directly, so a failed fetch degrades to what is already saved instead of blanking the screen.",
          "Dates are validated at entry rather than at display. A trip that ends before it starts should be impossible to type, not caught later by a view that has to decide what to render.",
          "Two builds of the same app, one in storyboards and one in SwiftUI, which made the difference between the two concrete rather than theoretical: the same list screen is about a third of the code, and the declarative one is far harder to get into an inconsistent state.",
        ],
      },
      {
        id: "results",
        title: "Results",
        body: [
          "It does what it says and it survives being force quit, which is the entire bar for this kind of app.",
          "The useful outcome was the comparison. Having written the same screens twice, I can say specifically what SwiftUI costs you and what it buys, rather than repeating what everyone says about it.",
          "What I would change: the view models live in a folder called ViewModels that also contains views, which is exactly the kind of thing that is invisible while you are writing it and confusing six months later.",
          "And like everything else from this term, it predates my accessibility work. Dynamic Type and VoiceOver labels would be the first pass if I picked it back up.",
        ],
      },
    ],
  },
};
