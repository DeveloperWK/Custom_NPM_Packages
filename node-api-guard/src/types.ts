// Rate limit configuration
export interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum number of requests allowed in the window
  message?: string; // Error message when rate limit is exceeded
}

// Node API Guard options
export interface NodeApiGuardOptions {
  whitelist?: string[]; // List of whitelisted IPs
  blacklist?: string[]; // List of blacklisted IPs
  allowedUserAgents?: string[]; // List of allowed user agents
  allowedOrigins?: string[]; // List of allowed origins
  rateLimit: RateLimitOptions; // Rate limiting configuration (required)
  enableLogging?: boolean; // Enable logging to console
  logToFile?: boolean; // Enable writing logs to a file
  logFilePath?: string; // Path to the log file
}
// Define a type for the log entry details
export interface LogDetails {
  ip: string;
  method: string;
  url: string;
  statusCode?: number; // Optional because it might not always be available
  duration: number; // Duration in milliseconds
  message: string;
  origin: string | undefined;
  originalUrl: string;
  requestId: string;
}

// Define a type for the log metadata (emoji and type)
export type LogMetadata = {
  emoji: string;
  type: "Info" | "Warning" | "Error";
};
