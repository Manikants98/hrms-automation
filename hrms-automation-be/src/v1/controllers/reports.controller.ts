import prisma from '../../configs/prisma.client';

export const reportsController = {
  async getAttendanceReport(req: any, res: any) {
    try {
      const { start_date, end_date, department_id, employee_id } = req.query;

      const filters: any = {};

      if (start_date && end_date) {
        filters.attendance_date = {
          gte: new Date(start_date as string),
          lte: new Date(end_date as string),
        };
      }

      if (employee_id) {
        filters.user_id = parseInt(employee_id as string);
      }

      if (department_id) {
        filters.attendance_user = {
          department_id: parseInt(department_id as string),
        };
      }

      const attendanceRecords = await prisma.attendance.findMany({
        where: filters,
        include: {
          attendance_user: {
            select: {
              id: true,
              name: true,
              email: true,
              employee_id: true,
              employees_department: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { attendance_date: 'desc' },
      });

      res.success('Attendance report fetched successfully', attendanceRecords);
    } catch (error: any) {
      console.error('Get attendance report error:', error);
      res.error(error.message || 'Failed to fetch attendance report', 500);
    }
  },

  async getLeaveReport(req: any, res: any) {
    try {
      const { start_date, end_date, department_id, employee_id, approval_status } = req.query;

      const filters: any = {};

      if (start_date && end_date) {
        filters.start_date = {
          gte: new Date(start_date as string),
          lte: new Date(end_date as string),
        };
      }

      if (employee_id) {
        filters.employee_id = parseInt(employee_id as string);
      }

      if (approval_status) {
        filters.approval_status = approval_status as string;
      }

      if (department_id) {
        filters.leave_applications_employee = {
          department_id: parseInt(department_id as string),
        };
      }

      const leaveApplications = await prisma.leave_applications.findMany({
        where: filters,
        include: {
          leave_applications_employee: {
            select: {
              id: true,
              name: true,
              email: true,
              employee_id: true,
              employees_department: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          leave_applications_type: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
        orderBy: { createdate: 'desc' },
      });

      res.success('Leave report fetched successfully', leaveApplications);
    } catch (error: any) {
      console.error('Get leave report error:', error);
      res.error(error.message || 'Failed to fetch leave report', 500);
    }
  },

  async getPayrollReport(req: any, res: any) {
    try {
      const { payroll_month, payroll_year, department_id } = req.query;

      const filters: any = {};

      if (payroll_month) {
        filters.payroll_month = payroll_month as string;
      }

      if (payroll_year) {
        filters.payroll_year = parseInt(payroll_year as string);
      }

      if (department_id) {
        filters.salary_slips_employee = {
          department_id: parseInt(department_id as string),
        };
      }

      const salarySlips = await prisma.salary_slips.findMany({
        where: filters,
        include: {
          salary_slips_employee: {
            select: {
              id: true,
              name: true,
              email: true,
              employee_id: true,
              employees_department: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { createdate: 'desc' },
      });

      res.success('Payroll report fetched successfully', salarySlips);
    } catch (error: any) {
      console.error('Get payroll report error:', error);
      res.error(error.message || 'Failed to fetch payroll report', 500);
    }
  },

  async getHiringReport(req: any, res: any) {
    try {
      const { start_date, end_date, job_posting_id, status } = req.query;

      const filters: any = {};

      if (start_date && end_date) {
        filters.application_date = {
          gte: new Date(start_date as string),
          lte: new Date(end_date as string),
        };
      }

      if (job_posting_id) {
        filters.job_posting_id = parseInt(job_posting_id as string);
      }

      if (status) {
        filters.status = status as string;
      }

      const candidates = await prisma.candidates.findMany({
        where: filters,
        include: {
          candidates_job_posting: {
            select: {
              id: true,
              job_title: true,
              job_postings_department: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          candidates_stage: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
        orderBy: { createdate: 'desc' },
      });

      res.success('Hiring report fetched successfully', candidates);
    } catch (error: any) {
      console.error('Get hiring report error:', error);
      res.error(error.message || 'Failed to fetch hiring report', 500);
    }
  },

  async getEmployeeReport(req: any, res: any) {
    try {
      const { department_id, designation_id, is_active } = req.query;

      const filters: any = {};

      if (department_id) {
        filters.department_id = parseInt(department_id as string);
      }

      if (designation_id) {
        filters.designation_id = parseInt(designation_id as string);
      }

      if (is_active) {
        filters.is_active = is_active as string;
      }

      const employees = await prisma.users.findMany({
        where: filters,
        include: {
          employees_department: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          employees_designation: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          employees_shift: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          user_role: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdate: 'desc' },
      });

      res.success('Employee report fetched successfully', employees);
    } catch (error: any) {
      console.error('Get employee report error:', error);
      res.error(error.message || 'Failed to fetch employee report', 500);
    }
  },
};
