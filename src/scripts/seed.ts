import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

async function main() {
  const users = [
    { email: "admin@empresa.com", name: "Admin", role: "ADMIN", pass: "Admin!123" },
    { email: "empleado1@empresa.com", name: "Empleado 1", role: "VENTAS", pass: "Empleado1!123" },
    { email: "empleado2@empresa.com", name: "Empleado 2", role: "VENTAS", pass: "Empleado2!123" },
    { email: "empleado3@empresa.com", name: "Empleado 3", role: "VENTAS", pass: "Empleado3!123" },
  ];

  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.pass, 10);
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { email: u.email, name: u.name, role: u.role as any, passwordHash },
    });
  }

  console.log("\nUsuarios creados:");
  users.forEach(u => console.log(`  ${u.email} / ${u.pass}`));
}

main().finally(() => prisma.$disconnect());
