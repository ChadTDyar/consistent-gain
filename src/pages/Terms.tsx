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
        description="Read Momentum's Terms of Service. Clear terms covering subscriptions, auto-renewal, account use, and the Apple App Store distribution agreement."
        keywords="momentum terms of service, fitness app terms, user agreement, subscription terms, auto-renewal, apple eula"
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
          <p className="text-muted-foreground mb-8">Last updated: 2026-05-09</p>

          <div className="prose prose-lg max-w-none space-y-6 text-foreground">
            <section>
              <h2 className="text-2xl font-display font-semibold mb-4">Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By creating an account, downloading, or using Momentum ("the Service"), you agree to these Terms of Service. If you do not agree, do not use the Service. These Terms form a binding agreement between you and Momentum.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-semibold mb-4">Account and Eligibility</h2>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>You must be at least 18 years old to create an account.</li>
                <li>You must provide accurate, current, and complete information during registration.</li>
                <li>You are responsible for safeguarding your password and for all activity under your account.</li>
                <li>You must notify us immediately of any unauthorized access at support@momentumfit.app.</li>
                <li>One person or legal entity per account. Sharing accounts is not permitted.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-display font-semibold mb-4">Subscriptions and Billing</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Momentum offers a free tier and a Premium subscription. Premium unlocks additional features such as unlimited habits, streak repair, unlimited history, data export, and AI Coach access.
              </p>

              <h3 className="text-xl font-semibold mb-2">Auto-Renewal</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Subscriptions renew automatically at the end of each billing period (monthly or annual) at the then-current price unless you cancel at least 24 hours before the end of the current period. Payment is charged to your Apple ID at confirmation of purchase for in-app purchases, or to your selected payment method on the web.
              </p>

              <h3 className="text-xl font-semibold mb-2">Managing and Cancelling</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You can manage your subscription and turn off auto-renewal in your Apple ID Account Settings on your device after purchase. Web subscriptions can be managed from the Account page inside Momentum. Cancelling stops future renewals. You retain access to paid features until the end of the current billing period.
              </p>

              <h3 className="text-xl font-semibold mb-2">Refunds</h3>
              <p className="text-muted-foreground leading-relaxed">
                Purchases made through the App Store are subject to Apple's refund policy and must be requested through Apple. Web purchases are non-refundable except where required by law. Good-faith refund requests for web purchases may be considered within 7 days of the original charge by writing to support@momentumfit.app.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-semibold mb-4">Apple App Store Distribution</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you obtained Momentum from the Apple App Store, your use is also governed by Apple's Licensed Application End User License Agreement (Apple's Standard EULA), available at https://www.apple.com/legal/internet-services/itunes/dev/stdeula/. To the extent these Terms conflict with Apple's Standard EULA on matters Apple's EULA covers, Apple's EULA controls for the App Store version of Momentum. You acknowledge that Apple is not a party to these Terms and is not responsible for the Service or its content. Apple has no obligation to provide maintenance or support for the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-semibold mb-4">Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed">
                Momentum and its content, design, logos, and software are owned by us and protected by copyright, trademark, and other laws. We grant you a limited, non-exclusive, non-transferable, revocable license to use the Service for personal, non-commercial purposes. You retain ownership of the data you create within the Service (habits, logs, notes, photos).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-semibold mb-4">User Conduct</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">You agree not to:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Use the Service for any unlawful purpose or in violation of these Terms.</li>
                <li>Attempt to gain unauthorized access to other accounts or our systems.</li>
                <li>Upload malicious code, abusive content, or content that infringes others' rights.</li>
                <li>Harass, threaten, or abuse other users or our support staff.</li>
                <li>Reverse engineer, decompile, or copy any part of the Service except as permitted by law.</li>
                <li>Use bots, scrapers, or other automated systems to access the Service.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-display font-semibold mb-4">Health Disclaimer</h2>
              <p className="text-muted-foreground leading-relaxed">
                Momentum is a fitness habit tracking tool. It is not medical advice, diagnosis, or treatment. The Service does not replace consultation with qualified healthcare professionals. Consult your physician before beginning any new exercise program, especially if you have existing health conditions, take medication, or are pregnant. You assume all risk for activities you choose to track. We are not responsible for injuries, health issues, or other adverse outcomes that may result from your use of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-semibold mb-4">Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                You may delete your account at any time from the Settings page or by contacting support. We may suspend or terminate your access for violations of these Terms, fraudulent activity, or extended inactivity. On termination, your license to use the Service ends, although certain provisions (intellectual property, liability, governing law) survive.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-semibold mb-4">Disclaimer of Warranties</h2>
              <p className="text-muted-foreground leading-relaxed">
                The Service is provided "as is" and "as available" without warranties of any kind, express or implied, including merchantability, fitness for a particular purpose, and non-infringement. We do not warrant that the Service will be uninterrupted, secure, error-free, or that defects will be corrected.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-semibold mb-4">Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                To the maximum extent permitted by law, Momentum and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits, data, or goodwill, arising from your use of the Service. Our total aggregate liability for any claim shall not exceed the greater of the amount you paid us in the 12 months preceding the claim, or USD 50.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-semibold mb-4">Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms are governed by the laws of the State of Delaware, United States, without regard to conflict of law principles. Any dispute shall be resolved in the state or federal courts located in Delaware, except where local consumer protection law grants you a non-waivable right to pursue claims elsewhere.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-semibold mb-4">Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update these Terms from time to time. Material changes will be communicated by email or in-app notice at least 14 days before they take effect. Continued use of the Service after changes take effect constitutes acceptance of the updated Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-semibold mb-4">Contact</h2>
              <p className="text-muted-foreground leading-relaxed">
                Questions about these Terms? Reach us at{" "}
                <a href="mailto:support@momentumfit.app" className="text-primary hover:underline">
                  support@momentumfit.app
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
