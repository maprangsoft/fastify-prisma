# Prisma Workflow Guide

## เมื่อสร้างตารางใหม่ใน Prisma Schema

เมื่อคุณเพิ่ม model ใหม่ใน `prisma/schema.prisma` คุณต้อง regenerate Prisma Client เพื่อให้ TypeScript รู้จัก property ใหม่

### วิธีที่ 1: ใช้ Script อัตโนมัติ (แนะนำ)

```bash
# หลังจากแก้ไข schema.prisma แล้ว
npm run prisma:generate
```

### วิธีที่ 2: ใช้ Watch Mode (สำหรับการพัฒนาต่อเนื่อง)

```bash
# เปิด terminal แยกและรันคำสั่งนี้
npm run prisma:watch
```

คำสั่งนี้จะ watch `schema.prisma` และ regenerate Prisma Client อัตโนมัติทุกครั้งที่มีการเปลี่ยนแปลง

### วิธีที่ 3: ใช้ Prisma Extension ใน VS Code

หากคุณใช้ VS Code และติดตั้ง Prisma extension แล้ว:
- Extension จะ generate Prisma Client อัตโนมัติเมื่อคุณ save `schema.prisma`
- ตรวจสอบว่าไฟล์ `.vscode/settings.json` มี `"prisma.generateOnSave": true`

### Scripts ที่มีให้ใช้งาน

- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:watch` - Watch schema และ regenerate อัตโนมัติ
- `npm run prisma:db-push` - Push schema ไปยัง database และ generate Prisma Client
- `npm run prisma:migrate` - สร้าง migration และ generate Prisma Client
- `npm run postinstall` - Generate Prisma Client อัตโนมัติหลังจาก npm install

### หมายเหตุ

- Prisma Client จะถูก generate อัตโนมัติเมื่อรัน `npm install` (ผ่าน postinstall script)
- Prisma Client จะถูก generate อัตโนมัติเมื่อรัน `npm run build` (ผ่าน build script)
- หาก TypeScript ใน IDE ยังแสดง error หลังจาก generate แล้ว ให้ลอง:
  1. Restart TypeScript Server ใน VS Code (Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server")
  2. หรือ restart IDE
