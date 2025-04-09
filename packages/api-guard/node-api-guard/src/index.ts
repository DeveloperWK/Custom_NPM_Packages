import { NextFunction, Request, Response } from "express";
import * as fs from "fs";
import cron from "node-cron";
import * as path from "path";
import isOriginAllowedWithPort from "./OriginAllowedWithPort";
import generateLogEntry from "./generateLog";
import { deleteOldLogs, ensureLogDirectoryExists } from "./logManager";
import { LogDetails, NodeApiGuardOptions } from "./types";

const defaultOptions: NodeApiGuardOptions = {
  whitelist: [],
  blacklist: [],
  allowedUserAgents: [],
  allowedOrigins: [],
  rateLimit: {
    windowMs: 60000,
    maxRequests: 100,
    message: "Too many requests",
  },
  enableLogging: false,
  logToFile: false,
  logFilePath: "logs/access.log",
};

const rateLimitMap = new Map<string, number[]>();

const validateOptions = (options: Partial<typeof defaultOptions>) => {
  if (options.whitelist && !Array.isArray(options.whitelist)) {
    throw new Error("Invalid whitelist: must be an array");
  }
  if (options.blacklist && !Array.isArray(options.blacklist)) {
    throw new Error("Invalid blacklist: must be an array");
  }
  if (options.allowedOrigins && !Array.isArray(options.allowedOrigins)) {
    throw new Error("Invalid allowedOrigins: must be an array");
  }
  if (
    options.rateLimit?.windowMs &&
    typeof options.rateLimit.windowMs !== "number"
  ) {
    throw new Error("Invalid rateLimit.windowMs: must be a number");
  }
};

