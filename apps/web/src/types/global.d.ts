// Type declarations for Node.js process.env to satisfy noPropertyAccessFromIndexSignature
// when type-checking API source files via path alias.

declare namespace NodeJS {
  interface ProcessEnv {
    readonly DATABASE_URL: string;
    readonly PORT?: string;
    readonly NODE_ENV?: 'development' | 'production' | 'test';
    [key: string]: string | undefined;
  }
}