export default function Home() {
  return (
    <main id="main" className="min-h-dvh px-6 py-24">
      <div className="mx-auto flex max-w-3xl flex-col gap-10">
        <header className="flex flex-col gap-3">
          <h1 className="font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl">
            Keerthi Anil
          </h1>
          <p className="text-highlight text-lg">
            Designer, Developer &amp; Researcher
          </p>
        </header>

        <p className="max-w-xl text-2xl leading-snug">
          I design, build, and research interfaces for the people default
          products miss.
        </p>

        <p className="font-mono text-text-muted text-sm tracking-wide uppercase">
          iOS / SwiftUI / Accessibility / AI
        </p>

        <section aria-label="Palette check" className="flex flex-col gap-3">
          <h2 className="font-display text-xl">Palette</h2>
          <ul className="flex flex-wrap gap-3">
            {[
              ["bg", "#0C0A09"],
              ["surface", "#17120F"],
              ["surface-raised", "#211A16"],
              ["border", "#2E2521"],
              ["accent", "#8B2332"],
              ["highlight", "#D4A0A0"],
              ["text", "#F2EAE1"],
              ["text-muted", "#7A706A"],
            ].map(([name, hex]) => (
              <li
                key={name}
                className="border-border flex flex-col gap-2 rounded-lg border p-3"
              >
                <span
                  className="block h-12 w-24 rounded"
                  style={{ background: hex }}
                />
                <span className="font-mono text-xs">{name}</span>
                <span className="font-mono text-text-muted text-xs">{hex}</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-label="Type check" className="flex flex-col gap-2">
          <h2 className="font-display text-xl">Type</h2>
          <p className="font-display text-2xl">Fraunces, display</p>
          <p className="font-sans text-lg">Schibsted Grotesk, body and UI</p>
          <p className="font-hand text-2xl">Patrick Hand, sticky notes</p>
          <p className="font-mono">JetBrains Mono, terminal</p>
        </section>
      </div>
    </main>
  );
}
