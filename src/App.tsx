import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { CookieConsent } from "@/components/CookieConsent";
import { BottomTabBar } from "@/components/BottomTabBar";
import { useEffect, lazy, Suspense } from "react";
import { notificationService } from "@/services/notifications.service";
import { usePostHogIdentify } from "@/hooks/usePostHogIdentify";

// Eagerly load the landing page for fast FCP/LCP
import Index from "./pages/Index";

// Lazy load all other routes
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const GoalDetail = lazy(() => import("./pages/GoalDetail"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Settings = lazy(() => import("./pages/Settings"));
const Account = lazy(() => import("./pages/Account"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Success = lazy(() => import("./pages/Success"));
const Cancel = lazy(() => import("./pages/Cancel"));
const Welcome = lazy(() => import("./pages/Welcome"));
const About = lazy(() => import("./pages/About"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Progress = lazy(() => import("./pages/Progress"));
const Library = lazy(() => import("./pages/Library"));
const Track = lazy(() => import("./pages/Track"));
const Coach = lazy(() => import("./pages/Coach"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Admin = lazy(() => import("./pages/Admin"));
const Profile = lazy(() => import("./pages/Profile"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const HabitStreaksScience = lazy(() => import("./pages/HabitStreaksScience"));
const FitnessHabitGuide = lazy(() => import("./pages/FitnessHabitGuide"));
const FitnessTrackerVsHabitTracker = lazy(() => import("./pages/FitnessTrackerVsHabitTracker"));
const Insights = lazy(() => import("./pages/Insights"));
const BuildFitnessHabitAfter40 = lazy(() => import("./pages/seo/BuildFitnessHabitAfter40"));
const BestHabitTrackerApp = lazy(() => import("./pages/seo/BestHabitTrackerApp"));
const WorkoutStreakTracker = lazy(() => import("./pages/seo/WorkoutStreakTracker"));
const FitnessMotivationOver50 = lazy(() => import("./pages/seo/FitnessMotivationOver50"));
const HowToStayConsistentWorkingOut = lazy(() => import("./pages/seo/HowToStayConsistentWorkingOut"));
const DailyFitnessCheckinApp = lazy(() => import("./pages/seo/DailyFitnessCheckinApp"));
const Features = lazy(() => import("./pages/Features"));

const queryClient = new QueryClient();

const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-pulse text-muted-foreground">Loading...</div>
  </div>
);

const App = () => {
  usePostHogIdentify();

  // Initialize mobile notifications
  useEffect(() => {
    notificationService.initialize();
  }, []);

  return (
  <QueryClientProvider client={queryClient}>
    <ErrorBoundary>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <CookieConsent />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/goal/:id" element={<GoalDetail />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/account" element={<Account />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/success" element={<Success />} />
              <Route path="/cancel" element={<Cancel />} />
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/story" element={<About />} />
              <Route path="/about" element={<About />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/library" element={<Library />} />
              <Route path="/track" element={<Track />} />
              <Route path="/coach" element={<Coach />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/insights" element={<Insights />} />
              <Route path="/resources/habit-streaks-science" element={<HabitStreaksScience />} />
              <Route path="/resources/fitness-habit-guide" element={<FitnessHabitGuide />} />
              <Route path="/resources/fitness-tracker-vs-habit-tracker" element={<FitnessTrackerVsHabitTracker />} />
              <Route path="/fitness-habit-after-40" element={<BuildFitnessHabitAfter40 />} />
              <Route path="/best-habit-tracker-app" element={<BestHabitTrackerApp />} />
              <Route path="/workout-streak-tracker" element={<WorkoutStreakTracker />} />
              <Route path="/fitness-motivation-over-50" element={<FitnessMotivationOver50 />} />
              <Route path="/how-to-stay-consistent-working-out" element={<HowToStayConsistentWorkingOut />} />
              <Route path="/daily-fitness-checkin-app" element={<DailyFitnessCheckinApp />} />
              <Route path="/features" element={<Features />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <BottomTabBar />
        </BrowserRouter>
      </TooltipProvider>
    </ErrorBoundary>
  </QueryClientProvider>
  );
};

export default App;
