import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { Check, X } from "lucide-react";
import momentumLogo from "@/assets/momentum-logo.png";
import { analytics } from "@/lib/analytics";

const schema = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Momentum",
    "applicationCategory": "HealthApplication",
    "operatingSystem": "Web",
    "offers": [
      {"@type": "Offer", "name": "Free", "price": "0", "priceCurrency": "USD"},
      {"@type": "Offer", "name": "Premium", "price": "7.99", "priceCurrency": "USD", "billingIncrement": "P1M"}
    ],
    "url": "https://momentumfit.app"
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Is Momentum a MyFitnessPal alternative?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Not exactly. MyFitnessPal logs food and macros. Momentum tracks habits and streaks and does not log food at all."
        }
      },
      {
        "@type": "Question",
        "name": "What does Momentum cost?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Free, or Premium at $7.99/mo."
        }
      }
    ]
  }
];

const comparisonRows = [
  { feature: "Food/macro logging", momentumFree: "No", momentumPremium: "No", mfpPremium: "Yes", mfpPremiumPlus: "Yes" },
  { feature: "Habit & streak tracking", momentumFree: "3 habits, basic", momentumPremium: "Unlimited habits", mfpPremium: "No", mfpPremiumPlus: "No" },
  { feature: "History retention", momentumFree: "Limited", momentumPremium: "Unlimited", mfpPremium: "N/A", mfpPremiumPlus: "N/A" },
  { feature: "AI coaching", momentumFree: "No", momentumPremium: "Yes", mfpPremium: "No", mfpPremiumPlus: "No" },
  { feature: "Data export", momentumFree: "No", momentumPremium: "CSV", mfpPremium: "No", mfpPremiumPlus: "No" },
  { feature: "Meal planning / recipes", momentumFree: "No", momentumPremium: "No", mfpPremium: "No", mfpPremiumPlus: "Yes" },
];

