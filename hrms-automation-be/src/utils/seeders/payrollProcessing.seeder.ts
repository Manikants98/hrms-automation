import prisma from '../../configs/prisma.client';
import logger from '../../configs/logger';

export const seedPayrollProcessing = async () => {
  logger.info('🌱 Seeding payroll processing...');

  try {
    const employees = await prisma.users.findMany({
      where: { 
        is_active: 'Y', 
        role_id: { not: 1 },
        salary: { not: null }
      },
      include: {
        salary_structures_employee: {
          where: { status: 'Active' },
          include: {
            salary_structure_items: true,
          },
        },
      },
    });

    const processor = await prisma.users.findFirst({
      where: { role_id: { in: [7, 8] } },
    });

    if (employees.length === 0) {
      logger.warn('No employees with salary found. Skipping payroll processing seeding.');
      return;
    }

    const currentDate = new Date();
    const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
    const currentYear = currentDate.getFullYear();

    const existingPayroll = await prisma.payroll_processing.findFirst({
      where: {
        payroll_month: currentMonth,
        payroll_year: currentYear,
      },
    });

    if (existingPayroll) {
      logger.info('⏭️  Payroll for current month already exists. Skipping...');
      return;
    }

    let totalEmployees = 0;
    let totalEarnings = 0;
    let totalDeductions = 0;
    let totalLeaveDeductions = 0;
    let totalNetSalary = 0;

    const payrollProcessing = await prisma.payroll_processing.create({
      data: {
        payroll_month: currentMonth,
        payroll_year: currentYear,
        processing_date: new Date(),
        status: 'Processed',
        total_employees: 0,
        total_earnings: 0,
        total_deductions: 0,
        total_leave_deductions: 0,
        total_net_salary: 0,
        processed_by: processor?.id,
        is_active: 'Y',
        createdate: new Date(),
        createdby: processor?.id || 1,
      },
    });

    for (const employee of employees) {
      const salaryStructure = employee.salary_structures_employee[0];
      
      if (!salaryStructure) continue;

      const earnings = salaryStructure.salary_structure_items
        .filter(item => item.category === 'Earnings')
        .reduce((sum, item) => sum + Number(item.value), 0);

      const deductions = salaryStructure.salary_structure_items
        .filter(item => item.category === 'Deductions')
        .reduce((sum, item) => sum + Number(item.value), 0);

      const basicSalary = salaryStructure.salary_structure_items
        .find(item => item.structure_type === 'Basic Salary')?.value || 0;

      const leaveDeductions = Math.floor(Math.random() * 3000);
      const netSalary = earnings - deductions - leaveDeductions;

      await prisma.salary_slips.create({
        data: {
          payroll_processing_id: payrollProcessing.id,
          employee_id: employee.id,
          payroll_month: currentMonth,
          payroll_year: currentYear,
          basic_salary: Number(basicSalary),
          total_earnings: earnings,
          total_deductions: deductions,
          leave_deductions: leaveDeductions,
          net_salary: netSalary,
          processed_date: new Date(),
          status: 'Processed',
          is_active: 'Y',
          createdate: new Date(),
          createdby: processor?.id || 1,
        },
      });

      totalEmployees++;
      totalEarnings += earnings;
      totalDeductions += deductions;
      totalLeaveDeductions += leaveDeductions;
      totalNetSalary += netSalary;
    }

    await prisma.payroll_processing.update({
      where: { id: payrollProcessing.id },
      data: {
        total_employees: totalEmployees,
        total_earnings: totalEarnings,
        total_deductions: totalDeductions,
        total_leave_deductions: totalLeaveDeductions,
        total_net_salary: totalNetSalary,
      },
    });

    logger.info(
      `✅ Payroll processing seeded: 1 payroll created with ${totalEmployees} salary slips`
    );
  } catch (error) {
    logger.error('Error seeding payroll processing:', error);
    throw error;
  }
};

export const clearPayrollProcessing = async () => {
  logger.info('Clearing payroll processing...');
  await prisma.salary_slips.deleteMany({});
  await prisma.payroll_processing.deleteMany({});
  logger.info('Payroll processing cleared.');
};
