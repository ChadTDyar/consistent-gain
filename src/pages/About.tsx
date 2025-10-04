import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import momentumLogo from "@/assets/momentum-logo.png";
import { SEO } from "@/components/SEO";

export default function About() {
  const navigate = useNavigate();

  return (
    <>
      <SEO 
        title="About Momentum - Our Story | Fitness Habit Tracker for Adults 40+"
        description="Learn why Momentum was created by a 50-year-old who needed sustainable fitness habits. No gimmicks, no judgment - just a tool that helps you build lasting habits."
        keywords="about momentum app, fitness app story, habit tracking for adults, fitness motivation over 40, sustainable fitness habits"
      />
      <div className="min-h-screen bg-background-cream">
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
              About Momentum
            </h1>
            <p className="text-muted-foreground mt-1">Building habits that last</p>
          </div>
        </div>

        <div className="prose prose-lg max-w-none space-y-8 text-foreground">
          
          {/* Why I Built This */}
          <section className="bg-card rounded-xl p-6 md:p-8 shadow-md">
            <h2 className="text-3xl font-display font-bold mb-4 text-foreground">Why I Built This</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Hi, I'm approaching 50, and like many people my age, I realized I couldn't keep putting off my health.
              </p>
              <p>
                For years, I'd start fitness routines with great intentions—gym memberships, personal trainers, 
                complicated programs—only to lose momentum after a few weeks. The guilt of missed days would compound, 
                and I'd give up entirely.
              </p>
              <p>
                I needed something different. Not a drill sergeant. Not another app telling me I "crushed it" or "failed." 
                Just a simple way to build sustainable habits without judgment.
              </p>
              <p className="font-semibold text-foreground">
                <Heart className="inline h-5 w-5 text-primary mr-1" />
                Momentum was built for me. And it turns out, I'm not alone.
              </p>
            </div>
          </section>

          {/* What Momentum Is */}
          <section>
            <h2 className="text-3xl font-display font-bold mb-4 text-foreground">What Momentum Is</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Momentum is a habit tracker designed specifically for adults who want to build lasting fitness routines—not chase quick transformations.
            </p>
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-6 space-y-3">
              <p className="font-semibold text-foreground text-lg">It helps you:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Track daily fitness goals (walking, stretching, gym sessions, etc.)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Build consistency through streaks</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>See your progress without overwhelming data</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Stay motivated without guilt</span>
                </li>
              </ul>
              <p className="font-semibold text-foreground pt-2 italic">
                It's simple because life is complicated enough.
              </p>
            </div>
          </section>

          {/* What Momentum Is NOT */}
          <section className="bg-orange-50 dark:bg-orange-950/20 border-l-4 border-orange-500 rounded-lg p-6">
            <h2 className="text-3xl font-display font-bold mb-4 text-foreground">What Momentum Is NOT</h2>
            <p className="font-semibold text-orange-800 dark:text-orange-200 mb-4">
              ⚠️ Momentum is not a replacement for professional medical advice, personal trainers, or healthcare providers.
            </p>
            <ul className="space-y-2 text-muted-foreground mb-4">
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">•</span>
                <span>It won't diagnose health conditions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">•</span>
                <span>It won't create workout programs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">•</span>
                <span>It won't give medical guidance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">•</span>
                <span>It won't replace your doctor</span>
              </li>
            </ul>
            <p className="text-foreground font-semibold">
              What it WILL do: Keep you organized and consistent with the fitness habits YOU choose.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              If you have health concerns, always consult your doctor before starting any exercise program. 
              Momentum is a tool for tracking—not prescribing.
            </p>
          </section>

          {/* Why I'm Sharing This */}
          <section>
            <h2 className="text-3xl font-display font-bold mb-4 text-foreground">Why I'm Sharing This</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                After using Momentum myself for months, I found it genuinely helpful. The streak counter kept me accountable. 
                The lack of judgment made it sustainable. The simple interface meant I actually used it.
              </p>
              <p>
                I built this for me, but I'm sharing it because I think others might benefit too.
              </p>
              <p className="font-semibold text-foreground text-lg">
                If you're approaching 50 (or beyond) and want to build fitness habits that stick—this is for you.
              </p>
            </div>
          </section>

          {/* My Commitment */}
          <section className="bg-card rounded-xl p-6 md:p-8 shadow-md">
            <h2 className="text-3xl font-display font-bold mb-4 text-foreground">My Commitment to You</h2>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="text-primary text-xl mt-0.5">✓</span>
                <div>
                  <strong className="text-foreground">No gimmicks.</strong> Just a straightforward tool that does one thing well.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary text-xl mt-0.5">✓</span>
                <div>
                  <strong className="text-foreground">Your data is yours.</strong> I don't sell it. I don't share it.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary text-xl mt-0.5">✓</span>
                <div>
                  <strong className="text-foreground">Sustainable pricing.</strong> Free tier for basic use. Premium for those who want more.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary text-xl mt-0.5">✓</span>
                <div>
                  <strong className="text-foreground">Continuous improvement.</strong> I use this daily, so I'm always making it better.
                </div>
              </li>
            </ul>
          </section>

          {/* Who Am I */}
          <section>
            <h2 className="text-3xl font-display font-bold mb-4 text-foreground">Who Am I?</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              I'm a 50-year-old who built five apps to solve problems in my own life:
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

          {/* Get Started */}
          <section className="bg-gradient-primary rounded-xl p-8 text-center text-white shadow-xl">
            <h2 className="text-3xl font-display font-bold mb-4">Get Started</h2>
            <p className="text-lg mb-4 text-white/90">
              Track up to 3 goals for free. Upgrade to Premium if you need more.
            </p>
            <p className="text-white/90 mb-6">
              No credit card required. No pressure. Just a tool that might help.
            </p>
            <Button
              onClick={() => navigate("/auth")}
              size="lg"
              variant="secondary"
              className="shadow-xl hover:shadow-2xl bg-white text-primary hover:bg-white hover:scale-105 transition-all text-lg h-14 px-10 font-semibold"
            >
              Start Your Journey
            </Button>
          </section>

          {/* Contact */}
          <section className="text-center">
            <h2 className="text-3xl font-display font-bold mb-4 text-foreground">Questions or Feedback?</h2>
            <p className="text-muted-foreground mb-4">
              I read every message. I respond to every question. This is a small operation, and I care about making it useful.
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
              — Creator of Momentum
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