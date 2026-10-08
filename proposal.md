# 10: Type-Safe Full-Stack Platform — Proposal (Angular/NestJS Edition)

## Problem
End-to-end type safety across the full stack (frontend, API, database) is a rare and highly valued signal. Recruiters see candidates who can enforce schemas at every layer, catch mismatches at compile-time, and reduce runtime bugs. Building a type-safe full-stack template demonstrates this depth.

## Goal
Build a **type-safe full-stack template** using Angular 20, NestJS, and tRPC (or GraphQL/Prisma) for end-to-end type sharing; TypeScript everywhere; Prisma ORM with a small demo schema; Angular signals for client state; a minimal but complete developer experience (setup script, type-checked API routes, example usage).

## Target Recruiter Signal
A recruiter asks "How do you prevent API-parsing errors?" → the candidate shows the tRPC/router type definitions, types shared between Angular components and the NestJS backend, Prisma schema → signals mastery of modern full-stack tooling and compile-time safety.

## Tech Stack (high-level)
- **Framework**: Angular 20 (standalone) + TypeScript
- **Backend**: NestJS
- **Routing/Types**: tRPC (server-side routers + client auto-types); or alternatively, with GraphQL Codegen + Prisma
- **ORM**: Prisma (migrations, type-safe queries)
- **Client Data**: Angular services + signals
- **Styling**: Tailwind CSS
- **Deployment**: Vercel; GitHub Actions type-check + lint step

## Timeline
- Week 1: Prisma schema (User, Post, Comment); Angular 20 standalone app + NestJS API setup; tRPC initialization with appRouter; define `appRouter` + types; basic `hello` procedure.
- Week 2: Prisma migrations run; create demo pages: list posts, create post (type-safe from form to DB); add an Angular data service with signals; style buttons/forms with Tailwind.
- Week 3: End-to-end type test: change Prisma schema field name → run `prisma generate` → TypeScript errors in frontend show the mismatch; add a `typescript-check` npm script; document the workflow.
- Week 4: Polish: error boundaries, default empty states; README with "type-safety demo" walkthrough; deploy; sample recruiter script.

## Acceptance Criteria
- [ ] Prisma schema defined + `prisma generate` produces TypeScript types
- [ ] tRPC procedures are fully type-safe: calling `appRouter.hello.query(...)` from Angular has correct types; returning data to the component matches expected shape
- [ ] `npm run typecheck` (or `prisma generate` + `tsc --noEmit`) completes with zero errors
- [ ] Minimal CRUD page (list + create) works end-to-end with types
- [ ] README documents the type-safety workflow and how a recruiter can verify it