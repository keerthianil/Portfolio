/**
 * Case study content, cut from the long versions in the Notion exports down to
 * the 600 to 900 word range the site uses.
 *
 * `metrics` are only ever real measured numbers. Two of the four projects have
 * a study behind them and two do not, and the ones that do not say so rather
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
  role: string;
  timeframe: string;
  repo?: string;
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
    role: "Design researcher, UX designer, and iOS developer",
    timeframe: "Sep 2025 to Feb 2026, Roux Institute at Northeastern",
    repo: "https://github.com/keerthianil/EducationApp",
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
          "Our lab already had a backend that turned those PDFs into structured content with real markup for the equations, so the information existed. That made this a design question rather than a data question: how do you present an equation, a figure, or a chart so a student can read it, and not just hear it read at them?",
          "Reading means you can move around. Go back to the denominator. Skip the choices you have ruled out. Check one bar against another. A screen reader that plays a wall of speech gives you listening, not reading.",
        ],
      },
      {
        id: "challenge",
        title: "Challenge",
        body: [
          "The first build handed the whole document to a browser view and let a math rendering engine speak it. I shipped that in November and pulled it out six days later. The problem was ownership: either I accept whatever the engine decides to say, or I take responsibility for it. I removed the browser path, wrote the spoken form myself from the markup the backend already produced, and left the rendered equation on screen purely as a picture, hidden from the screen reader entirely.",
          "Then everything that looked like math became math. Every answer choice turned into an interactive equation, and the screen reader announced math equation, double tap to enter math mode four times per question. An expression now has to be complex enough, at least two operators, before it earns its own interactive block.",
        ],
      },
      {
        id: "approach",
        title: "Approach",
        body: [
          "Two conditions, each a document a teacher might actually send: one with text and equations, one with diagrams. Six blind and low-vision participants worked through both while thinking aloud, then scored the interface on a questionnaire I read to them.",
          "The part I would defend hardest is the instrumentation. I built logging into the app that captured every touch, every screen reader focus change and every announcement, at roughly ten samples a second, tagged by condition. That produced 15,400 events across six participants. Think-aloud tells you what someone noticed and says nothing about where their finger actually spent its time.",
          "The task framing mattered too. I told participants explicitly that they were not solving the math, only judging whether it was readable. That single instruction changed the build: I had written code to strip answers out of the spoken text so nobody could cheat, and once the task was not about answers, I deleted it.",
        ],
        points: [
          "Four rotors shipped first: character, symbol, term, structure. More granularity felt more capable and in use it was worse. It is one rotor now, Equation parts, hidden until you enter math mode.",
          "Fullscreen math mode lasted three days. Opening a screen to read one equation inside a sentence costs you your place in the document, and I had built it for my own convenience rather than the reader's. Math mode is a state now, not a screen.",
          "Charts carry four representations at once: a spoken summary, a sonified audio graph, a tactile fullscreen view, and a data table. Four sounds indulgent. Sonification reads shape quickly and exact values badly, and a table is the reverse. The same student needs both, on different questions in the same worksheet.",
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
            caption: "A chart in the document, and the same chart opened to explore by touch.",
          },
        ],
      },
      {
        id: "results",
        title: "Results",
        body: [
          "Nobody ever left math mode on purpose. Participants entered it 41 times and used the exit gesture I had built zero times. I had shipped a modal state with no discoverable door.",
          "Half of the equations condition was spent listening rather than acting, with a median idle share of 46% and the longest stretches running to 36 seconds. That reframed the problem for me. I had assumed the difficulty was moving around inside an equation. The bigger cost is that hearing it once is slow and there is no way to skim.",
          "They re-read constantly. 71% of elements were returned to at least once, and one element was revisited 23 times in a single session. Every navigation feature I built works inside an element. Nothing helped anyone get back to one, which is what they actually spent their time doing.",
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
    role: "Design researcher, UX designer, and iOS developer",
    timeframe: "Mar 2026 to Dec 2026, Roux Institute at Northeastern",
    repo: "https://github.com/keerthianil/TactileNav",
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
          "I turned raw touches off and went back to standard screen reader behaviour. Eleven minutes later I turned them back on, because standard behaviour means no drag exploration, and drag exploration is the product.",
          "The answer was to stop treating the map as a map. I switched off every gesture the map view ships with, then rebuilt only what I wanted: pinch zoom by hand, a three finger swipe to go back, and the traffic controls re-exposed as screen reader actions plus a two finger double tap. One touch surface, one set of gestures, nothing competing.",
        ],
      },
      {
        id: "approach",
        title: "Approach",
        body: [
          "Line width and map scale are two independent numbers, and keeping them independent is the whole trick. A road is 4.0mm wide at every zoom level, because that is roughly the narrowest line a fingertip can reliably follow. It is a perceptual constant, not a measurement of asphalt. Deriving it from lane width sounds principled and makes the drawing life size: about 55 metres of street fits on a phone and the extract becomes 67 screens across.",
          "Intersections come from map node topology rather than from guessing at geometry. Two ways that genuinely meet share a node, and two ways that merely cross on a bridge do not. That is both the real definition of a junction and what keeps a highway overpass from being reported as one.",
          "Silence off the streets is the point: it is how a blank block reads as blank. Haptics change the instant the thing under the finger changes, and speech waits for a 0.2 second dwell with any newer request cancelling the pending one. Sweep across six streets and you feel all six but hear only the one you stop on.",
        ],
        points: [
          "I copied my own worse answer once. I ported the route app's manual touch handling across, it crashed on tap-to-open and hung, and five days later I deleted the whole thing. The failure was never system gestures against manual handling. It was two touch paths racing each other.",
          "Two custom gestures did not survive. A three finger swipe changed zoom level, which was elegant and undiscoverable, and a custom rotor jumped to the next landmark. Both became labelled buttons. A gesture nobody is told about does not exist.",
          "One fix was removing a channel rather than adding one. Testers could not tell where crossings ended, and the vibration turned out to be masking the audio cue. You cannot fix a perception problem by adding another channel. Sometimes you clear one.",
          "Texture carries meaning, not strength. Streets are a deep rumble, routes a fast pulse, intersections a slow pulse with a ding, landmarks a quick tick. Strength is reserved for one quantity, traffic volume, so a busy street literally feels heavier.",
        ],
        figures: [
          {
            src: "intersection-view.jpeg",
            alt: "A single intersection drawn close up, with sidewalks, roadway and crossing markings at their real angles rather than squared off.",
            caption: "Nothing is schematic. A junction that meets at 43 degrees is drawn at 43 degrees.",
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
          "The literature review did one genuinely useful thing, and it was to contradict itself. My own report said the platform's audio engine applies the Doppler effect for free once a sound is positioned in space, so no extra work was needed. On a device it was not convincing, and I had to build the pitch shift by hand. Writing that section and then disproving it on hardware was worth more than the rest of the review.",
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
    role: "Product design, research and SwiftUI build, end to end",
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
          "95.9% of the top million home pages fail WCAG, and that number went up in 2026 for the first time in six years. Meanwhile the share of teams that address accessibility during design fell nearly five points in a single year. Both leading indicators are moving the wrong way, and the tools that exist all detect problems for people who already know what the results mean. Nothing is built for the one person learning this for the first time.",
          "Ally teaches accessibility, scores your own work against a plain English self check, and hands you the tools to fix what it finds. Designed in Figma first, then built in SwiftUI.",
        ],
      },
      {
        id: "challenge",
        title: "Challenge",
        body: [
          "Ally started as a different app: a screenshot annotation audit tool called ARIA. Building it, I hit a truth that killed it. Nobody audits accessibility on their phone. Auditing is desk work, and ARIA was competing with mature free tools while adding nothing they did better.",
          "So I asked where the actual gap was, and the research pointed at understanding rather than detection. Even on the most favourable industry figure, more than 40% of accessibility issues need a human who grasps the intent behind the rule. And practitioners kept reporting the same thing: the language is impenetrable, they do not know where to start, it gets bolted on at the end. None of that is a tooling gap.",
          "So the most important decision in the whole project was what Ally refuses to be. It never scans your code, never grades your app, and never claims to be a certificate. It is the thing you open before the professional tools, to build the mental model that makes them useful.",
        ],
      },
      {
        id: "approach",
        title: "Approach",
        body: [
          "Three tabs carry it. Learn is a dictionary of 55 topics sorted by who is affected rather than by spec section, each one leading with a plain sentence, a real person, and a demo you drag until the barrier is something you feel. Check turns twenty plain questions into a score, and celebrates before it analyses, because a low score that gets silence reads as a verdict and accessibility guilt is the exact thing keeping people out. Toolkit holds five utilities, including a WCAG reference rebuilt as a deck of flash cards: the rule on the front, the fix on the back, because a reference you have to read is not a quick one.",
          "The visual system was explored in Figma before it was built, including the directions that lost. The first palette was five saturated hues and read as a carnival. The reference was a searchable list before it became a deck. The celebration had four bands before three made a legible traffic light. Those rejected directions live in the file, which is what makes designed first a process rather than a claim.",
          "The on-device AI got the same discipline. Ask Ally answers only from Ally's own corpus, and retrieval runs before the model and decides whether it is called at all, so it physically cannot invent a WCAG threshold. Most users are on hardware without the model, so the unavailable state is the main experience and it got designed first, not bolted on.",
        ],
      },
      {
        id: "results",
        title: "Results",
        body: [
          "Ally's whole credibility rests on passing what it teaches, and it did not.",
          "The README claimed every colour pair cleared WCAG AA. Nobody had ever computed it, because the automated audit skips contrast. When I finally measured it, eighteen assertions failed. The signature score ring was drawing each arc at 1.75:1 against its own track: the most prominent animation in the app was, in light mode, invisible. The fix was systemic rather than cosmetic, and then I made the claim enforceable. A test now recomputes every pair in both appearances and fails the build on a regression.",
          "Months later I wrote a second test, one that reads the accessibility tree the way a person would rather than just checking that labels exist. It found that every text input in the app had an empty label and was leaning on its placeholder. Ally has a Learn topic called Labels, Not Just Placeholders that tells you exactly not to do this. The app was breaking a rule it had written down, in its own words, in five places.",
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
    role: "Product design and SwiftUI build, end to end",
    timeframe: "2026",
    repo: "https://github.com/keerthianil/Threadline",
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
          "I audited eight wardrobe apps hands on, then went looking for published evidence rather than relying on my own impressions. A thematic analysis of all 5,953 reviews across 27 wardrobe apps did most of the work.",
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
};
