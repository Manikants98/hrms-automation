require('dotenv').config();

import prisma from '../../configs/prisma.client';
import { seedRoles } from './roles.seeder';
import { seedPermissions } from './permissions.seeder';
import { seedUsers } from './users.seeder';
import { seedDepartments } from './departments.seeder';
import { seedDesignations } from './designations.seeder';
import { seedShifts } from './shifts.seeder';
import { seedLeaveTypes } from './leaveTypes.seeder';
import { seedHiringStages } from './hiringStages.seeder';
import { seedAttachmentTypes } from './attachmentTypes.seeder';
import { seedCompanies } from './comanies.seeder';
import { seedAttendance } from './attendance.seeder';
import { seedLeaveApplications } from './leaveApplications.seeder';
import { seedLeaveBalances } from './leaveBalances.seeder';
import { seedSalaryStructures } from './salaryStructures.seeder';
import { seedJobPostings } from './jobPostings.seeder';
import { seedCandidates } from './candidates.seeder';
import { seedPayrollProcessing } from './payrollProcessing.seeder';
import { seedSystemSettings } from './systemSettings.seeder';
import { seedNotifications } from './notifications.seeder';

export async function runSeeders() {
  console.log('🚀 Starting HRMS database seeding...');
  console.log('=====================================\n');

  try {
    await seedRoles();
    console.log('');

    await seedPermissions();
    console.log('');

    await seedDepartments();
    console.log('');

    await seedDesignations();
    console.log('');

    await seedShifts();
    console.log('');

    await seedLeaveTypes();
    console.log('');

    await seedHiringStages();
    console.log('');

    await seedAttachmentTypes();
    console.log('');

    await seedCompanies();
    console.log('');

    await seedUsers();
    console.log('');

    await seedAttendance();
    console.log('');

    await seedLeaveBalances();
    console.log('');

    await seedLeaveApplications();
    console.log('');

    await seedSalaryStructures();
    console.log('');

    await seedJobPostings();
    console.log('');

    await seedCandidates();
    console.log('');

    await seedPayrollProcessing();
    console.log('');

    await seedSystemSettings();
    console.log('');

    await seedNotifications();
    console.log('');

    console.log('=====================================');
    console.log('✨ All HRMS seeders completed successfully!');
    console.log('=====================================\n');
  } catch (error) {
    console.error('\n❌ Error running seeders:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

export async function cleanSeeders() {
  console.log('🧹 Cleaning all seeded data...');
  console.log('=====================================\n');

  try {
    console.log('Deleting notifications...');
    await prisma.notifications.deleteMany({});
    
    console.log('Deleting system settings...');
    await prisma.system_settings.deleteMany({});
    
    console.log('Deleting workflow steps...');
    await prisma.workflow_steps.deleteMany({});
    
    console.log('Deleting approval workflows...');
    await prisma.approval_workflows.deleteMany({});
    
    console.log('Deleting audit logs...');
    await prisma.audit_logs.deleteMany({});
    
    console.log('Deleting login history...');
    await prisma.login_history.deleteMany({});
    
    console.log('Deleting salary slips...');
    await prisma.salary_slips.deleteMany({});
    
    console.log('Deleting payroll processing...');
    await prisma.payroll_processing.deleteMany({});
    
    console.log('Deleting candidates...');
    await prisma.candidates.deleteMany({});
    
    console.log('Deleting job posting attachments...');
    await prisma.job_posting_attachments.deleteMany({});
    
    console.log('Deleting job posting stages...');
    await prisma.job_posting_stages.deleteMany({});
    
    console.log('Deleting job postings...');
    await prisma.job_postings.deleteMany({});
    
    console.log('Deleting salary structure items...');
    await prisma.salary_structure_items.deleteMany({});
    
    console.log('Deleting salary structures...');
    await prisma.salary_structures.deleteMany({});
    
    console.log('Deleting leave applications...');
    await prisma.leave_applications.deleteMany({});
    
    console.log('Deleting leave balances...');
    await prisma.leave_balances.deleteMany({});
    
    console.log('Deleting attendance history...');
    await prisma.attendance_history.deleteMany({});
    
    console.log('Deleting attendance...');
    await prisma.attendance.deleteMany({});
    
    console.log('Deleting api tokens...');
    await prisma.api_tokens.deleteMany({});
    
    console.log('Deleting users...');
    await prisma.users.deleteMany({});
    
    console.log('Deleting companies...');
    await prisma.companies.deleteMany({});
    
    console.log('Deleting attachment types...');
    await prisma.attachment_types.deleteMany({});
    
    console.log('Deleting hiring stages...');
    await prisma.hiring_stages.deleteMany({});
    
    console.log('Deleting leave types...');
    await prisma.leave_types.deleteMany({});
    
    console.log('Deleting shifts...');
    await prisma.shifts.deleteMany({});
    
    console.log('Deleting designations...');
    await prisma.designations.deleteMany({});
    
    console.log('Deleting departments...');
    await prisma.departments.deleteMany({});
    
    console.log('Deleting role permissions...');
    await prisma.role_permissions.deleteMany({});
    
    console.log('Deleting permissions...');
    await prisma.permissions.deleteMany({});
    
    console.log('Deleting roles...');
    await prisma.roles.deleteMany({});

    console.log('\n=====================================');
    console.log('✨ All seeded data cleaned successfully!');
    console.log('=====================================\n');
  } catch (error) {
    console.error('\n❌ Error cleaning seeders:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

const command = process.argv[2];

if (command === 'clean') {
  cleanSeeders()
    .then(() => {
      console.log('Cleaning completed.');
      process.exit(0);
    })
    .catch(error => {
      console.error('Cleaning failed:', error);
      process.exit(1);
    });
} else {
  runSeeders()
    .then(() => {
      console.log('Seeding completed.');
      process.exit(0);
    })
    .catch(error => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}
