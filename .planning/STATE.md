# TrialMatch Project State

## Current Phase
Phase 1: Domain & Persistence (not started)

## Completed Phases
- (none yet -- auth foundation exists from template)

## Decisions
- MVP scope: web + backend only, skip mobile
- Matching is simple criteria-overlap scoring (not ML)
- Trials are seeded, not admin-managed
- Conditions use a simplified catalog (not full ICD codes)

## Blockers
- (none)

## Notes
- Auth system is fully built and working (login, register, refresh, logout, /me)
- Clean Architecture patterns established -- follow for all new features
- Shared contracts layer must be updated alongside backend changes
