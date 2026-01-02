import { body } from 'express-validator';

export const createShiftValidation = [
  body('name')
    .notEmpty()
    .withMessage('Shift name is required')
    .isLength({ max: 255 })
    .withMessage('Shift name must not exceed 255 characters'),
  body('code')
    .notEmpty()
    .withMessage('Shift code is required')
    .isLength({ max: 50 })
    .withMessage('Shift code must not exceed 50 characters'),
  body('start_time')
    .notEmpty()
    .withMessage('Start time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format'),
  body('end_time')
    .notEmpty()
    .withMessage('End time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM format'),
  body('break_duration')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Break duration must be a positive integer'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('is_active')
    .optional()
    .isIn(['Y', 'N'])
    .withMessage('Status must be Y or N'),
];

export const updateShiftValidation = [
  body('name')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Shift name must not exceed 255 characters'),
  body('code')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Shift code must not exceed 50 characters'),
  body('start_time')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format'),
  body('end_time')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM format'),
  body('break_duration')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Break duration must be a positive integer'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('is_active')
    .optional()
    .isIn(['Y', 'N'])
    .withMessage('Status must be Y or N'),
];
