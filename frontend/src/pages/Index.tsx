import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Upload, Brain, Shield, CheckCircle2 } from "lucide-react";
import Navigation from "@/components/Navigation";
import FeatureCard from "@/components/FeatureCard";
import heroImage from "@/assets/hero-dermatology.jpg";
import aiIcon from "@/assets/ai-analysis-icon.jpg";
import recommendationsIcon from "@/assets/recommendations-icon.jpg";
import accessibilityIcon from "@/assets/accessibility-icon.jpg";

import acneImg from "@/assets/acne.jpg";
import psoriasisImg from "@/assets/psoriasis.jpg";
import rosaceaImg from "@/assets/rosacea.png";
import eczemaImg from "@/assets/eczema.jpg";
import dermatitisImg from "@/assets/dermatitis.jpg";
import viralImg from "@/assets/viral.png";
import trustImg from "@/assets/medical-ai.jpg";

const Index = () => {
  const conditions = [
    { name: "Acne", img: acneImg },
    { name: "Psoriasis", img: psoriasisImg },
    { name: "Rosacea", img: rosaceaImg },
    { name: "Eczema", img: eczemaImg },
    { name: "Contact Dermatitis", img: dermatitisImg },
    { name: "Viral Skin Infection", img: viralImg },
  ];

  const trustPoints = [
    "CNN + Vision Transformer image understanding",
    "NLP-powered symptom interpretation",
    "RAG-based knowledge retrieval for recommendations",
    "Confidence scoring for transparent results",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Professional dermatology"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-teal-900/60 to-transparent" />
        </div>

        <div className="relative container mx-auto px-6 py-24 md:py-36">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-white/90 px-4 py-2 rounded-full text-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Medical AI • Dermatology • Personalized Insights
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight tracking-tight text-white">
              AI-Driven Dermatology Intelligence 
            </h1>

            <p className="text-xl md:text-2xl mb-10 text-white/90 leading-relaxed">
              A clinically-informed artificial intelligence system designed to assist in preliminary dermatological assessment through multimodal analysis of images and symptoms.
            </p>

            <div className="flex flex-col sm:flex-row gap-5">
              <Link to="/analysis">
                <Button
                  size="lg"
                  className="w-full sm:w-auto text-lg px-8 py-6 bg-white text-teal-800 hover:bg-gray-100 shadow-lg"
                >
                  Start Analysis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>

              <Link to="/about">
               <Button
  size="lg"
  className="w-full sm:w-auto text-lg px-8 py-6 bg-transparent border-2 border-white text-white hover:bg-white hover:text-teal-900 transition-all duration-300"
>
  Learn More
</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow-xl p-10 text-center border border-gray-100 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300">
              <h3 className="text-5xl font-extrabold text-teal-700 mb-4">85%+</h3>
              <p className="text-xl font-semibold text-gray-800 mb-2">Internal Validation Accuracy</p>
              <p className="text-gray-500">Evaluated on controlled dermatological datasets</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-10 text-center border border-gray-100 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300">
              <h3 className="text-5xl font-extrabold text-teal-700 mb-4">10+</h3>
              <p className="text-xl font-semibold text-gray-800 mb-2">Skin Conditions</p>
              <p className="text-gray-500">Common dermatological issues</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-10 text-center border border-gray-100 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300">
              <h3 className="text-5xl font-extrabold text-teal-700 mb-4">24/7</h3>
              <p className="text-xl font-semibold text-gray-800 mb-2">Availability</p>
              <p className="text-gray-500">Instant access anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Common Conditions Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
              Dermatological Conditions We Detect
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Explore common conditions analyzed by DermaSol. This section strengthens medical authenticity and mirrors editorial layouts seen on leading health platforms.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
            {conditions.map((c, idx) => (
              <div
                key={idx}
                className="group relative rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500"
              >
                <div className="h-64 overflow-hidden">
                  <img
                    src={c.img}
                    alt={c.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-90" />

                <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between gap-4">
                  <h3 className="text-white text-2xl font-bold tracking-wide">
                    {c.name}
                  </h3>
                  <Link to="/analysis" className="text-white/90 hover:text-white text-sm underline underline-offset-4">
                    Analyze
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-gray-900 tracking-tight">
              Clinical AI Architecture
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              A multimodal diagnostic-assistance pipeline integrating convolutional neural networks, vision transformers, and contextual natural language reasoning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mt-12">
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

      {/* Why Trust DermaSol */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-14 items-center">
            <div>
              <img
                src={trustImg}
                alt="Medical AI credibility"
                className="rounded-2xl shadow-2xl w-full object-cover"
              />
            </div>

            <div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
                Why Trust DermaSol?
              </h2>

              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                DermaSol is built with modern AI pipelines that combine vision models with retrieval-based knowledge.
                This creates results that are more accurate, explainable, and clinically meaningful.
              </p>

              <div className="space-y-4">
                {trustPoints.map((t, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-teal-700 mt-0.5" />
                    <p className="text-gray-700">{t}</p>
                  </div>
                ))}
              </div>

              <div className="mt-10">
                <Link to="/analysis">
                  <Button className="px-8 py-6 text-lg bg-teal-700 hover:bg-teal-800 text-white shadow-lg">
                    Try AI Analysis
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-8 bg-gray-50">
  <div className="container mx-auto px-6 max-w-4xl text-center">
    <h2 className="text-3xl font-bold mb-6 text-gray-900">
      Ethical AI & Responsible Deployment
    </h2>
    <p className="text-gray-600 leading-relaxed">
      DermaSol incorporates fairness-aware model training and bias-reduction
      strategies to improve performance across diverse skin tones.
      The system provides confidence-based outputs and does not replace
      licensed medical consultation.
    </p>
  </div>
</section>

      {/* How It Works Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-gray-900 tracking-tight">
              How DermaSol Works
            </h2>
            <p className="text-lg md:text-xl text-gray-600">
              Three simple steps to professional skin analysis
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto mt-16">
            <div className="relative bg-white p-10 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 text-center border border-gray-100">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-teal-700 text-white w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-md">
                1
              </div>
              <Upload className="h-12 w-12 text-teal-700 mx-auto mb-6 mt-6" />
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Upload Image</h3>
              <p className="text-gray-600 leading-relaxed">
                Take or upload a clear photo of the affected skin area
              </p>
            </div>

            <div className="relative bg-white p-10 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 text-center border border-gray-100">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-teal-700 text-white w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-md">
                2
              </div>
              <Brain className="h-12 w-12 text-teal-700 mx-auto mb-6 mt-6" />
              <h3 className="text-2xl font-bold mb-3 text-gray-900">AI Analysis</h3>
              <p className="text-gray-600 leading-relaxed">
                Our AI models analyze the image and process your symptoms
              </p>
            </div>

            <div className="relative bg-white p-10 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 text-center border border-gray-100">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-teal-700 text-white w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-md">
                3
              </div>
              <Shield className="h-12 w-12 text-teal-700 mx-auto mb-6 mt-6" />
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Get Results</h3>
              <p className="text-gray-600 leading-relaxed">
                Receive detailed analysis with confidence scores and recommendations
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-teal-800 to-teal-700 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
            Ready to Analyze Your Skin Condition?
          </h2>

          <p className="text-lg md:text-xl mb-8 text-white/90 max-w-2xl mx-auto leading-relaxed">
            Get professional AI-powered skin analysis in minutes. Early detection can make all the difference.
          </p>

          <Link to="/analysis">
            <Button
              size="lg"
              className="text-lg px-10 py-6 bg-white text-teal-800 hover:bg-gray-100 shadow-xl"
            >
              Start Free Analysis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400">
        <div className="container mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">DermaSol</h3>
              <p className="text-sm max-w-md leading-relaxed">
                AI-powered dermatological analysis platform for accessible, reliable skin health assessment.
              </p>

              <div className="mt-3 text-sm space-y-1">
                <p>
                  <a
                    href="mailto:dermasol.inc@gmail.com"
                    className="hover:text-white transition-colors"
                  >
                    dermasol.inc@gmail.com
                  </a>
                </p>
                <p>
                  <a
                    href="https://dermasol.com"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    dermasol.com
                  </a>
                </p>
              </div>
            </div>

            <div className="flex gap-8 text-sm">
              <Link to="/analysis" className="hover:text-white transition-colors">
                Analysis
              </Link>
              <Link to="/conditions" className="hover:text-white transition-colors">
                Conditions
              </Link>
              <Link to="/about" className="hover:text-white transition-colors">
                About
              </Link>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-gray-800 text-xs text-center">
            © 2025 DermaSol. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;