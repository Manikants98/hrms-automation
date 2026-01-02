import { body } from 'express-validator';

export const createHiringStageValidation = [
  body('name')
    .notEmpty()
    .withMessage('Hiring stage name is required')
    .isLength({ max: 255 })
    .withMessage('Hiring stage name must not exceed 255 characters'),
  body('code')
    .notEmpty()
    .withMessage('Hiring stage code is required')
    .isLength({ max: 50 })
    .withMessage('Hiring stage code must not exceed 50 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('sequence_order')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Sequence order must be a positive integer'),
  body('is_active')
    .optional()
    .isIn(['Y', 'N'])
    .withMessage('Status must be Y or N'),
];

export const updateHiringStageValidation = [
  body('name')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Hiring stage name must not exceed 255 characters'),
  body('code')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Hiring stage code must not exceed 50 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('sequence_order')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Sequence order must be a positive integer'),
  body('is_active')
    .optional()
    .isIn(['Y', 'N'])
    .withMessage('Status must be Y or N'),
];
