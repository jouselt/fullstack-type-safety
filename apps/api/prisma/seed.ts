/**
 * Seed script for the type-safe full-stack template.
 * Creates the mock author ("user-123", no auth by design) and sample posts.
 * Idempotent: upserts the author and only inserts sample posts when the table is empty.
 *
 * Run with: npm run db:seed -w api  (or `prisma db seed`)
 */
import { prisma } from '../src/db.js';

const MOCK_AUTHOR_ID = 'user-123';

async function main(): Promise<void> {
  const author = await prisma.user.upsert({
    where: { id: MOCK_AUTHOR_ID },
    update: {},
    create: {
      id: MOCK_AUTHOR_ID,
      email: 'author@example.com',
      name: 'Mock Author',
    },
  });

  const existingPosts = await prisma.post.count();
  if (existingPosts === 0) {
    await prisma.post.createMany({
      data: [
        {
          title: 'End-to-end types, from Postgres to Angular',
          content:
            'The Post shape you see rendered here was never hand-written: it is inferred from the Prisma schema through the tRPC router and lands in the component as a compile-time checked type.',
          published: true,
          authorId: author.id,
        },
        {
          title: 'Zod guards the API boundary',
          content:
            'Every tRPC input is parsed by a Zod schema, so invalid payloads fail loudly at the edge — and the parsed type flows to the client with zero duplication.',
          published: true,
          authorId: author.id,
        },
        {
          title: 'Draft: divergence demo checklist',
          content:
            'Change a Prisma field, run prisma generate, and watch TypeScript fail across the stack. Revert and it is green again. See README for the walkthrough.',
          published: false,
          authorId: author.id,
        },
      ],
    });
    console.log('Seeded 3 sample posts.');
  } else {
    console.log(`Posts already present (${existingPosts}); skipping sample data.`);
  }

  console.log(`Seed complete for author ${author.id}.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
