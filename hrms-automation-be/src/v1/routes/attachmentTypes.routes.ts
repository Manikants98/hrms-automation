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
import { attachmentTypesController } from '../controllers/attachmentTypes.controller';
import {
  createAttachmentTypeValidation,
  updateAttachmentTypeValidation,
} from '../validations/attachmentTypes.validation';

const router = Router();

router.post(
  '/attachment-types',
  authenticateToken,
  auditCreate('attachment_types'),
  requirePermission([{ module: 'attachment-type', action: 'create' }]),
  createAttachmentTypeValidation,
  attachmentTypesController.createAttachmentType
);

router.get(
  '/attachment-types',
  authenticateToken,
  requirePermission([{ module: 'attachment-type', action: 'read' }]),
  attachmentTypesController.getAttachmentTypes
);

router.get(
  '/attachment-types-dropdown',
  authenticateToken,
  attachmentTypesController.getAttachmentTypesDropdown
);

router.get(
  '/attachment-types/:id',
  authenticateToken,
  requirePermission([{ module: 'attachment-type', action: 'read' }]),
  attachmentTypesController.getAttachmentTypeById
);

router.put(
  '/attachment-types/:id',
  authenticateToken,
  auditUpdate('attachment_types'),
  requirePermission([{ module: 'attachment-type', action: 'update' }]),
  updateAttachmentTypeValidation,
  attachmentTypesController.updateAttachmentType
);

router.delete(
  '/attachment-types/:id',
  authenticateToken,
  auditDelete('attachment_types'),
  requirePermission([{ module: 'attachment-type', action: 'delete' }]),
  attachmentTypesController.deleteAttachmentType
);

export default router;
