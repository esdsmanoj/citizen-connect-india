import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Clock, FileText, Award, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadDraft } from "@/lib/survey-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Viksit Assam 2047 — Citizen Feedback Portal" },
      { name: "description", content: "Share Your Vision for Viksit Assam 2047. A citizen feedback portal by the Government of Assam." },
      { property: "og:title", content: "Viksit Assam 2047 — Citizen Feedback Portal" },
      { property: "og:description", content: "Share your vision and help build a developed, progressive, and prosperous Assam." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const navigate = useNavigate();
  const [hasDraft, setHasDraft] = useState(false);

  useEffect(() => {
    const d = loadDraft();
    if (d && d.status === "draft" && (d.profile.name || Object.keys(d.answers).length)) {
      setHasDraft(true);
    }
  }, []);

  return (
    <div className="app-shell gradient-hero relative">
      {/* Decorative background */}
      <BackgroundDecor />

      <main className="app-body relative z-10 flex flex-col items-center justify-center px-6 py-6 text-center">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center">
          {/* Emblem */}
          <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-full bg-card shadow-md ring-2 ring-primary/15">
            <AssamEmblem className="h-9 w-9" />
          </div>

          <p className="text-[11px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            Government of Assam
          </p>
          <h1 className="mt-2 text-4xl font-extrabold leading-tight text-primary drop-shadow-sm">
            VIKSIT ASSAM
          </h1>
          <p className="text-5xl font-extrabold text-saffron leading-none mt-1 drop-shadow-sm">2047</p>

          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-card/70 backdrop-blur px-3 py-1 border shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-saffron" />
            <span className="text-[11px] font-medium text-foreground/80">Citizen Feedback Portal</span>
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          </div>

          <p className="mt-4 text-base font-semibold text-foreground">
            Share Your Vision for Viksit Assam 2047
          </p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Your feedback will help in building a developed, progressive, and prosperous Assam.
          </p>

          <ul className="mt-6 w-full grid grid-cols-2 gap-2.5 text-left">
            <Feature icon={<Clock className="h-4 w-4" />} text="5 Min Survey" />
            <Feature icon={<FileText className="h-4 w-4" />} text="15–20 Qs" />
            <Feature icon={<Award className="h-4 w-4" />} text="Certificate" />
            <Feature icon={<Languages className="h-4 w-4" />} text="5 Languages" />
          </ul>
        </div>
      </main>
      <footer className="relative z-10 shrink-0 px-6 pb-6 pt-2">
        <div className="mx-auto max-w-md space-y-2">
          {hasDraft && (
            <Button
              variant="outline"
              size="lg"
              className="w-full h-12 text-base bg-card/80 backdrop-blur"
              onClick={() => navigate({ to: "/survey" })}
            >
              Resume incomplete survey
            </Button>
          )}
          <Button
            size="lg"
            className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/25"
            onClick={() => navigate({ to: "/language" })}
          >
            Participate Now
          </Button>
          <p className="text-center text-[11px] text-muted-foreground pt-1">
            By participating, you agree to our terms &amp; privacy policy.
          </p>
        </div>
      </footer>
    </div>
  );
}

function Feature({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <li className="flex items-center gap-2.5 rounded-xl border bg-card/85 backdrop-blur px-3 py-2.5 shadow-sm">
      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </span>
      <span className="text-sm font-medium text-foreground">{text}</span>
    </li>
  );
}

function AssamEmblem({ className }: { className?: string }) {
  // Stylized one-horned rhinoceros (Assam's state animal) silhouette
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="30" fill="url(#emb)" />
      <path
        d="M14 40c2-6 7-10 14-10 4 0 6 1 8 3l2-4 3 2-1 4c3 2 5 5 6 9H14z"
        fill="currentColor"
        className="text-primary"
      />
      <circle cx="36" cy="34" r="1.2" fill="white" />
      <defs>
        <linearGradient id="emb" x1="0" y1="0" x2="64" y2="64">
          <stop offset="0" stopColor="oklch(0.95 0.04 60)" />
          <stop offset="1" stopColor="oklch(0.92 0.06 250)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function BackgroundDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Soft saffron orb */}
      <div className="absolute -top-24 -right-20 h-72 w-72 rounded-full bg-saffron/20 blur-3xl" />
      {/* Soft primary orb */}
      <div className="absolute -bottom-24 -left-20 h-80 w-80 rounded-full bg-primary/15 blur-3xl" />

      {/* Stylized Assam state silhouette — top right, very subtle */}
      <svg
        className="absolute -top-6 -right-6 h-56 w-56 text-primary/10"
        viewBox="0 0 200 120"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path d="M10 70 C 20 50, 40 45, 55 55 C 70 40, 90 38, 105 50 C 120 35, 145 30, 165 42 C 180 50, 195 55, 190 75 C 180 90, 160 95, 140 85 C 120 95, 95 95, 80 82 C 60 92, 35 90, 22 80 C 12 78, 8 75, 10 70 Z" />
      </svg>

      {/* Brahmaputra river — flowing wave lines bottom */}
      <svg
        className="absolute bottom-0 left-0 w-full h-40 text-primary/10"
        viewBox="0 0 400 160"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path d="M0 90 Q 100 60 200 90 T 400 90 L 400 160 L 0 160 Z" fill="currentColor" />
        <path d="M0 110 Q 100 80 200 110 T 400 110 L 400 160 L 0 160 Z" fill="currentColor" opacity="0.6" />
        <path d="M0 130 Q 100 100 200 130 T 400 130 L 400 160 L 0 160 Z" fill="currentColor" opacity="0.4" />
      </svg>

      {/* Tea-leaf motifs — celebrating Assam's tea heritage */}
      <svg
        className="absolute top-1/3 -left-4 h-16 w-16 text-success/30 rotate-12"
        viewBox="0 0 32 32"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path d="M16 2 C 22 8, 26 16, 16 30 C 6 16, 10 8, 16 2 Z" />
        <path d="M16 6 L 16 28" stroke="white" strokeWidth="0.5" />
      </svg>
      <svg
        className="absolute top-20 right-8 h-10 w-10 text-saffron/30 -rotate-12"
        viewBox="0 0 32 32"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path d="M16 2 C 22 8, 26 16, 16 30 C 6 16, 10 8, 16 2 Z" />
      </svg>

      {/* Dotted pattern */}
      <svg
        className="absolute top-10 left-6 h-20 w-20 text-primary/15"
        viewBox="0 0 80 80"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          <pattern id="dots" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.2" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="80" height="80" fill="url(#dots)" />
      </svg>
    </div>
  );
}
