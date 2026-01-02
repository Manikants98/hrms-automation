import { Request, Response } from 'express';
import prisma from '../../configs/prisma.client';

interface AttendanceSerialized {
  id: number;
  user_id: number;
  employee_id: number;
  attendance_date: Date;
  punch_in_time: Date;
  punch_in_latitude?: number | null;
  punch_in_longitude?: number | null;
  punch_in_address?: string | null;
  punch_in_device_info?: any;
  punch_out_time?: Date | null;
  punch_out_latitude?: number | null;
  punch_out_longitude?: number | null;
  punch_out_address?: string | null;
  punch_out_device_info?: any;
  total_hours?: number | null;
  work_type?: string | null;
  status: string;
  remarks?: string | null;
  is_active: string;
  createdate?: Date | null;
  createdby: number;
  updatedate?: Date | null;
  updatedby?: number | null;
  employee_name?: string | null;
  employee_email?: string | null;
  employee_department?: string | null;
  marked_by?: number | null;
  marked_by_name?: string | null;
}

const safeJsonParse = (jsonString: string | null): any => {
  if (!jsonString) return null;
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('JSON parse error:', error);
    return null;
  }
};

const serializeAttendance = (attendance: any): AttendanceSerialized => ({
  id: attendance.id,
  user_id: attendance.user_id,
  employee_id: attendance.user_id,
  attendance_date: attendance.attendance_date,
  punch_in_time: attendance.punch_in_time,
  punch_in_latitude: attendance.punch_in_latitude
    ? Number(attendance.punch_in_latitude)
    : null,
  punch_in_longitude: attendance.punch_in_longitude
    ? Number(attendance.punch_in_longitude)
    : null,
  punch_in_address: attendance.punch_in_address,
  punch_in_device_info: safeJsonParse(attendance.punch_in_device_info),
  punch_out_time: attendance.punch_out_time,
  punch_out_latitude: attendance.punch_out_latitude
    ? Number(attendance.punch_out_latitude)
    : null,
  punch_out_longitude: attendance.punch_out_longitude
    ? Number(attendance.punch_out_longitude)
    : null,
  punch_out_address: attendance.punch_out_address,
  punch_out_device_info: safeJsonParse(attendance.punch_out_device_info),
  total_hours: attendance.total_hours ? Number(attendance.total_hours) : null,
  work_type: attendance.work_type,
  status: attendance.status,
  remarks: attendance.remarks,
  is_active: attendance.is_active,
  createdate: attendance.createdate,
  createdby: attendance.createdby,
  updatedate: attendance.updatedate,
  updatedby: attendance.updatedby,
  employee_name: attendance.attendance_user?.name || attendance.user?.name || null,
  employee_email: attendance.attendance_user?.email || attendance.user?.email || null,
  employee_department: attendance.attendance_user?.employees_department?.name || null,
  marked_by: attendance.createdby,
  marked_by_name: attendance.attendance_user?.name || attendance.user?.name || null,
});

