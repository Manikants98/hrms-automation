import * as Yup from 'yup';

export const attendanceValidationSchema = Yup.object({
  employee_id: Yup.number().required('Employee is required'),
  attendance_date: Yup.string().required('Attendance date is required'),
  status: Yup.string()
    .required('Status is required')
    .oneOf(
      ['Present', 'Absent', 'Half Day', 'Leave', 'Holiday', 'Weekend'],
      'Invalid status'
    ),
  punch_in_time: Yup.string().when('status', {
    is: (status: string) => status === 'Present' || status === 'Half Day',
    then: schema => schema.required('Punch in time is required'),
    otherwise: schema => schema.notRequired(),
  }),
  punch_out_time: Yup.string(),
  remarks: Yup.string().max(500, 'Remarks must be less than 500 characters'),
});

export type AttendanceFormValues = Yup.InferType<
  typeof attendanceValidationSchema
>;

