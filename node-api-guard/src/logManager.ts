import * as fs from "fs";
import * as path from "path";

/**
 * Deletes log files older than 24 hours from the specified directory.
 * @param logDirectory The directory containing the log files.
 */
export function deleteOldLogs(logDirectory: string): void {
  const currentTime = Date.now();
  const oneDayInMilliseconds = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  fs.readdir(logDirectory, (err, files) => {
    if (err) {
      console.error("Error reading log directory:", err);
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(logDirectory, file);

      // Get file stats (e.g., modification time)
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error(`Error getting file stats for ${file}:`, err);
          return;
        }

        // Check if the file is older than 24 hours
        if (currentTime - stats.mtime.getTime() > oneDayInMilliseconds) {
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error(`Error deleting file ${file}:`, err);
            } else {
              console.log(`Deleted old log file: ${file}`);
            }
          });
        }
      });
    });
  });
}

/**
 * Ensures the log directory exists. If it doesn't, creates it.
 * @param logDirectory The directory to ensure exists.
 */
export function ensureLogDirectoryExists(logDirectory: string): void {
  if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory, { recursive: true });
  }
}
