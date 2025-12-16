import * as Yup from 'yup';

export const employeeValidationSchema = Yup.object({
  name: Yup.string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(200, 'Name must be less than 200 characters'),
  email: Yup.string()
    .required('Email is required')
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters'),
  phone_number: Yup.string()
    .max(20, 'Phone number must be less than 20 characters')
    .matches(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number format'),
  employee_id: Yup.string().max(
    50,
    'Employee ID must be less than 50 characters'
  ),
  department_id: Yup.number().required('Department is required'),
  designation_id: Yup.number().required('Designation is required'),
  shift_id: Yup.number().required('Shift is required'),
  reporting_manager_id: Yup.number(),
  joining_date: Yup.string().required('Joining date is required'),
  address: Yup.string().max(500, 'Address must be less than 500 characters'),
  profile_image: Yup.string().max(
    500,
    'Profile image URL must be less than 500 characters'
  ),
  salary: Yup.number().min(0, 'Salary must be positive'),
  currency_code: Yup.string().max(
    10,
    'Currency code must be less than 10 characters'
  ),
  is_active: Yup.string().required('Status is required'),
});

export type EmployeeFormValues = Yup.InferType<typeof employeeValidationSchema>;
