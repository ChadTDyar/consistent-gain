import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Layers, PenTool } from "lucide-react";

const integrations = [
  {
    name: "Notion",
    description: "Sync goals and insights to your Notion workspace",
    icon: BookOpen,
    status: "coming-soon" as const,
  },
  {
    name: "Linear",
    description: "Track fitness goals alongside your project workflow",
    icon: Layers,
    status: "coming-soon" as const,
  },
  {
    name: "Obsidian",
    description: "Export weekly reports as Markdown to your vault",
    icon: PenTool,
    status: "coming-soon" as const,
  },
];

export function IntegrationHooks() {
  return (
    <Card className="border-none shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl font-display font-semibold">Integrations</CardTitle>
        <CardDescription className="text-base">Connect Momentum to your favorite tools</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {integrations.map((int) => {
            const Icon = int.icon;
            return (
              <div
                key={int.name}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{int.name}</p>
                    <p className="text-sm text-muted-foreground">{int.description}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs shrink-0">
                  Coming Soon
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
