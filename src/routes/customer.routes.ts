import type { FastifyInstance } from "fastify";
import type { PrismaClient } from "@prisma/client";


export async function customerRoutes(server: FastifyInstance, prisma: PrismaClient) {
  // GET /customers - Get all customers
  server.get("/customers", async (_request, reply) => {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
    });
    return reply.send({ success: true, message: "ดึงข้อมูลลูกค้าสำเร็จ", data: customers });
  });

}