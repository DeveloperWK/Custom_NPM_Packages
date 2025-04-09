import * as fs from "fs";
import * as path from "path";

export function deleteOldLogs(logDirectory: string): void {
  const currentTime = Date.now();
  const oneDayInMilliseconds = 24 * 60 * 60 * 1000;

  fs.readdir(logDirectory, (err, files) => {
    if (err) {
      console.error("Error reading log directory:", err);
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(logDirectory, file);

      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error(`Error getting file stats for ${file}:`, err);
          return;
        }

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

export function ensureLogDirectoryExists(logDirectory: string): void {
  if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory, { recursive: true });
  }
}
