import { Box, MenuItem, Typography } from '@mui/material';
import { useFormik } from 'formik';
import type { AttendanceStatus } from 'hooks/useAttendance';
import { useMarkAttendance } from 'hooks/useAttendance';
import React from 'react';
import { attendanceValidationSchema } from 'schemas/attendance.schema';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';

interface MarkAttendanceProps {
  selectedEmployee: {
    employee_id: number;
    employee_name: string;
    record?: any;
  } | null;
  selectedDate: string;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  onSuccess?: () => void;
}

const MarkAttendance: React.FC<MarkAttendanceProps> = ({
  selectedEmployee,
  selectedDate,
  drawerOpen,
  setDrawerOpen,
  onSuccess,
}) => {
  const markAttendanceMutation = useMarkAttendance({
    onSuccess: () => {
      onSuccess?.();
    },
  });

  const handleCancel = () => {
    setDrawerOpen(false);
  };

  const formik = useFormik({
    initialValues: {
      employee_id: selectedEmployee?.employee_id || 0,
      attendance_date: selectedDate,
      status: (selectedEmployee?.record?.status ||
        'Present') as AttendanceStatus,
      punch_in_time: selectedEmployee?.record?.punch_in_time || '09:00',
      punch_out_time: selectedEmployee?.record?.punch_out_time || '18:00',
      remarks: selectedEmployee?.record?.remarks || '',
    },
    validationSchema: attendanceValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        await markAttendanceMutation.mutateAsync({
          employee_id: values.employee_id,
          attendance_date: values.attendance_date,
          status: values.status,
          punch_in_time:
            values.status === 'Present' || values.status === 'Half Day'
              ? values.punch_in_time
              : undefined,
          punch_out_time:
            values.status === 'Present' || values.status === 'Half Day'
              ? values.punch_out_time
              : undefined,
          remarks: values.remarks || undefined,
        });
      } catch (error) {
        console.error('Error marking attendance:', error);
      }
    },
  });

  const isEdit = !!selectedEmployee?.record;

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={
        isEdit
          ? `Edit Attendance - ${selectedEmployee?.employee_name}`
          : `Mark Attendance - ${selectedEmployee?.employee_name}`
      }
      size="medium"
    >
      <Box className="!p-5">
        <form onSubmit={formik.handleSubmit}>
          <Box className="!space-y-6">
            <Box>
              <Typography
                variant="h6"
                className="!font-semibold !text-gray-900 !mb-4"
              >
                Attendance Details
              </Typography>
              <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-x-5 !gap-y-4">
                <Select
                  name="status"
                  label="Status"
                  formik={formik}
                  required
                  fullWidth
                >
                  <MenuItem value="Present">Present</MenuItem>
                  <MenuItem value="Absent">Absent</MenuItem>
                  <MenuItem value="Half Day">Half Day</MenuItem>
                  <MenuItem value="Leave">Leave</MenuItem>
                  <MenuItem value="Holiday">Holiday</MenuItem>
                  <MenuItem value="Weekend">Weekend</MenuItem>
                </Select>

                {(formik.values.status === 'Present' ||
                  formik.values.status === 'Half Day') && (
                  <>
                    <Input
                      name="punch_in_time"
                      label="Punch In Time"
                      type="time"
                      formik={formik}
                      required
                    />

                    <Input
                      name="punch_out_time"
                      label="Punch Out Time"
                      type="time"
                      formik={formik}
                    />
                  </>
                )}

                <Box className="md:!col-span-2">
                  <Input
                    name="remarks"
                    label="Remarks"
                    placeholder="Enter any remarks or notes"
                    formik={formik}
                    multiline
                    rows={3}
                  />
                </Box>
              </Box>
            </Box>
          </Box>

          <Box className="!flex !justify-end gap-1 !mt-6">
            <Button
              type="button"
              variant="outlined"
              onClick={handleCancel}
              className="!mr-3"
              disabled={markAttendanceMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={markAttendanceMutation.isPending}
            >
              {markAttendanceMutation.isPending
                ? 'Saving...'
                : isEdit
                  ? 'Update'
                  : 'Mark Attendance'}
            </Button>
          </Box>
        </form>
      </Box>
    </CustomDrawer>
  );
};

export default MarkAttendance;
