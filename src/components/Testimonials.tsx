import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import sarahImage from "@/assets/testimonial-sarah.jpg";
import mikeImage from "@/assets/testimonial-mike.jpg";
import jenniferImage from "@/assets/testimonial-jennifer.jpg";

const testimonials = [
  {
    name: "Sarah Mitchell",
    age: 45,
    location: "Portland, OR",
    image: sarahImage,
    quote: "After years of trying different apps, Momentum finally clicked. It doesn't judge me for missing days - it helps me get back on track. Down 22 lbs in 6 months.",
    achievement: "6-month streak"
  },
  {
    name: "Mike Rodriguez",
    age: 52,
    location: "Austin, TX",
    image: mikeImage,
    quote: "I'm not trying to be 25 again. I just want to feel good. Momentum gets that. Simple tracking, no pressure, real results.",
    achievement: "Lost 18 lbs"
  },
  {
    name: "Jennifer Chen",
    age: 48,
    location: "Seattle, WA",
    image: jenniferImage,
    quote: "The AI coach feels like having a supportive friend who understands that some weeks are harder than others. Game changer for staying consistent.",
    achievement: "4-month streak"
  }
];

export const Testimonials = () => {
  return (
    <section className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-6 md:px-8 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            Real People, Real Results
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join over 5,000+ adults building sustainable fitness habits
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-primary/10 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6 space-y-4">
                <div className="flex gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-foreground leading-relaxed italic">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-4 pt-4 border-t border-primary/10">
                  <img 
                    src={testimonial.image} 
                    alt={`${testimonial.name}, age ${testimonial.age}`}
                    className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
                    loading="lazy"
                    width="64"
                    height="64"
                  />
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}, {testimonial.age}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                    <p className="text-sm text-primary font-semibold mt-1">{testimonial.achievement}</p>
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
