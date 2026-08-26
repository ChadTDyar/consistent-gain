import { Card, CardContent } from "@/components/ui/card";

const questions = [
  {
    question: "Is Momentum really built for people over 50?",
    answer:
      "Yes. The app accounts for the reality that bodies change — with body-map pain tracking, joint-safe exercise swaps, and an AI coach that adjusts suggestions based on your energy and sleep patterns. It's consistency over intensity.",
  },
  {
    question: "What happens if I miss a day?",
    answer:
      "You get a 48-hour streak repair window. One off day doesn't erase weeks of progress. Momentum is built around the idea that missing a day shouldn't end everything.",
  },
  {
    question: "How many habits should I track?",
    answer:
      "Start with 1 to 3. The app is deliberately constrained — three habits, five minutes a day. Research shows tracking fewer habits leads to higher adherence than tracking dozens.",
  },
  {
    question: "What does the AI Coach actually do?",
    answer:
      "It learns your check-in patterns, energy levels, and sleep data, then sends personalized nudges and suggestions. Not generic motivation — context-aware coaching that adapts to your week.",
  },
];

export const NotificationExplainer = () => {
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-6 md:px-8 max-w-3xl">
        <Card className="border-primary/10 shadow-lg">
          <CardContent className="p-8 md:p-10 space-y-10">
            {questions.map((item) => (
              <div key={item.question} className="space-y-3">
                <h2 className="text-2xl font-display font-bold text-foreground">
                  {item.question}
                </h2>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {item.answer}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
