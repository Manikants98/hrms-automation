import * as Yup from 'yup';

export const salaryStructureItemSchema = Yup.object({
  structure_type: Yup.string()
    .required('Structure type is required')
    .oneOf(
      [
        'Basic Salary',
        'HRA',
        'Transport Allowance',
        'Medical Allowance',
        'Provident Fund',
        'Tax Deduction',
        'Insurance',
        'Bonus',
        'Overtime',
        'Allowance',
        'Loan Deduction',
        'Other Deduction',
        'Other Earnings',
      ],
      'Invalid structure type'
    ),
  value: Yup.number()
    .required('Value is required')
    .min(0, 'Value must be 0 or greater'),
  category: Yup.string()
    .required('Category is required')
    .oneOf(
      ['Earnings', 'Deductions'],
      'Category must be Earnings or Deductions'
    ),
  is_default: Yup.boolean().required('Is default is required'),
});

export const salaryStructureValidationSchema = Yup.object({
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
  structure_items: Yup.array()
    .of(salaryStructureItemSchema)
    .min(1, 'At least one structure item is required')
    .required('Structure items are required'),
});

export type SalaryStructureFormValues = Yup.InferType<
  typeof salaryStructureValidationSchema
>;
export type SalaryStructureItemFormValues = Yup.InferType<
  typeof salaryStructureItemSchema
>;
