import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const org = await prisma.organization.upsert({
    where: { slug: 'demo-school' },
    update: {},
    create: {
      name: 'Demo School',
      slug: 'demo-school',
      type: 'k12',
      address: { street: '123 Rizal St', barangay: 'San Antonio', city: 'Makati', province: 'Metro Manila', zipCode: '1200' },
      contactEmail: 'admin@demoschool.edu.ph',
      contactPhone: '09171234567',
      dpoName: 'Maria Santos',
      dpoEmail: 'dpo@demoschool.edu.ph',
    },
  });

  await prisma.schoolYear.upsert({
    where: { orgId_name: { orgId: org.id, name: '2025-2026' } },
    update: {},
    create: {
      orgId: org.id,
      name: '2025-2026',
      startDate: new Date('2025-06-01'),
      endDate: new Date('2026-03-31'),
      isCurrent: true,
    },
  });

  await prisma.user.upsert({
    where: { orgId_email: { orgId: org.id, email: 'admin@demoschool.edu.ph' } },
    update: {},
    create: {
      orgId: org.id,
      email: 'admin@demoschool.edu.ph',
      firstName: 'Maria',
      lastName: 'Santos',
      role: 'admin',
    },
  });

  console.log('Seed complete');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
