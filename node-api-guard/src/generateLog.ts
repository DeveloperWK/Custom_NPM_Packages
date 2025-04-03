import { LogDetails, LogMetadata } from "./types";
const getEmojiAndTypeForStatusCode = (statusCode?: number): LogMetadata => {
  if (!statusCode) return { emoji: "⚪", type: "Info" }; // Unknown status code
  if (statusCode >= 200 && statusCode < 300)
    return { emoji: "🟢", type: "Info" }; // Success
  if (statusCode >= 400 && statusCode < 500)
    return { emoji: "🟡", type: "Warning" }; // Client error
  if (statusCode >= 500) return { emoji: "🔴", type: "Error" }; // Server error
  return { emoji: "⚪", type: "Info" }; // Default
};

const formatDate = (date: Date): string => {
  const pad = (num: number): string => num.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds()
  )}`;
};

function getDurationInMilliseconds(start: [number, number]): number {
  const diff = process.hrtime(start);
  return diff[0] * 1e3 + diff[1] * 1e-6;
}

const generateLogEntry = (
  {
    ip,
    method,
    url,
    statusCode,
    duration,
    message,
    origin,
    originalUrl,
    requestId,
  }: LogDetails,
  emoji: string,
  type: string
): string => {
  return `[${formatDate(
    new Date()
  )}] ${emoji} [${type}] - ${ip} - ${method} - ${url} - ${origin} - ${
    statusCode || "N/A"
  }- ${originalUrl} - ${duration}ms - ${message} || [Request ID: ${requestId}] Middleware invoked for IP: ${ip}`;
};

function loggerMiddleware({
  ip,
  method,
  url,
  statusCode,
  duration,
  message,
  origin,
  originalUrl,
  requestId,
}: LogDetails) {
  const startTime = process.hrtime();

  const durationInMs = getDurationInMilliseconds(startTime);

  const { emoji, type } = getEmojiAndTypeForStatusCode(statusCode);

  const logDetails: LogDetails = {
    ip,
    method,
    url,
    statusCode,
    duration,
    message,
    origin,
    originalUrl,
    requestId,
  };

  const logEntry = generateLogEntry(logDetails, emoji, type);
  return logEntry;
}

export default loggerMiddleware;
