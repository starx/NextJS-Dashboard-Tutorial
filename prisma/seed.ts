import { users, customers, invoices, revenue } from "@/lib/placeholder-data";

import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";

async function seedUsers() {
    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await prisma.user.create({
        data: {
          ...user,
          password: hashedPassword,
        },
      });
    }
}

async function main() {
    await seedUsers();
    await prisma.customer.createMany({ data: customers });
    await prisma.invoice.createMany({ data: invoices });
    await prisma.revenue.createMany({ data: revenue });
}

main()
    .then(() => {
        console.log('Seeding complete.');
        return prisma.$disconnect();
    })
    .catch((e) => {
        console.error('Seeding error:', e);
        return prisma.$disconnect();
    });
  