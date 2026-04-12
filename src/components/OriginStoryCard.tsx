import { useState, useEffect } from "react";

const STORAGE_KEY = "mom_origin_seen";

export function OriginStoryCard() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="rounded-lg border-l-4 bg-card p-5 shadow-sm mb-6 relative"
      style={{ borderLeftColor: "#0d3b5e" }}
    >
      <button
        onClick={dismiss}
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground text-sm"
        aria-label="Dismiss"
      >
        ✕
      </button>
      <p className="text-[0.8rem] text-muted-foreground leading-relaxed">
        "I've worked out since I was 15. At 50 I'm busier and more tired — not less motivated. The gap isn't knowledge. It's momentum. I talked to my gym friends while building this. Every single one said the same thing: it's not like college anymore. We know what to do. We just need to actually show up. Momentum is built for that."
      </p>
      <p className="text-[0.8rem] font-semibold text-foreground mt-3">
        — Chad Dyar, Momentum
      </p>
    </div>
  );
}
