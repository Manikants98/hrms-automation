import { body } from 'express-validator';

export const createDepartmentValidation = [
  body('name')
    .notEmpty()
    .withMessage('Department name is required')
    .isLength({ max: 255 })
    .withMessage('Department name must not exceed 255 characters'),
  body('code')
    .notEmpty()
    .withMessage('Department code is required')
    .isLength({ max: 50 })
    .withMessage('Department code must not exceed 50 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('parent_id')
    .optional()
    .isInt()
    .withMessage('Parent ID must be an integer'),
  body('manager_id')
    .optional()
    .isInt()
    .withMessage('Manager ID must be an integer'),
  body('is_active')
    .optional()
    .isIn(['Y', 'N'])
    .withMessage('Status must be Y or N'),
];

export const updateDepartmentValidation = [
  body('name')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Department name must not exceed 255 characters'),
  body('code')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Department code must not exceed 50 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('parent_id')
    .optional()
    .isInt()
    .withMessage('Parent ID must be an integer'),
  body('manager_id')
    .optional()
    .isInt()
    .withMessage('Manager ID must be an integer'),
  body('is_active')
    .optional()
    .isIn(['Y', 'N'])
    .withMessage('Status must be Y or N'),
];
