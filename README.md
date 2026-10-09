# End-to-end type-safe fullstack template

![CI](https://github.com/jouselt/fullstack-type-safety/actions/workflows/ci.yml/badge.svg?branch=main)

**Angular 20 · tRPC 11 · Prisma 7 · Fastify 5 · Zod 4 · Tailwind 4**

A minimal but real fullstack app where **one schema line feeds every type from Postgres to the Angular template**. Change a Prisma field and both apps stop compiling — before any code runs. No duplicated DTOs, no `any`, no drift between API and UI.

## Verify the claim

From a fresh clone, one paste runs the whole gauntlet:

```bash
cp apps/api/.env.example apps/api/.env
npm ci && npm run verify:types
```

`verify:types` generates the Prisma client from `apps/api/prisma/schema.prisma`, then type-checks the whole monorepo: `tsc --noEmit` on the API and a full `ng build` (strict templates) on the web app. Green means every layer agrees. (CI runs [the same gate](.github/workflows/ci.yml) on every push and pull request.)

### The 60-second divergence proof

Rename one field in the Prisma schema (`content` → `body`):

```bash
sed -i 's/  content   String?/  body      String?/' apps/api/prisma/schema.prisma
npm run verify:types
```

The client regenerates and **both apps fail to compile** (errors below are the real output of exactly this change):

```
apps/api/src/trpc/app.router.ts(35,11):
  error TS2353: Object literal may only specify known properties, and 'content'
  does not exist in type 'Without<PostUncheckedCreateInput, PostCreateInput> & PostCreateInput & object'.

apps/web (ng build):
  error TS2339: Property 'content' does not exist on type
  '{ title: string; published: boolean; body: string | null; id: string; createdAt: string; authorId: string; }'.
```

That second error is the point: the renamed Prisma field crossed the tRPC router, was inferred by the Angular client, and broke the component template — all at compile time. Revert and it is green again:

```bash
git checkout -- apps/api/prisma/schema.prisma
npm run verify:types
```

## Run it locally

Prerequisites: Node 22+, Docker.

```bash
cp apps/api/.env.example apps/api/.env   # DB URL + PORT=3005
docker compose up -d                     # postgres:16 on :5432

npm ci
npm run db:generate -w api                # Prisma client (types for everything)
npm run db:migrate -w api                 # apply committed migrations
npm run db:seed -w api                    # mock author + 3 sample posts

npm run dev:api                          # Fastify + tRPC on http://localhost:3005
npm run dev:web                          # Angular on http://localhost:4200
```

Open http://localhost:4200 — the seeded posts render; create one from the form and it appears in the list.

### Smoke the API directly (tRPC is mounted at root)

```bash
curl -s "http://localhost:3005/getPosts?input=%7B%7D"
curl -s "http://localhost:3005/getPosts?input=%7B%22published%22%3Afalse%7D"   # filter: drafts only
curl -s -X POST "http://localhost:3005/createPost" \
  -H "content-type: application/json" \
  -d '{"title":"Hello from curl","content":"typed all the way","published":true}'
```

GET inputs travel as a URL-encoded JSON object in `input`; mutations take the raw JSON body.

## How the types flow

```
Postgres ── prisma/schema.prisma ──> generated client
                                          │
                                     tRPC router (procedures + Zod input schemas)
                                          │  export type AppRouter
                                     Angular client (type-only import)
                                          │  inferRouterOutputs / inferRouterInputs
                                     PostsService ──> components (strict templates)
```

| Layer | Source of truth | What it guarantees |
|-------|-----------------|--------------------|
| Prisma schema | `apps/api/prisma/schema.prisma` | DB shape → generated client types |
| tRPC router | `apps/api/src/trpc/app.router.ts` | Procedure inputs (Zod) + outputs (inferred from Prisma) |
| Angular service | `apps/web/src/app/posts.service.ts` | `Post` and `CreatePostInput` inferred from the router — zero hand-written shapes |
| Templates | `apps/web/src/app/*.component.ts` | Strict template type-check: wrong field = build error |

Input validation (Zod) and persistence types (Prisma) meet at the router boundary — the single place both apps import from.

## Project structure

```
├── docker-compose.yml          # postgres:16, healthcheck, named volume
├── .github/workflows/ci.yml     # npm ci → prisma generate → typecheck
├── apps/
│   ├── api/                     # Fastify 5 + tRPC 11 + Prisma 7
│   │   ├── prisma/schema.prisma # the one schema every type flows from
│   │   ├── prisma/seed.ts       # mock author (user-123) + sample posts
│   │   └── src/
│   │       ├── db.ts            # PrismaClient via PrismaPg driver adapter
│   │       └── trpc/            # context, router (hello/createPost/getPosts)
│   └── web/                     # Angular 20 + Tailwind 4
│       └── src/app/
│           ├── trpc/trpc-client.ts   # type-only AppRouter import, API_URL const
│           └── posts.service.ts     # inferred Post / CreatePostInput
```

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `npm run typecheck` fails on generated client imports | Run `npm run db:generate -w api` first (the client is gitignored; CI does this too) |
| Web shows "Failed to load posts" | Is the API up on :3005? `curl http://localhost:3005/health` → `{"status":"ok"}` |
| Changed the API port | The web client reads `API_URL` in `apps/web/src/app/trpc/trpc-client.ts` — keep it in sync with `PORT` in `apps/api/.env` |
| NixOS: `prisma generate` can't download engines | `PRISMA_CLI_BINARY_TARGETS=linux-musl-openssl-3.0.x npm run db:generate -w api` |
| NixOS: `prisma migrate` can't execute the schema engine (missing musl loader) | Run it inside an alpine container with the repo mounted: `docker run --rm -v "$PWD":/workspace -w /workspace/apps/api --add-host=host.docker.internal:host-gateway -e DATABASE_URL="postgresql://postgres:postgres@host.docker.internal:5432/fullstack_type_safety" --user "$(id -u):$(id -g)" -e HOME=/tmp node:22-alpine npx prisma migrate deploy` |

## Scope, on purpose

This is a template, not a product: a mock author (`user-123`), no auth, one relation. The interesting part is the type plumbing — everything else stays as small as possible so the pattern stays readable.

**Roadmap**: auth (a mock author is wired in — `user-123`), more relations. The hosted deployment is no longer roadmap — see [Deploy to Vercel](#deploy-to-vercel).

## CI

Every push and pull request runs the same gate you run locally: install, generate, typecheck ([ci.yml](.github/workflows/ci.yml)).

## Deploy to Vercel

The template deploys as two Vercel projects — the API as a single serverless function, the web app as static output — with a hosted Postgres ([Neon](https://neon.tech)). Vercel's native Fastify support requires zero config: it detects `apps/api/src/server.ts`, routes every request to the function, and lets Fastify's router match the path — so the root-mounted tRPC routes (`/health`, `/getPosts`, ...) work in production exactly as they do locally. Prisma runs through the `pg` driver adapter, so no query-engine binary ships with the function.

### 1. Create the Neon database

Create a project at [neon.tech](https://neon.tech) (free tier works). Copy **both** connection strings:

- **Pooled** (host ends in `-pooler`) — used by the running app and by `prisma generate`.
- **Direct** (port 5432, no pooler) — used only by the migration CLI.

### 2. Migrate and seed (from this machine)

Run `prisma migrate deploy` against the **direct** URL — on NixOS, still through the alpine container from [Troubleshooting](#troubleshooting), swapping `DATABASE_URL` for the Neon direct string. Then seed with the **pooled** URL:

```bash
DATABASE_URL="<neon-pooled-url>" npm run db:seed -w api
```

### 3. API project on Vercel

Import the repo at [vercel.com/new](https://vercel.com/new) and configure:

- **Root Directory**: `apps/api`
- **Build Command**: `npx prisma generate` (needs `DATABASE_URL`, see below)
- **Environment Variable**: `DATABASE_URL` = the Neon **pooled** URL

The framework preset (Fastify) and output need no configuration. After the first deploy, smoke-test the function:

```bash
curl -s https://<your-api-project>.vercel.app/health
# {"status":"ok"}
```

### 4. Point the web app at it

The production API origin is baked at build time into `apps/web/src/environments/environment.production.ts`. Set it to your deployed API URL (if you kept the suggested project name `fullstack-type-safety-api`, it is already correct) and commit the change.

### 5. Web project on Vercel

Import the repo again as a second project:

- **Root Directory**: `apps/web`

Everything else is auto-detected (Angular preset, `ng build`, static output). Open the deployed URL, create a post, and watch it appear — the same loop you tested locally, now on `https://`.
