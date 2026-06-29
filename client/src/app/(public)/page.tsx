import Image from "next/image";

export default function TutorFinderLanding() {
  return (
    <div className="min-h-screen text-primary bg-background">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-primary" />
            <span className="text-lg font-semibold tracking-tight">
              TutorFinder
            </span>
          </div>
          <nav className="hidden items-center gap-8 text-sm text-primary md:flex">
            <a className="hover:text-secondary" href="#subjects">
              Subjects
            </a>
            <a className="hover:text-secondary" href="#levels">
              Levels
            </a>
            <a className="hover:text-secondary" href="#how">
              How it works
            </a>
            <a className="hover:text-secondary" href="#pricing">
              Pricing
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <a
              className="rounded-xl bg-brand-green-emerald border font-medium border-secondary/15 px-4 py-2 text-sm text-white hover:bg-white/90 hover:text-primary md:inline-block"
              href="login"
            >
              Login
            </a>
            <a
              className="rounded-xl bg-primary border font-medium border-secondary/15 px-4 py-2 text-sm text-white hover:bg-white/90 hover:text-primary md:inline-block"
              href="register"
            >
              Sign Up
            </a>
          </div>
        </div>
      </header>

      <main className="relative isolate overflow-hidden pt-24">
        <div className="pointer-events-none absolute -left-1/2 top-0 h-[120vh] w-[120vw] bg-[radial-gradient(ellipse_at_center,rgba(0,119,182,0.25)_0%,rgba(13,13,34,0.0)_60%)]" />
        <div className="pointer-events-none absolute right-0 top-0 -z-10 h-[120vh] w-full bg-[radial-gradient(ellipse_at_right,rgba(255,255,255,0.12)_0%,rgba(13,13,34,0.0)_55%)]" />

        <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 pb-24 pt-12 md:grid-cols-2">
          <div>
            <h1 className="text-5xl font-bold tracking-tight md:text-6xl">
              Find the right tutor,
              <br />
              faster than ever
            </h1>
            <p className="mt-5 max-w-xl text-base text-primary/80">
              Match with vetted tutors in minutes, book secure lessons, and
              track progress with smart tools for families, students, and
              schools.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="/login"
                className="font-semibold rounded-xl bg-primary px-5 py-3 text-sm font-medium hover:bg-brand-green-emerald text-white"
              >
                Find a Tutor
              </a>
              <a
                href="/login"
                className="font-semibold rounded-xl bg-primary px-5 py-3 text-sm font-medium hover:bg-brand-green-emerald text-white"
              >
                Become a Tutor
              </a>
            </div>

            <form
              className="mt-6 rounded-2xl bg-primary/50 p-3 backdrop-blur"
              action="#search"
            >
              <div className="grid gap-3 md:grid-cols-4">
                <input
                  type="text"
                  placeholder="Subject"
                  className="w-full rounded-xl border border-white/10 focus:bg-white/20 bg-white/70 px-4 py-3 text-sm placeholder:text-primary/80 focus:outline-none focus:ring-2 focus:ring-white"
                />
                <input
                  type="text"
                  placeholder="Grade level"
                  className="w-full rounded-xl border border-white/10 focus:bg-white/20 bg-white/70 px-4 py-3 text-sm placeholder:text-primary/80 focus:outline-none focus:ring-2 focus:ring-white"
                />
                <input
                  type="text"
                  placeholder="Location"
                  className="w-full rounded-xl border border-white/10 focus:bg-white/20 bg-white/70 px-4 py-3 text-sm placeholder:text-primary/80 focus:outline-none focus:ring-2 focus:ring-white"
                />
                <button
                  className="rounded-xl bg-primary px-5 py-3 text-xl text-white font-medium hover:bg-brand-green-emerald"
                  type="submit"
                >
                  Search
                </button>
              </div>
            </form>

            <div className="mt-10 grid max-w-lg grid-cols-2 gap-6 text-sm text-primary/80">
              <div className="space-y-1">
                <div className="font-semibold text-primary/80">
                  Instant Matching
                </div>
                <p>Tell us your goals and get curated matches fast.</p>
              </div>
              <div className="space-y-1">
                <div className="font-semibold text-primary/80">
                  Verified Tutors
                </div>
                <p>ID checks, credentials, and background screening.</p>
              </div>
              <div className="space-y-1">
                <div className="font-semibold text-primary/80">
                  Secure Payments
                </div>
                <p>Pay per session with protection and receipts.</p>
              </div>
              <div className="space-y-1">
                <div className="font-semibold text-primary/80">
                  Progress Tracking
                </div>
                <p>Session notes, goals, and weekly reports.</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/3] w-full overflow-hidden rounded-3xl border border-white/10 to-white/10 shadow-2xl">
              <Image src="/image/landing/language-tutor.jpg" className="h-full w-auto" alt="Description" width={400} height={300} />
            </div>
            <div className="absolute bottom-4 right-4 w-72 rounded-2xl border border-white/10 p-4 bg-primary">
              <div className="text-sm text-white font-semibold">Top Subjects</div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-white/80">
                <Badge>Math</Badge>
                <Badge>English</Badge>
                <Badge>Physics</Badge>
                <Badge>Chemistry</Badge>
                <Badge>Biology</Badge>
                <Badge>Coding</Badge>
              </div>
            </div>
          </div>
        </section>

        <section id="trust" className="mx-auto max-w-7xl px-4 pb-24">
          <div className="grid grid-cols-2 items-center gap-6 opacity-70 sm:grid-cols-3 md:grid-cols-6">
            <LogoBox />
            <LogoBox />
            <LogoBox />
            <LogoBox />
            <LogoBox />
            <LogoBox />
          </div>
        </section>

        <section id="how" className="mx-auto max-w-7xl px-4 pb-24">
          <div className="mb-10 flex items-end justify-between">
            <h2 className="text-2xl font-semibold">How TutorFinder works</h2>
            <a
              href="#all"
              className="text-sm text-primary hover:text-primary/70"
            >
              See details →
            </a>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <Card
              title="Post your needs"
              desc="Share goals, schedule, budget, and preferences."
            />
            <Card
              title="Get matched"
              desc="We shortlist the best tutors using skills, rating, and fit."
            />
            <Card
              title="Book & learn"
              desc="Chat, schedule, pay securely, and track progress."
            />
          </div>
        </section>

        <section id="orgs" className="mx-auto max-w-7xl px-4 pb-28">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-primary/90 p-8">
              <div className="text-sm font-semibold text-white/90">
                For Schools & Orgs
              </div>
              <h3 className="mt-2 text-3xl text-white font-bold">
                Manage tutoring at scale
              </h3>
              <p className="mt-3 text-white/70">
                Roster import, attendance, invoicing, and analytics for
                districts, centers, and universities. SSO and data privacy
                built-in.
              </p>
              <div className="mt-6 flex gap-3 text-sm">
                <a
                  href="#contact"
                  className="rounded-xl bg-white px-4 py-2 font-medium text-black hover:bg-white/90"
                >
                  Contact Sales
                </a>
                <a
                  href="#pricing"
                  className="rounded-xl border border-white/15 px-4 py-2 text-white/90 hover:bg-white/5"
                >
                  View Pricing
                </a>
              </div>
            </div>
            <div className="aspect-[16/10] rounded-3xl border border-white/10 bg-[radial-gradient(1000px_140px_at_45%_70%,rgba(255,255,255,0.5),rgba(255,255,255,0)_60%)]" />
          </div>
        </section>
      </main>

      <footer className="border-t bg-secondary border-primary">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-10 text-sm text-white/80 md:grid-cols-4">
          <div className="space-y-3">
            <div className="text-white">TutorFinder</div>
            <p>Helping every learner find the right teacher.</p>
          </div>
          <div>
            <div className="mb-3 text-white">Explore</div>
            <ul className="space-y-2">
              <li>
                <a className="hover:text-primary" href="#find">
                  Find Tutors
                </a>
              </li>
              <li>
                <a className="hover:text-primary" href="#subjects">
                  Subjects
                </a>
              </li>
              <li>
                <a className="hover:text-primary" href="#reviews">
                  Reviews
                </a>
              </li>
            </ul>
          </div>
          <div>
            <div className="mb-3 text-white">Company</div>
            <ul className="space-y-2">
              <li>
                <a className="hover:text-white" href="#about">
                  About
                </a>
              </li>
              <li>
                <a className="hover:text-white" href="#careers">
                  Careers
                </a>
              </li>
              <li>
                <a className="hover:text-white" href="#press">
                  Press
                </a>
              </li>
            </ul>
          </div>
          <div>
            <div className="mb-3 text-white">Support</div>
            <ul className="space-y-2">
              <li>
                <a className="hover:text-white" href="#help">
                  Help Center
                </a>
              </li>
              <li>
                <a className="hover:text-white" href="#safety">
                  Safety
                </a>
              </li>
              <li>
                <a className="hover:text-white" href="#status">
                  Status
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 text-xs text-white/50">
            <p>
              © {new Date().getFullYear()} TutorFinder. All rights reserved.
            </p>
            <div className="flex gap-4">
              <a className="hover:text-white/80" href="#terms">
                Terms
              </a>
              <a className="hover:text-white/80" href="#privacy">
                Privacy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Card({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="text-base font-semibold text-primary/80">{title}</div>
      <p className="mt-2 text-sm text-primary/70">{desc}</p>
      <a
        href="#"
        className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#90e0ef] hover:text-[#caf0f8]"
      >
        Learn more<span aria-hidden="true">→</span>
      </a>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/30 px-2.5 py-1">
      {children}
    </span>
  );
}

function LogoBox() {
  return <div className="h-10 rounded bg-primary" />;
}
