import { body } from 'express-validator';

export const processPayrollValidation = [
  body('payroll_month')
    .notEmpty()
    .withMessage('Payroll month is required')
    .isLength({ min: 2, max: 2 })
    .withMessage('Payroll month must be 2 characters (01-12)')
    .matches(/^(0[1-9]|1[0-2])$/)
    .withMessage('Payroll month must be between 01 and 12'),
  body('payroll_year')
    .notEmpty()
    .withMessage('Payroll year is required')
    .isInt({ min: 2000, max: 2100 })
    .withMessage('Payroll year must be between 2000 and 2100'),
  body('employee_ids')
    .optional()
    .isArray()
    .withMessage('Employee IDs must be an array'),
  body('process_all')
    .optional()
    .isBoolean()
    .withMessage('Process all must be a boolean'),
];
