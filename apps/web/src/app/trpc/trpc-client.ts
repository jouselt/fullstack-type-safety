import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@api/trpc/app.router';
import { environment } from '../../environments/environment';

/**
 * Base URL for the tRPC API.
 * Development default ships in src/environments/environment.ts
 * (localhost:3005, matching the API's PORT in apps/api/.env);
 * production builds replace it via fileReplacements in angular.json
 * with the deployed API origin.
 */
export const API_URL = environment.apiUrl;

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: API_URL,
    }),
  ],
});