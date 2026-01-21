// import { useState, useEffect } from "react";
// import { Upload, FileImage, MessageSquare, AlertCircle } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Textarea } from "@/components/ui/textarea";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import Navigation from "@/components/Navigation";
// import { useAuth } from "@/hooks/useAuth";
// import { useToast } from "@/hooks/use-toast";
// import { apiFetch } from "@/lib/api";

// type ConsultationResponse = {
//   id: number;
//   user_id: string;
//   age?: number | null;
//   gender?: string | null;
//   symptoms?: string | null;
//   medical_history?: string | null;
//   image_url?: string | null;
//   diagnosis?: string | null;
//   confidence?: number | null;
//   status: string;
//   created_at: string;
// };

// const Analysis = () => {
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const [previewUrl, setPreviewUrl] = useState<string>("");
//   const [symptoms, setSymptoms] = useState("");
// const [submitting, setSubmitting] = useState(false);

//   const { user, isAuthenticated, loading, getAccessToken } = useAuth();
//   const navigate = useNavigate();
//   const { toast } = useToast();

//   useEffect(() => {
    
//     if (loading) return;

//     if (!isAuthenticated) {
//       navigate("/auth");
//     }
//   }, [loading, isAuthenticated, navigate]);

//   useEffect(() => {
//     return () => {
//       // cleanup preview blob url
//       if (previewUrl) URL.revokeObjectURL(previewUrl);
//     };
//   }, [previewUrl]);

//   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (file) {
//       setSelectedFile(file);
//       const url = URL.createObjectURL(file);
//       setPreviewUrl(url);
//     }
//   };

//   const handleAnalysis = async () => {
//   if (!selectedFile || !symptoms.trim() || !user) return;

//   try {
//     setSubmitting(true);

//     const token = await getAccessToken();
//     if (!token) throw new Error("You are not logged in.");

//     const form = new FormData();
//     form.append("symptoms", symptoms);
//     form.append("image", selectedFile);

//     const result = (await apiFetch("/consultations/", {
//       method: "POST",
//       headers: { Authorization: `Bearer ${token}` },
//       body: form,
//     })) as ConsultationResponse;

//     toast({
//       title: "Analysis Complete",
//       description: `Detected: ${result.diagnosis ?? "Unknown"}${
//         typeof result.confidence === "number"
//           ? ` (${Math.round(result.confidence * 100)}% confidence)`
//           : ""
//       }`,
//     });

//     // ✅ DO NOT clear form here

//   } catch (error) {
//     toast({
//       title: "Analysis failed",
//       description: error instanceof Error ? error.message : "Something went wrong",
//       variant: "destructive",
//     });
//   } finally {
//     setSubmitting(false);
//   }
// };


//   return (
//     <div className="min-h-screen bg-background">
//       <Navigation />

//       <div className="container mx-auto px-4 py-12">
//         <div className="max-w-4xl mx-auto">
//           <div className="text-center mb-12">
//             <h1 className="text-4xl font-bold mb-4 text-foreground">Skin Condition Analysis</h1>
//             <p className="text-xl text-muted-foreground">
//               Upload an image and describe your symptoms for AI-powered analysis
//             </p>
//           </div>

//           <Alert className="mb-8 border-primary/30 bg-primary/5">
//             <AlertCircle className="h-4 w-4 text-primary" />
//             <AlertDescription className="text-foreground">
//               <strong>Medical Disclaimer:</strong> This tool provides preliminary assessments only. Always consult qualified
//               dermatologists or healthcare professionals for accurate diagnosis and treatment.
//             </AlertDescription>
//           </Alert>

//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//             <Card className="shadow-professional">
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <FileImage className="h-5 w-5 text-primary" />
//                   Upload Image
//                 </CardTitle>
//                 <CardDescription>Provide a clear photo of the affected skin area</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-4">
//                   <div
//                     className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
//                     onClick={() => document.getElementById("file-input")?.click()}
//                   >
//                     {previewUrl ? (
//                       <div className="space-y-4">
//                         <img src={previewUrl} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
//                         <p className="text-sm text-muted-foreground">{selectedFile?.name}</p>
//                       </div>
//                     ) : (
//                       <div className="space-y-4">
//                         <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
//                         <div>
//                           <p className="font-medium text-foreground">Click to upload image</p>
//                           <p className="text-sm text-muted-foreground">PNG, JPG up to 10MB</p>
//                         </div>
//                       </div>
//                     )}
//                   </div>

//                   <input
//                     id="file-input"
//                     type="file"
//                     accept="image/*"
//                     onChange={handleFileChange}
//                     className="hidden"
//                   />
//                 </div>
//               </CardContent>
//             </Card>

