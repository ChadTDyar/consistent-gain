import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { DollarSign, Plus } from "lucide-react";

const CATEGORIES = [
  "Gym Membership",
  "Equipment",
  "Classes",
  "Personal Trainer",
  "Nutrition",
  "Supplements",
  "Apparel",
  "Other",
];

interface CostEntry {
  id: string;
  date: string;
  category: string;
  amount: number;
  description: string | null;
}

export function CostTracker() {
  const [costs, setCosts] = useState<CostEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCosts();
  }, []);

  const loadCosts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("cost_tracking")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Error loading costs:", error);
    } else {
      setCosts(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!category || !amount) {
      toast.error("Please fill in all required fields");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("cost_tracking").insert({
      user_id: user.id,
      category,
      amount: parseFloat(amount),
      description: description || null,
    });

    if (error) {
      toast.error("Failed to add expense");
    } else {
      toast.success("Expense added");
      setShowForm(false);
      setCategory("");
      setAmount("");
      setDescription("");
      loadCosts();
    }
  };

  const totalThisMonth = costs
    .filter(c => {
      const date = new Date(c.date);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    })
    .reduce((sum, c) => sum + Number(c.amount), 0);

  if (loading) return null;

  return (
    <Card className="border-none shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-display font-semibold flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-primary" />
              Fitness Budget
            </CardTitle>
            <CardDescription className="text-base">
              Track your fitness expenses
            </CardDescription>
          </div>
          <Button
            size="icon"
            onClick={() => setShowForm(!showForm)}
            className="min-w-[44px] min-h-[44px]"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
          <p className="text-sm text-muted-foreground">This Month</p>
          <p className="text-3xl font-bold text-foreground">${totalThisMonth.toFixed(2)}</p>
        </div>

        {showForm && (
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg animate-fade-in">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Monthly gym fee"
              />
            </div>

            <Button onClick={handleSubmit} className="w-full">
              Add Expense
            </Button>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-sm font-semibold">Recent Expenses</p>
          {costs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No expenses tracked yet
            </p>
          ) : (
            costs.map((cost) => (
              <div
                key={cost.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div>
                  <p className="font-medium">{cost.category}</p>
                  {cost.description && (
                    <p className="text-sm text-muted-foreground">{cost.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {new Date(cost.date).toLocaleDateString()}
                  </p>
                </div>
                <p className="font-bold">${Number(cost.amount).toFixed(2)}</p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
