# Feature and claims inventory (read-only, nothing changed)

## Features in the app today

| Feature | Where | Plan |
|---|---|---|
| Habits (add, check in, streak per habit) | Dashboard, GoalCard | Free: 3 habits. Premium: unlimited |
| Streak tracking | GoalCard, streakUtils | Free |
| Daily readiness check-in (6 taps, gives full / lighter / mobility / rest plan) | ReadinessCheckIn | Free |
| Workout suggestion (5/10/20-min "minimum viable day", follows the readiness plan) | MinimumViableDay, MicroblockSuggestion | Free |
| Body-map pain logger | BodyMapPainReport, only opens from "Log location" when check-in pain is notable | Free |
| Exercise library with "joint-safe" labels | /library (fixed list) | Free. No automatic swap based on pain was found |
| Streak Repair (48h window, 1 missed day, grace tokens) | StreakRepairCard, StreakRepair | Card shows for everyone; the repair button is Premium ("Upgrade to Repair" on free) |
| Progress / Consistency view | ProgressTab | Free sees 7 days of history (locked chart beyond). Premium unlimited (legacy Plus 30 days) |
| Insights / Trends | /insights | Locked on free. AI section needs Premium |
| AI Coach | /coach, CoachChat | Premium |
| Accountability partner | Dashboard card | Premium-locked on free; says "Coming soon" for paying users |
| CSV data export | Settings, DataExport | Premium |
| Doctor PDF report, workout buddies | Settings | No plan check found |
| Weather, cost tracker, calendar reminder, Apple Health card, referral prompt, onboarding checklist, photo upload | Dashboard / habit detail | No plan check found |
| 7-Day Readiness Reset | /7-day-reset | Public info page only. No in-app challenge or tracking |

Free-tier limits: 3 habits, 7 days of history, no streak length limit, Streak Repair locked.

## Where the claims appear

- "one goal free forever": not found anywhere.
- "free forever for one activity": src/pages/Features.tsx line 96, "Free forever for one activity. No credit card required." (wrong: free is 3 habits). Compare MyFitnessPalAlternative.tsx line 175, "Free forever for three habits."
- "tracks habits, not specific activities": src/components/FAQ.tsx line 57, "No! Momentum tracks habits, not specific activities. Whether you read a book, meditate, go for a walk, or hit the gym..."
- "body-map pain tracking" and "joint-safe exercise swaps":
  - src/pages/Index.tsx line 253, "...features like body-map pain tracking, joint-safe exercise swaps, and a 48-hour streak repair window."
  - src/pages/Index.tsx line 270, "Body-map pain tracking and joint-safe exercise alternatives"
  - src/pages/Features.tsx line 84, "...body-map pain tracking, joint-safe exercise alternatives, AI coaching that adapts to your energy levels..."
  - src/components/NotificationExplainer.tsx line 7, "...with body-map pain tracking, joint-safe exercise swaps, and an AI coach that adjusts suggestions..."
- "over 50":
  - src/components/NotificationExplainer.tsx line 5, "Is Momentum really built for people over 50?"
  - src/pages/seo/FitnessMotivationOver50.tsx (headline, title, description, keywords, lines 12-50 and 102, e.g. "Fitness Motivation Over 50: Stop Relying on Willpower...")
  - src/pages/Blog.tsx line 33 keywords "exercise tips adults 50+"
  - src/pages/Library.tsx line 85 description "50+ joint-safe exercises for adults 40+." (count, not age)
- "MomentumFit" (exact capitalization): not in visible copy anymore. index.html title now reads "Momentum: Daily Fitness Habit Tracker". Lowercase "momentumfit" only in keyword meta of Index.tsx line 64, Features.tsx line 47, Support.tsx line 44, plus momentumfit.app URLs.

## Blog link

- Top nav: src/pages/Index.tsx line 172, About.tsx line 49, MyFitnessPalAlternative.tsx line 79.
- Footer: src/pages/Index.tsx line 338, BlogPost.tsx line 157, MyFitnessPalAlternative.tsx line 197.
- Buttons: About.tsx line 223, BlogPost.tsx lines 37 and 77 ("Back to Blog").
- Not in the signed-in sidebar or bottom tab bar.

## Next step

Nothing to build. Approving this does not change anything; tell me which claims to fix.
