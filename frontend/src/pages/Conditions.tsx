import { useMemo, useState } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Sparkles, ShieldCheck } from "lucide-react";

/**
 * Auto-load any images placed inside:
 *   src/assets/conditions/
 * Supported: png, jpg, jpeg, webp
 *
 * It tries to match images by filename keywords.
 * Example filenames that work:
 *   acne-type-iv.jpg, psoriasis.png, vitiligo.jpg, contact-dermatitis.jpeg, eczema-1.png
 */
const conditionImages = import.meta.glob(
  "/src/assets/*.{png,jpg,jpeg,webp}",
  { eager: true, import: "default" }
) as Record<string, string>;

console.log("conditionImages keys:", Object.keys(conditionImages));
type Condition = {
  key: string;
  name: string;
  oneLiner: string;
  description: string;
  prevalence: "Very Common" | "Common" | "Less Common";
  severity: "Mild" | "Mild to Moderate" | "Moderate" | "Moderate to Severe" | "Mild to Severe" | "Cosmetic Concern";
  tags: string[];
  symptoms: string[];
  tips: string[];
};

const CONDITIONS: Condition[] = [
  {
    key: "acne",
    name: "Acne",
    oneLiner: "Breakouts, blackheads, pimples, and cysts often on face, chest, and back.",
    description:
      "Acne is an inflammatory condition involving clogged pores and bacteria. It can range from mild blackheads to painful cysts.",
    prevalence: "Very Common",
    severity: "Mild to Moderate",
    tags: ["Inflammatory", "Pores", "Face/Back"],
    symptoms: ["Blackheads/whiteheads", "Pimples", "Tender nodules/cysts", "Oily skin"],
    tips: ["Use gentle cleanser", "Avoid harsh scrubs", "Use non-comedogenic products", "Consult if severe/painful"],
  },
  {
    key: "eczema",
    name: "Eczema (Atopic Dermatitis)",
    oneLiner: "Dry, itchy, inflamed patches often in flexural areas.",
    description:
      "Eczema is a chronic inflammatory skin condition linked to barrier dysfunction and immune sensitivity. It often flares with triggers.",
    prevalence: "Common",
    severity: "Mild to Severe",
    tags: ["Itch", "Dryness", "Flares"],
    symptoms: ["Intense itching", "Dry/scaly patches", "Redness", "Thickened skin in chronic cases"],
    tips: ["Moisturize frequently", "Avoid fragrance triggers", "Use lukewarm showers", "Seek care if oozing/infected"],
  },
  {
    key: "psoriasis",
    name: "Psoriasis",
    oneLiner: "Thick, scaly plaques often on elbows, knees, scalp.",
    description:
      "Psoriasis is an autoimmune condition that speeds up skin cell turnover, leading to thick plaques and scale.",
    prevalence: "Common",
    severity: "Moderate to Severe",
    tags: ["Autoimmune", "Plaques", "Scalp"],
    symptoms: ["Red plaques", "Silvery scale", "Itching/burning", "Scalp flaking"],
    tips: ["Avoid scratching", "Moisturize regularly", "Track triggers (stress/infection)", "See dermatologist for systemic options"],
  },
  {
    key: "rosacea",
    name: "Rosacea",
    oneLiner: "Facial redness, flushing, visible vessels, sometimes acne-like bumps.",
    description:
      "Rosacea is a chronic facial condition often triggered by heat, sun, spicy foods, or stress. It can be mistaken for acne.",
    prevalence: "Common",
    severity: "Mild to Moderate",
    tags: ["Redness", "Flushing", "Sensitive skin"],
    symptoms: ["Persistent redness", "Flushing", "Visible blood vessels", "Bumps/pustules (sometimes)"],
    tips: ["Use sunscreen daily", "Avoid known triggers", "Use gentle skincare", "Consult for prescription options"],
  },
  {
    key: "seborrheic-dermatitis",
    name: "Seborrheic Dermatitis",
    oneLiner: "Flaky, scaly patches commonly scalp, eyebrows, sides of nose.",
    description:
      "Seborrheic dermatitis is linked to inflammation and yeast overgrowth in oily areas. It can resemble dandruff.",
    prevalence: "Common",
    severity: "Mild to Moderate",
    tags: ["Flaking", "Scalp", "Oily areas"],
    symptoms: ["Scalp flakes", "Greasy scale", "Redness", "Itching"],
    tips: ["Use anti-dandruff shampoos", "Avoid heavy oils on scalp", "Gentle cleansing", "See care if persistent"],
  },
  {
    key: "vitiligo",
    name: "Vitiligo",
    oneLiner: "Loss of pigmentation causing white patches on skin.",
    description:
      "Vitiligo is an autoimmune condition where pigment-producing cells are damaged, leading to depigmented patches.",
    prevalence: "Less Common",
    severity: "Cosmetic Concern",
    tags: ["Pigment loss", "Autoimmune", "Sun protection"],
    symptoms: ["White patches", "Symmetric distribution (often)", "Hair whitening in patches"],
    tips: ["Use sunscreen on depigmented areas", "Avoid skin trauma", "Consult for treatment options"],
  },
  {
    key: "contact-dermatitis",
    name: "Contact Dermatitis",
    oneLiner: "Red, itchy rash after exposure to irritants/allergens.",
    description:
      "Contact dermatitis occurs when skin reacts to a trigger like fragrance, metals, detergents, or plants.",
    prevalence: "Very Common",
    severity: "Mild to Moderate",
    tags: ["Allergy/irritant", "Rash", "Trigger-based"],
    symptoms: ["Itching", "Red rash", "Dry/cracked skin", "Blisters in some cases"],
    tips: ["Identify & avoid trigger", "Use mild soaps", "Patch-test new products", "Seek help if swelling/spreading"],
  },
  {
    key: "melasma",
    name: "Melasma",
    oneLiner: "Brown/gray-brown patches—usually on face; often sun/hormone related.",
    description:
      "Melasma is a pigmentation disorder commonly influenced by UV exposure and hormonal changes.",
    prevalence: "Common",
    severity: "Cosmetic Concern",
    tags: ["Pigmentation", "Sun-related", "Face"],
    symptoms: ["Dark patches", "Symmetric facial pattern", "Worsens with sun"],
    tips: ["Daily sunscreen is essential", "Avoid heat/UV", "Consult for topical treatments", "Be patient improvement takes time"],
  },
  {
    key: "hives",
    name: "Hives (Urticaria)",
    oneLiner: "Sudden raised itchy welts that come and go.",
    description:
      "Hives are often allergic or stress-related, and can appear suddenly. Individual welts typically fade within 24 hours.",
    prevalence: "Common",
    severity: "Mild to Moderate",
    tags: ["Allergic", "Itchy welts", "Sudden onset"],
    symptoms: ["Raised welts", "Itching", "Moving pattern", "Swelling (sometimes)"],
    tips: ["Avoid known triggers", "Cold compress can help", "Seek urgent care if breathing/lip swelling"],
  },
  {
    key: "fungal",
    name: "Fungal Infections",
    oneLiner: "Itching, scaling, ring-like rashes, or irritated folds.",
    description:
      "Fungal infections vary by area (ringworm, athlete’s foot, yeast). They often thrive in warm, moist environments.",
    prevalence: "Very Common",
    severity: "Mild to Moderate",
    tags: ["Itch", "Scaling", "Contagious (some)"],
    symptoms: ["Itching", "Scaling", "Ring-shaped lesions (some)", "Worsens with moisture"],
    tips: ["Keep area dry", "Avoid sharing towels", "Use antifungal care as directed", "See care if spreading/persistent"],
  },
];

