import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@api/trpc/app.router';

/**
 * Base URL for the tRPC API.
 * Must match the API's PORT (local .env uses 3005; fresh clones default to 3000 — README will document).
 */
export const API_URL = 'http://localhost:3005';

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: API_URL,
    }),
  ],
});