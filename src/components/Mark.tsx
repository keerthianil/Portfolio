/**
 * The logo mark: a fingertip on a raised line, with the feedback coming back
 * out of it. It is the whole portfolio in one glyph, and it works at 16px.
 */
export function Mark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="10.5" cy="16" r="3.75" fill="currentColor" />
      <path
        d="M17 10.6a7.2 7.2 0 0 1 0 10.8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M21.6 6.9a12.4 12.4 0 0 1 0 18.2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}
