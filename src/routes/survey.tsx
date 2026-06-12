import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import {
  SURVEY_ID, emptyDraft, loadDraft, saveDraft, localized, type AnswerValue,
} from "@/lib/survey-store";

export const Route = createFileRoute("/survey")({ component: SurveyPage });

type Question = {
  id: string;
  question_type: "single" | "rating" | "text";
  text: Record<string, string>;
  display_order: number;
  is_required: boolean;
  allow_other: boolean;
  allow_comment: boolean;
  question_options: {
    id: string;
    option_code: string;
    label: Record<string, string>;
    display_order: number;
    is_other: boolean;
  }[];
};

function SurveyPage() {
  const navigate = useNavigate();
  const draft = useMemo(() => loadDraft() ?? emptyDraft(), []);
  const lang = draft.language;
  const [idx, setIdx] = useState(draft.currentIndex || 0);

  const { data: questions, isLoading } = useQuery({
    queryKey: ["questions", SURVEY_ID],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("questions")
        .select("*, question_options(*)")
        .eq("survey_id", SURVEY_ID)
        .order("display_order");
      if (error) throw error;
      return (data as Question[]).map((q) => ({
        ...q,
        question_options: [...(q.question_options || [])].sort((a, b) => a.display_order - b.display_order),
      }));
    },
  });

  if (isLoading || !questions) {
    return (
      <div className="app-shell items-center justify-center">
        <p className="m-auto text-sm text-muted-foreground">Loading survey…</p>
      </div>
    );
  }

  const total = questions.length;
  const q = questions[idx];
  if (!q) return null;
  const progress = ((idx + 1) / total) * 100;
  const current: AnswerValue = draft.answers[q.id] ?? { updatedAt: new Date().toISOString() };

  const updateAnswer = (patch: Partial<AnswerValue>) => {
    const next: AnswerValue = { ...current, ...patch, updatedAt: new Date().toISOString() };
    const fresh = loadDraft() ?? draft;
    fresh.answers = { ...fresh.answers, [q.id]: next };
    fresh.currentIndex = idx;
    saveDraft(fresh);
  };

  const canAdvance = () => {
    if (!q.is_required) return true;
    const a = (loadDraft()?.answers || {})[q.id];
    if (!a) return false;
    if (q.question_type === "single") return !!a.selectedOptionId;
    if (q.question_type === "rating") return !!a.rating && a.rating > 0;
    if (q.question_type === "text") return !!a.textAnswer?.trim();
    return false;
  };

  const next = () => {
    if (!canAdvance()) return;
    if (idx + 1 < total) {
      setIdx(idx + 1);
      const fresh = loadDraft() ?? draft;
      fresh.currentIndex = idx + 1;
      saveDraft(fresh);
    } else {
      navigate({ to: "/review" });
    }
  };
  const back = () => {
    if (idx === 0) {
      navigate({ to: "/intro" });
    } else {
      setIdx(idx - 1);
    }
  };

  const selectedOpt = q.question_options.find((o) => o.id === current.selectedOptionId);
  const showOther = q.allow_other && selectedOpt?.is_other;

  return (
    <div className="app-shell">
      <header className="shrink-0 px-4 pt-3 pb-2 border-b bg-card">
        <div className="mx-auto max-w-md">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span className="font-medium text-foreground">Question {idx + 1} of {total}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      </header>

      <main className="app-body px-4 py-4">
        <div className="mx-auto max-w-md">
          <h2 className="text-lg font-semibold leading-snug text-foreground">
            {localized(q.text, lang)}
          </h2>

          {q.question_type === "single" && (
            <div className="mt-4 space-y-2">
              {q.question_options.map((o) => {
                const sel = current.selectedOptionId === o.id;
                return (
                  <button
                    key={o.id}
                    onClick={() => updateAnswer({ selectedOptionId: o.id })}
                    data-selected={sel}
                    className="option-pill w-full rounded-xl px-4 py-3 text-left flex items-center gap-3"
                  >
                    <span
                      className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                        sel ? "border-primary" : "border-muted-foreground/40"
                      }`}
                    >
                      {sel && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
                    </span>
                    <span className="text-sm font-medium">{localized(o.label, lang)}</span>
                  </button>
                );
              })}
              {showOther && (
                <div className="pt-2">
                  <label className="text-xs text-muted-foreground">Other (Please specify)</label>
                  <Textarea
                    rows={2}
                    value={current.otherText || ""}
                    onChange={(e) => updateAnswer({ otherText: e.target.value })}
                    placeholder="Type your answer…"
                    className="mt-1"
                  />
                </div>
              )}
            </div>
          )}

          {q.question_type === "rating" && (
            <div className="mt-6 flex flex-col items-center">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => {
                  const filled = (current.rating || 0) >= n;
                  return (
                    <button key={n} onClick={() => updateAnswer({ rating: n })} className="p-1">
                      <Star
                        className={`h-9 w-9 transition ${
                          filled ? "fill-saffron text-saffron" : "text-muted-foreground/30"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-sm font-medium text-muted-foreground">
                {ratingLabel(current.rating || 0)}
              </p>
            </div>
          )}

          {q.question_type === "text" && (
            <div className="mt-4">
              <Textarea
                rows={5}
                value={current.textAnswer || ""}
                onChange={(e) => updateAnswer({ textAnswer: e.target.value })}
                placeholder="Share your thoughts…"
              />
            </div>
          )}

          {q.allow_comment && q.question_type !== "text" && (
            <div className="mt-4">
              <label className="text-xs text-muted-foreground">Additional Comments (optional)</label>
              <Textarea
                rows={2}
                value={current.comment || ""}
                onChange={(e) => updateAnswer({ comment: e.target.value })}
                className="mt-1"
                placeholder="Add a comment…"
              />
            </div>
          )}
        </div>
      </main>

      <footer className="shrink-0 px-4 py-3 border-t bg-card">
        <div className="mx-auto max-w-md grid grid-cols-2 gap-3">
          <Button variant="outline" size="lg" className="h-12" onClick={back}>
            Back
          </Button>
          <Button size="lg" className="h-12" onClick={next} disabled={q.is_required && !canAdvance()}>
            {idx + 1 === total ? "Review" : "Next"}
          </Button>
        </div>
      </footer>
    </div>
  );
}

function ratingLabel(n: number) {
  return ["Tap a star to rate", "Very Poor", "Poor", "Average", "Good", "Excellent"][n] || "";
}
