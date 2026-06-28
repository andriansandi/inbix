export type HonoEnv = {
  Bindings: {
    DB: D1Database;
    R2_BUCKET: R2Bucket;
    CACHE: KVNamespace;
    ASSETS: Fetcher;
    ENVIRONMENT: string;
    APP_DOMAIN: string;
    CORS_ORIGIN: string;
    RATE_LIMIT_KV: KVNamespace;
    CLERK_SECRET_KEY: string;
    CLERK_PUBLISHABLE_KEY: string;
    VAPID_PUBLIC_KEY: string;
    VAPID_PRIVATE_KEY: string;
    VAPID_SUBJECT: string;
  };
  Variables: {
    requestId: string;
    userId?: string;
  };
};

export type EmailEnv = {
  Bindings: {
    DB: D1Database;
    R2_BUCKET: R2Bucket;
    CACHE: KVNamespace;
    APP_DOMAIN: string;
    VAPID_PUBLIC_KEY: string;
    VAPID_PRIVATE_KEY: string;
    VAPID_SUBJECT: string;
  };
};
