import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Star, Gift, CreditCard, ShieldCheck, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FeedbackForm } from "@/components/FeedbackForm";

interface Testimonial {
  id: string;
  display_name: string;
  location: string | null;
  quote: string;
  achievement: string | null;
  rating: number | null;
}

const MIN_RATINGS_FOR_AGGREGATE = 3;

const TRUST_FACTS = [
  { icon: Gift, title: "Free to start", body: "The free plan covers up to three habits." },
  { icon: CreditCard, title: "No credit card", body: "Sign up with just an email." },
  { icon: ShieldCheck, title: "Your data, your call", body: "Export it or delete your account anytime from Settings." },
  { icon: BookOpen, title: "Built by Chad T. Dyar", body: "Published author and Lean Six Sigma Black Belt." },
];

export const SocialProof = () => {
  const [items, setItems] = useState<Testimonial[] | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    supabase
      .from("testimonials")
      .select("id, display_name, location, quote, achievement, rating")
      .eq("is_approved", true)
      .order("created_at", { ascending: false })
      .limit(6)
      .then(({ data }) => setItems((data as Testimonial[]) ?? []));
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
  }, []);

  const rated = (items ?? []).filter((t) => typeof t.rating === "number" && t.rating >= 1 && t.rating <= 5);
  const showAggregate = rated.length >= MIN_RATINGS_FOR_AGGREGATE;
  const avg = showAggregate ? rated.reduce((s, t) => s + (t.rating as number), 0) / rated.length : 0;

  // JSON-LD only when real approved ratings exist
  useEffect(() => {
    if (!showAggregate) return;
    const el = document.createElement("script");
    el.type = "application/ld+json";
    el.dataset.socialProof = "true";
    el.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Momentum",
      applicationCategory: "HealthApplication",
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: avg.toFixed(1),
        ratingCount: rated.length,
        bestRating: 5,
        worstRating: 1,
      },
      review: rated.map((t) => ({
        "@type": "Review",
        author: { "@type": "Person", name: t.display_name },
        reviewBody: t.quote,
        reviewRating: { "@type": "Rating", ratingValue: t.rating, bestRating: 5 },
      })),
    });
    document.head.appendChild(el);
    return () => el.remove();
  }, [showAggregate, avg, rated.length]); // eslint-disable-line react-hooks/exhaustive-deps

  if (items === null) return null;

  const feedbackLink = (
    <button
      type="button"
      onClick={() => setFormOpen(true)}
      className="min-h-[44px] text-sm font-medium text-primary underline-offset-2 hover:underline"
    >
      Used Momentum? Share your feedback
    </button>
  );

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        {items.length > 0 ? (
          <>
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-3">
                What members are saying
              </h2>
              {showAggregate && (
                <p className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Star className="w-5 h-5 fill-primary text-primary" />
                  <span className="font-semibold text-foreground">{avg.toFixed(1)} / 5</span>
                  from {rated.length} reviews
                </p>
              )}
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((t) => (
                <Card key={t.id} className="border-primary/10">
                  <CardContent className="pt-6 space-y-3">
                    {t.rating ? (
                      <div className="flex gap-1" aria-label={`${t.rating} out of 5`}>
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} className={`w-4 h-4 ${i <= (t.rating as number) ? "fill-primary text-primary" : "text-muted-foreground/30"}`} />
                        ))}
                      </div>
                    ) : null}
                    <p className="text-foreground leading-relaxed">"{t.quote}"</p>
                    <div className="pt-3 border-t border-border">
                      <p className="font-semibold text-foreground">{t.display_name}</p>
                      {t.location && <p className="text-sm text-muted-foreground">{t.location}</p>}
                      {t.achievement && <p className="text-sm text-primary font-medium">{t.achievement}</p>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="mt-8 text-center text-sm text-muted-foreground" role="note">
              Testimonials reflect individual experiences. Results vary. We do not pay for endorsements.
            </p>
          </>
        ) : (
          <>
            <h2 className="text-center text-3xl md:text-4xl font-display font-bold text-foreground mb-8">
              What you can count on
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {TRUST_FACTS.map(({ icon: Icon, title, body }) => (
                <Card key={title} className="border-primary/10">
                  <CardContent className="pt-6 flex sm:flex-col gap-3">
                    <Icon className="w-6 h-6 text-primary shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">{title}</p>
                      <p className="text-sm text-muted-foreground">{body}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
        <div className="mt-6 text-center">{feedbackLink}</div>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogTitle className="sr-only">Share your feedback</DialogTitle>
          {signedIn ? (
            <FeedbackForm />
          ) : (
            <div className="py-6 text-center space-y-4">
              <p className="text-foreground">Sign in to share feedback so we know it comes from a real member.</p>
              <Link to="/auth" className="inline-flex min-h-[44px] items-center font-semibold text-primary hover:underline">
                Sign in
              </Link>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};
