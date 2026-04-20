
import { Brain, Users, Target, Award, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="border-b border-border bg-gradient-to-b from-teal-950 via-teal-900 to-background">
        <div className="container mx-auto px-6 py-16 text-center max-w-4xl">
          <p className="text-white/70 text-sm mb-4">About / DermaSol</p>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            Intelligent Dermatology Assistance
          </h1>
          <p className="mt-6 text-lg text-white/80 leading-relaxed">
            DermaSol leverages advanced artificial intelligence to make
            dermatological guidance more accessible, reliable, and inclusive.
            We bridge the gap between users and professional care through
            structured AI-driven analysis.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-6 py-14 max-w-6xl">

        {/* Mission */}
        <Card className="mb-12 border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <Target className="h-6 w-6 text-teal-700" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground leading-relaxed space-y-4">
            <p>
              DermaSol is designed to democratize access to dermatological
              screening by combining AI-powered image analysis with structured
              symptom interpretation.
            </p>
            <p>
              Our goal is to provide early-stage, intelligent guidance
              particularly in regions where professional dermatological care
              may be limited while maintaining transparency, fairness, and
              responsible medical positioning.
            </p>
          </CardContent>
        </Card>

        {/* Technology */}
        <Card className="mb-12 border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <Brain className="h-6 w-6 text-teal-700" />
              Core Technology
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">

            <div>
              <h3 className="font-semibold text-lg mb-3 text-foreground">
                Hybrid Vision Architecture
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                DermaSol integrates Convolutional Neural Networks (CNNs)
                with Vision Transformers (ViTs) to enhance detection
                performance across multiple dermatological conditions.
                This hybrid approach improves both spatial recognition
                and contextual understanding of skin patterns.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-3 text-foreground">
                Symptom-Aware NLP Module
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Our Natural Language Processing layer interprets
                user-provided symptom descriptions, aligning visual
                findings with contextual data to generate structured,
                user-friendly insights.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-3 text-foreground">
                Fairness & Explainability
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                The system incorporates bias-reduction mechanisms and
                confidence scoring to promote equitable and transparent
                AI-assisted decision support across diverse skin tones.
              </p>
            </div>

          </CardContent>
        </Card>

        {/* Performance Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          <Card className="text-center border-border shadow-sm">
            <CardContent className="pt-8 pb-8">
              <Award className="h-12 w-12 text-teal-700 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                85%+ Accuracy
              </h3>
              <p className="text-muted-foreground text-sm">
                Validated classification performance across supported conditions.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-border shadow-sm">
            <CardContent className="pt-8 pb-8">
              <Users className="h-12 w-12 text-teal-700 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Multi-Skin Type Support
              </h3>
              <p className="text-muted-foreground text-sm">
                Optimized across diverse pigmentation and complexion profiles.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-border shadow-sm">
            <CardContent className="pt-8 pb-8">
              <Target className="h-12 w-12 text-teal-700 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Beta 2026
              </h3>
              <p className="text-muted-foreground text-sm">
                Full-featured public release scheduled for 2026.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Team */}
        <Card className="mb-12 border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <Users className="h-6 w-6 text-teal-700" />
              Development Team
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 text-muted-foreground">

            <div>
              <h3 className="font-semibold text-lg mb-2 text-foreground">
                Academic Affiliation
              </h3>
              <p>
                Faculty of Computing and Information Technology, Lahore  
                <br />
                Bachelor of Science in Software Engineering (2022–2026)
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2 text-foreground">
                Project Contributors
              </h3>
              <ul className="space-y-2">
                <li>• Hamna Ali (BSEF22M506)</li>
                <li>• Aiman Ijaz (BSEF22M532)</li>
                <li>• Hamna Hashmi (BSEF22M538)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2 text-foreground">
                Supervision
              </h3>
              <p>
                <strong>Supervisor:</strong> Mr. Farhan Chaudhary  
                <br />
                <strong>Co-Supervisor:</strong> Dr. Amina Mustansir
              </p>
            </div>

          </CardContent>
        </Card>

        {/* Disclaimer */}
        <div className="rounded-2xl border border-border bg-gradient-to-b from-teal-950 to-teal-900 p-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck className="h-5 w-5 text-white" />
            <h3 className="text-xl font-semibold">
              Medical Disclaimer
            </h3>
          </div>

          <p className="text-white/80 text-sm leading-relaxed">
            DermaSol provides AI-based preliminary assessment support and
            educational insights. It does not replace professional medical
            diagnosis or treatment. Users experiencing severe, worsening, or
            urgent symptoms should consult a licensed healthcare provider.
          </p>

          <div className="mt-6">
            <Button variant="secondary" className="text-teal-900" asChild>
              <a href="/analysis">Start an Analysis</a>
            </Button>
          </div>
        </div>

      </section>
    </div>
  );
};

export default About;