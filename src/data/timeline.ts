export interface TimelineEntry {
  id: string;
  from: string;
  to: string;
  /** Sort key, as YYYYMM. Newest first. */
  start: number;
  role: string;
  org: string;
  place: string;
  kind: "work" | "study";
  lines: string[];
}

/**
 * Work and study, from the resume, with the current role first and the rest
 * newest first after it.
 *
 * Overlapping rows are real and there are several, which a stack of calendar
 * pages states rather than draws. A chart that drew them was tried and removed:
 * it read as analysis sitting next to the thing it analysed, and it pushed the
 * calendar off a panel whose whole job is to be the calendar you clicked.
 */
export const TIMELINE: TimelineEntry[] = [
  {
    id: "roux",
    from: "Sep 2025",
    to: "now",
    start: 202509,
    role: "Research assistant and iOS developer",
    org: "The Roux Institute, Northeastern University",
    place: "Boston, MA",
    kind: "work",
    lines: [
      "Built StemAlly and TactileNav, two accessibility-first iOS prototypes for blind and low-vision users.",
      "Ran usability studies and analysed task and gesture logs, shipping updated builds on a regular feedback cycle.",
      "Demonstrated both prototypes at accessibility conferences, directly with blind and low-vision users.",
    ],
  },
  {
    id: "clean-harbors",
    from: "Dec 2025",
    to: "May 2026",
    start: 202512,
    role: "Technical project manager",
    org: "Clean Harbors",
    place: "Norwell, MA",
    kind: "work",
    lines: [
      "Translated Figma wireframes into technical requirements for a permit management web application across 200+ branches.",
      "Built Power BI dashboards and Excel reports that turned sprint data into weekly performance reporting for senior leadership.",
    ],
  },
  {
    id: "ta",
    from: "Sep 2025",
    to: "Dec 2025",
    start: 202509,
    role: "Teaching assistant, iOS development",
    org: "Northeastern University",
    place: "Boston, MA",
    kind: "work",
    lines: [
      "Led weekly labs and office hours for 40+ graduate students, from programmatic UIKit through SwiftUI.",
      "Reviewed submissions each week on architecture, Core Data and Combine, and on adherence to the Human Interface Guidelines.",
    ],
  },
  {
    id: "ms",
    from: "Sep 2024",
    to: "Dec 2026",
    start: 202409,
    role: "MS, Information Systems",
    org: "Northeastern University, College of Engineering",
    place: "Boston, MA",
    kind: "study",
    lines: ["Graduating December 2026."],
  },
  {
    id: "capgemini",
    from: "Jun 2023",
    to: "Aug 2024",
    start: 202306,
    role: "Software engineer",
    org: "Capgemini",
    place: "Bengaluru, India",
    kind: "work",
    lines: [
      "Contributed to RESTful API development across client engagements on AWS.",
      "Wrote test cases and ran UAT to validate quality before production releases.",
    ],
  },
  {
    id: "varcons",
    from: "Jan 2023",
    to: "Apr 2023",
    start: 202301,
    role: "Web application developer, internship",
    org: "Varcons Technologies",
    place: "Bengaluru, India, remote",
    kind: "work",
    lines: [
      "Built a responsive food ordering system for a cafe in Bangalore, in HTML, CSS and JavaScript.",
      "Full menu, ordering and reservation flows, designed and built end to end.",
    ],
  },
  {
    id: "ace",
    from: "Oct 2021",
    to: "Dec 2022",
    start: 202110,
    role: "Club head, Association of Computer Engineers",
    org: "CMR Institute of Technology, CSE Department",
    place: "Bengaluru, India",
    kind: "work",
    lines: [
      "Led the Association of Computer Engineers for 200+ students.",
      "Organised technical workshops, hackathons and inter-college events. The kind of role where you learn project management before anyone calls it that.",
    ],
  },
  {
    id: "cmrit-ra",
    from: "Aug 2021",
    to: "Dec 2021",
    start: 202108,
    role: "Research assistant, accessibility technology",
    org: "CMR Institute of Technology",
    place: "Bengaluru, India",
    kind: "work",
    lines: [
      "Built a hands-free computer control system for people with physical disabilities.",
      "Facial gesture tracking for cursor movement, the nose as an anchor and eye blinks for clicks, plus a custom voice assistant.",
      "This is the one that started it. Everything since has been a version of the same question.",
    ],
  },
  {
    id: "be",
    from: "Aug 2019",
    to: "Jun 2023",
    start: 201908,
    role: "BE, Computer Science",
    org: "CMR Institute of Technology",
    place: "Bengaluru, India",
    kind: "study",
    lines: [
      "Researched hands-free computer control for people with physical disabilities, building and testing a facial-gesture cursor with target users.",
    ],
  },
];
