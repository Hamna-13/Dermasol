import { useState, useEffect } from "react";
import { Upload, FileImage, MessageSquare, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    recommended_products?: Product[];   // ✅ ADDED
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

  const { user, isAuthenticated, loading, getAccessToken } = useAuth();
  const navigate = useNavigate();

  /* ---------------- AUTH GUARD ---------------- */

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) navigate("/auth");
  }, [loading, isAuthenticated, navigate]);

  /* ---------------- CLEANUP ---------------- */

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  /* ---------------- HANDLERS ---------------- */

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleAnalysis = async () => {
    if (!selectedFile || !symptoms.trim() || !user) return;

    try {
      setSubmitting(true);
      setAnalysisResult(null);

      const token = await getAccessToken();
      if (!token) throw new Error("Not authenticated");

      const form = new FormData();
      form.append("symptoms", symptoms);
      form.append("image", selectedFile);

      const result = (await apiFetch("/consultations/", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      })) as ConsultationResponse;

      setAnalysisResult(result.response);
    } catch (err) {
      console.error("Analysis failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------- CONFIDENCE SLIDER ---------------- */

  const ConfidenceSlider = ({ value }: { value: number }) => {
    const percent = Math.round(value * 100);

    return (
      <div className="mb-6">
        <div className="flex justify-between text-sm font-medium mb-2">
          <span>Disease Confidence</span>
          <span>{percent}%</span>
        </div>

        <div className="relative w-full h-3 bg-gray-200 rounded-full">
          <div
            className="h-3 bg-teal-600 rounded-full transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-teal-600 rounded-full shadow-md transition-all duration-500"
            style={{ left: `calc(${percent}% - 10px)` }}
          />
        </div>
      </div>
    );
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">

          {/* HEADER */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              Skin Condition Analysis
            </h1>
            <p className="text-xl text-muted-foreground">
              Upload an image and describe your symptoms for analysis
            </p>
          </div>

          {/* DISCLAIMER */}
          <Alert className="mb-8 border-primary/30 bg-primary/5">
            <AlertCircle className="h-4 w-4 text-primary" />
            <AlertDescription>
              <strong>Medical Disclaimer:</strong> This tool provides
              educational information only and is not a medical diagnosis.
            </AlertDescription>
          </Alert>

          {/* INPUTS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* IMAGE */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileImage className="h-5 w-5 text-primary" />
                  Upload Image
                </CardTitle>
                <CardDescription>
                  Clear photo of the affected skin area
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary"
                  onClick={() =>
                    document.getElementById("file-input")?.click()
                  }
                >
                  {previewUrl ? (
                    <>
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-h-64 mx-auto rounded-lg"
                      />
                      <p className="text-sm mt-2 text-muted-foreground">
                        {selectedFile?.name}
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                      <p className="mt-2 font-medium">
                        Click to upload image
                      </p>
                      <p className="text-sm text-muted-foreground">
                        PNG or JPG (max 10MB)
                      </p>
                    </>
                  )}
                </div>

                <input
                  id="file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </CardContent>
            </Card>

            {/* SYMPTOMS */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Describe Symptoms
                </CardTitle>
                <CardDescription>
                  What you’ve noticed about your skin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="e.g., itching, redness, dryness, duration…"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="min-h-[280px] resize-none"
                />
              </CardContent>
            </Card>
          </div>

          {/* BUTTON */}
          <div className="mt-8 text-center">
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
            >
              {submitting ? "Analyzing…" : "Analyze Skin Condition"}
            </Button>

            <p className="text-sm mt-4 text-muted-foreground">
              Analysis typically takes 30–60 seconds
            </p>
          </div>

          {/* RESULTS */}
          {analysisResult && (
            <div className="mt-12">
              <Card className="border-primary/30">
                <CardHeader>
                  <CardTitle className="text-primary">
                    AI Skin Analysis
                  </CardTitle>
                  <CardDescription>
                    Dermatology-style explanation based on your input
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">

                  {/* Confidence Slider */}
                  {analysisResult.disease_confidence !== undefined && (
                    <ConfidenceSlider
                      value={analysisResult.disease_confidence}
                    />
                  )}

                  {analysisResult.analysis && (
                    <section>
                      <h3 className="font-semibold mb-1">Analysis</h3>
                      <p className="text-muted-foreground">
                        {analysisResult.analysis}
                      </p>
                    </section>
                  )}

                  {analysisResult.skin_type && (
                    <section>
                      <h3 className="font-semibold mb-1">Skin Type</h3>
                      <p className="text-muted-foreground">
                        Detected skin type: {analysisResult.skin_type}
                      </p>
                    </section>
                  )}
            
                  {analysisResult.symptoms && (
                    <section>
                      <h3 className="font-semibold mb-1">Detected Symptoms</h3>
                      <p className="text-muted-foreground">
                        Symptoms include {analysisResult.symptoms}
                      </p>
                    </section>
                  )}

                  {analysisResult.causes && (
                    <section>
                      <h3 className="font-semibold mb-1">Causes</h3>
                      <p className="text-muted-foreground">
                        {analysisResult.causes}
                      </p>
                    </section>
                  )}

                  {analysisResult.treatment && (
                    <section>
                      <h3 className="font-semibold mb-1">Treatment</h3>
                      <p className="text-muted-foreground">
                        {analysisResult.treatment}
                      </p>
                    </section>
                  )}

                  {analysisResult.precautions && (
                    <section>
                      <h3 className="font-semibold mb-1">Precautions</h3>
                      <p className="text-muted-foreground">
                        {analysisResult.precautions}
                      </p>
                    </section>
                  )}

                  {analysisResult.when_to_see_doctor && (
                    <section>
                      <h3 className="font-semibold mb-1">
                        When to Seek Professional Help
                      </h3>
                      <p className="text-muted-foreground">
                        {analysisResult.when_to_see_doctor}
                      </p>
                    </section>
                  )}

                  {analysisResult.routine && (
                    <section>
                      <h3 className="font-semibold mb-1">Routine guide</h3>
                      <p className="text-muted-foreground">
                        {analysisResult.routine}
                      </p>
                    </section>
                  )}

                  {analysisResult.products && (
                    <section>
                      <h3 className="font-semibold mb-1">Key Ingredients</h3>
                      <p className="text-muted-foreground">
                        {analysisResult.products}
                      </p>
                    </section>
                  )}
                  {/* ---------------- RECOMMENDED PRODUCTS ---------------- */}
                  {analysisResult.recommended_products &&
                    analysisResult.recommended_products.length > 0 && (
                      <section>
                        <h3 className="font-semibold mb-4">
                          Products Recommended For You
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {analysisResult.recommended_products.map((product, index) => (
                            <div
                              key={index}
                              className="border rounded-xl p-4 shadow-sm hover:shadow-md transition cursor-pointer bg-white"
                              onClick={() =>
                                window.open(product.product_url, "_blank")
                              }
                            >
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="h-40 w-full object-contain mb-3 rounded"
                              />

                              <h4 className="font-medium text-sm mb-1 line-clamp-2">
                                {product.name}
                              </h4>

                              <p className="text-primary font-semibold text-sm">
                                {product.price}
                              </p>

                              <p className="text-xs text-muted-foreground mt-1">
                                {product.source}
                              </p>
                            </div>
                          ))}
                        </div>
                      </section>
                  )}
                  {analysisResult.disclaimer && (
                    <Alert className="border-primary/30 bg-primary/5">
                      <AlertCircle className="h-4 w-4 text-primary" />
                      <AlertDescription>
                        {analysisResult.disclaimer}
                      </AlertDescription>
                    </Alert>
                  )}

                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analysis;