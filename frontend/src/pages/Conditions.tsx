import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const conditions = [
  {
    name: "Acne",
    description: "Inflammatory skin condition characterized by pimples, blackheads, and cysts, commonly affecting the face, chest, and back.",
    prevalence: "Very Common",
    severity: "Mild to Moderate"
  },
  {
    name: "Eczema (Atopic Dermatitis)",
    description: "Chronic inflammatory condition causing dry, itchy, and inflamed skin patches, often appearing on flexural areas.",
    prevalence: "Common",
    severity: "Mild to Severe"
  },
  {
    name: "Psoriasis",
    description: "Autoimmune condition causing rapid skin cell buildup, resulting in thick, scaly, red patches with silvery scales.",
    prevalence: "Common",
    severity: "Moderate to Severe"
  },
  {
    name: "Rosacea",
    description: "Chronic facial condition causing redness, visible blood vessels, and sometimes acne-like bumps, primarily on the cheeks and nose.",
    prevalence: "Common",
    severity: "Mild to Moderate"
  },
  {
    name: "Seborrheic Dermatitis",
    description: "Inflammatory condition causing scaly, flaky patches and redness, commonly affecting the scalp, face, and oily areas.",
    prevalence: "Common",
    severity: "Mild to Moderate"
  },
  {
    name: "Vitiligo",
    description: "Autoimmune condition causing loss of skin pigmentation, resulting in white patches that can appear anywhere on the body.",
    prevalence: "Less Common",
    severity: "Cosmetic Concern"
  },
  {
    name: "Contact Dermatitis",
    description: "Allergic or irritant reaction causing red, itchy rash when skin comes in contact with certain substances or allergens.",
    prevalence: "Very Common",
    severity: "Mild to Moderate"
  },
  {
    name: "Melasma",
    description: "Hyperpigmentation condition causing brown or gray-brown patches, typically on the face, often triggered by sun exposure or hormones.",
    prevalence: "Common",
    severity: "Cosmetic Concern"
  },
  {
    name: "Hives (Urticaria)",
    description: "Allergic reaction causing raised, itchy welts on the skin that appear suddenly and can vary in size and location.",
    prevalence: "Common",
    severity: "Mild to Moderate"
  },
  {
    name: "Fungal Infections",
    description: "Various skin conditions caused by fungi, including ringworm, athlete's foot, and yeast infections, causing itching and scaling.",
    prevalence: "Very Common",
    severity: "Mild to Moderate"
  }
];

const Conditions = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 text-foreground">
              Common Skin Conditions
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Learn about the dermatological conditions DermaSol can help identify
            </p>
            
            <div className="max-w-xl mx-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search conditions..." 
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {conditions.map((condition) => (
              <Card key={condition.name} className="shadow-professional hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl text-foreground">{condition.name}</CardTitle>
                  <CardDescription className="flex gap-4 text-sm">
                    <span className="font-medium">Prevalence: {condition.prevalence}</span>
                    <span className="font-medium">Severity: {condition.severity}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {condition.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 p-6 bg-accent rounded-lg border border-border">
            <h3 className="font-semibold text-lg mb-3 text-foreground">
              Detection Capabilities
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              DermaSol's AI model is trained to detect and analyze these common skin conditions with high accuracy. 
              Our system provides confidence scores and detailed analysis for each detected condition, helping users 
              understand potential skin issues and when to seek professional medical care.
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> This list represents the current detection capabilities. Our model continues to 
              evolve and improve with ongoing training and validation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Conditions;
