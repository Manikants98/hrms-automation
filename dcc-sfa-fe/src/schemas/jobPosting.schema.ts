import * as Yup from 'yup';

export const jobPostingValidationSchema = Yup.object({
  job_title: Yup.string()
    .required('Job title is required')
    .min(2, 'Job title must be at least 2 characters')
    .max(200, 'Job title must be less than 200 characters'),
  reporting_manager_id: Yup.number().required('Reporting manager is required'),
  department_id: Yup.number().required('Department is required'),
  due_date: Yup.string().required('Due date is required'),
  annual_salary_from: Yup.number()
    .required('Annual salary from is required')
    .min(0, 'Salary must be positive'),
  annual_salary_to: Yup.number()
    .required('Annual salary to is required')
    .min(0, 'Salary must be positive')
    .test(
      'is-greater-than-from',
      'Annual salary to must be greater than annual salary from',
      function (value) {
        const { annual_salary_from } = this.parent;
        if (!value || !annual_salary_from) return true;
        return value >= annual_salary_from;
      }
    ),
  currency_code: Yup.string().required('Currency code is required'),
  designation_id: Yup.number().required('Designation is required'),
  experience: Yup.string().required('Experience is required'),
  posting_date: Yup.string().required('Posting date is required'),
  closing_date: Yup.string()
    .required('Closing date is required')
    .test(
      'is-after-posting',
      'Closing date must be after posting date',
      function (value) {
        const { posting_date } = this.parent;
        if (!value || !posting_date) return true;
        return new Date(value) >= new Date(posting_date);
      }
    ),
  is_internal_job: Yup.string().required('Internal job status is required'),
  hiring_stages: Yup.array()
    .of(
      Yup.object({
        hiring_stage_id: Yup.number().required(),
        sequence: Yup.number().required(),
      })
    )
    .min(1, 'At least one hiring stage is required'),
  attachments_required: Yup.array()
    .of(
      Yup.object({
        attachment_type_id: Yup.number().required(),
        sequence: Yup.number().required(),
      })
    )
    .min(1, 'At least one attachment is required'),
  description: Yup.string().max(
    5000,
    'Description must be less than 5000 characters'
  ),
  is_active: Yup.string().required('Status is required'),
});

export type JobPostingFormValues = Yup.InferType<
  typeof jobPostingValidationSchema
>;
