import bcrypt from 'bcrypt';
import prisma from '../../configs/prisma.client';
import logger from '../../configs/logger';

interface MockUser {
  email: string;
  name: string;
  phone_number: string;
  role_id: number;
  parent_id: number;
  department_id?: number;
  designation_id?: number;
  shift_id?: number;
  salary?: number;
  currency_code?: string;
  address: string;
  employee_id: string;
  joining_date: Date;
  reporting_to?: number;
  is_active: string;
}

const mockUsers: MockUser[] = [
  {
    email: 'hr.manager@mkx.com',
    name: 'HR Manager',
    phone_number: '+1-555-0101',
    role_id: 3,
    parent_id: 1,
    address: '123 HR Street',
    employee_id: 'EMP-001',
    salary: 80000,
    currency_code: 'USD',
    joining_date: new Date('2024-01-15'),
    is_active: 'Y',
  },
  {
    email: 'recruiter@mkx.com',
    name: 'Recruiter',
    phone_number: '+1-555-0102',
    role_id: 6,
    parent_id: 1,
    address: '456 Talent Ave',
    employee_id: 'EMP-002',
    salary: 60000,
    currency_code: 'USD',
    joining_date: new Date('2024-02-01'),
    is_active: 'Y',
  },
  {
    email: 'payroll.manager@mkx.com',
    name: 'Payroll Manager',
    phone_number: '+1-555-0103',
    role_id: 7,
    parent_id: 1,
    address: '789 Finance St',
    employee_id: 'EMP-003',
    salary: 75000,
    currency_code: 'USD',
    joining_date: new Date('2024-01-20'),
    is_active: 'Y',
  },
  {
    email: 'employee1@mkx.com',
    name: 'John Employee',
    phone_number: '+1-555-0104',
    role_id: 12,
    parent_id: 1,
    address: '321 Worker Rd',
    employee_id: 'EMP-004',
    salary: 50000,
    currency_code: 'USD',
    joining_date: new Date('2024-03-01'),
    is_active: 'Y',
  },
  {
    email: 'employee2@mkx.com',
    name: 'Jane Employee',
    phone_number: '+1-555-0105',
    role_id: 12,
    parent_id: 1,
    address: '654 Staff Ave',
    employee_id: 'EMP-005',
    salary: 52000,
    currency_code: 'USD',
    joining_date: new Date('2024-03-15'),
    is_active: 'Y',
  },
];

export const seedUsers = async () => {
  logger.info('🌱 Seeding users...');

  try {
    await createAdminUser();
    await createMockUsers();
  } catch (error) {
    logger.error('Error in seedUsers:', error);
    throw error;
  }
};

const createAdminUser = async () => {
  try {
    const existingAdmin = await prisma.users.findFirst({
      where: { email: 'admin@mkx.com' },
    });

    if (existingAdmin) {
      logger.info('⏭️  Admin user already exists. Skipping...');
      return;
    }

    const adminRole = await prisma.roles.findFirst({
      where: { name: 'Super Admin' },
    });

    const firstCompany = await prisma.companies.findFirst({
      where: { is_active: 'Y' },
    });

    if (!adminRole) {
      logger.warn('Admin role not found. Skipping admin user creation.');
      return;
    }

    if (!firstCompany) {
      logger.warn('No active companies found. Skipping admin user creation.');
      return;
    }

    const passwordHash = await bcrypt.hash('123456', 10);

    const adminUser = await prisma.users.create({
      data: {
        email: 'admin@mkx.com',
        role_id: adminRole.id,
        password_hash: passwordHash,
        name: 'Admin',
        parent_id: firstCompany.id,
        phone_number: '+91-9999999999',
        address: 'System Admin Address',
        employee_id: 'ADMIN001',
        joining_date: new Date('2024-01-01'),
        reporting_to: null,
        profile_image: null,
        last_login: null,
        is_active: 'Y',
        createdate: new Date(),
        createdby: 1,
        log_inst: 1,
      },
    });

    logger.info('✅ Admin user created successfully!');
    logger.info(`   ID: ${adminUser.id}`);
    logger.info(`   Email: ${adminUser.email}`);
    logger.info(`   Name: ${adminUser.name}`);
    logger.info(`   Password: 123456`);
  } catch (error) {
    logger.error('Error creating admin user:', error);
    throw error;
  }
};

const createMockUsers = async () => {
  try {
    const existingMockUsers = await prisma.users.count({
      where: {
        email: {
          in: mockUsers.map(u => u.email),
        },
      },
    });

    if (existingMockUsers > 0) {
      logger.info('⏭️  Mock users already exist. Skipping...');
      return;
    }

    const roles = await prisma.roles.findMany({
      select: { id: true, name: true },
      where: { is_active: 'Y' },
    });

    const companies = await prisma.companies.findMany({
      select: { id: true, name: true },
      where: { is_active: 'Y' },
    });

    const departments = await prisma.departments.findMany({
      select: { id: true, name: true },
      where: { is_active: 'Y' },
    });

    if (roles.length === 0) {
      logger.warn('No active roles found. Skipping mock users creation.');
      return;
    }

    if (companies.length === 0) {
      logger.warn('No active companies found. Skipping mock users creation.');
      return;
    }

    let usersCreated = 0;
    let usersSkipped = 0;

    for (let i = 0; i < mockUsers.length; i++) {
      const user = mockUsers[i];
      const existingUser = await prisma.users.findFirst({
        where: { email: user.email },
      });

      if (!existingUser) {
        const role = roles.find(r => r.id === user.role_id) || roles[0];
        const company = companies[0];
        const department = departments[i % departments.length] || null;

        await prisma.users.create({
          data: {
            email: user.email,
            name: user.name,
            phone_number: user.phone_number,
            role_id: role.id,
            parent_id: company.id,
            department_id: department?.id || null,
            salary: user.salary || null,
            currency_code: user.currency_code || null,
            address: user.address,
            employee_id: user.employee_id,
            joining_date: user.joining_date,
            reporting_to: user.reporting_to || null,
            is_active: user.is_active,
            password_hash: await bcrypt.hash('123456', 10),
            createdate: new Date(),
            createdby: 1,
            log_inst: 1,
          },
        });

        usersCreated++;
      } else {
        usersSkipped++;
      }
    }

    logger.info(
      `✅ Mock users seeded: ${usersCreated} created, ${usersSkipped} skipped`
    );
  } catch (error) {
    logger.error('Error creating mock users:', error);
    throw error;
  }
};

export const clearUsers = async () => {
  logger.info('Clearing users...');
  await prisma.users.deleteMany({
    where: {
      email: {
        in: ['admin@mkx.com', ...mockUsers.map(u => u.email)],
      },
    },
  });
  logger.info('Users cleared.');
};
