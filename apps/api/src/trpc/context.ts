import type { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';
import { prisma } from '../db.js';

/**
 * Creates the tRPC context for each request.
 * Exposes the Prisma client for database access.
 * No authentication is included — the mock user "user-123" is used directly in procedures.
 */
export function createContext(_opts: CreateFastifyContextOptions) {
  return { prisma };
}

export type Context = Awaited<ReturnType<typeof createContext>>;