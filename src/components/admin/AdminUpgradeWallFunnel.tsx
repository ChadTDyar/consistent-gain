import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, MousePointerClick, X, AlertCircle, Download } from "lucide-react";

/**
 * AdminUpgradeWallFunnel
 *
 * Reads public.analytics_events for the last 30 days and pivots
 * upgrade_wall_dismissed vs upgrade_wall_cta_clicked by gate × tier.
 *
 * RLS allows admins to read all rows (and only admins reach this page).
 */

type EventRow = {
  event_name: string;
  gate: string | null;
  tier: string | null;
  created_at: string;
};

type CellTotals = {
  dismissed: number;
  ctaClicked: number;
};

type Pivot = {
  gates: string[];
  tiers: string[];
  cells: Map<string, CellTotals>; // key = `${gate}::${tier}`
  rowTotals: Map<string, CellTotals>; // key = gate
  colTotals: Map<string, CellTotals>; // key = tier
  grandTotal: CellTotals;
};

const cellKey = (gate: string, tier: string) => `${gate}::${tier}`;
const empty = (): CellTotals => ({ dismissed: 0, ctaClicked: 0 });

function pivot(rows: EventRow[]): Pivot {
  const gateSet = new Set<string>();
  const tierSet = new Set<string>();
  const cells = new Map<string, CellTotals>();
  const rowTotals = new Map<string, CellTotals>();
  const colTotals = new Map<string, CellTotals>();
  const grandTotal = empty();

  for (const row of rows) {
    const gate = row.gate || "(unknown)";
    const tier = row.tier || "(unknown)";
    gateSet.add(gate);
    tierSet.add(tier);

    const k = cellKey(gate, tier);
    if (!cells.has(k)) cells.set(k, empty());
    if (!rowTotals.has(gate)) rowTotals.set(gate, empty());
    if (!colTotals.has(tier)) colTotals.set(tier, empty());

    const bump = (t: CellTotals) => {
      if (row.event_name === "upgrade_wall_dismissed") t.dismissed += 1;
      else if (row.event_name === "upgrade_wall_cta_clicked") t.ctaClicked += 1;
    };
    bump(cells.get(k)!);
    bump(rowTotals.get(gate)!);
    bump(colTotals.get(tier)!);
    bump(grandTotal);
  }

  return {
    gates: Array.from(gateSet).sort(),
    tiers: Array.from(tierSet).sort(),
    cells,
    rowTotals,
    colTotals,
    grandTotal,
  };
}

function ctaRate(t: CellTotals): string {
  const denom = t.dismissed + t.ctaClicked;
  if (denom === 0) return "—";
  return `${Math.round((t.ctaClicked / denom) * 100)}%`;
}

export function AdminUpgradeWallFunnel() {
  const [rows, setRows] = useState<EventRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from("analytics_events")
        .select("event_name, gate, tier, created_at")
        .in("event_name", ["upgrade_wall_dismissed", "upgrade_wall_cta_clicked"])
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(10000);

      if (cancelled) return;
      if (error) {
        setError(error.message);
        setRows([]);
        return;
      }
      setRows((data ?? []) as EventRow[]);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const data = useMemo(() => (rows ? pivot(rows) : null), [rows]);

  if (rows === null) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center space-y-2">
          <AlertCircle className="h-8 w-8 mx-auto text-destructive" />
          <p className="font-medium">Failed to load analytics</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  const total = data!.grandTotal;
  const totalEvents = total.dismissed + total.ctaClicked;
  const overallCta = ctaRate(total);

  return (
    <div className="space-y-6">
      {/* Summary row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Total events (30d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalEvents.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <X className="h-4 w-4" /> Dismissed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{total.dismissed.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MousePointerClick className="h-4 w-4" /> CTA clicked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{total.ctaClicked.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overall CTA rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{overallCta}</p>
            <p className="text-xs text-muted-foreground mt-1">
              CTA clicks / (CTA clicks + dismissed)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pivot matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">UpgradeWall funnel — gate × tier (last 30 days)</CardTitle>
          <p className="text-sm text-muted-foreground">
            Each cell shows{" "}
            <Badge variant="outline" className="font-normal">
              dismissed
            </Badge>{" "}
            /{" "}
            <Badge variant="outline" className="font-normal">
              CTA clicked
            </Badge>{" "}
            with the CTA conversion rate.
          </p>
        </CardHeader>
        <CardContent>
          {data!.gates.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No upgrade_wall events recorded in the last 30 days.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">
                      Gate \ Tier
                    </th>
                    {data!.tiers.map((tier) => (
                      <th
                        key={tier}
                        className="text-left py-2 px-3 font-medium text-muted-foreground"
                      >
                        {tier}
                      </th>
                    ))}
                    <th className="text-left py-2 px-3 font-semibold">Row total</th>
                  </tr>
                </thead>
                <tbody>
                  {data!.gates.map((gate) => {
                    const rowTotal = data!.rowTotals.get(gate) ?? empty();
                    return (
                      <tr key={gate} className="border-b last:border-0 hover:bg-muted/40">
                        <td className="py-2 px-3 font-medium">{gate}</td>
                        {data!.tiers.map((tier) => {
                          const c = data!.cells.get(cellKey(gate, tier)) ?? empty();
                          const isEmpty = c.dismissed === 0 && c.ctaClicked === 0;
                          return (
                            <td key={tier} className="py-2 px-3">
                              {isEmpty ? (
                                <span className="text-muted-foreground">—</span>
                              ) : (
                                <div>
                                  <div className="tabular-nums">
                                    {c.dismissed} / {c.ctaClicked}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    CTA {ctaRate(c)}
                                  </div>
                                </div>
                              )}
                            </td>
                          );
                        })}
                        <td className="py-2 px-3 font-semibold">
                          <div className="tabular-nums">
                            {rowTotal.dismissed} / {rowTotal.ctaClicked}
                          </div>
                          <div className="text-xs text-muted-foreground font-normal">
                            CTA {ctaRate(rowTotal)}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="border-t-2 bg-muted/30">
                    <td className="py-2 px-3 font-semibold">Column total</td>
                    {data!.tiers.map((tier) => {
                      const c = data!.colTotals.get(tier) ?? empty();
                      return (
                        <td key={tier} className="py-2 px-3 font-semibold">
                          <div className="tabular-nums">
                            {c.dismissed} / {c.ctaClicked}
                          </div>
                          <div className="text-xs text-muted-foreground font-normal">
                            CTA {ctaRate(c)}
                          </div>
                        </td>
                      );
                    })}
                    <td className="py-2 px-3 font-semibold">
                      <div className="tabular-nums">
                        {total.dismissed} / {total.ctaClicked}
                      </div>
                      <div className="text-xs text-muted-foreground font-normal">
                        CTA {overallCta}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
