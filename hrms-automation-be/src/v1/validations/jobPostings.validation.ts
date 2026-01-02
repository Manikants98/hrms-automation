import { body } from 'express-validator';

export const createJobPostingValidation = [
  body('job_title')
    .notEmpty()
    .withMessage('Job title is required')
    .isLength({ max: 255 })
    .withMessage('Job title must not exceed 255 characters'),
  body('reporting_manager_id')
    .optional()
    .isInt()
    .withMessage('Reporting manager ID must be an integer'),
  body('department_id')
    .optional()
    .isInt()
    .withMessage('Department ID must be an integer'),
  body('designation_id')
    .optional()
    .isInt()
    .withMessage('Designation ID must be an integer'),
  body('due_date')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  body('annual_salary_from')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Annual salary from must be a positive number'),
  body('annual_salary_to')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Annual salary to must be a positive number'),
  body('currency_code')
    .optional()
    .isLength({ max: 10 })
    .withMessage('Currency code must not exceed 10 characters'),
  body('experience')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Experience must not exceed 100 characters'),
  body('posting_date')
    .optional()
    .isISO8601()
    .withMessage('Posting date must be a valid date'),
  body('closing_date')
    .optional()
    .isISO8601()
    .withMessage('Closing date must be a valid date'),
  body('is_internal_job')
    .optional()
    .isIn(['Y', 'N'])
    .withMessage('Is internal job must be Y or N'),
  body('description')
    .optional(),
  body('hiring_stages')
    .optional()
    .isArray()
    .withMessage('Hiring stages must be an array'),
  body('attachments_required')
    .optional()
    .isArray()
    .withMessage('Attachments required must be an array'),
  body('is_active')
    .optional()
    .isIn(['Y', 'N'])
    .withMessage('Status must be Y or N'),
];

export const updateJobPostingValidation = [
  body('job_title')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Job title must not exceed 255 characters'),
  body('reporting_manager_id')
    .optional()
    .isInt()
    .withMessage('Reporting manager ID must be an integer'),
  body('department_id')
    .optional()
    .isInt()
    .withMessage('Department ID must be an integer'),
  body('designation_id')
    .optional()
    .isInt()
    .withMessage('Designation ID must be an integer'),
  body('due_date')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  body('annual_salary_from')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Annual salary from must be a positive number'),
  body('annual_salary_to')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Annual salary to must be a positive number'),
  body('currency_code')
    .optional()
    .isLength({ max: 10 })
    .withMessage('Currency code must not exceed 10 characters'),
  body('experience')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Experience must not exceed 100 characters'),
  body('posting_date')
    .optional()
    .isISO8601()
    .withMessage('Posting date must be a valid date'),
  body('closing_date')
    .optional()
    .isISO8601()
    .withMessage('Closing date must be a valid date'),
  body('is_internal_job')
    .optional()
    .isIn(['Y', 'N'])
    .withMessage('Is internal job must be Y or N'),
  body('description')
    .optional(),
  body('hiring_stages')
    .optional()
    .isArray()
    .withMessage('Hiring stages must be an array'),
  body('attachments_required')
    .optional()
    .isArray()
    .withMessage('Attachments required must be an array'),
  body('is_active')
    .optional()
    .isIn(['Y', 'N'])
    .withMessage('Status must be Y or N'),
];
