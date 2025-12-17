import * as Yup from 'yup';

export const candidateValidationSchema = Yup.object({
  name: Yup.string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(200, 'Name must be less than 200 characters'),
  email: Yup.string()
    .required('Email is required')
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters'),
  phone_number: Yup.string()
    .max(20, 'Phone number must be less than 20 characters')
    .matches(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number format'),
  job_posting_id: Yup.number().required('Job posting is required'),
  current_hiring_stage_id: Yup.number(),
  resume_url: Yup.string().max(
    500,
    'Resume URL must be less than 500 characters'
  ),
  cover_letter_url: Yup.string().max(
    500,
    'Cover letter URL must be less than 500 characters'
  ),
  application_date: Yup.string().required('Application date is required'),
  status: Yup.string()
    .oneOf(
      [
        'Applied',
        'Screening',
        'Interview',
        'Offer',
        'Hired',
        'Rejected',
        'Withdrawn',
      ],
      'Invalid status'
    )
    .required('Status is required'),
  notes: Yup.string().max(2000, 'Notes must be less than 2000 characters'),
  experience_years: Yup.number()
    .min(0, 'Experience years must be positive')
    .max(50, 'Experience years must be less than 50'),
  skills: Yup.string().max(500, 'Skills must be less than 500 characters'),
  expected_salary: Yup.number().min(0, 'Expected salary must be positive'),
  current_salary: Yup.number().min(0, 'Current salary must be positive'),
  notice_period: Yup.string().max(
    100,
    'Notice period must be less than 100 characters'
  ),
  availability_date: Yup.string(),
  is_active: Yup.string().required('Status is required'),
});

export type CandidateFormValues = Yup.InferType<
  typeof candidateValidationSchema
>;
