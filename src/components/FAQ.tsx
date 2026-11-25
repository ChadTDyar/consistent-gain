import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useEffect } from "react";
import { getGoalLimit, getHistoryDays } from "@/lib/plans";

const FREE_GOAL_LIMIT = getGoalLimit("free");
const FREE_HISTORY_DAYS = getHistoryDays("free");

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "Is Momentum really free to use?",
    answer: `Yes. The Free plan has no time limit and needs no credit card. You get up to ${FREE_GOAL_LIMIT} habits, the daily readiness check-in with today's plan, streaks with the 48-hour repair window, and ${FREE_HISTORY_DAYS} days of history.`
  },
  {
    question: "Who is Momentum for?",
    answer: "Adults 40 and over who want to keep exercising through busy weeks, short sleep and slower recovery. It suits people restarting a routine and people who prefer steady progress to hard programs."
  },
  {
    question: "What does the daily check-in ask?",
    answer: "Six things, each on a 1 to 5 scale: sleep quality, energy, recovery from your last session, soreness, pain or discomfort, and whether you want to train today. It takes under a minute."
  },
  {
    question: "How does the check-in change my plan?",
    answer: "Your six answers are averaged into one of four plans: full workout, reduced workout, mobility and recovery, or rest day. If you report notable pain, the app will not recommend a full workout. It is a simple, fixed rule set. It is not a diagnosis."
  },
  {
    question: "Does Momentum write my workouts?",
    answer: "No. Momentum tells you how hard today should be and tracks whether you showed up. You choose the session. The app includes an exercise library for ideas."
  },
  {
    question: "What if I miss a day? Will I lose my streak?",
    answer: "Not right away. If you miss a single day, Momentum offers a repair the next day: a 5, 10 or 20 minute makeup session, or a grace token. You earn one token for every 7 days you log. The window closes 48 hours after the missed day begins. If you miss two days in a row, the streak restarts and you pick up from there."
  },
  {
    question: "What kind of habits can I track?",
    answer: "Momentum is built for fitness habits: walking, strength work, stretching, mobility, swimming, a class, or anything else you do to stay active. You name the habit and set how many days a week you are aiming for."
  },
  {
    question: "What does the AI Coach do?",
    answer: "The AI Coach is a chat inside the app, included with Premium. It is given your current streak, how many habits you track, when you last logged and, right after you check in, today's plan. It keeps answers short, supports a lighter day when that is your plan, and sends pain or medical questions to your doctor. It is an AI, not a trainer or a clinician."
  },
  {
    question: "What do I get with Premium?",
    answer: `Premium is $7.99 a month or $69.99 a year. It removes the ${FREE_GOAL_LIMIT}-habit limit and the ${FREE_HISTORY_DAYS}-day history limit, and adds the AI Coach chat, the Weekly Insights report, and JSON export of your data.`
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Yes. Cancel anytime from your account settings. You keep access until the end of your billing period, and you can come back later."
  },
  {
    question: "Will Momentum work on my phone and computer?",
    answer: "Yes. Momentum runs in the browser on phones, tablets and computers. Sign in on any device to see the same habits and history."
  },
  {
    question: "Is my data private?",
    answer: "Your data is tied to your account and we do not sell it. You can delete your account from Settings at any time, and Premium members can export their data. The Privacy Policy has the details."
  },
  {
    question: "Do I need any special equipment?",
    answer: "No. A walk around the block counts as much as a gym session."
  },
  {
    question: "Is this medical advice?",
    answer: "No. Momentum is a general fitness and habit tool. It does not diagnose or treat anything. Talk to your doctor before you start or change an exercise routine, and stop if something hurts."
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
    <section className="py-16 md:py-24 bg-background-cream">
      <div className="container mx-auto px-6 md:px-8 max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 text-foreground">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Straight answers about what Momentum does and does not do
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
            Email support
          </a>
        </div>
      </div>
    </section>
  );
};
