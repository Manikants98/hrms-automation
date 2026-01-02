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
import { leaveBalancesController } from '../controllers/leaveBalances.controller';
import {
  createLeaveBalanceValidation,
  updateLeaveBalanceValidation,
} from '../validations/leaveBalances.validation';

const router = Router();

router.post(
  '/leave-balances',
  authenticateToken,
  auditCreate('leave_balances'),
  requirePermission([{ module: 'leave-balance', action: 'create' }]),
  createLeaveBalanceValidation,
  leaveBalancesController.createLeaveBalance
);

router.get(
  '/leave-balances',
  authenticateToken,
  requirePermission([{ module: 'leave-balance', action: 'read' }]),
  leaveBalancesController.getLeaveBalances
);

router.get(
  '/leave-balances/:id',
  authenticateToken,
  requirePermission([{ module: 'leave-balance', action: 'read' }]),
  leaveBalancesController.getLeaveBalanceById
);

router.put(
  '/leave-balances/:id',
  authenticateToken,
  auditUpdate('leave_balances'),
  requirePermission([{ module: 'leave-balance', action: 'update' }]),
  updateLeaveBalanceValidation,
  leaveBalancesController.updateLeaveBalance
);

router.delete(
  '/leave-balances/:id',
  authenticateToken,
  auditDelete('leave_balances'),
  requirePermission([{ module: 'leave-balance', action: 'delete' }]),
  leaveBalancesController.deleteLeaveBalance
);

export default router;
