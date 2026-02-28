import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useEffect } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "Is Momentum really free to use?",
    answer: "Yes! Our free plan allows you to track up to 3 habits with basic streak tracking and 7-day history. No credit card required to get started."
  },
  {
    question: "What makes Momentum different from other habit apps?",
    answer: "Momentum is designed for busy professionals who want sustainable habits, not quick fixes. We focus on consistency over perfection, with no judgmental language or complicated metrics. It's about building momentum that lasts."
  },
  {
    question: "Do I need to be tech-savvy to use Momentum?",
    answer: "Not at all! Momentum is intentionally simple. Just set your habits and check them off daily. The interface is clean, intuitive, and designed for ease of use."
  },
  {
    question: "What kind of habits can I track?",
    answer: "Any habit you want to build! Reading, meditation, walking, stretching, journaling, hydration — if you can do it daily or regularly, you can track it. You define what matters to you."
  },
  {
    question: "How does the AI Coach work on Pro?",
    answer: "The AI Coach provides personalized suggestions based on your check-in patterns, habit types, and consistency data. It's like having a supportive accountability partner who adapts to your schedule and real life."
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Absolutely. Cancel anytime from your account settings. You'll retain access until the end of your billing period, and you can always reactivate later."
  },
  {
    question: "Will Momentum work on my phone and computer?",
    answer: "Yes! Momentum is a web app that works on any device with a browser — iPhone, Android, tablets, laptops, and desktops. Your data syncs automatically across all devices."
  },
  {
    question: "Is my data private and secure?",
    answer: "Yes. We use industry-standard encryption to protect your data. We never sell your information to third parties. Your habits are yours alone."
  },
  {
    question: "What if I miss a day? Will I lose my streak?",
    answer: "Your streak doesn't reset on one bad day. Momentum uses a momentum score that rewards consistency over perfection. Plus, with Streak Repair (available on Starter and Pro plans), you can acknowledge missed days within 48 hours without losing your progress."
  },
  {
    question: "How does accountability actually work?",
    answer: "You set your preferred reminder time. Momentum sends a daily nudge. If you miss a day, you get a supportive 'get back on track' message — not a guilt trip. Your momentum score tracks your overall consistency, so a single missed day doesn't erase weeks of effort."
  },
  {
    question: "Do I need any special equipment?",
    answer: "No! Momentum tracks habits, not specific activities. Whether you read a book, meditate, go for a walk, or hit the gym, Momentum works for your lifestyle."
  }
];

export const FAQ = () => {
  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqData.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    };

    let schemaElement = document.querySelector('script[type="application/ld+json"][data-faq]');
    if (!schemaElement) {
      schemaElement = document.createElement('script');
      schemaElement.setAttribute('type', 'application/ld+json');
      schemaElement.setAttribute('data-faq', 'true');
      document.head.appendChild(schemaElement);
    }
    schemaElement.textContent = JSON.stringify(schema);

    return () => {
      const element = document.querySelector('script[type="application/ld+json"][data-faq]');
      if (element) {
        element.remove();
      }
    };
  }, []);

  return (
    <section className="py-20 md:py-32 bg-background-cream">
      <div className="container mx-auto px-6 md:px-8 max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 text-foreground">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about Momentum
          </p>
        </div>
        
        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqData.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="bg-card border border-border rounded-lg px-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline hover:text-primary py-6 transition-colors [&>svg]:transition-transform">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-6 pt-2">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">Still have questions?</p>
          <a 
            href="mailto:support@momentumfit.app" 
            className="text-primary hover:underline font-semibold"
          >
            Contact our support team
          </a>
        </div>
      </div>
    </section>
  );
};
