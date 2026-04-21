import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowLeft, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";

const faqs = [
  {
    q: "How do I reset my password?",
    a: "Tap 'Forgot password' on the sign in screen. Enter your email. Check your inbox for a reset link.",
  },
  {
    q: "How do I delete my account?",
    a: "Go to Settings → Account → Delete Account. This permanently removes all your data.",
  },
  {
    q: "How do I cancel my subscription?",
    a: "Subscriptions purchased on the web are managed at momentumfit.app/account. Subscriptions purchased in the iOS app are managed in your Apple ID settings.",
  },
  {
    q: "I found a bug. What do I do?",
    a: "Email support@momentumfit.app with a description and a screenshot if possible. We fix issues fast.",
  },
  {
    q: "Is my data private?",
    a: "Yes. See our Privacy Policy for details.",
  },
];

export default function Support() {
  const navigate = useNavigate();

  return (
    <>
      <SEO
        title="Support — MomentumFit"
        description="Get help with MomentumFit. Contact support, reset your password, manage your subscription, and find answers to common questions."
        keywords="momentum support, momentumfit help, fitness app support, account help"
      />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 md:px-8 py-8 md:py-12 max-w-3xl">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-8 hover:bg-muted"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Momentum
          </Button>

          <header className="mb-10">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-3 text-foreground">
              Momentum Support
            </h1>
            <p className="text-lg text-muted-foreground">
              We're here to help.
            </p>
          </header>

          <Card className="mb-10 border-border">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-primary/10 p-3 shrink-0">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-2 text-foreground">
                    Email us at{" "}
                    <a
                      href="mailto:support@momentumfit.app"
                      className="text-primary hover:underline"
                    >
                      support@momentumfit.app
                    </a>
                  </h2>
                  <p className="text-muted-foreground">
                    We respond within 24 hours on business days.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-display font-semibold mb-6 text-foreground">
              Frequently asked questions
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((item, idx) => (
                <AccordionItem key={idx} value={`item-${idx}`}>
                  <AccordionTrigger className="text-left text-base font-medium">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          <footer className="border-t border-border pt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Back to Momentum
            </Link>
          </footer>
        </div>
      </div>
    </>
  );
}
