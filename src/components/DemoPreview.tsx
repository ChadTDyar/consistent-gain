import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Flame, Plus, TrendingUp, Moon, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MOCK_GOALS = [
  { title: "Morning Walk", category: "Walking", streak: 12, target: 5, logged: 4, emoji: "🚶" },
  { title: "Strength Training", category: "Strength", streak: 7, target: 3, logged: 2, emoji: "💪" },
  { title: "Evening Stretch", category: "Flexibility", streak: 21, target: 7, logged: 6, emoji: "🧘" },
];

export const DemoPreview = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"goals" | "progress">("goals");

  return (
    <section className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-6 md:px-8 max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            See It in Action
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            This is what your dashboard looks like - no account needed to explore
          </p>
        </div>

        {/* Mock dashboard */}
        <Card className="border-2 border-primary/20 shadow-2xl overflow-hidden">
          {/* Mock header */}
          <div className="border-b border-border bg-card px-4 md:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-gradient text-lg">Momentum</span>
              <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground font-medium">Free</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-sm">
                <Moon className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">4/5</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">3/5</span>
              </div>
            </div>
          </div>

          <CardContent className="p-4 md:p-6 space-y-5">
            {/* Welcome banner */}
            <div>
              <h3 className="text-xl md:text-2xl font-display font-bold text-foreground">
                Welcome back, Chad!
              </h3>
              <p className="text-sm text-muted-foreground">You have 3 active goals</p>
            </div>

            {/* Tab toggle */}
            <div className="flex gap-1 bg-muted rounded-lg p-1 max-w-xs">
              <button
                onClick={() => setActiveTab("goals")}
                className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeTab === "goals" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
                }`}
              >
                Goals
              </button>
              <button
                onClick={() => setActiveTab("progress")}
                className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-1 ${
                  activeTab === "progress" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
                }`}
              >
                <TrendingUp className="h-3.5 w-3.5" /> Progress
              </button>
            </div>

            {activeTab === "goals" && (
              <div className="space-y-4">
                {/* Goal cards */}
                <div className="grid gap-3 md:grid-cols-3">
                  {MOCK_GOALS.map((goal) => (
                    <div
                      key={goal.title}
                      className="rounded-xl border border-border bg-card p-4 space-y-3 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-lg">{goal.emoji}</span>
                        <div className="flex items-center gap-1 text-sm font-semibold text-primary">
                          <Flame className="h-4 w-4" />
                          {goal.streak}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground text-sm">{goal.title}</h4>
                        <p className="text-xs text-muted-foreground">{goal.category}</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{goal.logged}/{goal.target} this week</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${(goal.logged / goal.target) * 100}%` }}
                          />
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="w-full text-xs h-8">
                        <CheckCircle className="h-3.5 w-3.5 mr-1" /> Log today
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Mock add goal */}
                <div className="rounded-xl border-2 border-dashed border-primary/20 p-4 flex items-center justify-center text-muted-foreground hover:border-primary/40 transition-colors">
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">Add New Goal</span>
                </div>
              </div>
            )}

            {activeTab === "progress" && (
              <div className="space-y-4">
                {/* Mock chart */}
                <div className="rounded-xl border border-border bg-card p-4">
                  <h4 className="text-sm font-semibold text-foreground mb-3">Weekly Consistency</h4>
                  <div className="flex items-end gap-2 h-32">
                    {[60, 80, 40, 100, 80, 60, 90].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full rounded-t-md bg-primary/80 transition-all"
                          style={{ height: `${h}%` }}
                        />
                        <span className="text-[10px] text-muted-foreground">
                          {["M", "T", "W", "T", "F", "S", "S"][i]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Current Streak", value: "12 days", icon: Flame },
                    { label: "Best Streak", value: "21 days", icon: TrendingUp },
                    { label: "This Week", value: "85%", icon: CheckCircle },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-xl border border-border bg-card p-3 text-center space-y-1">
                      <stat.icon className="h-4 w-4 text-primary mx-auto" />
                      <div className="text-lg font-bold text-foreground">{stat.value}</div>
                      <div className="text-[10px] text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>

          {/* Frosted overlay CTA */}
          <div className="relative">
            <div className="absolute inset-x-0 -top-16 h-16 bg-gradient-to-t from-card to-transparent pointer-events-none" />
            <div className="border-t border-border bg-card/80 backdrop-blur-sm px-4 md:px-6 py-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground font-medium">
                Ready to start your own journey?
              </p>
              <Button onClick={() => navigate("/auth")} className="btn-gradient shadow-lg">
                Create Free Account
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};
