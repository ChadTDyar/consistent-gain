import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Dumbbell, Heart, Wind, Zap, StretchHorizontal } from "lucide-react";
import { SEO } from "@/components/SEO";

const CATEGORIES = [
  { id: "all", label: "All", icon: Dumbbell },
  { id: "strength", label: "Strength", icon: Dumbbell },
  { id: "cardio", label: "Cardio", icon: Heart },
  { id: "flexibility", label: "Flexibility", icon: StretchHorizontal },
  { id: "balance", label: "Balance", icon: Wind },
  { id: "warmup", label: "Warm-up", icon: Zap },
];

const EXERCISES = [
  { name: "Wall Sits", category: "strength", jointSafe: true, description: "Lean against wall, lower to seated position. Hold 20-60 seconds." },
  { name: "Step-Ups", category: "strength", jointSafe: true, description: "Step onto a sturdy platform, alternate legs. 10-15 reps each." },
  { name: "Seated Leg Press", category: "strength", jointSafe: true, description: "Use machine or resistance band. 12-15 reps." },
  { name: "Resistance Band Rows", category: "strength", jointSafe: true, description: "Anchor band at mid-height, pull back. 12-15 reps." },
  { name: "Chair Squats", category: "strength", jointSafe: true, description: "Sit and stand from chair. 10-15 reps." },
  { name: "Bicep Curls", category: "strength", jointSafe: true, description: "Light dumbbells. 12-15 reps each arm." },
  { name: "Modified Push-Ups", category: "strength", jointSafe: true, description: "Wall or knee push-ups. 8-12 reps." },
  { name: "Calf Raises", category: "strength", jointSafe: true, description: "Stand on edge, raise and lower. 15-20 reps." },
  { name: "Seated Overhead Press", category: "strength", jointSafe: true, description: "Light weights, press overhead. 10-12 reps." },
  { name: "Glute Bridges", category: "strength", jointSafe: true, description: "Lie on back, lift hips. 12-15 reps." },
  { name: "Walking", category: "cardio", jointSafe: true, description: "Brisk walking, 20-30 minutes at comfortable pace." },
  { name: "Swimming", category: "cardio", jointSafe: true, description: "Low-impact full body cardio. 20-30 minutes." },
  { name: "Cycling (Stationary)", category: "cardio", jointSafe: true, description: "Low resistance, steady pace. 20-30 minutes." },
  { name: "Elliptical", category: "cardio", jointSafe: true, description: "Smooth motion, adjustable resistance. 20-30 minutes." },
  { name: "Rowing Machine", category: "cardio", jointSafe: true, description: "Full body, low impact. 15-20 minutes." },
  { name: "Dancing", category: "cardio", jointSafe: true, description: "Fun movement to music. 15-30 minutes." },
  { name: "Water Aerobics", category: "cardio", jointSafe: true, description: "Pool-based exercise. 30-45 minutes." },
  { name: "Arm Ergometer", category: "cardio", jointSafe: true, description: "Upper body cycling. 15-20 minutes." },
  { name: "Tai Chi Walking", category: "cardio", jointSafe: true, description: "Slow, intentional movement. 15-20 minutes." },
  { name: "Marching in Place", category: "cardio", jointSafe: true, description: "Lift knees gently while standing. 5-10 minutes." },
  { name: "Seated Hamstring Stretch", category: "flexibility", jointSafe: true, description: "Sit and reach toward toes. Hold 30 seconds." },
  { name: "Standing Quad Stretch", category: "flexibility", jointSafe: true, description: "Hold ankle behind, keep knees together. 30 seconds each." },
  { name: "Cat-Cow Stretch", category: "flexibility", jointSafe: true, description: "On all fours, alternate arch and round. 10 reps." },
  { name: "Shoulder Rolls", category: "flexibility", jointSafe: true, description: "Roll shoulders forward and back. 10 each direction." },
  { name: "Neck Tilts", category: "flexibility", jointSafe: true, description: "Gently tilt head side to side. Hold 15 seconds each." },
  { name: "Figure-4 Stretch", category: "flexibility", jointSafe: true, description: "Cross ankle over knee, lean forward. 30 seconds each." },
  { name: "Chest Opener", category: "flexibility", jointSafe: true, description: "Clasp hands behind back, lift gently. Hold 20 seconds." },
  { name: "Side Bends", category: "flexibility", jointSafe: true, description: "Reach one arm overhead, lean sideways. 10 each side." },
  { name: "Ankle Circles", category: "flexibility", jointSafe: true, description: "Rotate each ankle 10 times in each direction." },
  { name: "Wrist Flexor Stretch", category: "flexibility", jointSafe: true, description: "Extend arm, pull fingers back gently. 20 seconds each." },
  { name: "Single Leg Stand", category: "balance", jointSafe: true, description: "Stand on one leg, hold chair if needed. 30 seconds each." },
  { name: "Heel-to-Toe Walk", category: "balance", jointSafe: true, description: "Walk in a straight line, heel touching toe. 20 steps." },
  { name: "Standing Weight Shifts", category: "balance", jointSafe: true, description: "Shift weight side to side. 10 each direction." },
  { name: "Clock Reaches", category: "balance", jointSafe: true, description: "Stand on one leg, reach to 12, 3, 6, 9. 5 reps each." },
  { name: "Seated Balance Ball", category: "balance", jointSafe: true, description: "Sit on stability ball, lift one foot. 15 seconds each." },
  { name: "Tree Pose (Modified)", category: "balance", jointSafe: true, description: "Foot on calf (not knee), use wall. 20 seconds each." },
  { name: "Tandem Stance", category: "balance", jointSafe: true, description: "One foot in front of other, hold. 30 seconds each." },
  { name: "Sit-to-Stand", category: "balance", jointSafe: true, description: "Rise from chair without using hands. 8-10 reps." },
  { name: "Lateral Steps", category: "balance", jointSafe: true, description: "Side steps with mini-band. 10 each direction." },
  { name: "Backwards Walking", category: "balance", jointSafe: true, description: "Walk backwards slowly, clear path. 20 steps." },
  { name: "Arm Circles", category: "warmup", jointSafe: true, description: "Small to large circles. 10 each direction." },
  { name: "Leg Swings", category: "warmup", jointSafe: true, description: "Hold wall, swing leg front to back. 10 each." },
  { name: "Hip Circles", category: "warmup", jointSafe: true, description: "Hands on hips, circle hips. 10 each direction." },
  { name: "Torso Twists", category: "warmup", jointSafe: true, description: "Arms out, rotate upper body. 10 each side." },
  { name: "Knee Lifts", category: "warmup", jointSafe: true, description: "March in place, lift knees higher. 20 total." },
  { name: "Gentle Jumping Jacks", category: "warmup", jointSafe: true, description: "Step-out jacks (no jumping). 15-20 reps." },
  { name: "Wrist Circles", category: "warmup", jointSafe: true, description: "Rotate wrists 10 times each direction." },
  { name: "Spinal Roll-Down", category: "warmup", jointSafe: true, description: "Stand tall, roll down vertebra by vertebra, roll back up." },
  { name: "Shoulder Shrugs", category: "warmup", jointSafe: true, description: "Raise shoulders to ears, release. 10 reps." },
  { name: "Ankle Pumps", category: "warmup", jointSafe: true, description: "Point and flex toes. 15 reps each foot." },
];

export default function Library() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = EXERCISES.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase()) ||
      ex.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "all" || ex.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <SEO title="Exercise Library - Momentum" description="50+ joint-safe exercises for adults 40+." />
      <div className="min-h-screen bg-background-cream pb-24">
        <header className="sticky top-0 z-10 bg-card/95 backdrop-blur-md border-b border-border px-4 py-4">
          <h1 className="text-2xl font-display font-bold text-gradient mb-3">Exercise Library</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search exercises..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors min-h-[36px] ${
                    activeCategory === cat.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-accent"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </header>

        <div className="container mx-auto px-4 py-4 max-w-2xl">
          <p className="text-sm text-muted-foreground mb-4">{filtered.length} exercises</p>
          <div className="space-y-3">
            {filtered.map((ex) => (
              <Card key={ex.name} className="border-none shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm">{ex.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{ex.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="outline" className="text-[10px] capitalize">{ex.category}</Badge>
                      {ex.jointSafe && (
                        <Badge className="text-[10px] bg-success/10 text-success border-success/20">Joint-Safe</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
