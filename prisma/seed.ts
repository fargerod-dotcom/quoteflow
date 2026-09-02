import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "demo@quoteflow.test";

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name: "Demo Owner" },
  });

  await prisma.business.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      name: "Demo Plumbing Co",
      slug: "demo-plumbing-co",
      trade: "PLUMBING",
      serviceArea: "Within 20 miles of Springfield",
      ownerPhone: "+15551234567",
      hourlyRate: 95,
      calloutFee: 49,
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });

  console.log(`Seeded demo business. Sign in as ${email} and visit /r/demo-plumbing-co`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
