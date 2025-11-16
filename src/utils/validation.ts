export function parseId(id: string): number {
  const parsed = Number(id);
  if (Number.isNaN(parsed) || parsed <= 0 || !Number.isInteger(parsed)) {
    throw new Error("id ต้องเป็นตัวเลขที่เป็นจำนวนเต็มบวก");
  }
  return parsed;
}

export function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("รูปแบบ email ไม่ถูกต้อง");
  }
}
