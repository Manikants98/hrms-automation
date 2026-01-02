import { body } from 'express-validator';

export const createUserValidation = [
  body('email').isEmail().withMessage('Enter a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('name').notEmpty().withMessage('Name is required'),
  body('role_id')
    .isInt()
    .withMessage('Role ID is required and must be a number'),
  body('parent_id')
    .optional()
    .isInt()
    .withMessage('Parent ID must be a number'),
  body('department_id').optional().isInt().withMessage('Department ID must be a number'),
  body('designation_id').optional().isInt().withMessage('Designation ID must be a number'),
  body('shift_id').optional().isInt().withMessage('Shift ID must be a number'),
  body('salary').optional().isFloat({ min: 0 }).withMessage('Salary must be a positive number'),
  body('currency_code').optional().isLength({ max: 10 }).withMessage('Currency code must not exceed 10 characters'),
  body('employee_id').optional().isString(),
  body('joining_date')
    .optional()
    .isISO8601()
    .withMessage('Joining date must be a valid date'),
  body('phone_number')
    .optional()
    .isString()
    .withMessage('Phone number must be a string'),
  body('address').optional().isString(),
  body('reporting_to').optional().isInt(),
  body('profile_image')
    .optional()
    .isURL()
    .withMessage('Profile image must be a URL'),
  body('is_active')
    .optional()
    .isIn(['Y', 'N'])
    .withMessage('is_active must be Y or N'),
];

export const updateUserValidation = [
  body('email').optional().isEmail().withMessage('Enter a valid email'),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('role_id')
    .optional()
    .isInt()
    .withMessage('Role ID must be a number'),
  body('parent_id')
    .optional()
    .isInt()
    .withMessage('Parent ID must be a number'),
  body('department_id').optional().isInt().withMessage('Department ID must be a number'),
  body('designation_id').optional().isInt().withMessage('Designation ID must be a number'),
  body('shift_id').optional().isInt().withMessage('Shift ID must be a number'),
  body('salary').optional().isFloat({ min: 0 }).withMessage('Salary must be a positive number'),
  body('currency_code').optional().isLength({ max: 10 }).withMessage('Currency code must not exceed 10 characters'),
  body('employee_id').optional().isString(),
  body('joining_date')
    .optional()
    .isISO8601()
    .withMessage('Joining date must be a valid date'),
  body('phone_number')
    .optional()
    .isString()
    .withMessage('Phone number must be a string'),
  body('address').optional().isString(),
  body('reporting_to').optional().isInt(),
  body('is_active')
    .optional()
    .isIn(['Y', 'N'])
    .withMessage('is_active must be Y or N'),
];
