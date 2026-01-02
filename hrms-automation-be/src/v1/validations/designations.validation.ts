import { body } from 'express-validator';

export const createDesignationValidation = [
  body('name')
    .notEmpty()
    .withMessage('Designation name is required')
    .isLength({ max: 255 })
    .withMessage('Designation name must not exceed 255 characters'),
  body('code')
    .notEmpty()
    .withMessage('Designation code is required')
    .isLength({ max: 50 })
    .withMessage('Designation code must not exceed 50 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('department_id')
    .optional()
    .isInt()
    .withMessage('Department ID must be an integer'),
  body('is_active')
    .optional()
    .isIn(['Y', 'N'])
    .withMessage('Status must be Y or N'),
];

export const updateDesignationValidation = [
  body('name')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Designation name must not exceed 255 characters'),
  body('code')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Designation code must not exceed 50 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('department_id')
    .optional()
    .isInt()
    .withMessage('Department ID must be an integer'),
  body('is_active')
    .optional()
    .isIn(['Y', 'N'])
    .withMessage('Status must be Y or N'),
];
