import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Upload, Brain, Shield } from "lucide-react";
import Navigation from "@/components/Navigation";
import FeatureCard from "@/components/FeatureCard";
import StatCard from "@/components/StatCard";
import heroImage from "@/assets/hero-dermatology.jpg";
import aiIcon from "@/assets/ai-analysis-icon.jpg";
import recommendationsIcon from "@/assets/recommendations-icon.jpg";
import accessibilityIcon from "@/assets/accessibility-icon.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative bg-primary text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img 
            src={heroImage} 
            alt="Professional dermatology" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              AI-Powered Dermatological Analysis
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-95 leading-relaxed">
              Professional skin condition detection and personalized recommendations powered by advanced artificial intelligence
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/analysis">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto text-lg">
                  Start Analysis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/about">
  <Button size="lg" variant="secondary" className="w-full sm:w-auto text-lg">
    Learn More
  </Button>
</Link>

            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-12 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
              value="85%+" 
              label="Model Accuracy"
              description="Validated detection rate"
            />
            <StatCard 
              value="10+" 
              label="Skin Conditions"
              description="Common dermatological issues"
            />
            <StatCard 
              value="24/7" 
              label="Availability"
              description="Instant access anytime"
            />
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Advanced Dermatological Technology
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Combining computer vision and natural language processing for comprehensive skin health assessment
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={aiIcon}
              title="AI-Powered Detection"
              description="Advanced CNN and Vision Transformer models analyze skin images to detect conditions like acne, eczema, and pigmentation issues with high accuracy."
            />
            <FeatureCard
              icon={recommendationsIcon}
              title="Personalized Recommendations"
              description="Receive tailored skincare advice and product suggestions based on your specific skin condition, type, and medical history."
            />
            <FeatureCard
              icon={accessibilityIcon}
              title="Accessible Healthcare"
              description="Bridge the gap to dermatological care with affordable, instant analysis available 24/7, especially valuable in underserved regions."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-accent">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              How DermaSol Works
            </h2>
            <p className="text-xl text-muted-foreground">
              Three simple steps to professional skin analysis
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="bg-primary text-primary-foreground w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <div className="bg-card p-6 rounded-lg shadow-professional">
                <Upload className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-foreground">Upload Image</h3>
                <p className="text-muted-foreground">
                  Take or upload a clear photo of the affected skin area
                </p>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-primary text-primary-foreground w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <div className="bg-card p-6 rounded-lg shadow-professional">
                <Brain className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-foreground">AI Analysis</h3>
                <p className="text-muted-foreground">
                  Our AI models analyze the image and process your symptoms
                </p>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-primary text-primary-foreground w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <div className="bg-card p-6 rounded-lg shadow-professional">
                <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-foreground">Get Results</h3>
                <p className="text-muted-foreground">
                  Receive detailed analysis with confidence scores and recommendations
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Analyze Your Skin Condition?
          </h2>
          <p className="text-xl mb-8 opacity-95 max-w-2xl mx-auto">
            Get professional AI-powered skin analysis in minutes. Early detection can make all the difference.
          </p>
          <Link to="/analysis">
            <Button size="lg" variant="secondary" className="text-lg">
              Start Free Analysis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground/5 py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4 text-foreground">DermaSol</h3>
              <p className="text-muted-foreground">
                AI-powered dermatological assistance for accessible, reliable skin health assessment.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4 text-foreground">Quick Links</h3>
              <div className="space-y-2">
                <Link to="/analysis" className="block text-muted-foreground hover:text-primary transition-colors">
                  Skin Analysis
                </Link>
                <Link to="/conditions" className="block text-muted-foreground hover:text-primary transition-colors">
                  Conditions
                </Link>
                <Link to="/about" className="block text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </Link>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4 text-foreground">Disclaimer</h3>
              <p className="text-sm text-muted-foreground">
                DermaSol provides preliminary assessments only. Always consult qualified healthcare professionals for medical diagnosis and treatment.
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-muted-foreground">
            <p>&copy; 2025 DermaSol. Developed at Faculty of Computing and Information Technology, Lahore.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
