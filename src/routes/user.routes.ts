import type { FastifyInstance } from "fastify";
import type { PrismaClient } from "@prisma/client";
import { parseId, validateEmail } from "../utils/validation";
import { NotFoundError, ValidationError } from "../types/errors";

export async function userRoutes(server: FastifyInstance, prisma: PrismaClient) {
  // GET /users - Get all users
  server.get("/users", async (_request, reply) => {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });
    return reply.send({ data: users });
  });

  // GET /users/:id - Get user by id
  server.get<{ Params: { id: string } }>("/users/:id", async (request, reply) => {
    let id: number;
    try {
      id = parseId(request.params.id);
    } catch (error) {
      throw new ValidationError(error instanceof Error ? error.message : "id ต้องเป็นตัวเลข");
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundError("ไม่พบผู้ใช้");
    }

    return reply.send({ data: user });
  });

  // POST /users - Create user
  server.post<{
    Body: { email: string; name?: string | null };
  }>("/users", async (request, reply) => {
    const { email, name } = request.body;

    if (!email || typeof email !== "string" || email.trim() === "") {
      throw new ValidationError("email จำเป็นต้องระบุ");
    }

    try {
      validateEmail(email);
    } catch (error) {
      throw new ValidationError(error instanceof Error ? error.message : "รูปแบบ email ไม่ถูกต้อง");
    }

    try {
      const createdUser = await prisma.user.create({
        data: {
          email: email.trim(),
          name: name?.trim() ?? null,
        },
      });

      return reply.status(201).send({ data: createdUser });
    } catch (error) {
      // Prisma unique constraint error will be handled by error handler
      throw error;
    }
  });

  // PUT /users/:id - Update user
  server.put<{
    Params: { id: string };
    Body: { email?: string; name?: string | null };
  }>("/users/:id", async (request, reply) => {
    let id: number;
    try {
      id = parseId(request.params.id);
    } catch (error) {
      throw new ValidationError(error instanceof Error ? error.message : "id ต้องเป็นตัวเลข");
    }

    const { email, name } = request.body;

    // Validate email if provided
    if (email !== undefined) {
      if (typeof email !== "string" || email.trim() === "") {
        throw new ValidationError("email ไม่สามารถเป็นค่าว่างได้");
      }
      try {
        validateEmail(email);
      } catch (error) {
        throw new ValidationError(error instanceof Error ? error.message : "รูปแบบ email ไม่ถูกต้อง");
      }
    }

    try {
      const updateData: { email?: string; name?: string | null } = {};
      if (email !== undefined) {
        updateData.email = email.trim();
      }
      if (name !== undefined) {
        updateData.name = name?.trim() ?? null;
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData,
      });

      return reply.send({ data: updatedUser });
    } catch (error) {
      // Prisma errors will be handled by error handler
      throw error;
    }
  });

  // DELETE /users/:id - Delete user
  server.delete<{ Params: { id: string } }>("/users/:id", async (request, reply) => {
    let id: number;
    try {
      id = parseId(request.params.id);
    } catch (error) {
      throw new ValidationError(error instanceof Error ? error.message : "id ต้องเป็นตัวเลข");
    }

    try {
      await prisma.user.delete({
        where: { id },
      });

      return reply.status(200).send({ message: "ลบข้อมูลสำเร็จ" });
    } catch (error) {
      // Prisma errors will be handled by error handler
      throw error;
    }
  });
}
