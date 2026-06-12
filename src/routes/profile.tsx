import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  DISTRICTS, GENDERS, PROFESSIONS, emptyDraft, loadDraft, saveDraft,
  type CitizenProfile,
} from "@/lib/survey-store";

export const Route = createFileRoute("/profile")({ component: ProfilePage });

function ProfilePage() {
  const navigate = useNavigate();
  const [p, setP] = useState<CitizenProfile>({
    name: "", mobile: "", age: "", gender: "", district: "", profession: "",
  });

  useEffect(() => {
    const d = loadDraft();
    if (d) setP(d.profile);
  }, []);

  const update = (k: keyof CitizenProfile, v: string) => {
    setP((prev) => {
      const next = { ...prev, [k]: v };
      const draft = loadDraft() ?? emptyDraft();
      draft.profile = next;
      saveDraft(draft);
      return next;
    });
  };

  const submit = () => {
    if (!p.name.trim()) return toast.error("Please enter your name");
    if (!/^[6-9]\d{9}$/.test(p.mobile)) return toast.error("Enter a valid 10-digit Indian mobile number");
    if (!p.age || +p.age < 13 || +p.age > 120) return toast.error("Enter a valid age");
    if (!p.gender) return toast.error("Please select your gender");
    if (!p.district) return toast.error("Please select your district");
    if (!p.profession) return toast.error("Please select your profession");
    navigate({ to: "/intro" });
  };

  return (
    <div className="app-shell">
      <header className="shrink-0 flex items-center justify-between px-4 py-3 border-b bg-card">
        <Link to="/language" className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-base font-semibold">Tell Us About Yourself</h1>
        <span className="w-9" />
      </header>

      <main className="app-body px-4 py-4">
        <div className="mx-auto max-w-md space-y-3.5">
          <Field label="Full Name" required>
            <Input value={p.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. Rajesh Sharma" />
          </Field>
          <Field label="Mobile Number" required>
            <div className="flex gap-2">
              <span className="inline-flex items-center rounded-md border bg-muted px-3 text-sm text-muted-foreground">+91</span>
              <Input
                inputMode="numeric"
                maxLength={10}
                value={p.mobile}
                onChange={(e) => update("mobile", e.target.value.replace(/\D/g, ""))}
                placeholder="9876543210"
              />
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Age" required>
              <Input inputMode="numeric" maxLength={3} value={p.age} onChange={(e) => update("age", e.target.value.replace(/\D/g, ""))} />
            </Field>
            <Field label="Gender" required>
              <Select value={p.gender} onChange={(v) => update("gender", v)} options={GENDERS} placeholder="Select" />
            </Field>
          </div>
          <Field label="District" required>
            <Select value={p.district} onChange={(v) => update("district", v)} options={DISTRICTS} placeholder="Select district" />
          </Field>
          <Field label="Profession" required>
            <Select value={p.profession} onChange={(v) => update("profession", v)} options={PROFESSIONS} placeholder="Select profession" />
          </Field>
        </div>
      </main>

      <footer className="shrink-0 px-4 py-3 border-t bg-card">
        <div className="mx-auto max-w-md">
          <Button size="lg" className="w-full h-12" onClick={submit}>Continue</Button>
        </div>
      </footer>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );
}

function Select({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: string[]; placeholder: string }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}
