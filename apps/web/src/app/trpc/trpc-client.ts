import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@api/trpc/app.router';

/**
 * Base URL for the tRPC API.
 * Must match the API's PORT in apps/api/.env (default .env.example ships 3005).
 */
export const API_URL = 'http://localhost:3005';

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: API_URL,
    }),
  ],
});