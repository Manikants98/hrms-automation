import * as Yup from 'yup';

export const leaveApplicationValidationSchema = Yup.object({
  employee_id: Yup.number().required('Employee is required'),
  leave_type: Yup.string()
    .required('Leave type is required')
    .oneOf(
      [
        'Annual',
        'Sick',
        'Casual',
        'Emergency',
        'Maternity',
        'Paternity',
        'Unpaid',
      ],
      'Invalid leave type'
    ),
  start_date: Yup.string().required('Start date is required'),
  end_date: Yup.string()
    .required('End date is required')
    .test(
      'is-after-start',
      'End date must be after or equal to start date',
      function (value) {
        const { start_date } = this.parent;
        if (!value || !start_date) return true;
        return new Date(value) >= new Date(start_date);
      }
    ),
  reason: Yup.string()
    .required('Reason is required')
    .min(10, 'Reason must be at least 10 characters')
    .max(500, 'Reason must be less than 500 characters'),
});

export type LeaveApplicationFormValues = Yup.InferType<
  typeof leaveApplicationValidationSchema
>;
