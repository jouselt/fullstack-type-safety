# 10: — Tasks (Angular/NestJS)

- [ ] Initialize Angular 20 standalone app + Fastify API with TypeScript; install required dependencies: @trpc/server, @trpc/client, fastify, @fastify/cors, prisma, @prisma/client, @prisma/adapter-pg, tailwindcss, zod
- [ ] Set up Prisma: init, set DATABASE_URL env var, define schema (User + Post models as designed); run `prisma generate`; confirm TypeScript types output
- [ ] Configure tRPC: create `app.router.ts` with public procedures `hello` + `createPost` + `getPosts`; expose its HTTP handler from the Fastify server
- [ ] Build tRPC procedures with Zod input/output schemas: hello(name: string), createPost(title: string, content?: string, published?: boolean), getPosts(published?: boolean)
- [ ] Set up an Angular data service with signals for post list + create; infer types from tRPC router output
- [ ] Create Angular components: `PostListComponent` (list), `CreatePostFormComponent` (form with Zod validation); wire to tRPC mutations/queries
- [ ] Add Tailwind CSS; style the buttons, inputs, and cards for a polished look
- [ ] Implement `npm run typecheck` script: `tsc --noEmit`; verify zero errors on clean checkout; after schema changes + `prisma generate`, confirm typecheck catches mismatches
- [ ] Create Prisma migration: initial migration; run `prisma migrate dev --name init`; confirm DB tables created
- [ ] Deploy the Angular app and Fastify API to Vercel; set `DATABASE_URL`; add GitHub Actions workflow that runs `prisma generate && tsc --noEmit` on PR
- [ ] Write README: full type-safety workflow (clone → prisma generate → tsc), how a recruiter can verify types (run the two commands, show before/after schema change), project structure overview
- [ ] End-to-end: (1) run dev server, (2) open /, (3) see post list (empty), (4) fill create form with title → submit, (5) new post appears in list with correct types, (6) open terminal, (7) make a small change to Prisma schema (add a field), (8) run prisma generate + tsc, (9) show TypeScript errors highlighting the mismatch, (10) revert schema change, commit