function findImageForKey(key: string) {
  const lowerKey = key.toLowerCase();


  const direct = Object.entries(conditionImages).find(([path]) =>
    path.toLowerCase().includes(lowerKey)
  );
  if (direct) return direct[1];

  // Extra keyword support
  const aliases: Record<string, string[]> = {
    eczema: ["atopic", "dermatitis", "eczema"],
    "contact-dermatitis": ["contact", "dermatitis"],
    "seborrheic-dermatitis": ["seborrheic", "seborrheic-dermatitis", "dandruff"],
    hives: ["urticaria", "hives"],
    fungal: ["fungal", "ringworm", "tinea", "athletes-foot", "yeast"],
  };

  const keys = aliases[lowerKey] ?? [];
  const aliasMatch = Object.entries(conditionImages).find(([path]) =>
    keys.some((k) => path.toLowerCase().includes(k))
  );
  if (aliasMatch) return aliasMatch[1];

  // Fallback (no image found)
  return null;
}

const Conditions = () => {
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState<string>("All");
  const [prevalence, setPrevalence] = useState<string>("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return CONDITIONS.filter((c) => {
      const matchesQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q));

      const matchesSeverity = severity === "All" || c.severity === severity;
      const matchesPrevalence = prevalence === "All" || c.prevalence === prevalence;

      return matchesQuery && matchesSeverity && matchesPrevalence;
    });
  }, [query, severity, prevalence]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-teal-950 via-teal-900 to-background">
        <div className="container mx-auto px-6 py-12 md:py-16">
          <div className="max-w-3xl">
            <p className="text-white/70 text-sm mb-3">Library / Conditions</p>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
              Skin Conditions Library
            </h1>
            <p className="mt-4 text-white/80 text-lg leading-relaxed">
              Explore common dermatological conditions DermaSol can help identify
              with quick overviews, key symptoms, and practical guidance.
            </p>
          </div>

          {/* Search + Filters */}
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            <div className="lg:col-span-7 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, symptom, tag..."
                className="pl-12 h-12 bg-white/10 border-white/15 text-white placeholder:text-white/50 focus-visible:ring-white/30"
              />
            </div>

            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="h-12 rounded-md border border-white/15 bg-white/10 px-3 flex items-center gap-3">
                <Filter className="h-4 w-4 text-white/60" />
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full bg-transparent text-white outline-none"
                >
                  <option className="text-black">All</option>
                  <option className="text-black">Mild</option>
                  <option className="text-black">Mild to Moderate</option>
                  <option className="text-black">Moderate</option>
                  <option className="text-black">Moderate to Severe</option>
                  <option className="text-black">Mild to Severe</option>
                  <option className="text-black">Cosmetic Concern</option>
                </select>
              </div>

              <div className="h-12 rounded-md border border-white/15 bg-white/10 px-3 flex items-center gap-3">
                <Filter className="h-4 w-4 text-white/60" />
                <select
                  value={prevalence}
                  onChange={(e) => setPrevalence(e.target.value)}
                  className="w-full bg-transparent text-white outline-none"
                >
                  <option className="text-black">All</option>
                  <option className="text-black">Very Common</option>
                  <option className="text-black">Common</option>
                  <option className="text-black">Less Common</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-5 text-white/70 text-sm">
            Showing <span className="text-white font-semibold">{filtered.length}</span> conditions
          </div>
        </div>
      </section>

      {/* Cards */}
      <section className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filtered.map((c) => {
            const img = findImageForKey(c.key);

            return (
              <Card
                key={c.key}
                className="overflow-hidden border-border bg-card shadow-sm hover:shadow-lg transition-shadow"
              >
                {/* Image Header */}
                <div className="relative h-44 bg-muted">
                  {img ? (
                    <img src={img} alt={c.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-teal-900 to-teal-700" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

                  <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-2">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 text-teal-900">
                      {c.prevalence}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20">
                      {c.severity}
                    </span>
                  </div>
                </div>

                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">{c.name}</CardTitle>
                  <p className="text-sm text-muted-foreground leading-relaxed">{c.oneLiner}</p>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {c.tags.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="text-xs px-2.5 py-1 rounded-full bg-foreground/5 text-foreground"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Expandable "Healthline-like" info */}
                  <details className="group">
                    <summary className="cursor-pointer list-none flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-foreground/5 transition-colors">
                      Quick overview
                      <span className="text-muted-foreground group-open:rotate-180 transition-transform">▾</span>
                    </summary>

                    <div className="mt-3 space-y-3 text-sm">
                      <p className="text-muted-foreground leading-relaxed">{c.description}</p>

                      <div>
                        <p className="font-semibold mb-1">Common symptoms</p>
                        <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                          {c.symptoms.map((s) => (
                            <li key={s}>{s}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <p className="font-semibold mb-1">Helpful tips</p>
                        <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                          {c.tips.map((t) => (
                            <li key={t}>{t}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </details>

                  <div className="mt-5">
  <Button className="w-full" asChild>
    <a href="/analysis">
      Start Analysis
    </a>
  </Button>
</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom capability panel (no big empty space) */}
        <div className="mt-14 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 rounded-2xl border border-border bg-card p-7">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="h-5 w-5 text-teal-700" />
              <h3 className="text-xl font-semibold">Detection capabilities</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              DermaSol’s AI is trained to recognize multiple skin conditions and return a structured summary
              with confidence signals. This library reflects the conditions currently supported by the system.
            </p>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl border border-border p-4 bg-foreground/5">
                <p className="text-sm font-semibold">Fast screening</p>
                <p className="text-sm text-muted-foreground mt-1">Instant guidance to help decide next steps.</p>
              </div>
              <div className="rounded-xl border border-border p-4 bg-foreground/5">
                <p className="text-sm font-semibold">Confidence output</p>
                <p className="text-sm text-muted-foreground mt-1">Transparent probabilities for top results.</p>
              </div>
              <div className="rounded-xl border border-border p-4 bg-foreground/5">
                <p className="text-sm font-semibold">Continuously improved</p>
                <p className="text-sm text-muted-foreground mt-1">Updated as training + validation progresses.</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 rounded-2xl border border-border bg-gradient-to-b from-teal-950 to-teal-900 p-7 text-white">
            <div className="flex items-center gap-3 mb-3">
              <ShieldCheck className="h-5 w-5 text-white" />
              <h3 className="text-xl font-semibold">Medical disclaimer</h3>
            </div>
            <p className="text-white/80 leading-relaxed text-sm">
              DermaSol provides AI-based preliminary guidance and is not a medical diagnosis.
              For urgent symptoms or worsening conditions, consult a qualified healthcare professional.
            </p>

            <div className="mt-5">
              <Button variant="secondary" className="w-full text-teal-900" asChild>
                <a href="mailto:dermasol.inc@gmail.com">Contact: dermasol.inc@gmail.com</a>
              </Button>
              <p className="mt-3 text-xs text-white/70 text-center">
                Website: dermasol.com
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Conditions;