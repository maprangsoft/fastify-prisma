import type { FastifyInstance, FastifyError } from "fastify";
import { Prisma } from "@prisma/client";
import { AppError, NotFoundError, ConflictError, ValidationError } from "../types/errors";

export function setupErrorHandler(server: FastifyInstance) {
  server.setErrorHandler((error: FastifyError, _request, reply) => {
    // Handle known AppError
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        error: {
          code: error.code ?? "APP_ERROR",
          message: error.message,
        },
      });
    }

    // Handle Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case "P2002":
          return reply.status(409).send({
            error: {
              code: "CONFLICT",
              message: "ข้อมูลซ้ำกับที่มีอยู่แล้ว",
            },
          });
        case "P2025":
          return reply.status(404).send({
            error: {
              code: "NOT_FOUND",
              message: "ไม่พบข้อมูลที่ต้องการ",
            },
          });
        default:
          server.log.error({ err: error }, "Prisma error");
          return reply.status(500).send({
            error: {
              code: "DATABASE_ERROR",
              message: "เกิดข้อผิดพลาดในการเข้าถึงฐานข้อมูล",
            },
          });
      }
    }

    // Handle Prisma validation errors
    if (error instanceof Prisma.PrismaClientValidationError) {
      return reply.status(400).send({
        error: {
          code: "VALIDATION_ERROR",
          message: "ข้อมูลไม่ถูกต้อง",
        },
      });
    }

    // Log unexpected errors
    server.log.error({ err: error }, "Unexpected error");

    // Return generic error in production
    const isDevelopment = process.env.NODE_ENV === "development";
    return reply.status(error.statusCode ?? 500).send({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: isDevelopment ? error.message : "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์",
        ...(isDevelopment && { stack: error.stack }),
      },
    });
  });

  // Handle 404
  server.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      error: {
        code: "NOT_FOUND",
        message: `ไม่พบ route: ${request.method} ${request.url}`,
      },
    });
  });
}

export { AppError, NotFoundError, ConflictError, ValidationError };
