import * as Yup from 'yup';

export const hiringStageValidationSchema = Yup.object({
  name: Yup.string()
    .required('Hiring stage name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  code: Yup.string()
    .required('Code is required')
    .min(2, 'Code must be at least 2 characters')
    .max(50, 'Code must be less than 50 characters')
    .matches(/^[A-Z_]+$/, 'Uppercase letters and underscores only.'),
  description: Yup.string().max(
    500,
    'Description must be less than 500 characters'
  ),
  is_active: Yup.string().required('Status is required'),
});

export type HiringStageFormValues = Yup.InferType<
  typeof hiringStageValidationSchema
>;
