import Fastify from 'fastify';
import cors from '@fastify/cors';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { appRouter } from './trpc/app.router.js';
import { createContext } from './trpc/context.js';

const app = Fastify({ logger: true });

// Register CORS
await app.register(cors, { origin: true });

// Register tRPC plugin
await app.register(fastifyTRPCPlugin, {
  trpcOptions: {
    router: appRouter,
    createContext,
  },
  // Required for tRPC v11 Fastify adapter to parse larger bodies
  maxBodySize: 1024 * 1024, // 1MB
});

// Health check endpoint (plain Fastify route, not tRPC)
app.get('/health', async () => ({ status: 'ok' }));

const port = Number(process.env.PORT ?? 3000);

const start = async (): Promise<void> => {
  try {
    await app.listen({ port, host: '0.0.0.0' });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

void start();