export const attendanceController = {
  async punch(req: Request, res: Response) {
    try {
      const userId = req.user?.id || 0;
      const {
        action_type,
        latitude,
        longitude,
        address,
        workType,
        deviceInfo,
        remarks,
      } = req.body;

      if (!action_type) {
        return res.status(400).json({
          message: 'action_type is required. Valid values: punch_in, punch_out',
        });
      }

      if (action_type !== 'punch_in' && action_type !== 'punch_out') {
        return res.status(400).json({
          message: 'Invalid action_type. Valid values: punch_in, punch_out',
        });
      }

      let attendance;
      let message;
      let statusCode;

      if (action_type === 'punch_in') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if already punched in today
        let existingAttendance = await prisma.attendance.findFirst({
          where: {
            user_id: userId,
            attendance_date: today,
            is_active: 'Y',
          },
        });

        if (existingAttendance && existingAttendance.status === 'punch_in') {
          return res.status(400).json({
            success: false,
            message: 'You have already punched in today',
            data: serializeAttendance(existingAttendance),
          });
        }

        if (!existingAttendance || existingAttendance.status === 'punch_out') {
          attendance = await prisma.attendance.create({
            data: {
              user_id: userId,
              attendance_date: today,
              punch_in_time: new Date(),
              punch_in_latitude: latitude,
              punch_in_longitude: longitude,
              punch_in_address: address,
              punch_in_device_info: deviceInfo
                ? JSON.stringify(deviceInfo)
                : null,
              work_type: workType || 'office',
              status: 'punch_in',
              is_active: 'Y',
              createdby: userId,
            },
            include: {
              attendance_user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  employee_id: true,
                  profile_image: true,
                },
              },
            },
          });

          // Only create history for new punch-in
          await prisma.attendance_history.create({
            data: {
              attendance_id: attendance.id,
              action_type: 'punch_in',
              action_time: new Date(),
              latitude: latitude,
              longitude: longitude,
              address: address,
              device_info: deviceInfo ? JSON.stringify(deviceInfo) : null,
              photo_url: null,
              old_data: null,
              new_data: JSON.stringify({
                punch_in_time: new Date(),
                work_type: workType || 'office',
                status: 'punch_in',
              }),
              ip_address: req.ip || null,
              user_agent: req.headers['user-agent'] || null,
              app_version: deviceInfo?.appVersion || null,
              battery_level: deviceInfo?.batteryLevel || null,
              network_type: deviceInfo?.networkType || null,
              remarks: `Punched in at ${address || 'unknown location'}`,
              is_active: 'Y',
              createdate: new Date(),
              createdby: userId,
            },
          });
        }

        message = 'Punched in successfully';
        statusCode = 201;
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existingAttendance = await prisma.attendance.findFirst({
          where: {
            user_id: userId,
            attendance_date: today,
            status: 'punch_in',
            is_active: 'Y',
          },
        });

        if (!existingAttendance) {
          return res.status(400).json({
            success: false,
            message: 'No punch-in found for today. Please punch in first.',
          });
        }

        const punchInTime = new Date(existingAttendance.punch_in_time);
        const punchOutTime = new Date();
        const totalHours =
          Math.round(
            ((punchOutTime.getTime() - punchInTime.getTime()) /
              (1000 * 60 * 60)) *
              100
          ) / 100;

        const oldData = {
          punch_out_time: existingAttendance.punch_out_time,
          total_hours: existingAttendance.total_hours,
          status: existingAttendance.status,
          remarks: existingAttendance.remarks,
        };

        attendance = await prisma.attendance.update({
          where: { id: existingAttendance.id },
          data: {
            punch_out_time: punchOutTime,
            punch_out_latitude: latitude,
            punch_out_longitude: longitude,
            punch_out_address: address,
            punch_out_device_info: deviceInfo
              ? JSON.stringify(deviceInfo)
              : null,
            total_hours: totalHours,
            status: 'punch_out',
            remarks: remarks || existingAttendance.remarks,
            updatedby: userId,
            updatedate: new Date(),
          },
          include: {
            attendance_user: {
              select: {
                id: true,
                name: true,
                email: true,
                employee_id: true,
                profile_image: true,
              },
            },
          },
        });

        await prisma.attendance_history.create({
          data: {
            attendance_id: attendance.id,
            action_type: 'punch_out',
            action_time: new Date(),
            latitude: latitude,
            longitude: longitude,
            address: address,
            device_info: deviceInfo ? JSON.stringify(deviceInfo) : null,
            photo_url: null,
            old_data: JSON.stringify(oldData),
            new_data: JSON.stringify({
              punch_out_time: punchOutTime,
              total_hours: totalHours,
              status: 'punch_out',
              remarks: remarks || existingAttendance.remarks,
            }),
            ip_address: req.ip || null,
            user_agent: req.headers['user-agent'] || null,
            app_version: deviceInfo?.appVersion || null,
            battery_level: deviceInfo?.batteryLevel || null,
            network_type: deviceInfo?.networkType || null,
            remarks: `Punched out. Total hours: ${totalHours.toFixed(2)}`,
            is_active: 'Y',
            createdate: new Date(),
            createdby: userId,
          },
        });

        message = 'Punched out successfully';
        statusCode = 200;
      }

      res.status(statusCode).json({
        message,
        data: serializeAttendance(attendance),
      });
    } catch (error: any) {
      console.error('Punch Error:', error);
      res.status(400).json({
        message: error.message || 'Failed to process punch',
        error: error.message,
      });
    }
  },

  async getPunchStatus(req: Request, res: Response) {
    try {
      const userId = req.user?.id || 0;

      const attendance = await prisma.attendance.findFirst({
        where: {
          user_id: userId,
          is_active: 'Y',
        },
        orderBy: {
          id: 'desc',
        },
        include: {
          attendance_user: {
            select: {
              id: true,
              name: true,
              email: true,
              employee_id: true,
              profile_image: true,
            },
          },
        },
      });

      if (!attendance) {
        return res.status(200).json({
          message: 'Punch status retrieved successfully',
          data: {
            status: 'not_punch',
            message: 'You have not punched in',
            attendance: null,
          },
        });
      }

      res.status(200).json({
        message: 'Punch status retrieved successfully',
        data: {
          status: (attendance.status || 'punch_in') as
            | 'punch_in'
            | 'punch_out'
            | 'not_punch',
          message: 'You have punched in',
          attendance: serializeAttendance(attendance),
        },
      });
    } catch (error: any) {
      console.error('Get Punch Status Error:', error);
      res.status(500).json({
        message: 'Failed to fetch punch status',
        error: error.message,
      });
    }
  },

  async getAllAttendance(req: Request, res: Response) {
    try {
      const { limit = 50, page = 1, attendance_date, employee_id, status } = req.query;
      
      const whereClause: any = {
        is_active: 'Y',
      };

      if (attendance_date) {
        whereClause.attendance_date = new Date(attendance_date as string);
      }

      if (employee_id) {
        whereClause.user_id = parseInt(employee_id as string);
      }

      if (status) {
        whereClause.status = status;
      }

      const attendance = await prisma.attendance.findMany({
        where: whereClause,
        include: {
          attendance_user: {
            select: {
              id: true,
              name: true,
              email: true,
              employee_id: true,
              profile_image: true,
            },
          },
        },
        orderBy: {
          attendance_date: 'desc',
        },
        take: parseInt(limit as string),
        skip: (parseInt(page as string) - 1) * parseInt(limit as string),
      });

      const total = await prisma.attendance.count({
        where: whereClause,
      });

      res.status(200).json({
        success: true,
        message: 'Attendance records fetched successfully',
        data: attendance.map(serializeAttendance),
        meta: {
          total,
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          totalPages: Math.ceil(total / parseInt(limit as string)),
        },
      });
    } catch (error: any) {
      console.error('Get All Attendance Error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch attendance records',
        error: error.message,
      });
    }
  },
};