const nodeApiGuard = (options: Partial<typeof defaultOptions> = {}) => {
  validateOptions(options);

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    whitelist: options.whitelist ?? defaultOptions.whitelist,
    blacklist: options.blacklist ?? defaultOptions.blacklist,
    allowedUserAgents:
      options.allowedUserAgents ?? defaultOptions.allowedUserAgents,
    allowedOrigins: options.allowedOrigins ?? defaultOptions.allowedOrigins,
    rateLimit: {
      windowMs:
        options.rateLimit?.windowMs ?? defaultOptions.rateLimit.windowMs,
      maxRequests:
        options.rateLimit?.maxRequests ?? defaultOptions.rateLimit.maxRequests,
      message: options.rateLimit?.message ?? defaultOptions.rateLimit.message,
    },
    logFilePath: options.logFilePath ?? defaultOptions.logFilePath,
  };

  if (mergedOptions.logToFile) {
    const logDir = path.dirname(mergedOptions.logFilePath || "");
    ensureLogDirectoryExists(logDir);

    const safeLogFilePath = path.resolve(
      process.cwd(),
      mergedOptions.logFilePath || ""
    );
    if (!safeLogFilePath.startsWith(process.cwd())) {
      throw new Error(
        "Invalid log file path: potential directory traversal attack"
      );
    }
    mergedOptions.logFilePath = safeLogFilePath;

    cron.schedule("0 0 * * *", () => {
      deleteOldLogs(logDir);
    });
  }

  return (req: Request, res: Response, next: NextFunction): void => {
    const requestId = Math.random().toString(36).substring(7);
    // Skip middleware for favicon requests
    if (req.url === "/favicon.ico") {
      return next();
    }
    // Skip middleware for OPTIONS requests
    if (req.method === "OPTIONS") {
      return next();
    }
    const ip = (req.ip || req.socket.remoteAddress || "").replace(
      "::ffff:",
      ""
    );

    const ua = req.headers["user-agent"] || "";
    const host = req.get("host");
    const protocol = req.protocol;
    const currentOrigin = `${protocol}://${host}`;
    const origin =
      req.headers["origin"] || req.headers["referer"] || currentOrigin || "";

    const startTime = Date.now();

    const logMessage = (message: string, statusCode?: number) => {
      const endTime = Date.now();
      const duration = endTime - startTime;

      const sanitizedUrl = req.originalUrl.replace(
        /(token|password|api_key)=([^&]+)/gi,
        "$1=***"
      );

      const logDetails: LogDetails = {
        ip: ip,
        method: req.method,
        url: sanitizedUrl,
        statusCode: req.statusCode || statusCode,
        duration: duration,
        message: message,
        origin: origin,
        originalUrl: req.originalUrl,
        requestId: requestId,
      };
      const logEntry = generateLogEntry(logDetails);

      if (mergedOptions.enableLogging) {
        console.log(logEntry);
      }

      if (mergedOptions.logToFile) {
        fs.appendFileSync(
          mergedOptions.logFilePath || "logs/access.log",
          logEntry + "\n"
        );
      }
    };

    const MAX_BODY_SIZE = 10 * 1024;
    if (
      req.headers["content-length"] &&
      parseInt(req.headers["content-length"], 10) > MAX_BODY_SIZE
    ) {
      logMessage("Request too large", 413);
      res.status(413).json({ message: "Request entity too large" });
      return;
    }

    if (
      Array.isArray(mergedOptions.blacklist) &&
      mergedOptions.blacklist.includes(ip)
    ) {
      logMessage("Forbidden: IP is blacklisted", 403);
      res.status(403).json({ message: "Forbidden: IP is blacklisted" });
      return;
    }

    if (
      Array.isArray(mergedOptions.whitelist) &&
      mergedOptions.whitelist.length > 0 &&
      !mergedOptions.whitelist.includes(ip)
    ) {
      logMessage("Forbidden: IP is not whitelisted", 403);
      res.status(403).json({ message: "Forbidden: IP is not whitelisted" });
      return;
    }

    if (
      Array.isArray(mergedOptions.allowedUserAgents) &&
      mergedOptions.allowedUserAgents.length > 0 &&
      !mergedOptions.allowedUserAgents.some((agent) => ua.includes(agent))
    ) {
      logMessage("Forbidden: User agent is not allowed", 403);
      res.status(403).json({ message: "Forbidden: User agent is not allowed" });
      return;
    }

    if (
      mergedOptions.allowedOrigins &&
      mergedOptions.allowedOrigins.length > 0 &&
      !mergedOptions.allowedOrigins.includes("*")
    ) {
      const allowedOrigins = isOriginAllowedWithPort(
        origin,
        mergedOptions.allowedOrigins as string[]
      );
      if (!allowedOrigins) {
        logMessage(`Forbidden: Origin is not allowed ${origin}`, 403);
        res.status(403).json({ message: "Forbidden: Origin is not allowed" });
        return;
      }
    }

    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );

    const now = Date.now();
    let ipData = rateLimitMap.get(ip) || [];

    ipData = ipData.filter(
      (timestamp) => now - timestamp < mergedOptions.rateLimit.windowMs
    );
    console.log(`IP: ${ip}, Current Requests: ${ipData.length}`);

    if (ipData.length >= mergedOptions.rateLimit.maxRequests) {
      logMessage("Rate limit exceeded", 429);
      res.status(429).json({ error: mergedOptions.rateLimit.message });
      return;
    }

    ipData.push(now);
    rateLimitMap.set(ip, ipData);

    const originalSend = res.send;
    res.send = function (body?: any): any {
      const statusCode = res.statusCode;
      logMessage(`Response sent`, statusCode);
      return originalSend.call(this, body);
    };

    next();
  };
};

setInterval(() => {
  const now = Date.now();
  for (const [ip, timestamps] of rateLimitMap.entries()) {
    const filtered = timestamps.filter(
      (timestamp) => now - timestamp < defaultOptions.rateLimit.windowMs
    );
    if (filtered.length === 0) {
      console.log(`Deleting expired IP: ${ip}`);
      rateLimitMap.delete(ip);
    } else {
      rateLimitMap.set(ip, filtered);
    }
  }
}, defaultOptions.rateLimit.windowMs);
export default nodeApiGuard;
