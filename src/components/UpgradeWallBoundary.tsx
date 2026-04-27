import React from "react";
import { analytics } from "@/lib/analytics";
import type { UpgradeWallGate, UpgradeWallTier } from "@/components/UpgradeWall";

interface Props {
  children: React.ReactNode;
  gate: UpgradeWallGate;
  tier: UpgradeWallTier;
  /**
   * Renders when the inner subtree has thrown. Should be a static, low-risk
   * fallback (e.g. a Close button + apology). Receives a `retry` callback
   * that resets the boundary; if the retry succeeds we emit
   * `ios_render_error_recovered` so we can flag repeat-offender users.
   */
  fallback: (args: { error: Error; retry: () => void }) => React.ReactNode;
}

interface State {
  error: Error | null;
  /** True once we've successfully rendered after a previous catch. */
  recoveredOnce: boolean;
}

/**
 * Scoped error boundary for the iOS UpgradeWall fallback.
 *
 * Why a dedicated boundary (instead of relying on the app-level one)?
 *   - The app boundary swaps the entire screen for an error card. If the
 *     user merely tapped a gated feature, blowing away their current page
 *     is overkill and confusing.
 *   - We want the failure to be observable in the UpgradeWall funnel
 *     (`upgrade_wall_null_return` with reason=`ios_fallback_threw`) so it
 *     joins the same dashboard as render-time null guards.
 *   - We want a retry path because most fallback-render failures we've
 *     seen in Sentry are transient (e.g. a portal target detached during
 *     a navigation). A single retry recovers without bothering the user.
 */
export class UpgradeWallBoundary extends React.Component<Props, State> {
  state: State = { error: null, recoveredOnce: false };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    try {
      analytics.upgradeWallNullReturn(
        this.props.gate,
        this.props.tier,
        "ios_fallback_threw",
      );
    } catch {
      /* never let analytics swallow the boundary */
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = window as any;
      w.Sentry?.captureException?.(error, {
        tags: {
          component: "UpgradeWallBoundary",
          gate: this.props.gate,
          tier: this.props.tier,
          reason: "ios_fallback_threw",
        },
        extra: { componentStack: info.componentStack },
      });
    } catch {
      /* no-op */
    }
  }

  componentDidUpdate(_prev: Props, prevState: State) {
    // We just transitioned from "errored" to "rendering" — i.e. the retry
    // worked. Fire the recovery beacon exactly once per recovery so we can
    // alert on users who recover multiple times in a session (a sign the
    // root cause is reproducible, not a one-off paint race).
    if (prevState.error && !this.state.error && !this.state.recoveredOnce) {
      try {
        analytics.upgradeWallNullReturn(
          this.props.gate,
          this.props.tier,
          "ios_render_error_recovered",
        );
      } catch {
        /* no-op */
      }
      this.setState({ recoveredOnce: true });
    }
  }

  retry = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return this.props.fallback({ error: this.state.error, retry: this.retry });
    }
    return this.props.children;
  }
}
