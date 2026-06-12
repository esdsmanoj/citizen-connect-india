import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Clock, FileText, Award, Languages, Globe2 } from "lucide-react";
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
    <div className="app-shell gradient-hero">
      <main className="app-body flex flex-col items-center justify-center px-6 py-6 text-center">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center">
          <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-card shadow-sm">
            <Globe2 className="h-7 w-7 text-primary" />
          </div>
          <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
            Government of Assam
          </p>
          <h1 className="mt-2 text-4xl font-extrabold leading-tight text-primary">
            VIKSIT ASSAM
          </h1>
          <p className="text-5xl font-extrabold text-saffron leading-none mt-1">2047</p>
          <p className="mt-3 text-base font-semibold text-foreground">
            Share Your Vision for Viksit Assam 2047
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Your feedback will help in building a developed, progressive, and prosperous Assam.
          </p>

          <ul className="mt-6 w-full space-y-2.5 text-left">
            <Feature icon={<Clock className="h-4 w-4" />} text="5 Minutes Survey" />
            <Feature icon={<FileText className="h-4 w-4" />} text="15–20 Questions" />
            <Feature icon={<Award className="h-4 w-4" />} text="Appreciation Certificate" />
            <Feature icon={<Languages className="h-4 w-4" />} text="Available in 5 languages" />
          </ul>
        </div>
      </main>
      <footer className="shrink-0 px-6 pb-6 pt-2">
        <div className="mx-auto max-w-md space-y-2">
          {hasDraft && (
            <Button
              variant="outline"
              size="lg"
              className="w-full h-12 text-base"
              onClick={() => navigate({ to: "/survey" })}
            >
              Resume incomplete survey
            </Button>
          )}
          <Button
            size="lg"
            className="w-full h-12 text-base font-semibold"
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
    <li className="flex items-center gap-3 rounded-xl border bg-card px-4 py-2.5 shadow-sm">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </span>
      <span className="text-sm font-medium text-foreground">{text}</span>
    </li>
  );
}
