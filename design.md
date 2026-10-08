# 10: — Design (Angular/NestJS)

## Prisma Schema (demo)
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  posts     Post[]
}

model Post {
  id        String   @id @default(uuid())
  title     String
  content   String?
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String
  createdAt DateTime @default(now())
}
```

## tRPC App Router Design
```
apps/
├─ api/src/trpc/
│  ├─ app.router.ts        → defines appRouter with procedures: hello, createPost, getPosts
│  └─ context.ts           → creates ctx = { prisma }; export type Context = inferContext<typeof ctx>
└─ web/src/app/
   ├─ post-list.component.ts
   ├─ create-post-form.component.ts
   └─ posts.service.ts     → typed tRPC client + signals
```

## tRPC Procedures (key examples)
```typescript
// apps/api/src/trpc/app.router.ts
// Procedure: hello (simple type test)
hello: publicProcedure
  .input(z.object({name: z.string()}))
  .output(z.object({greeting: z.string()}))
  .query(({input}) => ({greeting: `Hello, ${input.name}!`}));

// Procedure: createPost (full stack type safety)
createPost: publicProcedure
  .input(z.object({title: z.string(), content: z.string().optional(), published: z.boolean().optional()}))
  .mutation(async ({input, ctx}) => {
    return ctx.prisma.post.create({
      data: {title: input.title, content: input.content, published: input.published, author: {connect: {id: "user-123"}}},
    });
  });
```

## Angular Client Integration
```typescript
// posts.service.ts
readonly posts = signal<Post[]>([]);

async load() {
  this.posts.set(await this.trpc.post.getPosts.query({published: true}));
}
```

## Type-Safety Verification Workflow
1. Define or change Prisma schema (`prisma/schema.prisma`)
2. Run `prisma generate` → updates `node_modules/.prisma/client/generated/client.ts`
3. Run `npm run typecheck` (which is `tsc --noEmit`) → TypeScript checks:
   - All tRPC input/output zod schemas are satisfied
   - All procedure calls in components have matching types
   - No `any` leakage from Prisma types into the API layer
4. The CI/CD pipeline (GitHub Actions) runs `prisma generate && tsc --noEmit` on every PR; fails if types diverge.

## Key Design Decisions & Rationale
| Decision | Rationale |
|---|---|
| **tRPC over REST/GraphQL** | Zero runtime overhead; types are shared directly between server and client (no codegen needed beyond Prisma); the strongest "full-stack type safety" signal. |
| **Prisma over raw SQL** | Migration tooling + auto-generated types; the de facto standard for type-safe DB access in the TypeScript ecosystem. |
| **Angular services + signals** | Native client state with no additional data-fetching abstraction. |
| **Tailwind components** | Keeps UI polish lightweight so focus stays on type safety, not CSS. |
| **Angular 20 standalone** | Current Angular architecture with strict typing and no NgModule boilerplate. |

## Trade-offs Considered
- **tRPC vs. with GraphQL + Codegen**: tRPC is simpler for a TypeScript-only full stack; GraphQL + codegen (e.g., `graphql-codegen`) adds flexibility for heterogeneous clients but adds build complexity. Chose tRPC for the strongest "types everywhere" signal with minimal config.
- **Prisma vs. Drizzle ORM**: Prisma is more established + has better migration UI; Drizzle is lighter + TS-first but younger. Chose Prisma for the demo's "out-of-the-box" experience.
- **Full auth system vs. hardcoded user ID**: Full auth adds infra; for the type-safety demo, a hardcoded `authorId: "user-123"` (or a simple `mockUser` context) showcases the type flow without auth complexity.

## Open Questions
- Should this template include real user management, or stay minimal with a mock user?
- Add tRPC middleware for authentication (e.g., `router.middleware((ctx, next) => { ... })`) to demonstrate auth-protected procedures?
- Publish this as an npm package (`@myorg/fullstack-ts-template`) for reuse across projects?

## Acceptance Criteria (design-verifiable)
- [ ] Prisma schema defined; `prisma generate` runs without errors
- [ ] `npm run typecheck` (tsc --noEmit) completes with zero errors
- [ ] tRPC `appRouter.hello` procedure: calling from Angular has correct types (name: string → greeting: string)
- [ ] tRPC `appRouter.post.createPost` procedure: full end-to-end type safety from form input → DB insert → returned data shape
- [ ] Minimal CRUD page works: list posts + create new post; form validates; on success, post appears in list
- [ ] README documents: (a) how to run `prisma generate && tsc`, (b) how to verify types diverge when schema changes, (c) sample recruiter verification steps