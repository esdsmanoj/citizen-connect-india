import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Users, CheckCircle2, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SURVEY_ID, localized } from "@/lib/survey-store";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Dashboard — Viksit Assam 2047" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { data: total } = useQuery({
    queryKey: ["admin", "total"],
    queryFn: async () => {
      const { count } = await supabase
        .from("survey_responses")
        .select("*", { count: "exact", head: true })
        .eq("survey_id", SURVEY_ID);
      return count ?? 0;
    },
  });

  const { data: today } = useQuery({
    queryKey: ["admin", "today"],
    queryFn: async () => {
      const start = new Date(); start.setHours(0, 0, 0, 0);
      const { count } = await supabase
        .from("survey_responses")
        .select("*", { count: "exact", head: true })
        .eq("survey_id", SURVEY_ID)
        .gte("submitted_at", start.toISOString());
      return count ?? 0;
    },
  });

  const { data: byDistrict } = useQuery({
    queryKey: ["admin", "districts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("survey_responses")
        .select("citizens(district)")
        .eq("survey_id", SURVEY_ID)
        .limit(5000);
      const m = new Map<string, number>();
      (data as any[] | null)?.forEach((r) => {
        const d = r.citizens?.district || "Unknown";
        m.set(d, (m.get(d) || 0) + 1);
      });
      return Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
    },
  });

  const { data: questionStats } = useQuery({
    queryKey: ["admin", "questions"],
    queryFn: async () => {
      const { data: qs } = await supabase
        .from("questions")
        .select("*, question_options(*)")
        .eq("survey_id", SURVEY_ID)
        .order("display_order");
      const { data: answers } = await supabase
        .from("survey_answers")
        .select("question_id, selected_option_id, rating_value")
        .limit(50000);
      return (qs as any[] | null)?.map((q) => {
        const my = (answers as any[] | null)?.filter((a) => a.question_id === q.id) ?? [];
        if (q.question_type === "single") {
          const counts = new Map<string, number>();
          my.forEach((a) => a.selected_option_id && counts.set(a.selected_option_id, (counts.get(a.selected_option_id) || 0) + 1));
          return {
            ...q,
            kind: "single",
            counts: q.question_options.map((o: any) => ({
              label: localized(o.label, "en"),
              count: counts.get(o.id) || 0,
            })),
            total: my.length,
          };
        }
        if (q.question_type === "rating") {
          const sum = my.reduce((s, a) => s + (a.rating_value || 0), 0);
          return { ...q, kind: "rating", avg: my.length ? sum / my.length : 0, total: my.length };
        }
        return { ...q, kind: "text", total: my.length };
      });
    },
  });

  const exportCsv = async () => {
    const { data } = await supabase
      .from("survey_responses")
      .select("response_code, mobile, submitted_at, citizens(name,age,gender,district,profession)")
      .eq("survey_id", SURVEY_ID)
      .order("submitted_at", { ascending: false });
    const rows = [
      ["Response Code", "Mobile", "Name", "Age", "Gender", "District", "Profession", "Submitted At"],
      ...((data as any[] | null) ?? []).map((r) => [
        r.response_code, r.mobile, r.citizens?.name, r.citizens?.age,
        r.citizens?.gender, r.citizens?.district, r.citizens?.profession, r.submitted_at,
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `viksit-assam-responses-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app-shell">
      <header className="shrink-0 flex items-center justify-between px-4 py-3 border-b bg-card">
        <Link to="/" className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-base font-semibold">Admin Dashboard</h1>
        <button onClick={exportCsv} className="text-xs font-medium text-primary">Export CSV</button>
      </header>

      <main className="app-body px-4 py-4">
        <div className="mx-auto max-w-3xl space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Stat icon={<Users className="h-4 w-4" />} label="Total Responses" value={(total ?? 0).toLocaleString("en-IN")} />
            <Stat icon={<CheckCircle2 className="h-4 w-4" />} label="Today" value={(today ?? 0).toLocaleString("en-IN")} />
            <Stat icon={<MapPin className="h-4 w-4" />} label="Districts" value={String(byDistrict?.length ?? 0)} />
          </div>

          <section className="rounded-xl border bg-card">
            <h2 className="px-4 py-3 border-b text-sm font-semibold">Responses by District</h2>
            <ul className="divide-y">
              {(byDistrict ?? []).slice(0, 10).map(([d, n]) => (
                <li key={d} className="flex items-center justify-between px-4 py-2 text-sm">
                  <span>{d}</span>
                  <span className="font-medium">{n.toLocaleString("en-IN")}</span>
                </li>
              ))}
              {!byDistrict?.length && <li className="px-4 py-6 text-center text-sm text-muted-foreground">No responses yet</li>}
            </ul>
          </section>

          <section className="rounded-xl border bg-card">
            <h2 className="px-4 py-3 border-b text-sm font-semibold">Question Insights</h2>
            <ul className="divide-y">
              {(questionStats ?? []).map((q: any, i: number) => (
                <li key={q.id} className="px-4 py-3">
                  <p className="text-xs text-muted-foreground">Q{i + 1} · {q.total} responses</p>
                  <p className="text-sm font-medium mt-0.5">{localized(q.text, "en")}</p>
                  {q.kind === "single" && (
                    <div className="mt-2 space-y-1.5">
                      {q.counts.map((c: any) => {
                        const pct = q.total ? Math.round((c.count / q.total) * 100) : 0;
                        return (
                          <div key={c.label} className="text-xs">
                            <div className="flex justify-between"><span>{c.label}</span><span>{c.count} ({pct}%)</span></div>
                            <div className="h-1.5 rounded bg-muted overflow-hidden">
                              <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {q.kind === "rating" && (
                    <p className="text-sm mt-1">Average: <span className="font-semibold text-saffron">{q.avg.toFixed(2)} / 5</span></p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-card p-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">{icon}</span>
        {label}
      </div>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
