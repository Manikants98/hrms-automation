import { body } from 'express-validator';

export const createLeaveBalanceValidation = [
  body('employee_id')
    .notEmpty()
    .withMessage('Employee is required')
    .isInt()
    .withMessage('Employee ID must be an integer'),
  body('leave_type_id')
    .notEmpty()
    .withMessage('Leave type is required')
    .isInt()
    .withMessage('Leave type ID must be an integer'),
  body('total_allocated')
    .notEmpty()
    .withMessage('Total allocated is required')
    .isInt({ min: 0 })
    .withMessage('Total allocated must be a positive integer'),
  body('year')
    .notEmpty()
    .withMessage('Year is required')
    .isInt({ min: 2000, max: 2100 })
    .withMessage('Year must be between 2000 and 2100'),
  body('is_active')
    .optional()
    .isIn(['Y', 'N'])
    .withMessage('Status must be Y or N'),
];

export const updateLeaveBalanceValidation = [
  body('total_allocated')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Total allocated must be a positive integer'),
  body('used')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Used must be a positive integer'),
  body('is_active')
    .optional()
    .isIn(['Y', 'N'])
    .withMessage('Status must be Y or N'),
];
