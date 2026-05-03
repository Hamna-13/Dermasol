import { useState, useEffect, useRef } from "react";
import ReviewModal from "@/components/ReviewModal";
import {
  Upload,
  FileImage,
  MessageSquare,
  AlertCircle,
  Camera,
  X,
  Sparkles,
  ShieldCheck,
  Loader2,
  Trash2,
  ImagePlus,
  Stethoscope,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";

/* ---------------- TYPES ---------------- */

type Product = {
  name: string;
  price: string;
  image_url: string;
  product_url: string;
  source: string;
};

type ConsultationResponse = {
  id: string;
  status: string;
  created_at: string;
  response: {
    case_type: "medical" | "skincare";
    analysis?: string;
    skin_type?: string;
    intent?: string;
    routine?: string;
    products?: string;
    symptoms?: string;
    causes?: string;
    treatment?: string;
    precautions?: string;
    when_to_see_doctor?: string;
    disclaimer?: string;
    disease_confidence?: number;
    recommended_products?: Product[];
  };
};

/* ---------------- COMPONENT ---------------- */

const Analysis = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [analysisResult, setAnalysisResult] = useState<
    ConsultationResponse["response"] | null
  >(null);

  /* ---------------- REVIEW MODAL STATES ---------------- */

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [latestConsultationId, setLatestConsultationId] = useState<string | null>(
    null
  );
  const [reviewPending, setReviewPending] = useState(false);
  const [pendingNavigationPath, setPendingNavigationPath] = useState<string | null>(
    null
  );

  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState("");

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const { user, isAuthenticated, loading, getAccessToken } = useAuth();
  const navigate = useNavigate();

  const resetReviewState = () => {
    setShowReviewModal(false);
    setLatestConsultationId(null);
    setReviewPending(false);
    setPendingNavigationPath(null);
  };

  const continuePendingNavigation = () => {
    setShowReviewModal(false);
    setReviewPending(false);

    const path = pendingNavigationPath;
    setPendingNavigationPath(null);

    if (path) {
      navigate(path);
    }
  };

  /* ---------------- AUTH GUARD ---------------- */

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) navigate("/auth");
  }, [loading, isAuthenticated, navigate]);

  /* ---------------- CLEANUP ---------------- */

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);

      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [previewUrl, cameraStream]);

  /* ---------------- SHOW REVIEW WHEN USER TRIES TO LEAVE ---------------- */

  useEffect(() => {
    if (!reviewPending || !analysisResult) return;

    const handleNavigationClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const link = target.closest("a");

      if (!link) return;

      const href = link.getAttribute("href");
      if (!href) return;

      // Ignore product/external links and new-tab links
      if (link.getAttribute("target") === "_blank") return;

      const url = new URL(href, window.location.origin);

      // External website links should continue normally
      if (url.origin !== window.location.origin) return;

      const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      const nextPath = `${url.pathname}${url.search}${url.hash}`;

      // Do not show review if user clicks the current page again
      if (nextPath === currentPath) return;

      event.preventDefault();
      event.stopPropagation();

      setPendingNavigationPath(nextPath);
      setShowReviewModal(true);
    };

    document.addEventListener("click", handleNavigationClick, true);

    return () => {
      document.removeEventListener("click", handleNavigationClick, true);
    };
  }, [reviewPending, analysisResult]);

  /* ---------------- FILE UPLOAD ---------------- */

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setAnalysisResult(null);

    // Reset review state when a new image is selected
    resetReviewState();
  };

  const removeSelectedImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setSelectedFile(null);
    setPreviewUrl("");
    setAnalysisResult(null);

    // Reset review state when image is removed
    resetReviewState();

    const input = document.getElementById("file-input") as HTMLInputElement;
    if (input) input.value = "";
  };

  /* ---------------- CAMERA HANDLERS ---------------- */

  const openCamera = async () => {
    try {
      setCameraError("");

      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError("Camera is not supported in this browser.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
        },
        audio: false,
      });

      setCameraStream(stream);
      setCameraOpen(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (error) {
      console.error("Camera error:", error);
      setCameraError(
        "Unable to access camera. Please allow camera permission or use file upload."
      );
    }
  };

  const closeCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
    }

    setCameraStream(null);
    setCameraOpen(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;

        const capturedFile = new File(
          [blob],
          `camera-capture-${Date.now()}.jpg`,
          {
            type: "image/jpeg",
          }
        );

        if (previewUrl) URL.revokeObjectURL(previewUrl);

        setSelectedFile(capturedFile);
        setPreviewUrl(URL.createObjectURL(capturedFile));
        setAnalysisResult(null);

        // Reset review state when a new camera photo is captured
        resetReviewState();

        closeCamera();
      },
      "image/jpeg",
      0.95
    );
  };

  /* ---------------- ANALYSIS HANDLER ---------------- */

  const handleAnalysis = async () => {
    if (!selectedFile || !symptoms.trim() || !user) return;

    try {
      setSubmitting(true);
      setAnalysisResult(null);
      resetReviewState();

      const token = await getAccessToken();
      if (!token) throw new Error("Not authenticated");

      const form = new FormData();
      form.append("symptoms", symptoms.trim());
      form.append("image", selectedFile);

      const result = (await apiFetch("/consultations/", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      })) as ConsultationResponse;

      console.log("Analysis result:", result);

      setAnalysisResult(result.response);

      // Save current consultation id for review
      const consultationId = result.id || null;
      setLatestConsultationId(consultationId);

      // Do not show the popup immediately.
      // Mark review as pending and show it only when user tries to leave this page.
      setReviewPending(true);
    } catch (err) {
      console.error("Analysis failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------- HELPERS ---------------- */

  const ConfidenceMeter = ({ value }: { value: number }) => {
    const percent = Math.round(value * 100);

    return (
      <div className="rounded-2xl border border-border bg-foreground/5 p-5">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div>
            <p className="text-sm text-muted-foreground">AI confidence</p>
            <p className="text-2xl font-bold text-foreground">{percent}%</p>
          </div>

          <div className="h-12 w-12 rounded-full bg-teal-700/10 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-teal-700" />
          </div>
        </div>

        <div className="relative h-3 w-full rounded-full bg-background overflow-hidden">
          <div
            className="h-full rounded-full bg-teal-700 transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          This score shows how confident the system is, not a confirmed medical
          diagnosis.
        </p>
      </div>
    );
  };

  const ResultSection = ({
    title,
    value,
  }: {
    title: string;
    value?: string;
  }) => {
    if (!value) return null;

    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-semibold mb-2 text-foreground">{title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{value}</p>
      </div>
    );
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* HERO */}
      <section className="border-b border-border bg-gradient-to-b from-teal-950 via-teal-900 to-background">
        <div className="container mx-auto px-6 py-12 md:py-16">
          <div className="max-w-3xl">
            <p className="text-white/70 text-sm mb-3">AI Analysis / DermaSol</p>

            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
              Skin Condition Analysis
            </h1>

            <p className="mt-4 text-white/80 text-lg leading-relaxed">
              Upload or capture a clear skin image, describe your symptoms, and
              get a structured AI-assisted dermatology overview.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-5">
              <ImagePlus className="h-6 w-6 text-white mb-3" />
              <p className="text-white font-semibold">Image-based analysis</p>
              <p className="text-white/70 text-sm mt-1">
                Upload or capture the affected area.
              </p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 p-5">
              <MessageSquare className="h-6 w-6 text-white mb-3" />
              <p className="text-white font-semibold">Symptom context</p>
              <p className="text-white/70 text-sm mt-1">
                Add itching, redness, pain, duration, or spread.
              </p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 p-5">
              <ShieldCheck className="h-6 w-6 text-white mb-3" />
              <p className="text-white font-semibold">Safe guidance</p>
              <p className="text-white/70 text-sm mt-1">
                Educational result with medical disclaimer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN */}
      <main className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* LEFT: FORM */}
          <div className="xl:col-span-8 space-y-8">
            <Alert className="border-teal-700/30 bg-teal-700/5">
              <AlertCircle className="h-4 w-4 text-teal-700" />
              <AlertDescription>
                <strong>Medical Disclaimer:</strong> DermaSol provides
                educational information only. It is not a substitute for a
                dermatologist or emergency medical care.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* IMAGE CARD */}
              <Card className="overflow-hidden border-border bg-card shadow-sm hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileImage className="h-5 w-5 text-teal-700" />
                        Skin Image
                      </CardTitle>
                      <CardDescription>
                        Upload or capture a clear image
                      </CardDescription>
                    </div>

                    {selectedFile && !cameraOpen && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={removeSelectedImage}
                        title="Remove image"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {cameraOpen ? (
                    <div className="space-y-4">
                      <div className="relative overflow-hidden rounded-2xl border bg-black">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-72 object-contain"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Button type="button" onClick={capturePhoto}>
                          <Camera className="h-4 w-4 mr-2" />
                          Capture Photo
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={closeCamera}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Close Camera
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div
                        className="group border-2 border-dashed border-border rounded-2xl p-6 text-center cursor-pointer hover:border-teal-700 hover:bg-teal-700/5 transition"
                        onClick={() =>
                          document.getElementById("file-input")?.click()
                        }
                      >
                        {previewUrl ? (
                          <>
                            <div className="relative overflow-hidden rounded-xl bg-muted">
                              <img
                                src={previewUrl}
                                alt="Selected skin preview"
                                className="h-72 w-full object-contain"
                              />
                            </div>

                            <p className="text-sm mt-3 font-medium truncate">
                              {selectedFile?.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Click to replace image
                            </p>
                          </>
                        ) : (
                          <div className="py-10">
                            <div className="mx-auto h-14 w-14 rounded-full bg-teal-700/10 flex items-center justify-center mb-4 group-hover:bg-teal-700/15 transition">
                              <Upload className="h-7 w-7 text-teal-700" />
                            </div>

                            <p className="font-semibold">
                              Click to upload skin image
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              PNG or JPG recommended
                            </p>
                          </div>
                        )}
                      </div>

                      <input
                        id="file-input"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />

                      <Button
                        type="button"
                        variant="outline"
                        onClick={openCamera}
                        className="w-full"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Open Camera
                      </Button>
                    </>
                  )}

                  {cameraError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{cameraError}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* SYMPTOMS CARD */}
              <Card className="overflow-hidden border-border bg-card shadow-sm hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-teal-700" />
                    Symptoms
                  </CardTitle>
                  <CardDescription>
                    Type what you noticed about your skin
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Example: I have redness and itching on my cheek for 3 days. The area feels dry and slightly painful..."
                    value={symptoms}
                    onChange={(e) => {
                      setSymptoms(e.target.value);
                      setAnalysisResult(null);
                      resetReviewState();
                    }}
                    className="min-h-[290px] resize-none rounded-2xl"
                  />

                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground">
                      {symptoms.trim().length} characters
                    </p>

                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setSymptoms("");
                        setAnalysisResult(null);
                        resetReviewState();
                      }}
                      disabled={!symptoms.trim()}
                    >
                      Clear Symptoms
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ACTION PANEL */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                <div>
                  <h2 className="text-xl font-semibold">Ready for analysis?</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add both an image and symptoms before starting.
                  </p>
                </div>

                <Button
                  size="lg"
                  onClick={handleAnalysis}
                  disabled={
                    !selectedFile ||
                    !symptoms.trim() ||
                    loading ||
                    !isAuthenticated ||
                    submitting
                  }
                  className="min-w-[220px]"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Analyze Skin
                    </>
                  )}
                </Button>
              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-border bg-foreground/5 p-4">
                  <p className="text-sm font-semibold">Step 1</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload a clear photo.
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-foreground/5 p-4">
                  <p className="text-sm font-semibold">Step 2</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Describe symptoms.
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-foreground/5 p-4">
                  <p className="text-sm font-semibold">Step 3</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Review AI guidance.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: SIDE INFO */}
          <aside className="xl:col-span-4 space-y-6">
            <Card className="border-border bg-card shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-teal-700" />
                  Better input tips
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4 text-sm">
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-teal-700 shrink-0" />
                  <p className="text-muted-foreground">
                    Use a clear, well-lit photo of the affected area.
                  </p>
                </div>

                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-teal-700 shrink-0" />
                  <p className="text-muted-foreground">
                    Mention duration, itching, pain, redness, swelling, or
                    spreading.
                  </p>
                </div>

                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-teal-700 shrink-0" />
                  <p className="text-muted-foreground">
                    Avoid blurry photos, heavy filters, or makeup covering the
                    affected skin.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-teal-700" />
                  Safety note
                </CardTitle>
              </CardHeader>

              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Seek professional help urgently if symptoms include breathing
                  difficulty, swelling of lips/eyes, rapidly spreading rash,
                  fever, severe pain, pus, or bleeding.
                </p>
              </CardContent>
            </Card>
          </aside>
        </div>

        {/* RESULTS */}
        {analysisResult && (
          <section className="mt-12">
            <div className="mb-6">
              <p className="text-sm text-muted-foreground">DermaSol Result</p>
              <h2 className="text-3xl font-bold tracking-tight">
                AI Skin Analysis Summary
              </h2>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              <div className="xl:col-span-4 space-y-6">
                {analysisResult.disease_confidence !== undefined && (
                  <ConfidenceMeter value={analysisResult.disease_confidence} />
                )}

                {analysisResult.skin_type && (
                  <Card className="border-border bg-card">
                    <CardHeader>
                      <CardTitle>Detected Skin Type</CardTitle>
                      <CardDescription>
                        Based on the submitted image and symptoms
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <div className="rounded-2xl bg-teal-700/10 p-5">
                        <p className="text-2xl font-bold text-teal-800">
                          {analysisResult.skin_type}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="xl:col-span-8 space-y-5">
                <ResultSection
                  title="Analysis"
                  value={analysisResult.analysis}
                />

                <ResultSection
                  title="Detected Symptoms"
                  value={analysisResult.symptoms}
                />

                <ResultSection
                  title="Possible Causes"
                  value={analysisResult.causes}
                />

                <ResultSection
                  title="Suggested Treatment"
                  value={analysisResult.treatment}
                />

                <ResultSection
                  title="Precautions"
                  value={analysisResult.precautions}
                />

                <ResultSection
                  title="When to See a Doctor"
                  value={analysisResult.when_to_see_doctor}
                />

                <ResultSection
                  title="Routine Guide"
                  value={analysisResult.routine}
                />

                <ResultSection
                  title="Key Ingredients / Products"
                  value={analysisResult.products}
                />

                {analysisResult.disclaimer && (
                  <Alert className="border-teal-700/30 bg-teal-700/5">
                    <AlertCircle className="h-4 w-4 text-teal-700" />
                    <AlertDescription>
                      {analysisResult.disclaimer}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            {analysisResult.recommended_products &&
              analysisResult.recommended_products.length > 0 && (
                <div className="mt-10">
                  <div className="mb-5">
                    <h3 className="text-2xl font-bold">
                      Products Recommended For You
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Suggested products based on your analysis result.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {analysisResult.recommended_products.map(
                      (product, index) => (
                        <Card
                          key={`${product.name}-${index}`}
                          className="overflow-hidden border-border bg-card shadow-sm hover:shadow-lg transition-shadow"
                        >
                          <div className="h-48 bg-muted flex items-center justify-center">
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="h-full w-full object-contain p-4"
                            />
                          </div>

                          <CardContent className="p-5">
                            <h4 className="font-semibold text-sm leading-relaxed line-clamp-2">
                              {product.name}
                            </h4>

                            <div className="mt-3 flex items-center justify-between gap-3">
                              <div>
                                <p className="text-teal-700 font-bold">
                                  {product.price}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {product.source}
                                </p>
                              </div>

                              <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                onClick={() =>
                                  window.open(product.product_url, "_blank")
                                }
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    )}
                  </div>
                </div>
              )}
          </section>
        )}
      </main>

      {/* REVIEW MODAL */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={continuePendingNavigation}
        consultationId={latestConsultationId}
      />
    </div>
  );
};

export default Analysis;