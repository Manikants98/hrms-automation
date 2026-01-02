import { Router } from 'express';
import {
  authenticateToken,
  requirePermission,
} from '../../middlewares/auth.middleware';
import { importExportController } from '../controllers/import-export.controller';
import { upload } from '../../utils/multer';

const router = Router();

router.get(
  '/export/template/:table',
  authenticateToken,
  requirePermission([{ module: 'report', action: 'read' }]),
  importExportController.exportTemplate
);

router.get(
  '/export/data/:table',
  authenticateToken,
  requirePermission([{ module: 'report', action: 'read' }]),
  importExportController.exportData
);

router.post(
  '/import/preview/:table',
  authenticateToken,
  upload.single('file'),
  requirePermission([{ module: 'report', action: 'create' }]),
  importExportController.previewImport
);

router.post(
  '/import/data/:table',
  authenticateToken,
  upload.single('file'),
  requirePermission([{ module: 'report', action: 'create' }]),
  importExportController.importData
);

router.get(
  '/import-export/supported-tables',
  authenticateToken,
  importExportController.getSupportedTables
);

export default router;