//             <Card className="shadow-professional">
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <MessageSquare className="h-5 w-5 text-primary" />
//                   Describe Symptoms
//                 </CardTitle>
//                 <CardDescription>Provide details about your skin condition</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-4">
//                   <Textarea
//                     placeholder="Describe your symptoms in detail..."
//                     value={symptoms}
//                     onChange={(e) => setSymptoms(e.target.value)}
//                     className="min-h-[280px] resize-none"
//                   />
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

//           <div className="mt-8 text-center">
//             <Button
//               size="lg"
//               className="text-lg px-8"
//               onClick={handleAnalysis}
//               disabled={!selectedFile || !symptoms.trim() || loading || !isAuthenticated || submitting}

//             >
//               Analyze Skin Condition
//             </Button>

//             <p className="text-sm text-muted-foreground mt-4">Analysis typically takes 30-60 seconds</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Analysis;


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

type ConsultationResponse = {
  id: string;
  status: string;
  created_at: string;
  response: {
    summary?: string;
    what_this_means?: string;
    skincare_guidance?: string;
    when_to_seek_help?: string;
    disclaimer?: string;
  };
};

/* ---------------- COMPONENT ---------------- */

const Analysis = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [symptoms, setSymptoms] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [analysisResult, setAnalysisResult] =
    useState<ConsultationResponse["response"] | null>(null);

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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
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
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* HEADER */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 text-foreground">
              Skin Condition Analysis
            </h1>
            <p className="text-xl text-muted-foreground">
              Upload an image and describe your symptoms for AI-powered analysis
            </p>
          </div>

          {/* DISCLAIMER */}
          <Alert className="mb-8 border-primary/30 bg-primary/5">
            <AlertCircle className="h-4 w-4 text-primary" />
            <AlertDescription className="text-foreground">
              <strong>Medical Disclaimer:</strong> This tool provides educational
              information only and is not a medical diagnosis.
            </AlertDescription>
          </Alert>

          {/* INPUT GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* IMAGE */}
            <Card className="shadow-professional">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileImage className="h-5 w-5 text-primary" />
                  Upload Image
                </CardTitle>
                <CardDescription>
                  Provide a clear photo of the affected skin area
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
                  onClick={() => document.getElementById("file-input")?.click()}
                >
                  {previewUrl ? (
                    <>
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-h-64 mx-auto rounded-lg"
                      />
                      <p className="text-sm text-muted-foreground mt-2">
                        {selectedFile?.name}
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                      <p className="font-medium mt-2">
                        Click to upload image
                      </p>
                      <p className="text-sm text-muted-foreground">
                        PNG, JPG up to 10MB
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

            {/* TEXT */}
            <Card className="shadow-professional">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Describe Symptoms
                </CardTitle>
                <CardDescription>
                  Provide details about your skin condition
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Describe your symptoms in detail..."
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
              className="text-lg px-8"
              onClick={handleAnalysis}
              disabled={
                !selectedFile ||
                !symptoms.trim() ||
                loading ||
                !isAuthenticated ||
                submitting
              }
            >
              {submitting ? "Analyzing..." : "Analyze Skin Condition"}
            </Button>

            <p className="text-sm text-muted-foreground mt-4">
              Analysis typically takes 30–60 seconds
            </p>
          </div>

          {/* GROQ RESPONSE */}
          {analysisResult && (
            <div className="mt-12">
              <Card className="shadow-professional border-primary/30">
                <CardHeader>
                  <CardTitle className="text-primary">
                    AI Skin Analysis
                  </CardTitle>
                  <CardDescription>
                    Personalized explanation based on your input
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {analysisResult.summary && (
                    <section>
                      <h3 className="font-semibold mb-1">Summary</h3>
                      <p className="text-muted-foreground">
                        {analysisResult.summary}
                      </p>
                    </section>
                  )}

                  {analysisResult.what_this_means && (
                    <section>
                      <h3 className="font-semibold mb-1">
                        What this means
                      </h3>
                      <p className="text-muted-foreground">
                        {analysisResult.what_this_means}
                      </p>
                    </section>
                  )}

                  {analysisResult.skincare_guidance && (
                    <section>
                      <h3 className="font-semibold mb-1">
                        Skincare guidance
                      </h3>
                      <p className="text-muted-foreground">
                        {analysisResult.skincare_guidance}
                      </p>
                    </section>
                  )}

                  {analysisResult.when_to_seek_help && (
                    <section>
                      <h3 className="font-semibold mb-1">
                        When to seek help
                      </h3>
                      <p className="text-muted-foreground">
                        {analysisResult.when_to_seek_help}
                      </p>
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
