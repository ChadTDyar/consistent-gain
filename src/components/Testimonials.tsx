import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star, MessageSquareHeart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Testimonial {
  id: string;
  display_name: string;
  location: string | null;
  quote: string;
  achievement: string | null;
  rating: number;
}

export const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApproved = async () => {
      const { data } = await supabase
        .from("testimonials")
        .select("id, display_name, location, quote, achievement, rating")
        .eq("is_approved", true)
        .order("created_at", { ascending: false })
        .limit(6);
      setTestimonials(data ?? []);
      setLoading(false);
    };
    fetchApproved();
  }, []);

  if (loading) return null;

  // If no approved testimonials yet, show a CTA to leave feedback
  if (testimonials.length === 0) {
    return (
      <section className="py-20 md:py-32 bg-background">
        <div className="container mx-auto px-6 md:px-8 max-w-3xl text-center space-y-6">
          <MessageSquareHeart className="h-12 w-12 text-primary mx-auto" />
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground">
            What Our Users Say
          </h2>
          <p className="text-xl text-muted-foreground">
            We're just getting started! Real stories from real users will appear here as our community grows.
          </p>
          <p className="text-muted-foreground">
            Already a member? Share your experience from the Settings page.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-6 md:px-8 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            Real People, Real Results
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Hear from members building sustainable fitness habits
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <Card key={t.id} className="border-primary/10 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6 space-y-4">
                <div className="flex gap-1 mb-2">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                  {[...Array(5 - t.rating)].map((_, i) => (
                    <Star key={`e-${i}`} className="w-5 h-5 text-muted-foreground/30" />
                  ))}
                </div>
                <p className="text-foreground leading-relaxed italic">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-4 pt-4 border-t border-primary/10">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                    {t.display_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{t.display_name}</p>
                    {t.location && <p className="text-sm text-muted-foreground">{t.location}</p>}
                    {t.achievement && <p className="text-sm text-primary font-semibold mt-1">{t.achievement}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
