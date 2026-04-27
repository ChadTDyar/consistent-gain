import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, Smartphone, Globe } from "lucide-react";

/**
 * AdminUpgradeWallReliability
 *
 * Reads public.analytics_events for the last 30 days and computes:
 *   - shown counts split by variant (web vs ios_fallback vs entitled_manage)
 *   - null-return counts (DB-mirrored from upgrade_wall_null_return)
 *   - null-return RATE per variant = nulls / (shown + nulls)
 *     (denominator includes nulls because a null-return is, by definition,
 *      a wall the user TRIED to see — counting it only against successful
 *      shows would understate the true failure rate.)
 *
 * Reason breakdown is grouped under each variant so we can spot which
 * failure mode dominates (e.g. ios_branch_returned_null vs ios_fallback_threw).
 *
 * iOS vs web is the primary slice the user requested. We extract platform
 * from the variant column directly: 'ios_fallback' = iOS, everything else
 * = web (Android Capacitor falls under web for funnel purposes — the web
 * upgrade wall is what renders there).
 *
 * RLS allows admins to read all analytics_events rows.
 */

type ShownRow = {
  variant: string | null;
};

type NullRow = {
  gate: string | null;
  tier: string | null;
  metadata: { reason?: string } | null;
};

type Bucket = {
  shown: number;
  nulls: number;
  reasons: Map<string, number>;
};

const emptyBucket = (): Bucket => ({ shown: 0, nulls: 0, reasons: new Map() });

const platformLabel = (variant: string | null): "iOS" | "Web" => {
  if (variant === "ios_fallback") return "iOS";
  return "Web";
};

const since30Days = () => {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString();
};

export function AdminUpgradeWallReliability() {
  const [shown, setShown] = useState<ShownRow[] | null>(null);
  const [nulls, setNulls] = useState<NullRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const since = since30Days();
        // Two parallel queries are cheaper than one big OR and keep the
        // type narrowing simple.
        const [shownRes, nullRes] = await Promise.all([
          supabase
            .from("analytics_events")
            .select("variant")
            .eq("event_name", "upgrade_wall_shown")
            .gte("created_at", since),
          supabase
            .from("analytics_events")
            .select("gate, tier, metadata")
            .eq("event_name", "upgrade_wall_null_return")
            .gte("created_at", since),
        ]);
        if (cancelled) return;
        if (shownRes.error) throw shownRes.error;
        if (nullRes.error) throw nullRes.error;
        setShown((shownRes.data ?? []) as ShownRow[]);
        setNulls((nullRes.data ?? []) as NullRow[]);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load reliability data");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const buckets = useMemo(() => {
    const out: Record<"iOS" | "Web", Bucket> = {
      iOS: emptyBucket(),
      Web: emptyBucket(),
    };
    if (shown) {
      for (const row of shown) {
        const p = platformLabel(row.variant);
        out[p].shown += 1;
      }
    }
    if (nulls) {
      for (const row of nulls) {
        // Null-return events all originate from the iOS branch guard /
        // boundary (web has no equivalent failure mode). Bucket them under
        // iOS regardless of any future variant column drift.
        const reason = row.metadata?.reason ?? "unknown";
        out.iOS.nulls += 1;
        out.iOS.reasons.set(reason, (out.iOS.reasons.get(reason) ?? 0) + 1);
      }
    }
    return out;
  }, [shown, nulls]);

  const loading = shown === null || nulls === null;

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Reliability data unavailable
          </CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-44 w-full" />
        <Skeleton className="h-44 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>UpgradeWall reliability (last 30 days)</CardTitle>
          <CardDescription>
            Shown counts and null-return rates split by platform. A null-return
            means the wall failed to render — see the reason breakdown for the
            specific failure mode.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <PlatformPanel
              icon={<Globe className="h-4 w-4" />}
              label="Web"
              bucket={buckets.Web}
            />
            <PlatformPanel
              icon={<Smartphone className="h-4 w-4" />}
              label="iOS"
              bucket={buckets.iOS}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PlatformPanel({
  icon,
  label,
  bucket,
}: {
  icon: React.ReactNode;
  label: string;
  bucket: Bucket;
}) {
  // Denominator = shown + nulls. See header comment for the rationale.
  const total = bucket.shown + bucket.nulls;
  const rate = total === 0 ? 0 : bucket.nulls / total;
  const ratePct = (rate * 100).toFixed(2);
  const healthy = bucket.nulls === 0;

  // Sort reasons by count desc for readability.
  const reasonRows = Array.from(bucket.reasons.entries()).sort(
    (a, b) => b[1] - a[1],
  );

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-medium text-foreground">
          {icon}
          {label}
        </div>
        {healthy ? (
          <Badge variant="outline" className="gap-1">
            <CheckCircle2 className="h-3 w-3 text-green-600" />
            Healthy
          </Badge>
        ) : (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            {ratePct}% null
          </Badge>
        )}
      </div>

      <dl className="grid grid-cols-3 gap-2 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">Shown</dt>
          <dd className="font-mono font-semibold text-foreground">
            {bucket.shown.toLocaleString()}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Null returns</dt>
          <dd className="font-mono font-semibold text-foreground">
            {bucket.nulls.toLocaleString()}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Null rate</dt>
          <dd className="font-mono font-semibold text-foreground">{ratePct}%</dd>
        </div>
      </dl>

      {reasonRows.length > 0 && (
        <div className="pt-2 border-t">
          <div className="text-xs font-medium text-muted-foreground mb-2">
            Reason breakdown
          </div>
          <ul className="space-y-1">
            {reasonRows.map(([reason, count]) => (
              <li
                key={reason}
                className="flex items-center justify-between text-xs"
              >
                <code className="font-mono text-foreground">{reason}</code>
                <span className="font-mono text-muted-foreground">{count}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {reasonRows.length === 0 && bucket.nulls === 0 && (
        <div className="pt-2 border-t text-xs text-muted-foreground">
          No null returns recorded in the last 30 days.
        </div>
      )}
    </div>
  );
}
