# Lean TypeScript API

API Server ที่สร้างด้วย TypeScript, Fastify, และ Prisma

## โครงสร้างโปรเจค

```
src/
├── lib/              # Library และ utilities หลัก
│   ├── prisma.ts     # Prisma Client singleton
│   └── env.ts        # Environment variables validation
├── routes/           # API routes
│   ├── user.routes.ts
│   ├── blog.routes.ts
│   └── product.routes.ts
├── types/            # Type definitions
│   └── errors.ts     # Custom error types
├── utils/            # Utility functions
│   ├── error-handler.ts  # Global error handler
│   └── validation.ts     # Validation utilities
└── index.ts          # Main server file
```

## การติดตั้ง

1. ติดตั้ง dependencies:
```bash
npm install
```

2. สร้างไฟล์ `.env` จาก `.env.example`:
```bash
cp .env.example .env
```

3. ตั้งค่า `DATABASE_URL` ในไฟล์ `.env`

4. Generate Prisma Client:
```bash
npm run prisma:generate
```

5. สร้าง database schema:
```bash
npm run prisma:db-push
# หรือ
npm run prisma:migrate
```

## การใช้งาน

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Production
```bash
npm run build
npm start
```

## API Endpoints

### Users
- `GET /users` - ดึงข้อมูลผู้ใช้ทั้งหมด
- `GET /users/:id` - ดึงข้อมูลผู้ใช้ตาม id
- `POST /users` - สร้างผู้ใช้ใหม่
- `PUT /users/:id` - อัปเดตข้อมูลผู้ใช้
- `DELETE /users/:id` - ลบผู้ใช้

### Blogs
- `GET /blogs` - ดึงข้อมูลบล็อกทั้งหมด
- `GET /blogs/:id` - ดึงข้อมูลบล็อกตาม id
- `POST /blogs` - สร้างบล็อกใหม่
- `PUT /blogs/:id` - อัปเดตข้อมูลบล็อก
- `DELETE /blogs/:id` - ลบบล็อก

### Products
- `GET /products` - ดึงข้อมูลสินค้าทั้งหมด
- `GET /products/:id` - ดึงข้อมูลสินค้าตาม id
- `POST /products` - สร้างสินค้าใหม่
- `PUT /products/:id` - อัปเดตข้อมูลสินค้า
- `DELETE /products/:id` - ลบสินค้า

### Health Check
- `GET /health` - ตรวจสอบสถานะเซิร์ฟเวอร์

## Features

- ✅ TypeScript with strict mode
- ✅ Prisma ORM with MySQL
- ✅ Fastify web framework
- ✅ Centralized error handling
- ✅ Input validation
- ✅ Environment variables validation
- ✅ Graceful shutdown
- ✅ Structured project organization

## Best Practices

- **Error Handling**: ใช้ centralized error handler ที่จัดการ Prisma errors และ custom errors
- **Validation**: ใช้ utility functions สำหรับ validation
- **Type Safety**: ใช้ TypeScript strict mode และ type definitions
- **Code Organization**: แยก concerns ตามโครงสร้างโฟลเดอร์
- **Environment Variables**: ใช้ env validation เพื่อป้องกัน runtime errors
