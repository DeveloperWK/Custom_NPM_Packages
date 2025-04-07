# **Node-API-Guard 🚀**

_A lightweight and flexible security middleware for Node.js applications_

## ✨ **Features**

- ✅ **Rate Limiting** – Prevents API abuse by limiting requests per IP.
- ✅ **Logging Support** – Enables request logging for monitoring and debugging.
- ✅ **IP Blacklisting** – Blocks access from specified IPs.
- ✅ **IP Whitelisting** – Allows access only from approved IPs.
- ✅ **File System Logging** – Logs request data to a file for audit purposes.
- ✅ **User-Agent Filtering** – Restricts access based on allowed user agents.
- ✅ **CORS Origin Control** – Limits requests to specific origins.
- ✅ **Automatic Log Cleanup** – Deletes log files older than 24 hours _(enabled by default)_.
- ✅ **Rate Limit Cleanup** – Clears expired rate limit records automatically _(enabled by default)_.

## 📌 **Installation**

```sh
npm install node-api-guard
```

## 🚀 **Usage**

### **CommonJS**

```js
const nodeApiGuard = require("node-api-guard").default;
const express = require("express");

const app = express();

app.use(
  nodeApiGuard({
    allowedOrigins: ["http://localhost:5000"],
    allowedUserAgents: ["chrome", "Mozilla"],
    logToFile: true,
    logFilePath: "./log/access.log",
    blacklist: ["http://malicious-site.com", "http://spam-site.com"],
    enableLogging: true,
    rateLimit: {
      maxRequests: 100,
      windowMs: 60000,
      message: "Too many requests from this IP, please try again later.",
    },
    whitelist: ["http://localhost:3000", "http://localhost:3000/api"],
  })
);

app.listen(3000, () => console.log("Server is running on port 3000"));
```

### **ES Modules**

```js
import nodeApiGuard from "node-api-guard";
import express from "express";

const app = express();

app.use(
  nodeApiGuard({
    allowedOrigins: ["http://localhost:5000"],
    allowedUserAgents: ["chrome", "Mozilla"],
    logToFile: true,
    logFilePath: "./log/access.log",
    blacklist: ["http://malicious-site.com", "http://spam-site.com"],
    enableLogging: true,
    rateLimit: {
      maxRequests: 100,
      windowMs: 60000,
      message: "Too many requests from this IP, please try again later.",
    },
    whitelist: ["http://localhost:3000", "http://localhost:3000/api"],
  })
);

app.listen(3000, () => console.log("Server is running on port 3000"));
```

## 🎯 **Default Behavior**

By default, `node-api-guard` ensures **optimized security and performance** with these built-in settings:

| Option                   | Default Value                                          |
| ------------------------ | ------------------------------------------------------ |
| `logToFile`              | `false`                                                |
| `logFilePath`            | `"./logs/access.log"`                                  |
| `enableLogging`          | `false`                                                |
| **`Auto Log Deletion`**  | ✅ **Enabled (Deletes logs older than 24 hours)**      |
| **`Rate Limit Cleanup`** | ✅ **Enabled (Automatically removes expired records)** |
| `rateLimit.maxRequests`  | `100`                                                  |
| `rateLimit.windowMs`     | `60000ms`                                              |
| `rateLimit.message`      | `"Too many requests."`                                 |

## 🛠 **TypeScript Support**

This middleware is fully compatible with TypeScript. Here's a usage example:

```ts
import express from "express";
import nodeApiGuard from "node-api-guard";

const app = express();

app.use(
  nodeApiGuard({
    allowedOrigins: ["http://localhost:5000"],
    allowedUserAgents: ["chrome", "Mozilla"],
    logToFile: true,
    logFilePath: "./log/access.log",
    blacklist: ["http://malicious-site.com", "http://spam-site.com"],
    enableLogging: true,
    rateLimit: {
      maxRequests: 100,
      windowMs: 60000,
      message: "Too many requests from this IP, please try again later.",
    },
    whitelist: ["http://localhost:3000", "http://localhost:3000/api"],
  })
);

app.listen(3000, () => console.log("Server is running on port 3000"));
```

---

## 🔥 **Automatic Security & Performance Enhancements**

### 🗑 **Automatic Log File Deletion (Enabled by Default)**

- **No manual setup required!** `node-api-guard` automatically removes logs older than **24 hours**.
- This helps **save storage space** and ensures **log files stay manageable**.

### 🔄 **Rate Limit Cleanup (Enabled by Default)**

- Expired rate limit records are automatically removed **to free up memory**.
- No need for manual intervention—ensures optimal performance!

---

### 🚀 **Why Use Node-API-Guard?**

✔️ **Enhances API Security** – Prevents abuse, spam, and unauthorized access.  
✔️ **Lightweight & Flexible** – Easily configurable for various security needs.  
✔️ **Easy to Integrate** – Works seamlessly with Express.  
✔️ **Customizable** – Modify settings to match your security requirements.  
✔️ **Automatic Cleanup** – Saves storage and improves performance.

## 💡Contribute or report issues on [GitHub](https://github.com/DeveloperWK/Custom_NPM_Packages/tree/main/node-api-guard)

### **What's New?**

🔥 **No extra setup required!** Your API is automatically optimized with:

- ✅ **24-hour log auto-deletion** _(enabled by default)_
- ✅ **Automatic rate limit cleanup** _(enabled by default)_
