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
  };
  Variables: {
    requestId: string;
  };
};

export type EmailEnv = {
  Bindings: {
    DB: D1Database;
    R2_BUCKET: R2Bucket;
    CACHE: KVNamespace;
    APP_DOMAIN: string;
  };
};
