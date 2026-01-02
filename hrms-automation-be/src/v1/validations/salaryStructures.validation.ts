import { body } from 'express-validator';

export const createSalaryStructureValidation = [
  body('employee_id')
    .notEmpty()
    .withMessage('Employee is required')
    .isInt()
    .withMessage('Employee ID must be an integer'),
  body('start_date')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('end_date')
    .notEmpty()
    .withMessage('End date is required')
    .isISO8601()
    .withMessage('End date must be a valid date'),
  body('status')
    .optional()
    .isIn(['Active', 'Inactive'])
    .withMessage('Status must be Active or Inactive'),
  body('structure_items')
    .notEmpty()
    .withMessage('Structure items are required')
    .isArray({ min: 1 })
    .withMessage('At least one structure item is required'),
  body('structure_items.*.structure_type')
    .notEmpty()
    .withMessage('Structure type is required'),
  body('structure_items.*.value')
    .notEmpty()
    .withMessage('Value is required')
    .isFloat({ min: 0 })
    .withMessage('Value must be a positive number'),
  body('structure_items.*.category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['Earnings', 'Deductions'])
    .withMessage('Category must be Earnings or Deductions'),
  body('structure_items.*.is_default')
    .optional()
    .isBoolean()
    .withMessage('Is default must be a boolean'),
  body('is_active')
    .optional()
    .isIn(['Y', 'N'])
    .withMessage('Status must be Y or N'),
];

export const updateSalaryStructureValidation = [
  body('employee_id')
    .optional()
    .isInt()
    .withMessage('Employee ID must be an integer'),
  body('start_date')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('end_date')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  body('status')
    .optional()
    .isIn(['Active', 'Inactive'])
    .withMessage('Status must be Active or Inactive'),
  body('structure_items')
    .optional()
    .isArray()
    .withMessage('Structure items must be an array'),
  body('structure_items.*.structure_type')
    .optional(),
  body('structure_items.*.value')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Value must be a positive number'),
  body('structure_items.*.category')
    .optional()
    .isIn(['Earnings', 'Deductions'])
    .withMessage('Category must be Earnings or Deductions'),
  body('structure_items.*.is_default')
    .optional()
    .isBoolean()
    .withMessage('Is default must be a boolean'),
  body('is_active')
    .optional()
    .isIn(['Y', 'N'])
    .withMessage('Status must be Y or N'),
];
