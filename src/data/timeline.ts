export interface TimelineEntry {
  from: string;
  to: string;
  /** Sort key, newest first. */
  start: number;
  role: string;
  org: string;
  place: string;
  kind: "work" | "study";
  lines: string[];
}

/**
 * From the resume. Newest first. Overlapping rows are real: the research
 * assistantship ran alongside both the teaching assistantship and the Clean
 * Harbors work.
 */
export const TIMELINE: TimelineEntry[] = [
  {
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
    from: "Sep 2025",
    to: "Dec 2025",
    start: 202508,
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
