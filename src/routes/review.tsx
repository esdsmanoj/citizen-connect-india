import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  SURVEY_ID, clearDraft, genIdempotencyKey, loadDraft, localized,
} from "@/lib/survey-store";

export const Route = createFileRoute("/review")({ component: ReviewPage });

function ReviewPage() {
  const navigate = useNavigate();
  const draft = loadDraft();
  const [submitting, setSubmitting] = useState(false);

  const { data: questions } = useQuery({
    queryKey: ["questions", SURVEY_ID],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("questions")
        .select("*, question_options(*)")
        .eq("survey_id", SURVEY_ID)
        .order("display_order");
      if (error) throw error;
      return data as any[];
    },
  });

  if (!draft) {
    return (
      <div className="app-shell items-center justify-center">
        <p className="m-auto text-sm text-muted-foreground">No draft found.</p>
      </div>
    );
  }

  const lang = draft.language;
  const total = questions?.length ?? 0;
  const answered = questions?.filter((q) => {
    const a = draft.answers[q.id];
    if (!a) return false;
    if (q.question_type === "single") return !!a.selectedOptionId;
    if (q.question_type === "rating") return !!a.rating;
    if (q.question_type === "text") return !!a.textAnswer?.trim();
    return false;
  }).length ?? 0;

  const submit = async () => {
    if (!questions) return;
    const required = questions.filter((q) => q.is_required);
    const missing = required.find((q) => {
      const a = draft.answers[q.id];
      if (!a) return true;
      if (q.question_type === "single") return !a.selectedOptionId;
      if (q.question_type === "rating") return !a.rating;
      if (q.question_type === "text") return !a.textAnswer?.trim();
      return false;
    });
    if (missing) {
      toast.error("Please complete all required questions");
      return;
    }

    setSubmitting(true);
    try {
      // Client-generated IDs so we don't need SELECT-after-insert
      // (anonymous role has no read access to these PII tables).
      const citizenId = crypto.randomUUID();
      const responseId = crypto.randomUUID();
      const responseCode = "VA2047-" + Math.floor(100000 + Math.random() * 900000);

      // 1. Insert citizen
      const { error: cErr } = await supabase
        .from("citizens")
        .insert({
          id: citizenId,
          name: draft.profile.name,
          mobile: draft.profile.mobile,
          age: parseInt(draft.profile.age, 10),
          gender: draft.profile.gender,
          district: draft.profile.district,
          profession: draft.profile.profession,
        });
      if (cErr) throw cErr;

      // 2. Insert response (unique by survey_id + mobile)
      const { error: rErr } = await supabase
        .from("survey_responses")
        .insert({
          id: responseId,
          survey_id: SURVEY_ID,
          citizen_id: citizenId,
          mobile: draft.profile.mobile,
          selected_language: lang,
          response_code: responseCode,
          idempotency_key: genIdempotencyKey(draft.profile),
        });
      if (rErr) {
        if (rErr.code === "23505") {
          toast.error("This mobile number has already submitted a response.");
          return;
        }
        throw rErr;
      }

      // 3. Insert answers
      const rows = questions.map((q) => {
        const a = draft.answers[q.id] || {};
        return {
          response_id: responseId,
          question_id: q.id,
          selected_option_id: a.selectedOptionId || null,
          rating_value: a.rating || null,
          other_text: a.otherText || a.textAnswer || null,
          comment: a.comment || null,
        };
      });
      const { error: aErr } = await supabase.from("survey_answers").insert(rows);
      if (aErr) throw aErr;

      // 4. Stash success info, clear draft
      sessionStorage.setItem(
        "va2047_success",
        JSON.stringify({ name: draft.profile.name, responseCode }),
      );
      clearDraft(draft.profile.mobile);
      navigate({ to: "/success" });
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-shell">
      <header className="shrink-0 flex items-center justify-between px-4 py-3 border-b bg-card">
        <Link to="/survey" className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-base font-semibold">Review Your Responses</h1>
        <span className="w-9" />
      </header>

      <main className="app-body px-4 py-4">
        <div className="mx-auto max-w-md space-y-3">
          <div className="rounded-xl border bg-success/10 px-4 py-3">
            <p className="text-xs text-muted-foreground">Questions Answered</p>
            <p className="text-lg font-semibold">{answered} / {total}</p>
          </div>

          <section className="rounded-xl border bg-card">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h2 className="text-sm font-semibold">Personal Information</h2>
              <Link to="/profile" className="text-xs text-primary inline-flex items-center gap-1">
                <Pencil className="h-3 w-3" /> Edit
              </Link>
            </div>
            <dl className="divide-y text-sm">
              <Row k="Name" v={draft.profile.name} />
              <Row k="Mobile" v={`+91 ${draft.profile.mobile}`} />
              <Row k="Age" v={draft.profile.age} />
              <Row k="Gender" v={draft.profile.gender} />
              <Row k="District" v={draft.profile.district} />
              <Row k="Profession" v={draft.profile.profession} />
            </dl>
          </section>

          {questions && (
            <section className="rounded-xl border bg-card">
              <div className="px-4 py-3 border-b flex items-center justify-between">
                <h2 className="text-sm font-semibold">Your Answers</h2>
                <Link to="/survey" className="text-xs text-primary inline-flex items-center gap-1">
                  <Pencil className="h-3 w-3" /> Edit
                </Link>
              </div>
              <ul className="divide-y">
                {questions.map((q, i) => {
                  const a = draft.answers[q.id];
                  let display = "—";
                  if (a) {
                    if (q.question_type === "single") {
                      const o = (q.question_options as any[]).find((x) => x.id === a.selectedOptionId);
                      display = o ? localized(o.label, lang) : "—";
                      if (o?.is_other && a.otherText) display += `: ${a.otherText}`;
                    } else if (q.question_type === "rating") {
                      display = `${a.rating || 0} / 5`;
                    } else if (q.question_type === "text") {
                      display = a.textAnswer || "—";
                    }
                  }
                  return (
                    <li key={q.id} className="px-4 py-2.5">
                      <p className="text-xs text-muted-foreground">Q{i + 1}. {localized(q.text, lang)}</p>
                      <p className="text-sm font-medium mt-0.5">{display}</p>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>
      </main>

      <footer className="shrink-0 px-4 py-3 border-t bg-card">
        <div className="mx-auto max-w-md grid grid-cols-2 gap-3">
          <Button variant="outline" size="lg" className="h-12" onClick={() => navigate({ to: "/survey" })}>
            Back
          </Button>
          <Button size="lg" className="h-12" disabled={submitting} onClick={submit}>
            {submitting ? "Submitting…" : "Submit Feedback"}
          </Button>
        </div>
      </footer>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-2">
      <dt className="text-xs text-muted-foreground">{k}</dt>
      <dd className="text-sm font-medium">{v || "—"}</dd>
    </div>
  );
}
