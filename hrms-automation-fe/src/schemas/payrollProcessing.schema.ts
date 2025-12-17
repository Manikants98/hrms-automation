import * as Yup from 'yup';

export const processPayrollValidationSchema = Yup.object({
  payroll_month: Yup.string()
    .required('Payroll month is required')
    .matches(/^(0[1-9]|1[0-2])$/, 'Month must be between 01 and 12'),
  payroll_year: Yup.number()
    .required('Payroll year is required')
    .min(2000, 'Year must be 2000 or later')
    .max(2100, 'Year must be 2100 or earlier'),
  employee_ids: Yup.array().of(Yup.number()).optional(),
  process_all: Yup.boolean().optional(),
});

export type ProcessPayrollFormValues = Yup.InferType<
  typeof processPayrollValidationSchema
>;
