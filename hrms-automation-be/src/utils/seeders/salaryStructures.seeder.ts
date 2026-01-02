import prisma from '../../configs/prisma.client';
import logger from '../../configs/logger';

interface SalaryStructureItem {
  structure_type: string;
  value: number;
  category: string;
  is_default: boolean;
}

const defaultStructureItems: SalaryStructureItem[] = [
  { structure_type: 'Basic Salary', value: 0, category: 'Earnings', is_default: true },
  { structure_type: 'HRA', value: 0, category: 'Earnings', is_default: true },
  { structure_type: 'Transport Allowance', value: 0, category: 'Earnings', is_default: false },
  { structure_type: 'Medical Allowance', value: 0, category: 'Earnings', is_default: false },
  { structure_type: 'Provident Fund', value: 0, category: 'Deductions', is_default: true },
  { structure_type: 'Tax Deduction', value: 0, category: 'Deductions', is_default: true },
];

export const seedSalaryStructures = async () => {
  logger.info('🌱 Seeding salary structures...');

  try {
    const employees = await prisma.users.findMany({
      where: { 
        is_active: 'Y', 
        role_id: { not: 1 },
        salary: { not: null }
      },
    });

    if (employees.length === 0) {
      logger.warn('No employees with salary found. Skipping salary structures seeding.');
      return;
    }

    const currentYear = new Date().getFullYear();
    let structuresCreated = 0;
    let structuresSkipped = 0;

    for (const employee of employees) {
      const existingStructure = await prisma.salary_structures.findFirst({
        where: {
          employee_id: employee.id,
          status: 'Active',
        },
      });

      if (!existingStructure && employee.salary) {
        const basicSalary = Number(employee.salary) * 0.6;
        const hra = Number(employee.salary) * 0.25;
        const transportAllowance = Number(employee.salary) * 0.05;
        const medicalAllowance = Number(employee.salary) * 0.05;
        const providentFund = basicSalary * 0.12;
        const taxDeduction = Number(employee.salary) * 0.15;

        const salaryStructure = await prisma.salary_structures.create({
          data: {
            employee_id: employee.id,
            start_date: new Date(`${currentYear}-01-01`),
            end_date: new Date(`${currentYear}-12-31`),
            status: 'Active',
            is_active: 'Y',
            createdate: new Date(),
            createdby: 1,
          },
        });

        const items = [
          { structure_type: 'Basic Salary', value: basicSalary, category: 'Earnings', is_default: true },
          { structure_type: 'HRA', value: hra, category: 'Earnings', is_default: true },
          { structure_type: 'Transport Allowance', value: transportAllowance, category: 'Earnings', is_default: false },
          { structure_type: 'Medical Allowance', value: medicalAllowance, category: 'Earnings', is_default: false },
          { structure_type: 'Provident Fund', value: providentFund, category: 'Deductions', is_default: true },
          { structure_type: 'Tax Deduction', value: taxDeduction, category: 'Deductions', is_default: true },
        ];

        for (const item of items) {
          await prisma.salary_structure_items.create({
            data: {
              salary_structure_id: salaryStructure.id,
              structure_type: item.structure_type,
              value: item.value,
              category: item.category,
              is_default: item.is_default,
              is_active: 'Y',
              createdate: new Date(),
              createdby: 1,
            },
          });
        }

        structuresCreated++;
      } else {
        structuresSkipped++;
      }
    }

    logger.info(
      `✅ Salary structures seeded: ${structuresCreated} created, ${structuresSkipped} skipped`
    );
  } catch (error) {
    logger.error('Error seeding salary structures:', error);
    throw error;
  }
};

export const clearSalaryStructures = async () => {
  logger.info('Clearing salary structures...');
  await prisma.salary_structure_items.deleteMany({});
  await prisma.salary_structures.deleteMany({});
  logger.info('Salary structures cleared.');
};
