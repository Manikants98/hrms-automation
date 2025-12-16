import * as Yup from 'yup';

export const leaveBalanceItemSchema = Yup.object({
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
        'Marriage',
        'Earned',
        'Informal',
        'Formal',
        'Normal',
      ],
      'Invalid leave type'
    ),
  total_allocated: Yup.number()
    .required('Total allocated is required')
    .min(0, 'Total allocated must be 0 or greater')
    .max(365, 'Total allocated must be less than 365 days'),
  used: Yup.number()
    .required('Used is required')
    .min(0, 'Used must be 0 or greater'),
  leave_balance: Yup.number()
    .required('Leave balance is required')
    .min(0, 'Leave balance must be 0 or greater'),
});

export const leaveBalanceValidationSchema = Yup.object({
  employee_id: Yup.number().required('Employee is required'),
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
  status: Yup.string()
    .required('Status is required')
    .oneOf(['Active', 'Inactive'], 'Status must be Active or Inactive'),
  leave_type_items: Yup.array()
    .of(leaveBalanceItemSchema)
    .min(1, 'At least one leave type item is required')
    .required('Leave type items are required'),
});

export type LeaveBalanceFormValues = Yup.InferType<
  typeof leaveBalanceValidationSchema
>;
export type LeaveBalanceItemFormValues = Yup.InferType<
  typeof leaveBalanceItemSchema
>;
