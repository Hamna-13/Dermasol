import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Image,
  Trash2,
  FileText,
  PlusCircle,
  AlertCircle,
} from "lucide-react";

type ConsultationHistoryItem = {
  id: string;
  created_at: string;

  context_type?: "medical" | "skincare" | null;
  cv_label?: string | null;
  disease_confidence?: number | null;
  skin_type?: string | null;
  image_url?: string | null;

  // These are optional because backend may or may not send them in history list
  analysis?: string | null;
  symptoms?: string | null;
  final_condition?: string | null;
  description?: string | null;
};

export default function History() {
  const { isAuthenticated, session } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState<ConsultationHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, session, navigate]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const token = session?.access_token;
      if (!token) {
        navigate("/auth");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/consultations/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        navigate("/auth");
        return;
      }

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }

      const data: ConsultationHistoryItem[] = await res.json();

      data.sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      );

      setItems(data);
    } catch (err) {
      console.error("History fetch failed:", err);
      setError("Could not load your analysis history.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (
    e: React.MouseEvent<HTMLButtonElement>,
    id: string
  ) => {
    e.stopPropagation();

    const confirmed = window.confirm(
      "Are you sure you want to delete this consultation?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      const token = session?.access_token;
      if (!token) {
        navigate("/auth");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/consultations/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        navigate("/auth");
        return;
      }

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }

      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert(
        "Could not delete this consultation. Backend DELETE endpoint may not be added yet."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const getConfidencePct = (value?: number | null) => {
    if (value == null) return null;
    return value <= 1 ? Math.round(value * 100) : Math.round(value);
  };

  const getTitle = (item: ConsultationHistoryItem) => {
    if (item.final_condition) return item.final_condition;
    if (item.context_type === "medical") return item.cv_label ?? "Medical case";
    return item.cv_label ?? "Skincare guidance";
  };

  const getDiagnosisDescription = (item: ConsultationHistoryItem) => {
    const directDescription =
      item.description || item.analysis || item.symptoms || "";

    if (directDescription) {
      return directDescription.length > 120
        ? `${directDescription.slice(0, 120)}...`
        : directDescription;
    }

    const title = getTitle(item);

    if (item.context_type === "medical") {
      return `AI detected signs related to ${title}. Open this consultation to review the full diagnosis, symptoms, precautions, and treatment guidance.`;
    }

    return `AI generated skincare guidance based on the uploaded image and symptoms. Open this consultation to view the complete recommendations.`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Analysis History
              </h1>
              <p className="text-muted-foreground">
                View your previous skin diagnoses, confidence scores, and
                uploaded images.
              </p>
            </div>

            <Button onClick={() => navigate("/analysis")}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Analysis
            </Button>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {loading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Loading...</p>
              </CardContent>
            </Card>
          ) : items.length === 0 ? (
            <Card>
              <CardContent className="py-14 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-teal-700/10">
                  <FileText className="h-7 w-7 text-teal-700" />
                </div>

                <h2 className="text-2xl font-bold">No analyses yet</h2>

                <p className="mx-auto mt-2 max-w-md text-muted-foreground">
                  Start your first skin analysis and it will appear here.
                </p>

                <Button className="mt-6" onClick={() => navigate("/analysis")}>
                  Start Analysis
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {items.map((x) => {
                const confidencePct = getConfidencePct(x.disease_confidence);
                const title = getTitle(x);
                const description = getDiagnosisDescription(x);

                return (
                  <Card
                    key={x.id}
                    className="group cursor-pointer overflow-hidden border-border shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                    onClick={() => navigate(`/consultations/${x.id}`)}
                  >
                    <CardHeader className="space-y-0 pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <CardTitle className="line-clamp-1 text-xl">
                            {title}
                          </CardTitle>

                          <CardDescription className="mt-2 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {new Date(x.created_at).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </CardDescription>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          {confidencePct != null && (
                            <Badge
                              variant={
                                confidencePct >= 80 ? "default" : "secondary"
                              }
                              className="whitespace-nowrap"
                            >
                              {confidencePct}% confidence
                            </Badge>
                          )}

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={(e) => handleDelete(e, x.id)}
                            disabled={deletingId === x.id}
                            className="text-muted-foreground hover:bg-red-50 hover:text-red-600"
                            title="Delete consultation"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[180px_1fr]">
                        <div className="h-40 overflow-hidden rounded-xl bg-muted">
                          {x.image_url ? (
                            <img
                              src={x.image_url}
                              alt="Consultation"
                              className="h-full w-full object-cover"
                              loading="lazy"
                              onError={(e) => {
                                (
                                  e.currentTarget as HTMLImageElement
                                ).style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Image className="h-10 w-10 text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col">
                          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                            {description}
                          </p>

                          <div className="mt-4 grid grid-cols-2 gap-3">
                            <div className="rounded-lg border bg-muted/30 p-3">
                              <h4 className="text-xs font-semibold text-muted-foreground">
                                Skin Type
                              </h4>
                              <p className="mt-1 line-clamp-1 text-sm font-medium capitalize text-foreground">
                                {x.skin_type ?? "—"}
                              </p>
                            </div>

                            <div className="rounded-lg border bg-muted/30 p-3">
                              <h4 className="text-xs font-semibold text-muted-foreground">
                                Case Type
                              </h4>
                              <p className="mt-1 line-clamp-1 text-sm font-medium capitalize text-foreground">
                                {x.context_type ?? "—"}
                              </p>
                            </div>
                          </div>

                          <p className="mt-4 text-sm font-semibold text-teal-700">
                            View full diagnosis →
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}