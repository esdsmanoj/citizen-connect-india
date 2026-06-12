import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LANGUAGES, loadDraft, saveDraft, emptyDraft, type LangCode } from "@/lib/survey-store";

export const Route = createFileRoute("/language")({
  component: LanguagePage,
});

function LanguagePage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<LangCode>("en");

  useEffect(() => {
    const d = loadDraft();
    if (d) setSelected(d.language);
  }, []);

  const handleContinue = () => {
    const draft = loadDraft() ?? emptyDraft();
    draft.language = selected;
    saveDraft(draft);
    navigate({ to: "/profile" });
  };

  return (
    <div className="app-shell">
      <header className="shrink-0 flex items-center justify-between px-4 py-3 border-b bg-card">
        <Link to="/" className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-base font-semibold">Select Language</h1>
        <span className="w-9" />
      </header>

      <main className="app-body px-4 py-4">
        <div className="mx-auto max-w-md space-y-2">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => setSelected(l.code)}
              data-selected={selected === l.code}
              className="option-pill w-full rounded-xl px-4 py-3 flex items-center gap-3"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-saffron/15 text-sm font-bold text-saffron">
                {l.native.slice(0, 1)}
              </span>
              <span className="flex-1 text-left">
                <span className="block text-base font-medium">{l.native}</span>
                <span className="block text-xs text-muted-foreground">{l.english}</span>
              </span>
              {selected === l.code && <Check className="h-5 w-5 text-primary" />}
            </button>
          ))}
        </div>
      </main>

      <footer className="shrink-0 px-4 py-3 border-t bg-card">
        <div className="mx-auto max-w-md">
          <Button size="lg" className="w-full h-12" onClick={handleContinue}>
            Continue
          </Button>
        </div>
      </footer>
    </div>
  );
}
