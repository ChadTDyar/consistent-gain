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
    answer: "Yes! Our free plan allows you to track up to 3 fitness goals with basic streak tracking and 7-day activity history. No credit card required to get started."
  },
  {
    question: "What makes Momentum different from other fitness apps?",
    answer: "Momentum is designed specifically for adults 40+ who want sustainable habits, not quick transformations. We focus on consistency over intensity, with no judgmental language or complicated metrics. It's about building momentum that lasts."
  },
  {
    question: "Do I need to be tech-savvy to use Momentum?",
    answer: "Not at all! Momentum is intentionally simple. Just set your goals and check them off daily. The interface is clean, intuitive, and designed for ease of use."
  },
  {
    question: "What kind of fitness goals can I track?",
    answer: "Any fitness activity you want! Walking, stretching, gym sessions, yoga, swimming, cycling - if you can do it daily or regularly, you can track it. You define what fitness means for you."
  },
  {
    question: "How does the AI Coach work in Premium?",
    answer: "The AI Coach provides personalized motivation, answers fitness questions, and helps you overcome obstacles. It's like having a supportive fitness buddy who understands your journey and adapts to your needs."
  },
  {
    question: "Can I cancel my Premium subscription anytime?",
    answer: "Absolutely. Cancel anytime from your account settings. You'll retain Premium access until the end of your billing period, and you can always reactivate later."
  },
  {
    question: "Will Momentum work on my phone and computer?",
    answer: "Yes! Momentum is a web app that works on any device with a browser - iPhone, Android, tablets, laptops, and desktops. Your data syncs automatically across all devices."
  },
  {
    question: "Is my fitness data private and secure?",
    answer: "Yes. We use industry-standard encryption to protect your data. We never sell your information to third parties. Your fitness journey is yours alone."
  },
  {
    question: "What if I miss a day? Will I lose my streak?",
    answer: "If you miss a day, your streak resets, but your history remains. Momentum is about building consistent habits, not perfection. Every day is a new opportunity to continue building momentum."
  },
  {
    question: "Do I need any special equipment or gym membership?",
    answer: "No! Momentum tracks habits, not specific workouts. Whether you walk around your neighborhood, do bodyweight exercises at home, or have a full gym membership, Momentum works for your lifestyle."
  }
];

export const FAQ = () => {
  useEffect(() => {
    // Add FAQ schema markup
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
              <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline py-6">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
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
