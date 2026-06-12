import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Download, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateCertificate } from "@/lib/certificate";

export const Route = createFileRoute("/success")({ component: SuccessPage });

function SuccessPage() {
  const navigate = useNavigate();
  const [info, setInfo] = useState<{ name: string; responseCode: string } | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("va2047_success");
    if (!raw) {
      navigate({ to: "/" });
      return;
    }
    setInfo(JSON.parse(raw));
  }, [navigate]);

  if (!info) return null;

  return (
    <div className="app-shell gradient-hero">
      <main className="app-body flex items-center justify-center px-6 py-6 text-center">
        <div className="mx-auto max-w-md">
          <div className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full bg-success/15 text-success">
            <CheckCircle2 className="h-12 w-12" />
          </div>
          <h1 className="mt-5 text-2xl font-bold">Thank You, {info.name.split(" ")[0]}!</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your feedback has been submitted successfully. Together, we are building Viksit Assam 2047.
          </p>

          <div className="mt-6 rounded-xl border bg-card px-4 py-3">
            <p className="text-xs text-muted-foreground">Response ID</p>
            <p className="text-base font-semibold tracking-wide text-primary">{info.responseCode}</p>
          </div>
        </div>
      </main>

      <footer className="shrink-0 px-4 py-3 border-t bg-card">
        <div className="mx-auto max-w-md space-y-2">
          <Button
            size="lg"
            className="w-full h-12"
            onClick={() => generateCertificate({ name: info.name, responseCode: info.responseCode })}
          >
            <Download className="h-4 w-4" /> Download Certificate
          </Button>
          <Button variant="outline" size="lg" className="w-full h-12" onClick={() => navigate({ to: "/" })}>
            <Home className="h-4 w-4" /> Go to Home
          </Button>
        </div>
      </footer>
    </div>
  );
}
