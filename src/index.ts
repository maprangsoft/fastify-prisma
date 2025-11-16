import fastify from "fastify";
import { prisma } from "./lib/prisma";
import { env } from "./lib/env";
import { setupErrorHandler } from "./utils/error-handler";
import { userRoutes } from "./routes/user.routes";
import { blogRoutes } from "./routes/blog.routes";
import { productRoutes } from "./routes/product.routes";
import { customerRoutes } from "./routes/customer.routes";
const server = fastify({
  logger: {
    level: env.NODE_ENV === "production" ? "info" : "debug",
  },
});

// Setup error handler
setupErrorHandler(server);

// Register routes
await userRoutes(server, prisma);
await blogRoutes(server, prisma);
await productRoutes(server, prisma);
await customerRoutes(server, prisma);

// Health check endpoint
server.get("/health", async (_request, reply) => {
  return reply.send({ status: "ok", timestamp: new Date().toISOString() });
});

// Graceful shutdown
let isShuttingDown = false;
const shutdown = async (signal: string) => {
  if (isShuttingDown) {
    return;
  }
  isShuttingDown = true;

  server.log.info(`Received ${signal}, shutting down server...`);

  // Force exit after 10 seconds if shutdown takes too long
  const forceExitTimer = setTimeout(() => {
    server.log.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10000);

  try {
    await server.close();
    await prisma.$disconnect();
    clearTimeout(forceExitTimer);
    server.log.info("Server shut down gracefully");
    process.exit(0);
  } catch (err) {
    clearTimeout(forceExitTimer);
    server.log.error({ err }, "Error during shutdown");
    process.exit(1);
  }
};

// Use once() to prevent multiple handlers
process.once("SIGTERM", () => shutdown("SIGTERM"));
process.once("SIGINT", () => shutdown("SIGINT"));

// Start server
const startServer = async () => {
  try {
    // Use localhost in development to reduce log noise, 0.0.0.0 in production
    const host = env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1";
    await server.listen({ port: env.PORT, host });
    server.log.info(`Environment: ${env.NODE_ENV}`);
  } catch (err) {
    server.log.error({ err }, "Error starting server");
    await prisma.$disconnect();
    process.exit(1);
  }
};

startServer();