export default function MyFitnessPalAlternative() {
  const navigate = useNavigate();

  return (
    <>
      <SEO
        title="Momentum vs MyFitnessPal: A Consistency Tracker, Not a Food Log"
        description="Momentum tracks habits and streaks, not macros. See how it compares to MyFitnessPal's Premium and Premium+ tiers before you pick one."
        keywords="MyFitnessPal alternative, habit tracker vs food log, streak tracker app, fitness consistency app, habit tracker comparison, Momentum vs MyFitnessPal"
        canonical="https://momentumfit.app/myfitnesspal-alternative"
        schema={schema}
      />

      <div className="min-h-screen bg-background">
        {/* Nav */}
        <nav className="sticky top-0 z-20 bg-card/80 backdrop-blur-md border-b border-border shadow-sm">
          <div className="container mx-auto px-6 md:px-8 max-w-7xl flex items-center justify-between py-3">
            <a href="/" onClick={(e) => { e.preventDefault(); navigate("/"); }} className="flex items-center gap-2">
              <img src={momentumLogo} alt="Momentum" className="h-8 w-auto" />
              <span className="font-display font-bold text-lg text-gradient">Momentum</span>
            </a>
            <div className="hidden md:flex items-center gap-6 text-sm font-medium">
              <a href="/features" className="text-muted-foreground hover:text-primary transition-colors" onClick={(e) => { e.preventDefault(); navigate("/features"); }}>Features</a>
              <a href="/pricing" className="text-muted-foreground hover:text-primary transition-colors" onClick={(e) => { e.preventDefault(); navigate("/pricing"); }}>Pricing</a>
              <a href="/blog" className="text-muted-foreground hover:text-primary transition-colors" onClick={(e) => { e.preventDefault(); navigate("/blog"); }}>Blog</a>
            </div>
            <Button size="sm" onClick={() => { analytics.startSignup(); navigate("/auth"); }} className="btn-gradient">
              Start Free
            </Button>
          </div>
        </nav>

        <main className="py-16 md:py-24">
          <div className="container mx-auto px-6 md:px-8 max-w-3xl">
            <p className="text-primary font-semibold text-sm uppercase tracking-wide mb-4">Comparison</p>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground leading-tight mb-6">
              Not another calorie counter. Something that tracks whether you showed up.
            </h1>

            <section className="mt-12">
              <h2 className="text-2xl font-display font-bold text-foreground mb-4">Is Momentum a MyFitnessPal alternative?</h2>
              <p className="text-muted-foreground leading-relaxed">
                Not exactly, and that's worth saying up front. MyFitnessPal logs what you eat down to the gram. Momentum doesn't log food at all. It tracks whether you showed up for the habit you said mattered, and it repairs a broken streak instead of making you start over.
              </p>
            </section>

            <section className="mt-12">
              <h2 className="text-2xl font-display font-bold text-foreground mb-4">What does Momentum actually track?</h2>
              <p className="text-muted-foreground leading-relaxed">
                Workouts and habits, day by day, with a streak that survives a missed day instead of resetting to zero. Free covers basic tracking, three habits. Premium ($7.99/mo) adds unlimited habits, an AI Coach, unlimited history, and CSV export.
              </p>
            </section>

            <section className="mt-12">
              <h2 className="text-2xl font-display font-bold text-foreground mb-4">What does MyFitnessPal cost, and what do you get?</h2>
              <p className="text-muted-foreground leading-relaxed">
                MyFitnessPal Premium runs $79.99/yr for ad-free logging, barcode and meal scanning, and macro tracking. Premium+ runs $24.99/mo or $99.99/yr and adds a meal planner, recipes, and grocery delivery syncing. Both tiers are built around food logging.
              </p>
            </section>

            <section className="mt-12">
              <h2 className="text-2xl font-display font-bold text-foreground mb-4">Who should stick with MyFitnessPal?</h2>
              <p className="text-muted-foreground leading-relaxed">
                Anyone whose goal is dialing in macros, meal planning, or grocery logistics. MyFitnessPal is built for that and does it well. This page isn't arguing otherwise.
              </p>
            </section>

            <section className="mt-12">
              <h2 className="text-2xl font-display font-bold text-foreground mb-4">Who should try Momentum instead?</h2>
              <p className="text-muted-foreground leading-relaxed">
                Someone who already knows what to do and has stopped doing it consistently. Chad built Momentum at 50, after every gym friend he asked gave the same answer when he asked what was actually stopping them: not knowledge, just showing up. If tracking food isn't the problem and consistency is, that's the gap this app is for.
              </p>
            </section>

            {/* Feature comparison table */}
            <section className="mt-16">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-6 text-center">
                Feature Comparison
              </h2>
              <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
                <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3 font-display font-bold text-foreground">Feature</th>
                      <th className="text-center p-3 font-display font-bold text-foreground">Momentum Free</th>
                      <th className="text-center p-3 font-display font-bold text-primary bg-primary/5">Momentum Premium ($7.99/mo)</th>
                      <th className="text-center p-3 font-display font-bold text-muted-foreground">MyFitnessPal Premium ($79.99/yr)</th>
                      <th className="text-center p-3 font-display font-bold text-muted-foreground">MyFitnessPal Premium+ ($24.99/mo)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonRows.map((row, i) => (
                      <tr key={row.feature} className={`border-t border-border ${i % 2 === 1 ? 'bg-muted/30' : ''}`}>
                        <td className="p-3 font-medium text-foreground">{row.feature}</td>
                        <td className="p-3 text-center text-muted-foreground">{renderCell(row.momentumFree)}</td>
                        <td className="p-3 text-center bg-primary/5 text-foreground">{renderCell(row.momentumPremium)}</td>
                        <td className="p-3 text-center text-muted-foreground">{renderCell(row.mfpPremium)}</td>
                        <td className="p-3 text-center text-muted-foreground">{renderCell(row.mfpPremiumPlus)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* CTA */}
            <section className="mt-16 text-center">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">
                Start with consistency, not complexity
              </h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Track your first three habits free. Upgrade to Premium only when you want unlimited habits, AI coaching, and deeper history.
              </p>
              <Button
                size="lg"
                onClick={() => { analytics.startSignup(); navigate("/auth?utm_source=organic&utm_medium=comparison_page&utm_campaign=myfitnesspal_alternative"); }}
                className="btn-gradient btn-large shadow-xl hover:shadow-2xl transition-all hover:scale-105 text-base md:text-lg h-12 md:h-14 px-8 md:px-10"
              >
                Start Your First Habit Free
              </Button>
              <p className="text-sm text-muted-foreground mt-3">Free forever for three habits. No credit card required.</p>
            </section>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-12 border-t border-primary/10 bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
              <div>
                <p className="text-muted-foreground font-medium">Built by <a href="https://chadtdyar.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Chad T. Dyar</a></p>
                <p className="text-xs text-muted-foreground mt-1">&copy; 2026 MomentumFit. All rights reserved.</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Also by Chad:{" "}
                  <a href="https://pawformance.app" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">tools for pets</a>,{" "}
                  <a href="https://carecadence.app" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">health</a>,{" "}
                  <a href="https://palettepro.design" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">design</a>, and{" "}
                  <a href="https://thehomegrown.app" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">gardening</a>
                </p>
              </div>
              <nav className="flex flex-wrap gap-6 text-sm justify-center" aria-label="Footer navigation">
                <a href="/features" className="text-muted-foreground hover:text-primary transition-colors font-medium" onClick={(e) => { e.preventDefault(); navigate("/features"); }}>Features</a>
                <a href="/blog" className="text-muted-foreground hover:text-primary transition-colors font-medium" onClick={(e) => { e.preventDefault(); navigate("/blog"); }}>Blog</a>
                <a href="/story" className="text-muted-foreground hover:text-primary transition-colors font-medium" onClick={(e) => { e.preventDefault(); navigate("/story"); }}>Our Story</a>
                <a href="/resources/habit-streaks-science" className="text-muted-foreground hover:text-primary transition-colors font-medium" onClick={(e) => { e.preventDefault(); navigate("/resources/habit-streaks-science"); }}>Resources</a>
                <a href="mailto:support@momentumfit.app" className="text-muted-foreground hover:text-primary transition-colors font-medium">Contact</a>
                <a href="/privacy" className="text-muted-foreground hover:text-primary transition-colors font-medium" onClick={(e) => { e.preventDefault(); navigate("/privacy"); }}>Privacy Policy</a>
              </nav>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

function renderCell(value: string) {
  if (value === "Yes") return <Check className="h-5 w-5 text-success mx-auto" aria-label="Yes" />;
  if (value === "No") return <X className="h-5 w-5 text-muted-foreground/40 mx-auto" aria-label="No" />;
  return <span className="text-muted-foreground">{value}</span>;
}
