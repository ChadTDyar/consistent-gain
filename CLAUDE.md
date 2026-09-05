# Momentum (consistent-gain) — Claude Code Standing Orders

## Sync with Lovable

This repo is the GitHub mirror of a Lovable project. Lovable commits directly to this repo on its own schedule.

**Rules:**
- Lovable is the primary write path. A local commit will NOT appear in Lovable's editor or the live app until Lovable's sync picks it up.
- Before editing locally: `git fetch && git status` to confirm you're on the same SHA Lovable reports as `latest_commit_sha`.
- If local has commits that remote doesn't, stop and flag to Chad — that's a real divergence requiring a decision on which side wins.
- Do not hand-reconstruct changes from spec docs. Lovable's actual implementation diverges from specs in small ways during builds.
- Lovable's self-reports have contained factual errors. Always verify by reading the actual file or querying the database, not by trusting build transcripts.

## Live App

- **URL**: https://momentumfit.app (also https://consistent-gain.lovable.app)
- **Stack**: React + Vite + TypeScript + Tailwind + shadcn/ui
- **Supabase**: project `tayueahiwrqsvueaespk` (Momentum's own DB)
- **ARL ops hub**: project `skaeklayghuqwakrbemy` (agent_decisions, agent_tasks, shared infra)
- **Stripe**: shared "Autonomous Revenue Labs" account (acct_1SE6KNL98dr6Pw0k)

## Recent Work

Daily Readiness Phase 1 shipped (2026-09-05) via Lovable. Merged DailyContext + BodyMapPainReport into a single ReadinessCheckIn with 6 inputs producing full/reduced/mobility/rest recommendation. Phase 2 blocked on additional file reads.

## Pricing

Do not modify Stripe/pricing configuration without explicit instruction from Chad. Pricing source of truth is Stripe Live, not code.
