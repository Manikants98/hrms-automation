import { body } from 'express-validator';

export const createAttachmentTypeValidation = [
  body('name')
    .notEmpty()
    .withMessage('Attachment type name is required')
    .isLength({ max: 255 })
    .withMessage('Attachment type name must not exceed 255 characters'),
  body('code')
    .notEmpty()
    .withMessage('Attachment type code is required')
    .isLength({ max: 50 })
    .withMessage('Attachment type code must not exceed 50 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('is_active')
    .optional()
    .isIn(['Y', 'N'])
    .withMessage('Status must be Y or N'),
];

export const updateAttachmentTypeValidation = [
  body('name')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Attachment type name must not exceed 255 characters'),
  body('code')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Attachment type code must not exceed 50 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('is_active')
    .optional()
    .isIn(['Y', 'N'])
    .withMessage('Status must be Y or N'),
];
