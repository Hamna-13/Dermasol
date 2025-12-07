import { Brain, Users, Target, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              About DermaSol
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Advancing dermatological care through artificial intelligence and accessible healthcare technology
            </p>
          </div>

          {/* Mission Section */}
          <Card className="mb-12 shadow-professional">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-3">
                <Target className="h-6 w-6 text-primary" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground leading-relaxed space-y-4">
              <p>
                DermaSol is an AI-powered dermatological assistance system designed to bridge the gap between 
                users and professional dermatological care. Our mission is to make quality skin health assessment 
                accessible, affordable, and available to everyone, especially in regions with limited access to 
                dermatologists.
              </p>
              <p>
                By combining advanced computer vision and natural language processing, we provide intelligent, 
                reliable preliminary assessments that empower individuals to take informed steps toward better 
                skin health.
              </p>
            </CardContent>
          </Card>

          {/* Technology Section */}
          <Card className="mb-12 shadow-professional">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-3">
                <Brain className="h-6 w-6 text-primary" />
                Our Technology
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-3 text-foreground">
                  Hybrid AI Model
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  DermaSol utilizes a sophisticated hybrid model combining Convolutional Neural Networks (CNNs) 
                  and Vision Transformers (ViTs) to accurately detect common skin conditions including acne, 
                  eczema, pigmentation issues, and other dermatological concerns.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3 text-foreground">
                  Natural Language Processing
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Our NLP module processes textual symptom descriptions to extract key medical information, 
                  generating context-aware recommendations and precautionary advice tailored to each user's 
                  specific situation.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3 text-foreground">
                  Fairness and Reliability
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  To ensure equitable healthcare access, DermaSol incorporates Asian skin tone bias reduction 
                  algorithms, achieving better performance across diverse complexions. Our explainable AI (XAI) 
                  mechanism provides transparency through confidence scoring for each analysis.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Goals Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="shadow-professional text-center">
              <CardContent className="pt-6">
                <Award className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2 text-foreground">85%+ Accuracy</h3>
                <p className="text-muted-foreground">
                  Validated model accuracy in skin condition detection
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-professional text-center">
              <CardContent className="pt-6">
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2 text-foreground">5+ Skin Types</h3>
                <p className="text-muted-foreground">
                  Personalized recommendations for diverse skin types
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-professional text-center">
              <CardContent className="pt-6">
                <Target className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2 text-foreground">Beta Launch</h3>
                <p className="text-muted-foreground">
                  Full functional version launching February 2026
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Team Section */}
          <Card className="shadow-professional">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-3">
                <Users className="h-6 w-6 text-primary" />
                Development Team
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-foreground">
                    Academic Institution
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Faculty of Computing and Information Technology, Lahore
                  </p>
                  <p className="text-muted-foreground">
                    Bachelor of Science in Software Engineering (2022-2026)
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3 text-foreground">
                    Development Team
                  </h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Hamna Ali (BSEF22M506)</li>
                    <li>• Aiman Ijaz (BSEF22M532)</li>
                    <li>• Hamna Hashmi (BSEF22M538)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3 text-foreground">
                    Supervision
                  </h3>
                  <p className="text-muted-foreground">
                    <strong>Supervisor:</strong> Mr. Farhan Chaudhary<br />
                    <strong>Co-Supervisor:</strong> Dr. Amina Mustansir
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <div className="mt-12 p-6 bg-muted rounded-lg border border-border">
            <h3 className="font-semibold text-lg mb-3 text-foreground">
              Important Medical Disclaimer
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              DermaSol is designed to provide preliminary skin condition assessments and educational information. 
              It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the 
              advice of qualified dermatologists or healthcare providers with any questions regarding skin conditions 
              or medical concerns. Never disregard professional medical advice or delay seeking it because of 
              information provided by DermaSol.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
