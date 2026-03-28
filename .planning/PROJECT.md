# TrialMatch

## Vision
A patient-to-clinical-trial matching platform that helps patients and doctors discover relevant clinical trials based on medical conditions, demographics, and eligibility criteria.

## Context
- **Event**: AUBG Hackathon 2026
- **Scope**: MVP demo -- core flow only, enough to demonstrate the concept end-to-end
- **Platforms**: Web (React 19 + Vite) + Backend (ASP.NET Core 8)
- **Existing foundation**: Auth system (JWT login, register, refresh, logout, user lookup) is fully built across backend, web, shared, and mobile

## What Already Exists
- ASP.NET Core 8 backend with Clean Architecture (Domain, Application, Infrastructure, API layers)
- MediatR + FluentValidation pipeline
- EF Core + SQL Server persistence
- JWT auth with rotating refresh tokens
- React 19 web app with Tailwind CSS, shadcn/ui, React Query, React Hook Form, Zod
- Shared TypeScript contracts layer
- Mobile app (Expo) -- out of scope for MVP

## MVP Demo Goal
A user can:
1. Log in (existing)
2. Fill out a patient profile (conditions, age, location)
3. Browse available clinical trials
4. See which trials they match and why
5. View trial details

## Key Constraints
- Hackathon timeline -- speed over perfection
- Seed data for trials (no admin CRUD needed for MVP)
- Simple matching algorithm (criteria overlap scoring)
- Web + Backend only (skip mobile for MVP)
