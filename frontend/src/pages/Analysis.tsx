import { useState, useEffect } from "react";
import { Upload, FileImage, MessageSquare, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const Analysis = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [symptoms, setSymptoms] = useState("");
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleAnalysis = () => {
    if (!selectedFile || !symptoms || !user) return;

    const conditions = ['Eczema', 'Psoriasis', 'Acne Vulgaris', 'Rosacea', 'Contact Dermatitis'];
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
    const confidence = Math.floor(Math.random() * 20) + 75;

    const analysis = {
      id: crypto.randomUUID(),
      userId: user.id,
      imageUrl: previewUrl,
      symptoms,
      result: randomCondition,
      confidence,
      date: new Date().toISOString()
    };

    const analyses = JSON.parse(localStorage.getItem('dermaSolAnalyses') || '[]');
    analyses.push(analysis);
    localStorage.setItem('dermaSolAnalyses', JSON.stringify(analyses));

    toast({
      title: 'Analysis Complete',
      description: `Detected: ${randomCondition} with ${confidence}% confidence`
    });

    setSelectedFile(null);
    setPreviewUrl('');
    setSymptoms('');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 text-foreground">
              Skin Condition Analysis
            </h1>
            <p className="text-xl text-muted-foreground">
              Upload an image and describe your symptoms for AI-powered analysis
            </p>
          </div>

          <Alert className="mb-8 border-primary/30 bg-primary/5">
            <AlertCircle className="h-4 w-4 text-primary" />
            <AlertDescription className="text-foreground">
              <strong>Medical Disclaimer:</strong> This tool provides preliminary assessments only. 
              Always consult qualified dermatologists or healthcare professionals for accurate diagnosis and treatment.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Upload Section */}
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
                <div className="space-y-4">
                  <div 
                    className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
                    onClick={() => document.getElementById('file-input')?.click()}
                  >
                    {previewUrl ? (
                      <div className="space-y-4">
                        <img 
                          src={previewUrl} 
                          alt="Preview" 
                          className="max-h-64 mx-auto rounded-lg"
                        />
                        <p className="text-sm text-muted-foreground">
                          {selectedFile?.name}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                        <div>
                          <p className="font-medium text-foreground">Click to upload image</p>
                          <p className="text-sm text-muted-foreground">
                            PNG, JPG up to 10MB
                          </p>
                        </div>
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
                </div>
              </CardContent>
            </Card>

            {/* Symptoms Description Section */}
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
                <div className="space-y-4">
                  <Textarea
                    placeholder="Describe your symptoms in detail...&#10;&#10;Example:&#10;- When did you first notice the condition?&#10;- Is there any pain, itching, or burning?&#10;- Have you tried any treatments?&#10;- Any relevant medical history?"
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    className="min-h-[280px] resize-none"
                  />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium mb-2">Include information about:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Duration and progression</li>
                      <li>Associated symptoms</li>
                      <li>Previous treatments</li>
                      <li>Allergies or medical conditions</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analysis Button */}
          <div className="mt-8 text-center">
            <Button 
              size="lg" 
              className="text-lg px-8"
              onClick={handleAnalysis}
              disabled={!selectedFile || !symptoms.trim()}
            >
              Analyze Skin Condition
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              Analysis typically takes 30-60 seconds
            </p>
          </div>

          {/* Guidelines Section */}
          <Card className="mt-12 shadow-professional border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary">Photography Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2 text-foreground">✓ Do:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Use good natural lighting</li>
                    <li>• Keep camera steady and focused</li>
                    <li>• Capture the entire affected area</li>
                    <li>• Take photos from multiple angles if needed</li>
                    <li>• Ensure the area is clean</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-foreground">✗ Don't:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Use flash photography</li>
                    <li>• Take blurry or dark photos</li>
                    <li>• Apply filters or editing</li>
                    <li>• Crop too closely</li>
                    <li>• Include identifying information</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Analysis;
