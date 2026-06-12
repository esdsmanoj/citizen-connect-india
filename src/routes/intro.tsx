import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ClipboardCheck, Clock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/intro")({ component: Intro });

function Intro() {
  const navigate = useNavigate();
  return (
    <div className="app-shell">
      <header className="shrink-0 flex items-center justify-between px-4 py-3 border-b bg-card">
        <Link to="/profile" className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <span className="w-9" />
        <span className="w-9" />
      </header>
      <main className="app-body flex items-center justify-center px-6 py-6 text-center">
        <div className="mx-auto max-w-md">
          <div className="mx-auto inline-flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ClipboardCheck className="h-12 w-12" />
          </div>
          <h2 className="mt-6 text-2xl font-bold">Welcome!</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your feedback is important to shape the future of Assam.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Card icon={<Clock className="h-4 w-4" />} label="Duration" value="5 Minutes" />
            <Card icon={<FileText className="h-4 w-4" />} label="Questions" value="18" />
          </div>
        </div>
      </main>
      <footer className="shrink-0 px-4 py-3 border-t bg-card">
        <div className="mx-auto max-w-md">
          <Button size="lg" className="w-full h-12" onClick={() => navigate({ to: "/survey" })}>
            Start Survey
          </Button>
        </div>
      </footer>
    </div>
  );
}

function Card({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-card p-3 text-left">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">{icon}</span>
        {label}
      </div>
      <p className="mt-1 text-base font-semibold">{value}</p>
    </div>
  );
}
