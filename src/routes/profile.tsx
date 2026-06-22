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
  const [errors, setErrors] = useState<Partial<Record<keyof CitizenProfile, string>>>({});

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
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validate = (): Partial<Record<keyof CitizenProfile, string>> => {
    const e: Partial<Record<keyof CitizenProfile, string>> = {};
    if (!p.name.trim()) e.name = "Please enter your name";
    if (!/^[6-9]\d{9}$/.test(p.mobile))
      e.mobile = "Enter a valid 10-digit Indian mobile (starting 6-9)";
    if (!p.age || +p.age < 13 || +p.age > 120) e.age = "Enter a valid age (13–120)";
    if (!p.gender) e.gender = "Please select your gender";
    if (!p.district) e.district = "Please select your district";
    if (!p.profession) e.profession = "Please select your profession";
    return e;
  };

  const submit = () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      toast.error("Please fix the highlighted fields");
      return;
    }
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
          <Field label="Full Name" required error={errors.name}>
            <Input value={p.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. Rajesh Sharma" />
          </Field>
          <Field label="Mobile Number" required error={errors.mobile}>
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
            <Field label="Age" required error={errors.age}>
              <Input inputMode="numeric" maxLength={3} value={p.age} onChange={(e) => update("age", e.target.value.replace(/\D/g, ""))} />
            </Field>
            <Field label="Gender" required error={errors.gender}>
              <Select value={p.gender} onChange={(v) => update("gender", v)} options={GENDERS} placeholder="Select" />
            </Field>
          </div>
          <Field label="District" required error={errors.district}>
            <Select value={p.district} onChange={(v) => update("district", v)} options={DISTRICTS} placeholder="Select district" />
          </Field>
          <Field label="Profession" required error={errors.profession}>
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

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
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
