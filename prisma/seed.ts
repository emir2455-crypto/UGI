import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@fleetview.local";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "ChangeMoi123!";
  const helperEmail = process.env.SEED_HELPER_EMAIL || "renfort@fleetview.local";
  const helperPassword = process.env.SEED_HELPER_PASSWORD || "Renfort123!";

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Propriétaire",
      role: "ADMIN",
      passwordHash: await bcrypt.hash(adminPassword, 10),
    },
  });

  const helper = await prisma.user.upsert({
    where: { email: helperEmail },
    update: {},
    create: {
      email: helperEmail,
      name: "Renfort famille",
      role: "HELPER",
      passwordHash: await bcrypt.hash(helperPassword, 10),
    },
  });

  console.log("Seed terminé.");
  console.log(`Admin: ${admin.email} / mot de passe: ${adminPassword}`);
  console.log(`Renfort: ${helper.email} / mot de passe: ${helperPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
