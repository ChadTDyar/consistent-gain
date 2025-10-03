import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Privacy() {
  const navigate = useNavigate();

  return (
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

        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 text-foreground">
          Privacy Policy
        </h1>
        <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="prose prose-lg max-w-none space-y-6 text-foreground">
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4">Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Momentum ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our fitness habit tracking application.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold mb-4">Information We Collect</h2>
            <h3 className="text-xl font-semibold mb-2">Personal Information</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Email address (for account creation and communication)</li>
              <li>Name (optional, for personalization)</li>
              <li>Payment information (processed securely through Stripe)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-4">Usage Data</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Goals you create and track</li>
              <li>Activity logs and streak data</li>
              <li>Chat messages with our AI Coach (Premium users only)</li>
              <li>Device and browser information</li>
              <li>Usage statistics and analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold mb-4">How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Provide and maintain our service</li>
              <li>Process your subscription payments</li>
              <li>Send you reminders and notifications (if enabled)</li>
              <li>Improve our service through analytics</li>
              <li>Provide customer support</li>
              <li>Send important updates about our service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold mb-4">Data Storage and Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your data is stored securely using industry-standard encryption. We use Supabase for data storage and Stripe for payment processing. All data transmission is encrypted using SSL/TLS protocols.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold mb-4">Data Sharing</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We do not sell your personal information. We may share your data with:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Service Providers:</strong> Stripe (payment processing), Google AI (AI Coach feature)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold mb-4">Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Access your personal data</li>
              <li>Export your data (available in Settings)</li>
              <li>Delete your account and data (available in Settings)</li>
              <li>Opt-out of marketing communications</li>
              <li>Request corrections to your data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold mb-4">Cookies and Tracking</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use essential cookies to maintain your login session. We also use analytics cookies (Google Analytics) to understand how users interact with our service. You can disable non-essential cookies in your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold mb-4">Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our service is not intended for users under 18 years of age. We do not knowingly collect personal information from children.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold mb-4">Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold mb-4">Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about this Privacy Policy, please contact us at:{" "}
              <a href="mailto:support@momentum-app.com" className="text-primary hover:underline">
                support@momentum-app.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}