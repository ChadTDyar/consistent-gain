import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Heart, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import momentumLogo from "@/assets/momentum-logo.png";
import { SEO } from "@/components/SEO";

const storySchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Our Story: Why Momentum Was Built for Adults 40+ Who Need Sustainable Fitness Habits",
  description: "After losing 100 pounds at 30 and maintaining it for 20 years, the founder built Momentum - a fitness habit tracker for adults 40+ who need consistency over intensity.",
  author: {
    "@type": "Person",
    name: "Chad T Dyar",
    url: "https://www.chadtdyar.com"
  },
  publisher: {
    "@type": "Organization",
    name: "Momentum",
    url: "https://consistent-gain.lovable.app"
  },
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": "https://consistent-gain.lovable.app/story"
  }
};

export default function About() {
  const navigate = useNavigate();

  return (
    <>
      <SEO 
        title="Our Story - How Losing 100lbs Led to Momentum | Fitness Habits for Adults 40+"
        description="After losing 100 pounds at 30 and spending 20 years keeping it off, I built Momentum - a fitness habit tracker for adults 40+ who need consistency, not perfection."
        keywords="fitness journey after 40, weight loss maintenance, sustainable fitness habits, fitness app origin story, building habits over 40, fitness consistency, habit tracker for adults, midlife fitness, exercise motivation over 50"
        canonical="https://consistent-gain.lovable.app/story"
        schema={storySchema}
      />
      <div className="min-h-screen bg-background-cream">
        {/* Nav */}
        <nav className="sticky top-0 z-20 bg-card/80 backdrop-blur-md border-b border-border shadow-sm">
          <div className="container mx-auto px-6 md:px-8 max-w-7xl flex items-center justify-between py-3">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
              <img src={momentumLogo} alt="Momentum" className="h-8 w-auto" />
              <span className="font-display font-bold text-lg text-gradient">Momentum</span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm font-medium">
              <a href="/blog" className="text-muted-foreground hover:text-primary transition-colors" onClick={(e) => { e.preventDefault(); navigate("/blog"); }}>Blog</a>
              <a href="/pricing" className="text-muted-foreground hover:text-primary transition-colors" onClick={(e) => { e.preventDefault(); navigate("/pricing"); }}>Pricing</a>
            </div>
            <Button size="sm" onClick={() => navigate("/auth")} className="btn-gradient">
              Start Free
            </Button>
          </div>
        </nav>

        <div className="container mx-auto px-4 md:px-8 py-8 md:py-12 max-w-4xl">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")} 
            className="mb-8 hover:bg-muted"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>

          <div className="flex items-center gap-4 mb-8">
            <img src={momentumLogo} alt="Momentum" className="h-16 w-auto" />
            <div>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground">
                Our Story
              </h1>
              <p className="text-muted-foreground mt-1">How losing 100 pounds led to building Momentum</p>
            </div>
          </div>

          <div className="prose prose-lg max-w-none space-y-8 text-foreground">
            
            {/* The Origin - SEO-rich narrative */}
            <section className="bg-card rounded-xl p-6 md:p-8 shadow-md">
              <h2 className="text-3xl font-display font-bold mb-4 text-foreground">The 100-Pound Wake-Up Call</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  When I was 30, I lost over a hundred pounds. It changed everything - my confidence, my energy, my outlook. But here's what nobody tells you about massive weight loss: <strong className="text-foreground">keeping it off is the harder part.</strong>
                </p>
                <p>
                  For twenty years, I've fought to maintain that loss. In the last few years, as I approached 50, things changed. Recovery took longer. Joints started complaining. The routines that worked at 35 stopped working at 45. I needed to completely rebuild my approach to fitness.
                </p>
                <p>
                  I looked for tools to help. Every fitness app I found was designed for 25-year-olds chasing six-packs - not for someone my age trying to stay consistent after a health setback.
                </p>
                <p className="font-semibold text-foreground">
                  <Heart className="inline h-5 w-5 text-primary mr-1" />
                  So I built my own. That's how Momentum was born.
                </p>
              </div>
            </section>

            {/* What Makes Momentum Different */}
            <section>
              <h2 className="text-3xl font-display font-bold mb-4 text-foreground">Why Momentum Is Different from Other Fitness Apps</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Momentum is a <strong className="text-foreground">fitness habit tracker built specifically for adults 40+</strong> who want lasting routines - not quick transformations.
              </p>
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-6 space-y-3">
                <p className="font-semibold text-foreground text-lg">What it actually does:</p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span><strong className="text-foreground">Tracks daily fitness goals</strong> - walking, stretching, gym sessions, whatever you choose</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span><strong className="text-foreground">Builds consistency through streaks</strong> - with a unique <a href="/blog/streak-repair-missing-workout-days" className="text-primary hover:underline font-semibold" onClick={(e) => { e.preventDefault(); navigate("/blog/streak-repair-missing-workout-days"); }}>Streak Repair</a> feature for missed days</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span><strong className="text-foreground">Shows progress without overwhelm</strong> - clean visual graphs, not spreadsheets</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span><strong className="text-foreground">Supports <a href="/blog/joint-friendly-exercises-over-40" className="text-primary hover:underline" onClick={(e) => { e.preventDefault(); navigate("/blog/joint-friendly-exercises-over-40"); }}>joint-friendly exercises</a></strong> - because your knees have earned some respect</span>
                  </li>
                </ul>
                <p className="font-semibold text-foreground pt-2 italic">
                  It's simple because life is complicated enough.
                </p>
              </div>
            </section>

            {/* Medical Disclaimer */}
            <section className="bg-orange-50 dark:bg-orange-950/20 border-l-4 border-orange-500 rounded-lg p-6">
              <h2 className="text-3xl font-display font-bold mb-4 text-foreground">What Momentum Is NOT</h2>
              <p className="font-semibold text-orange-800 dark:text-orange-200 mb-4">
                ⚠️ Momentum is not a replacement for professional medical advice, personal trainers, or healthcare providers.
              </p>
              <ul className="space-y-2 text-muted-foreground mb-4">
                <li className="flex items-start gap-2"><span className="text-orange-500 mt-1">•</span><span>It won't diagnose health conditions or create workout programs</span></li>
                <li className="flex items-start gap-2"><span className="text-orange-500 mt-1">•</span><span>It won't give medical guidance or replace your doctor</span></li>
              </ul>
              <p className="text-foreground font-semibold">
                What it WILL do: Keep you organized and consistent with the <a href="/blog/how-to-build-fitness-habits-after-40" className="text-primary hover:underline" onClick={(e) => { e.preventDefault(); navigate("/blog/how-to-build-fitness-habits-after-40"); }}>fitness habits</a> YOU choose.
              </p>
            </section>

            {/* Philosophy */}
            <section>
              <h2 className="text-3xl font-display font-bold mb-4 text-foreground">Consistency Over Perfection</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Most fitness apps punish you for missing days. Momentum was built on the opposite philosophy: <strong className="text-foreground">showing up imperfectly is better than not showing up at all.</strong>
                </p>
                <p>
                  That's why we built <a href="/blog/streak-repair-missing-workout-days" className="text-primary hover:underline font-semibold" onClick={(e) => { e.preventDefault(); navigate("/blog/streak-repair-missing-workout-days"); }}>Streak Repair</a> - a feature that lets you acknowledge missed days without losing your progress. Because real life has sick days, travel, and low-energy weeks. A good system expects that.
                </p>
                <p>
                  Read more about <a href="/blog/fitness-consistency-over-50" className="text-primary hover:underline" onClick={(e) => { e.preventDefault(); navigate("/blog/fitness-consistency-over-50"); }}>why consistency beats intensity after 50</a>.
                </p>
              </div>
            </section>

            {/* Commitment */}
            <section className="bg-card rounded-xl p-6 md:p-8 shadow-md">
              <h2 className="text-3xl font-display font-bold mb-4 text-foreground">My Commitment to You</h2>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-primary text-xl mt-0.5">✓</span>
                  <div><strong className="text-foreground">No gimmicks.</strong> Just a straightforward tool that does one thing well.</div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary text-xl mt-0.5">✓</span>
                  <div><strong className="text-foreground">Your data is yours.</strong> I don't sell it. I don't share it.</div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary text-xl mt-0.5">✓</span>
                  <div><strong className="text-foreground">Sustainable pricing.</strong> <a href="/pricing" className="text-primary hover:underline" onClick={(e) => { e.preventDefault(); navigate("/pricing"); }}>Free tier for basic use. Premium for those who want more.</a></div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary text-xl mt-0.5">✓</span>
                  <div><strong className="text-foreground">Continuous improvement.</strong> I use this daily, so I'm always making it better.</div>
                </li>
              </ul>
            </section>

            {/* Who Am I */}
            <section>
              <h2 className="text-3xl font-display font-bold mb-4 text-foreground">Who Built This?</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                I'm <a href="https://www.chadtdyar.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">Chad T Dyar</a> - a 50-year-old who builds apps to solve problems in my own life:
              </p>
              <div className="bg-muted/30 rounded-lg p-6 space-y-3 text-muted-foreground">
                <p><strong className="text-foreground">Momentum</strong> - Because my fitness couldn't wait any longer</p>
                <p><strong className="text-foreground">HomeGrown</strong> - Because I garden and waste too much produce</p>
                <p><strong className="text-foreground">Out Tonight</strong> - Because I want to support local businesses and events</p>
                <p><strong className="text-foreground">PillPal</strong> - Because managing my heart medications was chaotic</p>
                <p><strong className="text-foreground">Pawformance</strong> - Because my dog's health matters as much as mine</p>
              </div>
              <p className="text-muted-foreground leading-relaxed mt-4 italic">
                I'm not a developer by trade. I'm just someone who saw problems and built solutions.
              </p>
            </section>

            {/* CTA */}
            <section className="rounded-xl p-8 text-center text-white shadow-xl" style={{ background: 'var(--gradient-primary)' }}>
              <h2 className="text-3xl font-display font-bold mb-4">Ready to Build Your Own Momentum?</h2>
              <p className="text-lg mb-4 text-white/90">
                Track up to 3 goals for free. Upgrade to Premium if you need more.
              </p>
              <p className="text-white/90 mb-6">
                No credit card required. No pressure. Just a tool that might help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => navigate("/auth")}
                  size="lg"
                  variant="secondary"
                  className="shadow-xl hover:shadow-2xl bg-white text-primary hover:bg-white hover:scale-105 transition-all text-lg h-14 px-10 font-semibold"
                >
                  Start Your Journey
                </Button>
                <Button
                  onClick={() => navigate("/blog")}
                  size="lg"
                  variant="outline"
                  className="border-2 border-white/50 text-white hover:bg-white/10 text-lg h-14 px-10"
                >
                  Read the Blog <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </section>

            {/* Contact */}
            <section className="text-center">
              <h2 className="text-3xl font-display font-bold mb-4 text-foreground">Questions or Feedback?</h2>
              <p className="text-muted-foreground mb-4">
                I read every message. I respond to every question.
              </p>
              <a 
                href="mailto:support@momentumfit.app"
                className="inline-flex items-center gap-2 text-primary hover:underline font-semibold text-lg"
              >
                <Mail className="h-5 w-5" />
                support@momentumfit.app
              </a>
            </section>

            {/* Disclaimer */}
            <section className="bg-muted/50 rounded-lg p-6 text-sm text-muted-foreground">
              <h3 className="font-semibold text-foreground mb-2">Medical Disclaimer</h3>
              <p className="leading-relaxed">
                Momentum is a habit tracking tool, not medical advice. Always consult your physician or qualified healthcare provider 
                before beginning any fitness program. Never disregard professional medical advice or delay seeking it because of 
                something in this app. If you think you have a medical emergency, call your doctor or 911 immediately.
              </p>
            </section>

            {/* Footer */}
            <section className="text-center pt-8 border-t border-border">
              <p className="text-muted-foreground font-medium mb-2">
                Thanks for being here. Let's build lasting habits together.
              </p>
              <p className="text-muted-foreground italic">
                - <a href="https://www.chadtdyar.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Chad T Dyar</a>, Creator of Momentum
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                Last updated: 2025
              </p>
            </section>

          </div>
        </div>
      </div>
    </>
  );
}
