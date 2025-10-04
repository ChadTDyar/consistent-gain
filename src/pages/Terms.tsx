import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";

export default function Terms() {
  const navigate = useNavigate();

  return (
    <>
      <SEO 
        title="Terms of Service - Momentum | Fitness Habit Tracker"
        description="Read Momentum's Terms of Service. Clear, fair terms for our fitness habit tracking app. Free and Premium subscription details included."
        keywords="momentum terms of service, fitness app terms, user agreement, subscription terms, fitness tracker legal"
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

        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 text-foreground">
          Terms of Service
        </h1>
        <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="prose prose-lg max-w-none space-y-6 text-foreground">
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4">Agreement to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using Momentum, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold mb-4">Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              Momentum is a fitness habit tracking application designed to help users build sustainable fitness routines through goal setting, activity logging, and streak tracking. Premium features include unlimited goals and AI coaching.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold mb-4">Account Registration</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>You must be at least 18 years old to create an account</li>
              <li>You must provide accurate and complete information</li>
              <li>You are responsible for maintaining the security of your account</li>
              <li>You are responsible for all activities under your account</li>
              <li>You must notify us immediately of any unauthorized access</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold mb-4">Subscription Plans</h2>
            
            <h3 className="text-xl font-semibold mb-2">Free Plan</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>Up to 3 active goals</li>
              <li>Basic streak tracking</li>
              <li>Activity logging</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2">Premium Plan ($9.99/month or $90/year)</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>Unlimited goals</li>
              <li>AI Coach access</li>
              <li>Priority support</li>
              <li>Advanced analytics (coming soon)</li>
            </ul>

            <p className="text-muted-foreground leading-relaxed">
              Subscriptions automatically renew unless cancelled before the renewal date. Prices are subject to change with 30 days notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold mb-4">Payment and Refunds</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Payments are processed securely through Stripe</li>
              <li>All fees are non-refundable except as required by law</li>
              <li>You can cancel your subscription at any time</li>
              <li>Upon cancellation, you retain access until the end of your billing period</li>
              <li>Refund requests will be considered on a case-by-case basis within 7 days of purchase</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold mb-4">User Content and Conduct</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Use the service for any illegal purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Upload malicious code or content</li>
              <li>Harass or abuse other users or support staff</li>
              <li>Reverse engineer or copy any part of the service</li>
              <li>Use automated systems to access the service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold mb-4">Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              All content, features, and functionality of Momentum are owned by us and protected by copyright, trademark, and other intellectual property laws. You retain ownership of the data you create (goals, logs, etc.).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold mb-4">Disclaimer of Warranties</h2>
            <p className="text-muted-foreground leading-relaxed">
              Momentum is provided "as is" without warranties of any kind. We do not guarantee that the service will be uninterrupted, secure, or error-free. This app is not a substitute for professional medical, fitness, or health advice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold mb-4">Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              We shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service. Our total liability shall not exceed the amount you paid us in the past 12 months.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold mb-4">Health and Safety Disclaimer</h2>
            <p className="text-muted-foreground leading-relaxed">
              Momentum is a habit tracking tool, not medical advice. Consult with a healthcare professional before starting any fitness program. We are not responsible for any injuries or health issues that may occur from activities you track.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold mb-4">Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to suspend or terminate your account at any time for violations of these terms. You may delete your account at any time from the Settings page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold mb-4">Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms. Material changes will be notified via email.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold mb-4">Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold mb-4">Contact Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions about these Terms of Service, contact us at:{" "}
              <a href="mailto:support@momentumfit.app" className="text-primary hover:underline">
                support@momentumfit.app
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
    </>
  );
}