/**
 * Case study content.
 *
 * Every project has one, every one has the same four sections, and every one is
 * short. Around 300 words, which is about two minutes, because the long version
 * is one click away in the research section and a grid where the reading gets
 * longer as you go down it is a grid nobody finishes.
 *
 * What survives the cut: the numbers, the reversals, and the thing I would fix.
 * What goes: the elaboration. If a sentence is explaining a sentence that
 * already landed, it belongs in the research document instead.
 *
 * There is no hero image and no clip up here any more. Every screen and every
 * recording is in the Screens gallery at the bottom of the same page, so a
 * portrait capture beside the title was the same asset twice, and the one on
 * top was the one nobody had scrolled to yet.
 *
 * `figures` survive, and they are only ever the ones that are an argument
 * rather than a picture of the app: a diagram, a chart, a table.
 *
 * `metrics` are only ever real measured numbers, and a project without them
 * simply has no tiles. A sentence explaining that there was no study is a
 * sentence apologising for a thing nobody asked about.
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
  /**
   * What I actually did, on the two research projects only. Everything else in
   * this list was mine end to end, so a My part heading under six of eight
   * cards is a heading that never varies, which is furniture.
   */
  role?: string;
  timeframe: string;
  repo?: string;
  /** Published design file, when there is one. */
  figma?: { href: string; label: string };
  /** The long version, in the research section. */
  research?: { id: string; label: string }[];
  metrics?: Metric[];
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
    figma: {
      href: "https://www.figma.com/design/Ydkv7vqzHmqKCt64QeOUhp/StemAlly?node-id=0-1",
      label: "Design file",
    },
    research: [
      { id: "stemally-study", label: "The full case study, with the numbers" },
    ],
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
          "The lab already had a backend that turned those PDFs into structured content, so the information existed. That made it a design question: how do you present an equation so a student can read it, rather than hear it read at them? Reading means you can move around. A wall of speech gives you listening.",
        ],
        figures: [
          {
            src: "hero-worksheet-vs-screenreader.png",
            alt: "Two columns. On the left, a rendered fraction as it appears on a worksheet, captioned as an image with no structure a screen reader can enter. On the right, the same fraction written out as one long line of speech, captioned as one breath you cannot move around inside.",
            caption:
              "The worksheet on the left. What a screen reader says about it on the right.",
          },
        ],
      },
      {
        id: "challenge",
        title: "Challenge",
        body: [
          "My first build let a rendering engine speak the math. I shipped it in November and pulled it six days later. The engine writes its own description of the equation and there is no way inside it, so either I accept whatever it says or I take responsibility for it. I wrote the spoken form myself.",
          "Then everything that looked like math became math. An answer choice like a. -11 arrives tagged exactly the same as a quadratic, so the screen reader said math equation, double tap to enter math mode four times per question. An expression needs two operators now before it earns its own block.",
        ],
      },
      {
        id: "approach",
        title: "Approach",
        body: [
          "Two conditions, one document of equations and one of diagrams. Six blind and low-vision participants worked through both while thinking aloud.",
          "The part I would defend hardest is the logging. Every touch, every focus change and every announcement, ten times a second, tagged by condition. 15,400 events. Think-aloud tells you what someone noticed and nothing about where their finger went.",
        ],
        points: [
          "Four rotors shipped first. More granularity felt more capable and was worse. It is one now, hidden until you enter math mode.",
          "Fullscreen math mode lasted three days. Reading one equation inside a sentence should not cost you your place in the document. It is a state now, not a screen.",
          "Charts carry four representations at once. Sonification reads shape quickly and values badly, and a table is the reverse.",
        ],
      },
      {
        id: "results",
        title: "Results",
        body: [
          "Nobody left math mode on purpose. Forty-one entries, and zero uses of the exit gesture I had built. A modal state with no door.",
          "Half the equations condition was spent listening rather than acting. I had assumed the difficulty was moving around inside an equation. The bigger cost is that hearing it once is slow and there is no way to skim.",
          "And tactile figures beat equation navigation 43 to 1. I had spent most of my time on the math.",
        ],
        points: [
          "Six participants, facilitated sessions, and everyone did equations before graphics, so order effects and condition effects are tangled.",
          "I logged which equation parts people visited but never which rotor they had selected, which is the question I most wanted answered and the one I made unanswerable.",
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
    metrics: [
      { value: "19", label: "intersections in the data request to the city" },
      { value: "50", label: "fields requested per intersection" },
      { value: "4.0mm", label: "line width, held constant at every scale" },
      { value: "643", label: "junctions found from map node topology" },
    ],
    sections: [
      {
        id: "summary",
        title: "Summary",
        body: [
          "A blind traveller planning a route can find out where the streets are. What they cannot find out is what the crossing will be like: how many lanes, whether there is an audible signal, whether cars turn across it.",
          "So the question was whether someone can learn an intersection before they walk it, using only touch and sound. You put a finger on the map and drag, and it speaks and vibrates under you. Roads buzz. Intersections pulse.",
        ],
      },
      {
        id: "challenge",
        title: "Challenge",
        body: [
          "Which is where the problem starts, because that needs raw one finger touches, and the screen reader needs them too, since that is how a blind user moves focus. Only one of us can have them, and the setting for it is all or nothing.",
          "I turned it on and every multi finger gesture started reaching the map instead. I turned it off and lost drag exploration, which is the product. Eleven minutes later I turned it back on.",
          "The answer was to stop treating the map as a map: switch off every gesture the map view ships with, then rebuild only the ones I wanted. One touch surface, one set of gestures, nothing competing.",
        ],
      },
      {
        id: "approach",
        title: "Approach",
        body: [
          "Line width and map scale are two independent numbers, and keeping them independent is the whole trick. A road is 4.0mm wide at every zoom level, because that is roughly the narrowest line a fingertip can follow. It is a perceptual constant, not a measurement of asphalt.",
          "Silence off the streets is the point: it is how a blank block reads as blank. Speech waits for a 0.2 second dwell, so sweeping across six streets you feel all six and hear only the one you stop on.",
        ],
        points: [
          "Intersections come from map node topology rather than from geometry. Two ways that genuinely meet share a node, and two that cross on a bridge do not.",
          "Two custom gestures did not survive. Both became labelled buttons, because a gesture nobody is told about does not exist.",
          "One fix was removing a channel rather than adding one. Testers could not tell where crossings ended, and the vibration was masking the audio cue that marked it.",
        ],
        figures: [
          {
            src: "feedback-vocabulary-table.png",
            alt: "A table mapping what is under the finger to its haptic pattern, its sound and its spoken announcement. Streets, routes, intersections and landmarks each get a distinct texture.",
            caption:
              "Texture carries meaning. Strength is reserved for one quantity, traffic volume, so a busy street feels heavier.",
          },
        ],
      },
      {
        id: "results",
        title: "Results",
        body: [
          "The street geometry is real. The signal and traffic data are simulated, built to match the structure of the real sources, because no public accessible signal dataset exists for Portland at all.",
          "So I wrote the ask. Nineteen downtown intersections, about fifty fields each, every field with a line on why it matters to a blind pedestrian. It is with the city now.",
          "The literature review did one genuinely useful thing, and it was to contradict itself. My own report said the platform applies the Doppler effect for free once a sound is positioned in space. On a device it was not convincing, and I built the pitch shift by hand.",
        ],
        points: [
          "What I would change: version the shared kit, and run a discoverability pass before the field test rather than after. Both apps ended up with four ways to exit a screen. Four is not a design. It is a hedge.",
        ],
      },
    ],
  },

  ally: {
    id: "ally",
    title: "Ally",
    subtitle: "An accessibility app that failed its own rules twice",
    timeframe: "2026",
    repo: "https://github.com/keerthianil/Ally",
    figma: {
      href: "https://www.figma.com/design/0AVQiGKiMKUE4Z68Nd1Rrx/Ally?node-id=31-60",
      label: "Design file",
    },
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
          "95.9% of the top million home pages fail WCAG, and that went up in 2026 for the first time in six years. Every tool that exists detects problems for people who already know what the results mean. Nothing is built for the person learning this for the first time.",
        ],
      },
      {
        id: "challenge",
        title: "Challenge",
        body: [
          "Ally started as ARIA, a screenshot audit tool, and building that one I hit the truth that killed it: nobody audits accessibility on their phone.",
          "So I asked where the gap actually was, and the research pointed at understanding rather than detection. Practitioners kept saying the same three things: the language is impenetrable, they do not know where to start, and it gets bolted on at the end. None of that is a tooling gap.",
          "So the most important decision was what Ally refuses to be. It never scans your code, never grades your app, and never claims to be a certificate.",
        ],
      },
      {
        id: "approach",
        title: "Approach",
        body: [
          "Three tabs. Learn is 55 topics sorted by who is affected rather than by spec section, each one leading with a plain sentence and a demo you drag until the barrier is something you feel. Check turns twenty plain questions into a score, and celebrates before it analyses, because a low score met with silence reads as a verdict. Toolkit is five utilities, including the WCAG reference rebuilt as a deck of cards.",
          "The visual system was explored in Figma first, including the directions that lost. The first palette was five saturated hues and read as a carnival. Those rejected directions are still in the file, which is what makes designed first a process rather than a claim.",
        ],
        points: [
          "Ask Ally answers only from Ally's own corpus, and retrieval runs before the model and decides whether it is called at all, so it physically cannot invent a WCAG threshold.",
        ],
      },
      {
        id: "results",
        title: "Results",
        body: [
          "Ally's whole credibility rests on passing what it teaches, and it did not.",
          "The README claimed every colour pair cleared AA. Nobody had ever computed it. When I measured, eighteen assertions failed, and the signature score ring was drawing each arc at 1.75:1 against its own track: the most prominent animation in the app was, in light mode, invisible. A test now recomputes every pair in both appearances and fails the build on a regression.",
          "Months later a second test found that every text input had an empty label and was leaning on its placeholder. Ally has a Learn topic that tells you exactly not to do this. It was breaking a rule it had written down, in its own words, in five places. Which is the thesis of the app, demonstrated on the app.",
        ],
        points: [
          "Known gap, stated rather than quietly shipped: the exported PDF report rasterizes a view, so the report is an image and is not screen reader accessible.",
        ],
      },
    ],
  },

  threadline: {
    id: "threadline",
    title: "Threadline",
    subtitle: "Your closet, priced per wear",
    timeframe: "2026",
    repo: "https://github.com/keerthianil/Threadline",
    figma: {
      href: "https://www.figma.com/design/8zM6wy1k9kJXzKFYKOIKfY/Threadline?node-id=0-1",
      label: "Design file",
    },
    research: [{ id: "threadline-research", label: "The research behind it" }],
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
          "The real question is not why people do not organise their closets. It is why people who already track their spending still make bad clothing purchases. Knowing your cost per wear is twelve dollars means nothing while you are standing in a shop holding a sweater. The data is in a dashboard you last opened three weeks ago. The decision is happening now.",
        ],
      },
      {
        id: "challenge",
        title: "Challenge",
        body: [
          "I audited eight wardrobe apps hands on, then went looking for published evidence rather than trusting my own impressions. A thematic analysis of all 5,953 reviews across 27 wardrobe apps did most of the work.",
          "It also told me I was wrong. I went in assuming setup friction was the category's main failure. 34% of negative reviews were about pricing and paywalls, and setup barely features. It is still my hypothesis and it still shaped the design, but an earlier version of this write-up stated it as a ranked finding it never was.",
        ],
      },
      {
        id: "approach",
        title: "Approach",
        body: [
          "The pre-purchase check is the hero, and it is the interaction that does not exist in any competitor. Category, then price, then verdict, one question at a time, with the count of what you already own sitting inside the input. No model and no network: it runs on device with no latency.",
          "Financial framing, never sustainability framing. Behaviour change through self interest rather than guilt. The app observes and suggests, and it never shames.",
        ],
        points: [
          "Category is the matching axis because the alternatives do not work. Name matching is unreliable without a model and image matching is a research problem.",
          "Three arcs, not one ring. A ring split into the weights draws them while implying the parts sum to the total. They do not.",
        ],
      },
      {
        id: "results",
        title: "Results",
        body: [
          "The most useful output of this project was a list of things I had asserted and could not support. Five claims came out of the write-up, including a quote I had attributed to a blogger who never said it, and a correlation between utilization and behaviour change that no study establishes.",
          "Two things are specified and not shipped, and both are in the docs rather than hidden. A seasons field no view reads, so a wool overcoat reads as an underperformer at 95 days unworn when the real explanation is that it is August. And stored items are documented as excluded from utilization, except nothing in the app can mark an item as stored.",
          "The question I am still sitting with is whether the pre-purchase check creates decision confidence or decision anxiety. That is something I would want to test with real users rather than decide.",
        ],
      },
    ],
  },

  aria: {
    id: "aria",
    title: "ARIA",
    subtitle: "An accessibility lens for a product that already shipped",
    timeframe: "2026",
    repo: "https://github.com/keerthianil/ARIA",
    sections: [
      {
        id: "summary",
        title: "Summary",
        body: [
          "Designers annotate accessibility in Figma. Developers build the product. Somewhere between those two steps it breaks, and nobody has a structured way to find out what survived.",
          "The tools that exist sit at one end or the other. ARIA is for the gap in the middle: a designer reviewing the built thing on the device it ships on. An audit holds screens, a screen collects findings, and the findings roll up into a report you can send someone.",
        ],
      },
      {
        id: "challenge",
        title: "Challenge",
        body: [
          "A screenshot is a picture. It has no accessibility tree, no focus order, no labels, and the platform will not let one app read another app's. So most of what an audit wants to know is simply not in the file you imported.",
          "The temptation is to guess. Plenty of tools will look at an image and tell you the touch targets are too small, inferring that from pixel measurements of something that may not be a button at all. A confident wrong finding in an accessibility report is worse than no finding, because somebody acts on it.",
        ],
      },
      {
        id: "approach",
        title: "Approach",
        body: [
          "So the line gets drawn and held. Contrast and colour distinguishability are arithmetic, so the app does them on device and shows its working. Everything that needs the semantic layer a screenshot does not carry stays manual, in a lens where a human drops a pin and picks the criterion.",
          "Pins rather than a list, because a violation's position on screen matters as much as its description. Telling someone the contrast fails is a bug report. Showing them where is a fix.",
        ],
        points: [
          "The criterion picker is written in plain language, so it teaches while you use it. Most designers do not know WCAG numbers by heart and there is no reason they should.",
          "Nothing leaves the device. No account, no upload, no model. The screenshots people audit are of unreleased products.",
        ],
      },
      {
        id: "results",
        title: "Results",
        body: [
          "It ships with a real audit in it: five screens of a music app, thirteen findings across four severity levels, so the workflow is visible the moment you open it.",
          "ARIA is also the reason Ally exists. Building this one taught me the thing that killed it, which is that auditing is desk work. The app is good and the premise was wrong, and the useful part was working out that the real gap is understanding rather than detection.",
        ],
        points: [
          "What I would change: the report is a rendered view rather than a text layer, which is the same flaw Ally shipped. An accessibility report a screen reader cannot read is an embarrassing thing to hand anyone.",
        ],
      },
    ],
  },

  portfolio: {
    id: "portfolio",
    title: "An Interactive Desk",
    subtitle: "A portfolio you walk into, that also works with the screen off",
    timeframe: "2026",
    repo: "https://github.com/keerthianil/Portfolio",
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
          "It was built with AI assistance, and the interesting part is what that does and does not do. It writes quickly, and it will happily produce a confident, broken, inaccessible version of anything you ask for. Directing it is the work.",
        ],
      },
      {
        id: "challenge",
        title: "Challenge",
        body: [
          "Almost every 3D portfolio is unusable with a keyboard, invisible to a screen reader, and a black rectangle without WebGL. That made it exactly the wrong thing for me to build and exactly the right thing to fix. A portfolio about accessibility that is not accessible is an argument against its author.",
          "A canvas has no structure. Nothing to tab to, nothing to announce, nothing for a focus ring to sit on. And a scene that fails has to fail into something: a throttled background tab and a shader that throws both produced the same result, which was a working site under a black rectangle that never lifted.",
        ],
      },
      {
        id: "approach",
        title: "Approach",
        body: [
          "Every object in the room is also a real button, hidden until it is focused, and the scene draws a ring around the focused object in 3D. That ring is on whenever the room is, not behind an accessibility mode.",
          "The hash is the router, so every view has a URL, and the panels that go a level deeper push a history entry rather than replacing one, so Back closes the panel instead of leaving the site. Without WebGL you get a flat view that is not a picture of the room: every object in it was a link anyway.",
        ],
        points: [
          "The camera leads the overlay by 700ms, so you arrive at the object before its content covers it.",
          "Four things in the room do something rather than say something. Pull the blind and the daylight goes with it, because glare is an access need and a room going dark is a better argument than a caption about it.",
          "The palette is measured against the background, not eyeballed. A version shipped with the blue channel left in gamma space and every ratio came out inflated, which only shows up if you compute it twice.",
        ],
      },
      {
        id: "results",
        title: "Results",
        body: [
          "It works with a keyboard, with a screen reader, without WebGL, and at 320px. The curtain over the loading scene has two independent guards on it, both added after a real black screen.",
          "The parts that took longest were not the 3D. They were a modal sized to its animating parent instead of the viewport, two Escape handlers closing two dialogs at once, and an opening animation that ran twice because the panels sat inside a presence wrapper that played their exit when they were told to open.",
          "What the AI assistance changed is that it made the expensive version affordable. What it did not change is that every one of those decisions still had to be made by somebody, and every claim on this page still had to be checked by somebody.",
        ],
        points: [
          "Still open, and stated rather than quietly left out: this has been measured in an emulator at six phone widths and never opened on a real device, and no automated accessibility scan has been run against it.",
        ],
      },
    ],
  },

  swaptitude: {
    id: "swaptitude",
    title: "Swaptitude",
    subtitle: "Teach one thing, learn another",
    timeframe: "2025",
    figma: {
      href: "https://www.figma.com/design/EwcJ2adgMQA9KSAmJGBysq/Swaptitude?node-id=0-1",
      label: "Design file",
    },
    sections: [
      {
        id: "summary",
        title: "Summary",
        body: [
          "A skill swap marketplace. You post what you can teach and what you want to learn, and the app looks for the person whose post is the mirror of yours.",
          "No money moves. An hour of guitar for an hour of Spanish, matched, chatted about and scheduled in the app. Firebase behind all of it, so posts, matches and chat are live rather than four copies of a local database.",
        ],
      },
      {
        id: "challenge",
        title: "Challenge",
        body: [
          "A two sided match is not a search. Both sides have to want what the other has, so the interesting query is which pairs of posts complement each other, which is a different shape of problem from a feed.",
          "The harder thing was four people on one codebase for the first time. Everybody wanted to own a tab, tabs share models, and the same user object got defined three slightly different ways inside a week.",
        ],
      },
      {
        id: "approach",
        title: "Approach",
        body: [
          "We settled it with structure rather than with a meeting. One model layer, one service layer for everything that talks to Firebase, and a view model per feature. After that the conflicts were in views, which are cheap to resolve, rather than in models, which are not.",
        ],
        points: [
          "Matching runs on the post rather than the profile. What you want this month is not who you are, and a match built from a post expires with the post.",
          "The feed says why you cannot swap with someone, not just that you cannot. A disabled button with no explanation is a dead end.",
        ],
      },
      {
        id: "results",
        title: "Results",
        body: [
          "The whole loop works end to end: sign up, post, get matched, chat, schedule, review.",
          "What I took from it was mostly about working in a team. Naming the boundaries early is worth more than agreeing on style, and the architecture decision we made in week two is why the last two weeks were not spent merging.",
        ],
        points: [
          "Matching is a query run on the client, which is fine for a class project and would fall over at any real number of posts. It belongs on the server.",
          "And it needs an accessibility pass. This was built before I started working on accessibility properly, and it shows.",
        ],
      },
    ],
  },

  travelplanner: {
    id: "travelplanner",
    title: "TravelPlanner",
    subtitle: "The one that is about persistence rather than touch",
    timeframe: "2025",
    sections: [
      {
        id: "summary",
        title: "Summary",
        body: [
          "Destinations, trips inside them, activities and expenses inside those. A planner where the whole point is that it is still there tomorrow.",
          "It is in this list because it is the one project here about data rather than about touch, and because most of what I know about modelling relationships came out of it. It was built twice, in storyboards and in SwiftUI, which turned out to be the useful part.",
        ],
      },
      {
        id: "challenge",
        title: "Challenge",
        body: [
          "Nested ownership is easy to draw and easy to get wrong. Deleting a destination has to take its trips, activities and expenses with it, or leave orphans in the store forever.",
          "The other one was the network. The app enriches destinations from a remote source, and the first version assumed that call succeeds. On a plane, which is exactly where you would open a travel planner, it does not.",
        ],
      },
      {
        id: "approach",
        title: "Approach",
        body: [
          "One data manager owns the store and every view goes through it. Delete rules are declared on the model rather than implemented in each view, so removing a destination cascades once, in one place.",
          "The API layer never writes to the store directly, so a failed fetch degrades to what is already saved instead of blanking the screen. What is stored locally is the truth and the remote data is a decoration on top of it.",
        ],
        points: [
          "Dates are validated at entry rather than at display. A trip that ends before it starts should be impossible to type, not caught later by a view that has to decide what to render.",
        ],
      },
      {
        id: "results",
        title: "Results",
        body: [
          "It does what it says and it survives being force quit, which is the entire bar for this kind of app.",
          "The useful outcome was the comparison. Having written the same screens twice, I can say specifically what SwiftUI costs you and what it buys, rather than repeating what everybody says about it.",
        ],
        points: [
          "What I would change: the view models live in a folder that also contains views, which is invisible while you are writing it and confusing six months later.",
          "And like everything else from that term, it predates my accessibility work. Dynamic Type and VoiceOver labels would be the first pass if I picked it back up.",
        ],
      },
    ],
  },
};
