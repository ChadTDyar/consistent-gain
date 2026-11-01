/** Same footer as the Home page, for public pages outside Home. */
export function SiteFooter() {
  const linkClass = "text-muted-foreground hover:text-primary transition-colors font-medium";
  return (
    <footer className="py-12 border-t border-primary/10 bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <p className="text-muted-foreground font-medium">Built by <a href="https://chadtdyar.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Chad T. Dyar</a></p>
            <p className="text-xs text-muted-foreground mt-1">&copy; 2026 Momentum. All rights reserved.</p>
            <p className="text-xs text-muted-foreground mt-1">
              Also by Chad:{" "}
              <a href="https://pawformance.app" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">tools for pets</a>,{" "}
              <a href="https://carecadence.app" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">health</a>,{" "}
              <a href="https://palettepro.design" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">design</a>, and{" "}
              <a href="https://thehomegrown.app" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">gardening</a>
            </p>
          </div>
          <nav className="flex flex-wrap gap-6 text-sm justify-center" aria-label="Footer navigation">
            <a href="/features" className={linkClass}>Features</a>
            <a href="/blog" className={linkClass}>Blog</a>
            <a href="/story" className={linkClass}>Our Story</a>
            <a href="/resources/habit-streaks-science" className={linkClass}>Resources</a>
            <a href="mailto:support@momentumfit.app" className={linkClass}>Contact</a>
            <a href="/privacy" className={linkClass}>Privacy Policy</a>
            <a href="/terms" className={linkClass}>Terms of Service</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
