import { body } from 'express-validator';

export const createLeaveTypeValidation = [
  body('name')
    .notEmpty()
    .withMessage('Leave type name is required')
    .isLength({ max: 100 })
    .withMessage('Leave type name must not exceed 100 characters'),
  body('code')
    .notEmpty()
    .withMessage('Leave type code is required')
    .isLength({ max: 50 })
    .withMessage('Leave type code must not exceed 50 characters'),
  body('max_days_per_year')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Max days per year must be a positive integer'),
  body('is_paid')
    .optional()
    .isIn(['Y', 'N'])
    .withMessage('Is paid must be Y or N'),
  body('requires_approval')
    .optional()
    .isIn(['Y', 'N'])
    .withMessage('Requires approval must be Y or N'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('is_active')
    .optional()
    .isIn(['Y', 'N'])
    .withMessage('Status must be Y or N'),
];

export const updateLeaveTypeValidation = [
  body('name')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Leave type name must not exceed 100 characters'),
  body('code')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Leave type code must not exceed 50 characters'),
  body('max_days_per_year')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Max days per year must be a positive integer'),
  body('is_paid')
    .optional()
    .isIn(['Y', 'N'])
    .withMessage('Is paid must be Y or N'),
  body('requires_approval')
    .optional()
    .isIn(['Y', 'N'])
    .withMessage('Requires approval must be Y or N'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('is_active')
    .optional()
    .isIn(['Y', 'N'])
    .withMessage('Status must be Y or N'),
];
