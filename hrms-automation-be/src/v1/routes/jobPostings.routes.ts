import { Router } from 'express';
import {
  authenticateToken,
  requirePermission,
} from '../../middlewares/auth.middleware';
import {
  auditCreate,
  auditUpdate,
  auditDelete,
} from '../../middlewares/audit.middleware';
import { jobPostingsController } from '../controllers/jobPostings.controller';
import {
  createJobPostingValidation,
  updateJobPostingValidation,
} from '../validations/jobPostings.validation';

const router = Router();

router.post(
  '/job-postings',
  authenticateToken,
  auditCreate('job_postings'),
  requirePermission([{ module: 'job-posting', action: 'create' }]),
  createJobPostingValidation,
  jobPostingsController.createJobPosting
);

router.get(
  '/job-postings',
  authenticateToken,
  requirePermission([{ module: 'job-posting', action: 'read' }]),
  jobPostingsController.getJobPostings
);

router.get(
  '/job-postings-dropdown',
  authenticateToken,
  jobPostingsController.getJobPostingsDropdown
);

router.get(
  '/job-postings/:id',
  authenticateToken,
  requirePermission([{ module: 'job-posting', action: 'read' }]),
  jobPostingsController.getJobPostingById
);

router.put(
  '/job-postings/:id',
  authenticateToken,
  auditUpdate('job_postings'),
  requirePermission([{ module: 'job-posting', action: 'update' }]),
  updateJobPostingValidation,
  jobPostingsController.updateJobPosting
);

router.delete(
  '/job-postings/:id',
  authenticateToken,
  auditDelete('job_postings'),
  requirePermission([{ module: 'job-posting', action: 'delete' }]),
  jobPostingsController.deleteJobPosting
);

export default router;
