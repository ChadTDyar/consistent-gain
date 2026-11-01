import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import momentumLogo from "@/assets/momentum-logo.png";

/** Same nav as the Home page, for public pages outside Home. Section links point back to Home. */
export function MarketingHeader() {
  const navigate = useNavigate();
  const go = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(path);
  };
  const linkClass = "text-muted-foreground hover:text-primary transition-colors";

  return (
    <nav className="sticky top-0 z-20 bg-card/80 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container mx-auto px-6 md:px-8 max-w-7xl flex items-center justify-between py-3">
        <a href="/" onClick={go("/")} className="flex items-center gap-2">
          <img src={momentumLogo} alt="Momentum" className="h-8 w-auto" width="32" height="32" />
          <span className="font-display font-bold text-lg text-gradient">Momentum</span>
        </a>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <a href="/#how-it-works" className={linkClass}>How It Works</a>
          <a href="/#features" className={linkClass}>Features</a>
          <a href="/pricing" className={linkClass} onClick={go("/pricing")}>Pricing</a>
          <a href="/resources/habit-streaks-science" className={linkClass} onClick={go("/resources/habit-streaks-science")}>Resources</a>
          <a href="/story" className={linkClass} onClick={go("/story")}>Our Story</a>
          <a href="/#faq" className={linkClass}>FAQ</a>
        </div>
        <Button size="sm" onClick={() => navigate("/auth?mode=signup")} className="btn-gradient">
          Start Free
        </Button>
      </div>
    </nav>
  );
}
