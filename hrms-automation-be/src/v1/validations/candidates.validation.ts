import { body } from 'express-validator';

export const createCandidateValidation = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Name must be between 2 and 255 characters'),
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .isLength({ max: 255 })
    .withMessage('Email must not exceed 255 characters'),
  body('phone_number')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Phone number must not exceed 20 characters'),
  body('job_posting_id')
    .notEmpty()
    .withMessage('Job posting is required')
    .isInt()
    .withMessage('Job posting ID must be an integer'),
  body('current_hiring_stage_id')
    .optional()
    .isInt()
    .withMessage('Hiring stage ID must be an integer'),
  body('resume_url')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Resume URL must not exceed 500 characters'),
  body('cover_letter_url')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Cover letter URL must not exceed 500 characters'),
  body('application_date')
    .optional()
    .isISO8601()
    .withMessage('Application date must be a valid date'),
  body('status')
    .optional()
    .isIn(['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected', 'Withdrawn'])
    .withMessage('Invalid status'),
  body('notes')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Notes must not exceed 2000 characters'),
  body('experience_years')
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage('Experience years must be between 0 and 50'),
  body('skills')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Skills must not exceed 500 characters'),
  body('expected_salary')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Expected salary must be a positive number'),
  body('current_salary')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Current salary must be a positive number'),
  body('notice_period')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Notice period must not exceed 100 characters'),
  body('availability_date')
    .optional()
    .isISO8601()
    .withMessage('Availability date must be a valid date'),
  body('is_active')
    .optional()
    .isIn(['Y', 'N'])
    .withMessage('Status must be Y or N'),
];

export const updateCandidateValidation = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 255 })
    .withMessage('Name must be between 2 and 255 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email format')
    .isLength({ max: 255 })
    .withMessage('Email must not exceed 255 characters'),
  body('phone_number')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Phone number must not exceed 20 characters'),
  body('job_posting_id')
    .optional()
    .isInt()
    .withMessage('Job posting ID must be an integer'),
  body('current_hiring_stage_id')
    .optional()
    .isInt()
    .withMessage('Hiring stage ID must be an integer'),
  body('resume_url')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Resume URL must not exceed 500 characters'),
  body('cover_letter_url')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Cover letter URL must not exceed 500 characters'),
  body('application_date')
    .optional()
    .isISO8601()
    .withMessage('Application date must be a valid date'),
  body('status')
    .optional()
    .isIn(['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected', 'Withdrawn'])
    .withMessage('Invalid status'),
  body('notes')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Notes must not exceed 2000 characters'),
  body('experience_years')
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage('Experience years must be between 0 and 50'),
  body('skills')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Skills must not exceed 500 characters'),
  body('expected_salary')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Expected salary must be a positive number'),
  body('current_salary')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Current salary must be a positive number'),
  body('notice_period')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Notice period must not exceed 100 characters'),
  body('availability_date')
    .optional()
    .isISO8601()
    .withMessage('Availability date must be a valid date'),
  body('is_active')
    .optional()
    .isIn(['Y', 'N'])
    .withMessage('Status must be Y or N'),
];
