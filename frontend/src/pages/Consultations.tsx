// 
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  Image as ImageIcon,
  ArrowLeft,
  ShieldCheck,
  FileText,
  AlertCircle,
  Stethoscope,
  Sparkles,
  TriangleAlert,
  Info,
  Brain,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Consultation {
  id: string;
  created_at: string;
  symptoms?: string | null;
  image_url?: string | null;
  final_condition?: string | null;
  cv_result?: any;
  nlp_result?: any;
  rag_context_used?: unknown;
  llm_output?: any;
  final_response?: any;
  status?: string | null;
  error?: string | null;
  medical_history?: string | null;
  context_type?: string | null;
}

type ConsultationHistoryItem = {
  id: string;
  created_at: string;
  context_type?: "medical" | "skincare" | null;
  cv_label?: string | null;
  disease_confidence?: number | null;
  skin_type?: string | null;
  image_url?: string | null;
};

function prettyValue(value: unknown): string {
  if (value === null || value === undefined) return "No data available";
  if (typeof value === "string") return value;

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

const SectionCard = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <Card className="border-border shadow-sm">
    <CardHeader className="pb-3">
      <CardTitle className="flex items-center gap-3 text-xl">
        {icon}
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

export default function Consultations() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, session, loading: authLoading } = useAuth();

  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [historyItems, setHistoryItems] = useState<ConsultationHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    async function fetchHistory() {
      try {
        setHistoryLoading(true);

        const token = session?.access_token;
        if (!token) return;

        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/consultations/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) return;

        const data: ConsultationHistoryItem[] = await res.json();

        data.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        setHistoryItems(data);
      } catch (err) {
        console.error("Failed to fetch consultation history:", err);
      } finally {
        setHistoryLoading(false);
      }
    }

    async function fetchConsultation() {
      if (!id) {
        setFetchError("Missing consultation ID.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setFetchError("");

        const token = session?.access_token;
        if (!token) {
          navigate("/auth");
          return;
        }

        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/consultations/${id}/`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.status === 401) {
          navigate("/auth");
          return;
        }

        if (res.status === 404) {
          setFetchError("Consultation not found.");
          setLoading(false);
          return;
        }

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || `HTTP ${res.status}`);
        }

        const data: Consultation = await res.json();
        setConsultation(data);
      } catch (err) {
        console.error("Failed to fetch consultation:", err);
        setFetchError("Could not load consultation details.");
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
    fetchConsultation();
  }, [id, isAuthenticated, session, navigate, authLoading]);

  const readable = useMemo(() => {
    const source =
      consultation?.final_response && typeof consultation.final_response === "object"
        ? consultation.final_response
        : consultation?.llm_output && typeof consultation.llm_output === "object"
          ? consultation.llm_output
          : {};

    return {
      analysis: source?.analysis || "No analysis available.",
      causes: source?.causes || "No causes available.",
      symptoms: source?.symptoms || "No symptom summary available.",
      treatment: source?.treatment || "No treatment guidance available.",
      precautions: source?.precautions || "No precautions available.",
      whenToSeeDoctor:
        source?.when_to_see_doctor || "No doctor guidance available.",
      disclaimer:
        source?.disclaimer ||
        "This information is educational and not a confirmed medical diagnosis.",
      skinType:
        source?.skin_type ||
        consultation?.cv_result?.skin_type ||
        "Not available",
      caseType:
        source?.case_type || consultation?.context_type || "Not available",
      confidence:
        source?.disease_confidence ?? consultation?.cv_result?.confidence ?? null,
    };
  }, [consultation]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-6 py-8">
          <Card className="border-border shadow-sm">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Loading consultation...</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (fetchError || !consultation) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-6 py-8">
          <Card className="border-border shadow-sm">
            <CardContent className="py-12 text-center">
              <AlertCircle className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
              <p className="text-muted-foreground">
                {fetchError || "Consultation not found."}
              </p>
              <Button className="mt-6" onClick={() => navigate("/history")}>
                Back to History
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const confidencePct =
    readable.confidence != null ? Math.round(readable.confidence * 100) : null;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-teal-950 via-teal-900 to-background">
        <div className="container mx-auto px-6 py-12 md:py-16">
          <div className="max-w-4xl">
            <Button
              variant="secondary"
              className="mb-6 text-teal-900"
              onClick={() => navigate("/history")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to History
            </Button>

            <p className="mb-3 text-sm text-white/70">History / Consultation</p>
            <h1 className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">
              Consultation Report
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-white/80">
              Review the analysis summary, findings, and guidance generated for
              this consultation.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-white">
              <p className="text-xs uppercase tracking-wide text-white/70">
                Condition
              </p>
              <p className="mt-2 text-xl font-semibold">
                {consultation.final_condition || "Unknown"}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-white">
              <p className="text-xs uppercase tracking-wide text-white/70">
                Confidence
              </p>
              <p className="mt-2 text-xl font-semibold">
                {confidencePct != null ? `${confidencePct}%` : "Not available"}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-white">
              <p className="text-xs uppercase tracking-wide text-white/70">
                Case Type
              </p>
              <p className="mt-2 text-xl font-semibold capitalize">
                {readable.caseType}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-white">
              <p className="text-xs uppercase tracking-wide text-white/70">
                Skin Type
              </p>
              <p className="mt-2 text-xl font-semibold capitalize">
                {readable.skinType}
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Badge variant="secondary" className="uppercase">
              {consultation.status || "unknown"}
            </Badge>
            <span className="flex items-center gap-2 text-sm text-white/70">
              <Calendar className="h-4 w-4" />
              {consultation.created_at
                ? new Date(consultation.created_at).toLocaleString()
                : "No date available"}
            </span>
          </div>
        </div>
      </section>

      {/* Main content with sidebar */}
      <section className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
          {/* Sidebar */}
          <aside className="h-fit lg:sticky lg:top-24">
            <Card className="border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Previous Analyses</CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                {historyLoading ? (
                  <p className="text-sm text-muted-foreground">
                    Loading history...
                  </p>
                ) : historyItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No previous analyses found.
                  </p>
                ) : (
                  historyItems.map((item) => {
                    const isActive = item.id === id;
                    const itemConfidence =
                      item.disease_confidence != null
                        ? Math.round(item.disease_confidence * 100)
                        : null;

                    const title =
                      item.context_type === "medical"
                        ? `${item.cv_label ?? "Medical"} Analysis`
                        : "Skincare Guidance";

                    return (
                      <button
                        key={item.id}
                        onClick={() => navigate(`/consultations/${item.id}`)}
                        className={`w-full rounded-xl border p-4 text-left transition-colors ${
                          isActive
                            ? "border-teal-700 bg-teal-50"
                            : "border-border bg-background hover:bg-muted/50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {title}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {new Date(item.created_at).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </p>
                          </div>

                          {itemConfidence != null && (
                            <Badge variant={isActive ? "default" : "secondary"}>
                              {itemConfidence}%
                            </Badge>
                          )}
                        </div>

                        <p className="mt-2 text-xs capitalize text-muted-foreground">
                          {item.skin_type || item.context_type || "Consultation"}
                        </p>
                      </button>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </aside>

          {/* Right content */}
          <div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card className="overflow-hidden border-border bg-card shadow-sm">
                <div className="relative h-72 bg-muted">
                  {consultation.image_url ? (
                    <img
                      src={consultation.image_url}
                      alt="Consultation"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-teal-900">
                      Uploaded Image
                    </span>
                  </div>
                </div>
              </Card>

              <SectionCard
                title="Symptoms Entered"
                icon={<FileText className="h-5 w-5 text-teal-700" />}
              >
                <p className="whitespace-pre-line text-sm leading-7 text-foreground">
                  {consultation.symptoms || "No symptoms provided."}
                </p>

                {consultation.medical_history && (
                  <div className="mt-6 rounded-xl border border-border bg-foreground/5 p-4">
                    <p className="mb-2 text-sm font-semibold text-foreground">
                      Medical history
                    </p>
                    <p className="whitespace-pre-line text-sm leading-7 text-muted-foreground">
                      {consultation.medical_history}
                    </p>
                  </div>
                )}
              </SectionCard>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              <SectionCard
                title="Analysis"
                icon={<Stethoscope className="h-5 w-5 text-teal-700" />}
              >
                <p className="whitespace-pre-line text-sm leading-7 text-foreground">
                  {readable.analysis}
                </p>
              </SectionCard>

              <SectionCard
                title="Possible Causes"
                icon={<Sparkles className="h-5 w-5 text-teal-700" />}
              >
                <p className="whitespace-pre-line text-sm leading-7 text-foreground">
                  {readable.causes}
                </p>
              </SectionCard>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              <SectionCard
                title="Symptoms Overview"
                icon={<FileText className="h-5 w-5 text-teal-700" />}
              >
                <p className="whitespace-pre-line text-sm leading-7 text-foreground">
                  {readable.symptoms}
                </p>
              </SectionCard>

              <SectionCard
                title="Treatment / Care Guidance"
                icon={<ShieldCheck className="h-5 w-5 text-teal-700" />}
              >
                <p className="whitespace-pre-line text-sm leading-7 text-foreground">
                  {readable.treatment}
                </p>
              </SectionCard>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              <SectionCard
                title="Precautions"
                icon={<TriangleAlert className="h-5 w-5 text-teal-700" />}
              >
                <p className="whitespace-pre-line text-sm leading-7 text-foreground">
                  {readable.precautions}
                </p>
              </SectionCard>

              <SectionCard
                title="When to See a Doctor"
                icon={<Info className="h-5 w-5 text-teal-700" />}
              >
                <p className="whitespace-pre-line text-sm leading-7 text-foreground">
                  {readable.whenToSeeDoctor}
                </p>
              </SectionCard>
            </div>

            <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="rounded-2xl border border-border bg-card p-7 lg:col-span-7">
                <div className="mb-3 flex items-center gap-3">
                  <Brain className="h-5 w-5 text-teal-700" />
                  <h3 className="text-xl font-semibold">Technical summary</h3>
                </div>
                <p className="leading-relaxed text-muted-foreground">
                  This consultation combines image-based screening and
                  symptom-aware processing to produce a structured response for
                  the user.
                </p>

                <details className="group mt-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between rounded-md border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-foreground/5">
                    Advanced technical details
                    <span className="text-muted-foreground transition-transform group-open:rotate-180">
                      ▾
                    </span>
                  </summary>

                  <div className="mt-4 space-y-4 text-sm">
                    <div>
                      <p className="mb-2 font-semibold">Computer vision result</p>
                      <pre className="whitespace-pre-wrap break-words rounded-lg bg-foreground/5 p-4 text-muted-foreground">
                        {prettyValue(consultation.cv_result)}
                      </pre>
                    </div>

                    <div>
                      <p className="mb-2 font-semibold">NLP analysis</p>
                      <pre className="whitespace-pre-wrap break-words rounded-lg bg-foreground/5 p-4 text-muted-foreground">
                        {prettyValue(consultation.nlp_result)}
                      </pre>
                    </div>

                    <div>
                      <p className="mb-2 font-semibold">Raw final response</p>
                      <pre className="whitespace-pre-wrap break-words rounded-lg bg-foreground/5 p-4 text-muted-foreground">
                        {prettyValue(consultation.final_response)}
                      </pre>
                    </div>

                    <div>
                      <p className="mb-2 font-semibold">RAG context used</p>
                      <pre className="whitespace-pre-wrap break-words rounded-lg bg-foreground/5 p-4 text-muted-foreground">
                        {prettyValue(consultation.rag_context_used)}
                      </pre>
                    </div>
                  </div>
                </details>
              </div>

              <div className="rounded-2xl border border-border bg-gradient-to-b from-teal-950 to-teal-900 p-7 text-white lg:col-span-5">
                <div className="mb-3 flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-white" />
                  <h3 className="text-xl font-semibold">Medical disclaimer</h3>
                </div>
                <p className="text-sm leading-relaxed text-white/80">
                  {readable.disclaimer}
                </p>

                {consultation.error && (
                  <div className="mt-5 rounded-xl border border-white/15 bg-white/10 p-4">
                    <p className="mb-1 text-sm font-semibold">System note</p>
                    <p className="text-sm text-white/80">{consultation.error}</p>
                  </div>
                )}

                <div className="mt-5">
                  <Button
                    variant="secondary"
                    className="w-full text-teal-900"
                    asChild
                  >
                    <a href="/analysis">Start New Analysis</a>
                  </Button>
                  <p className="mt-3 text-center text-xs text-white/70">
                    Review previous cases anytime from History.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}