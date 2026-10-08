import { z } from 'zod';
import { initTRPC } from '@trpc/server';
import type { Context } from './context.js';

const t = initTRPC.context<Context>().create();

/**
 * Public procedure — no auth, just exposes the context.
 * Auth is deliberately omitted for this template (mock user "user-123" used in mutations).
 */
const publicProcedure = t.procedure;

export const appRouter = t.router({
  hello: publicProcedure
    .input(z.object({ name: z.string() }))
    .output(z.object({ greeting: z.string() }))
    .query(({ input }) => {
      return { greeting: `Hello, ${input.name}!` };
    }),

  createPost: publicProcedure
    .input(
      z.object({
        title: z.string(),
        content: z.string().optional(),
        published: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // No explicit .output schema — let the Prisma return type flow.
      // This demonstrates DB types crossing the wire directly to the client.
      const post = await ctx.prisma.post.create({
        data: {
          title: input.title,
          content: input.content,
          published: input.published ?? false,
          author: {
            connect: { id: 'user-123' },
          },
        },
      });
      return post;
    }),

  getPosts: publicProcedure
    .input(z.object({ published: z.boolean().optional() }))
    .query(async ({ ctx, input }) => {
      // No explicit .output schema — Prisma return type flows to client.
      const where = input.published !== undefined ? { published: input.published } : {};
      const posts = await ctx.prisma.post.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });
      return posts;
    }),
});

export type AppRouter = typeof appRouter;