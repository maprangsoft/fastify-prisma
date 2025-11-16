import type { FastifyInstance } from "fastify";
import type { PrismaClient } from "@prisma/client";
import { parseId } from "../utils/validation";
import { NotFoundError, ValidationError } from "../types/errors";

export async function productRoutes(server: FastifyInstance, prisma: PrismaClient) {
  // GET /products - Get all products
  server.get("/products", async (_request, reply) => {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    return reply.send({ success: true, message: "ดึงข้อมูลสินค้าสำเร็จ 200", data: products });
  });

  // GET /products/:id - Get product by id
  server.get<{ Params: { id: string } }>("/products/:id", async (request, reply) => {
    let id: number;
    try {
      id = parseId(request.params.id);
    } catch (error) {
      throw new ValidationError(error instanceof Error ? error.message : "id ต้องเป็นตัวเลข");
    }

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundError("ไม่พบสินค้า");
    }

    return reply.send({ data: product });
  });

  // POST /products - Create product
  server.post<{
    Body: { name: string; price: number };
  }>("/products", async (request, reply) => {
    const { name, price } = request.body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      throw new ValidationError("name จำเป็นต้องระบุ");
    }

    if (typeof price !== "number" || price < 0 || !Number.isInteger(price)) {
      throw new ValidationError("price ต้องเป็นตัวเลขที่เป็นจำนวนเต็มบวกหรือศูนย์");
    }

    try {
      const createdProduct = await prisma.product.create({
        data: {
          name: name.trim(),
          price,
        },
      });

      return reply.status(201).send({ data: createdProduct });
    } catch (error) {
      throw error;
    }
  });

  // PUT /products/:id - Update product
  server.put<{
    Params: { id: string };
    Body: { name?: string; price?: number };
  }>("/products/:id", async (request, reply) => {
    let id: number;
    try {
      id = parseId(request.params.id);
    } catch (error) {
      throw new ValidationError(error instanceof Error ? error.message : "id ต้องเป็นตัวเลข");
    }

    const { name, price } = request.body;

    if (name !== undefined && (typeof name !== "string" || name.trim() === "")) {
      throw new ValidationError("name ไม่สามารถเป็นค่าว่างได้");
    }

    if (price !== undefined && (typeof price !== "number" || price < 0 || !Number.isInteger(price))) {
      throw new ValidationError("price ต้องเป็นตัวเลขที่เป็นจำนวนเต็มบวกหรือศูนย์");
    }

    try {
      const updateData: { name?: string; price?: number } = {};
      if (name !== undefined) {
        updateData.name = name.trim();
      }
      if (price !== undefined) {
        updateData.price = price;
      }

      const updatedProduct = await prisma.product.update({
        where: { id },
        data: updateData,
      });

      return reply.send({ data: updatedProduct });
    } catch (error) {
      throw error;
    }
  });

  // DELETE /products/:id - Delete product
  server.delete<{ Params: { id: string } }>("/products/:id", async (request, reply) => {
    let id: number;
    try {
      id = parseId(request.params.id);
    } catch (error) {
      throw new ValidationError(error instanceof Error ? error.message : "id ต้องเป็นตัวเลข");
    }

    try {
      await prisma.product.delete({
        where: { id },
      });

      return reply.status(200).send({ message: "ลบข้อมูลสำเร็จ" });
    } catch (error) {
      throw error;
    }
  });
}
