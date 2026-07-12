import { PrismaClient, AssociationStatus, AccessCodeStatus, UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean the database
  await prisma.notification.deleteMany();
  await prisma.maintenanceRequest.deleteMany();
  await prisma.document.deleteMany();
  await prisma.correctionRequest.deleteMany();
  await prisma.codeRequest.deleteMany();
  await prisma.user.deleteMany();
  await prisma.accessCode.deleteMany();
  await prisma.association.deleteMany();

  // 1. Create Associations
  const ieee = await prisma.association.create({
    data: {
      name: 'IEEE - Global Technological Institute',
      code: 'IEEE',
      email: 'ieee-support@ieee.org',
      phone: '+1414141414',
      status: AssociationStatus.ACTIVE,
    },
  });

  const nar = await prisma.association.create({
    data: {
      name: 'NAR - National Realtors Association',
      code: 'NAR',
      email: 'nar-support@nar.realtor',
      phone: '+1515151515',
      status: AssociationStatus.ACTIVE,
    },
  });

  const ama = await prisma.association.create({
    data: {
      name: 'AMA - Allied Medical Academy',
      code: 'AMA',
      email: 'ama-support@ama-assn.org',
      phone: '+1616161616',
      status: AssociationStatus.ACTIVE,
    },
  });

  const asa = await prisma.association.create({
    data: {
      name: 'ASA - Advanced Science Alliance',
      code: 'ASA',
      email: 'asa-support@sciencealliance.org',
      phone: '+1717171717',
      status: AssociationStatus.ACTIVE,
    },
  });

  console.log('Associations seeded successfully.');

  // 2. Create Access Codes
  const partner99 = await prisma.accessCode.create({
    data: {
      associationId: ieee.id,
      code: 'PARTNER-99',
      memberName: 'Manish Suthar',
      email: 'manis@gmail.com',
      phone: '1414141414',
      status: AccessCodeStatus.PENDING,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days expiry
    },
  });

  const memberNar = await prisma.accessCode.create({
    data: {
      associationId: nar.id,
      code: 'REALTOR-101',
      memberName: 'Jane Doe',
      email: 'jane.doe@example.com',
      phone: '5151515151',
      status: AccessCodeStatus.PENDING,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('Access codes seeded successfully.');

  // 3. Create Default Platform Admin
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
  const adminUser = await prisma.user.create({
    data: {
      firstName: 'System',
      lastName: 'Admin',
      email: 'admin@associationmanagement.com',
      phone: '+1000000000',
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  // 4. Create an Association Manager for IEEE
  const managerPasswordHash = await bcrypt.hash('Manager@123', 10);
  const managerUser = await prisma.user.create({
    data: {
      associationId: ieee.id,
      firstName: 'IEEE',
      lastName: 'Manager',
      email: 'manager@ieee.org',
      phone: '+1111111111',
      passwordHash: managerPasswordHash,
      role: UserRole.MANAGER,
      status: UserStatus.ACTIVE,
    },
  });

  console.log('Users (Admin & Manager) seeded successfully.');
  console.log('Database seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
