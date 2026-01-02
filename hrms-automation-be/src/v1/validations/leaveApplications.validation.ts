import { body } from 'express-validator';

export const createLeaveApplicationValidation = [
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
  body('reason')
    .notEmpty()
    .withMessage('Reason is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Reason must be between 10 and 500 characters'),
];

export const updateLeaveApplicationValidation = [
  body('employee_id')
    .optional()
    .isInt()
    .withMessage('Employee ID must be an integer'),
  body('leave_type_id')
    .optional()
    .isInt()
    .withMessage('Leave type ID must be an integer'),
  body('start_date')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('end_date')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  body('reason')
    .optional()
    .isLength({ min: 10, max: 500 })
    .withMessage('Reason must be between 10 and 500 characters'),
];

export const rejectLeaveApplicationValidation = [
  body('rejection_reason')
    .notEmpty()
    .withMessage('Rejection reason is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Rejection reason must be between 10 and 500 characters'),
];
