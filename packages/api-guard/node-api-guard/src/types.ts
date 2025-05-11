export interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  message?: string;
}

export interface NodeApiGuardOptions {
  whitelist?: string[];
  blacklist?: string[];
  allowedUserAgents?: string[];
  allowedOrigins?: string[];
  rateLimit: RateLimitOptions;
  enableLogging?: boolean;
  logToFile?: boolean;
  logFilePath?: string;
  MAX_BODY_SIZE?: number;
}

export interface LogDetails {
  ip: string;
  method: string;
  url: string;
  statusCode?: number;
  duration: number;
  message: string;
  origin: string | undefined;
  originalUrl: string;
  requestId: string;
}

export type LogMetadata = {
  emoji: string;
  type: "Info" | "Warning" | "Error";
};
