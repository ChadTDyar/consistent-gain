/**
 * The seven actions of the 7-Day Readiness Reset. Single source for the
 * /7-day-reset page and the homepage teaser so the two never drift apart.
 */
export const RESET_DAYS = [
  { title: "Sleep anchor", text: "Pick one bedtime and keep it tonight. Same time, give or take 15 minutes." },
  { title: "Morning light", text: "Step outside for a few minutes within an hour of waking." },
  { title: "Hydration", text: "Drink a glass of water before your first coffee." },
  { title: "Movement snack", text: "Two to five minutes of movement between tasks. A walk, stairs, or a few squats." },
  { title: "Evening shutdown", text: "Set a time to close the laptop and write tomorrow's first task down." },
  { title: "Reflection", text: "Look back at the week. Note which day felt easiest and why." },
  { title: "Plan next week", text: "Choose the one or two actions you want to keep and put them on your calendar." },
] as const;
