import type { FastifyInstance } from "fastify";
import type { PrismaClient } from "@prisma/client";
import { parseId } from "../utils/validation";
import { NotFoundError, ValidationError } from "../types/errors";

export async function blogRoutes(server: FastifyInstance, prisma: PrismaClient) {
  // GET /blogs - Get all blogs
  server.get("/blogs", async (_request, reply) => {
    const blogs = await prisma.blog.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return reply.send({ data: blogs });
  });

  // GET /blogs/:id - Get blog by id
  server.get<{ Params: { id: string } }>("/blogs/:id", async (request, reply) => {
    let id: number;
    try {
      id = parseId(request.params.id);
    } catch (error) {
      throw new ValidationError(error instanceof Error ? error.message : "id ต้องเป็นตัวเลข");
    }

    const blog = await prisma.blog.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!blog) {
      throw new NotFoundError("ไม่พบบล็อก");
    }

    return reply.send({ data: blog });
  });

  // POST /blogs - Create blog
  server.post<{
    Body: { title: string; content?: string | null; authorId?: number | null };
  }>("/blogs", async (request, reply) => {
    const { title, content, authorId } = request.body;

    if (!title || typeof title !== "string" || title.trim() === "") {
      throw new ValidationError("title จำเป็นต้องระบุ");
    }

    // Validate authorId if provided
    if (authorId !== undefined && authorId !== null) {
      if (typeof authorId !== "number" || authorId <= 0 || !Number.isInteger(authorId)) {
        throw new ValidationError("authorId ต้องเป็นตัวเลขที่เป็นจำนวนเต็มบวก");
      }
    }

    try {
      const createdBlog = await prisma.blog.create({
        data: {
          title: title.trim(),
          content: content?.trim() ?? null,
          authorId: authorId ?? null,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return reply.status(201).send({ data: createdBlog });
    } catch (error) {
      throw error;
    }
  });

  // PUT /blogs/:id - Update blog
  server.put<{
    Params: { id: string };
    Body: { title?: string; content?: string | null; authorId?: number | null };
  }>("/blogs/:id", async (request, reply) => {
    let id: number;
    try {
      id = parseId(request.params.id);
    } catch (error) {
      throw new ValidationError(error instanceof Error ? error.message : "id ต้องเป็นตัวเลข");
    }

    const { title, content, authorId } = request.body;

    if (title !== undefined && (typeof title !== "string" || title.trim() === "")) {
      throw new ValidationError("title ไม่สามารถเป็นค่าว่างได้");
    }

    if (authorId !== undefined && authorId !== null) {
      if (typeof authorId !== "number" || authorId <= 0 || !Number.isInteger(authorId)) {
        throw new ValidationError("authorId ต้องเป็นตัวเลขที่เป็นจำนวนเต็มบวก");
      }
    }

    try {
      const updateData: {
        title?: string;
        content?: string | null;
        authorId?: number | null;
      } = {};

      if (title !== undefined) {
        updateData.title = title.trim();
      }
      if (content !== undefined) {
        updateData.content = content?.trim() ?? null;
      }
      if (authorId !== undefined) {
        updateData.authorId = authorId;
      }

      const updatedBlog = await prisma.blog.update({
        where: { id },
        data: updateData,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return reply.send({ data: updatedBlog });
    } catch (error) {
      throw error;
    }
  });

  // DELETE /blogs/:id - Delete blog
  server.delete<{ Params: { id: string } }>("/blogs/:id", async (request, reply) => {
    let id: number;
    try {
      id = parseId(request.params.id);
    } catch (error) {
      throw new ValidationError(error instanceof Error ? error.message : "id ต้องเป็นตัวเลข");
    }

    try {
      await prisma.blog.delete({
        where: { id },
      });

      return reply.status(200).send({ message: "ลบข้อมูลสำเร็จ" });
    } catch (error) {
      throw error;
    }
  });
}
