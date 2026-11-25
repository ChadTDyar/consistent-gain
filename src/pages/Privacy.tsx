import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <>
      <SEO 
        title="Privacy Policy - Momentum"
        canonical="https://momentumfit.app/privacy"
        description="What Momentum collects, including readiness check-ins, pain and soreness ratings and workout logs, where it is stored, who it is shared with, and how to delete your account."
        keywords="momentum privacy policy, fitness app privacy, readiness check-in data, delete account"
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
          Privacy Policy
        </h1>
        <p className="text-muted-foreground mb-8">Last updated: November 25, 2026</p>

        <div className="prose prose-lg max-w-none space-y-6 text-foreground">
          <section>
            <h2 className="text-2xl font-display font-semibold mb-4">Overview</h2>
            <p className="text-muted-foreground leading-relaxed">
              Momentum ("we," "our," or "us") is a fitness habit app run by Autonomous Revenue Labs. This policy explains what Momentum collects, where it is stored, who it is shared with, and how to delete it. In short: your check-ins and workout logs are stored in our database so the app can work, we do not sell your data, and you can delete your account and the data saved to it from Settings at any time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold mb-4">Information We Collect</h2>
            <h3 className="text-xl font-semibold mb-2 mt-4">Account information</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Email address and password, or your Google or Apple account if you sign in that way</li>
              <li>Name, if you choose to add one</li>
              <li>Reminder and notification settings</li>
            </ul>
            <h3 className="text-xl font-semibold mb-2 mt-4">Daily readiness check-ins</h3>
            <p className="text-muted-foreground leading-relaxed">
              Each check-in records six 1 to 5 ratings: sleep quality, energy, recovery from your last session, soreness, pain or discomfort, and whether you want to train. We also store the readiness score and the plan for the day (full, reduced, mobility or rest) worked out from those ratings.
            </p>
            <h3 className="text-xl font-semibold mb-2 mt-4">Pain and soreness</h3>
            <p className="text-muted-foreground leading-relaxed">
              If you use the detailed pain log, we store the body area you choose, an intensity from 1 to 10, and any note you add. We treat your pain and soreness ratings and pain log entries as sensitive. We use them only to show you your plan, history and Weekly Insights report. We do not sell them, we do not use them for advertising, and we do not send them to our analytics providers.
            </p>
            <h3 className="text-xl font-semibold mb-2 mt-4">Workout logs and habits</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>The habits you set up and their weekly targets</li>
              <li>Workout and activity logs, including the session type, effort or wellness ratings and any notes you add</li>
              <li>Streaks and streak repairs</li>
              <li>Costs you choose to track, such as a gym membership</li>
              <li>Workout buddies you add by email, so you can see each other's progress</li>
            </ul>
            <h3 className="text-xl font-semibold mb-2 mt-4">AI Coach (Premium)</h3>
            <p className="text-muted-foreground leading-relaxed">
              Messages you send to the AI Coach and its replies are saved to your account so the conversation history is kept. Do not put anything in a Coach message that you would not want stored.
            </p>
            <h3 className="text-xl font-semibold mb-2 mt-4">Payments</h3>
            <p className="text-muted-foreground leading-relaxed">
              Web subscriptions are paid through Stripe. In the iOS app, purchases go through Apple and RevenueCat. We never see or store your full card number.
            </p>
            <h3 className="text-xl font-semibold mb-2 mt-4">Usage and device data</h3>
            <p className="text-muted-foreground leading-relaxed">
              We collect page views, feature usage, device and browser type, and error reports to run and improve the app. On the web, PostHog analytics only loads after you accept the cookie banner. When you are signed in, PostHog receives your email address and account ID with usage events. Usage events record what you did in the app, not the ratings or notes you entered.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold mb-4">How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>To run Momentum: save your habits, check-ins and logs, and show your daily plan, streaks and progress</li>
              <li>To produce the AI Coach replies and the Weekly Insights report for Premium members</li>
              <li>To process subscriptions and manage your account</li>
              <li>To send account emails, such as a welcome email and a note if you have not finished setting up</li>
              <li>To send reminders and notifications if you turn them on</li>
              <li>To fix errors and understand how the app is used</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold mb-4">AI Features</h2>
            <p className="text-muted-foreground leading-relaxed">
              The AI Coach and the AI part of the Weekly Insights report are produced by AI models from Google (Gemini), reached through the Lovable AI gateway. For the Coach, we send your messages plus your current streak, number of habits, when you last logged, and today's plan. For the Weekly Insights report, we send a summary of your last 30 days, including workout counts, average ratings and the body areas you logged pain in. These features are only used for Premium members. Momentum does not use your data to train AI models.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold mb-4">Who We Share Data With</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We do not sell your personal information. We share data only with the service providers we use to run Momentum:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Supabase:</strong> sign-in, user accounts, and the database where your check-ins, pain logs, workout logs and Coach messages are stored</li>
              <li><strong>Lovable:</strong> app hosting and the AI gateway for the AI Coach and Weekly Insights</li>
              <li><strong>Google:</strong> the AI models behind the AI Coach and Weekly Insights; Google Analytics for website usage; and sign-in, if you choose Google</li>
              <li><strong>Apple:</strong> sign-in, if you choose Apple, and iOS purchases</li>
              <li><strong>Stripe:</strong> web payment processing</li>
              <li><strong>RevenueCat:</strong> iOS subscription status</li>
              <li><strong>Resend:</strong> sends account emails</li>
              <li><strong>PostHog:</strong> product analytics (after you accept cookies on the web)</li>
              <li><strong>Sentry:</strong> error reports, so we can fix crashes</li>
              <li><strong>Legal requirements:</strong> when required by law or to protect our rights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold mb-4">Cookies and Browser Storage</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use browser storage to keep you signed in and remember your settings, including your cookie choice. Google Analytics and PostHog set analytics cookies on the web. We do not use advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold mb-4">Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              Data moving between your device and our servers is encrypted in transit (HTTPS). Your records are stored in our Supabase database with access rules that limit each account to its own data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold mb-4">Your Choices</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>See and change your habits, check-ins and logs in the app</li>
              <li>Export your data as a JSON file from Settings (Premium), or from the account deletion screen before you delete</li>
              <li>Delete your account and the data saved to it from Settings</li>
              <li>Turn reminders and notifications off in Settings</li>
              <li>Email us to correct anything you cannot change yourself</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold mb-4">Data Retention and Deleting Your Account</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We keep your data for as long as your account is open. When you delete your account from Settings, we first cancel any active Momentum web subscription in Stripe. If that cancellation fails, the account is not deleted and you are asked to try again or contact support. Cancelling this way does not refund any remaining time on your current billing period. iOS subscriptions are managed by Apple; cancel those in your Apple ID settings.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We then delete your profile, habits, check-ins, pain logs, workout logs, streak repairs, cost tracking, workout buddy links, AI Coach messages and your sign-in account from our database. Records held by our service providers, such as payment records at Stripe and Apple and analytics events at PostHog and Google Analytics, are not removed by deleting your account and are kept under their own policies. Email us if you want those removed too.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold mb-4">Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Momentum is not intended for anyone under 18. We do not knowingly collect personal information from children.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold mb-4">Health Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              Momentum is a general fitness and habit tool. It does not give medical advice, and it does not diagnose or treat any condition. Momentum is not a healthcare provider, and the information you enter is not a medical record.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold mb-4">Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this policy from time to time. We will post the new version on this page and change the "Last updated" date. For significant changes we will also let you know by email or in the app.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-semibold mb-4">Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              Questions about this policy or your data? Email{" "}
              <a href="mailto:support@momentumfit.app" className="text-primary hover:underline">
                support@momentumfit.app
              </a>
              . By mail: Autonomous Revenue Labs, PO Box 12185, Charleston, SC 29422.
            </p>
          </section>
        </div>
      </div>
    </div>
      <SiteFooter />
    </>
  );
}