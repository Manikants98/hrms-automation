import prisma from '../../configs/prisma.client';

const serializeApprovalWorkflow = (workflow: any) => ({
  id: workflow.id,
  workflow_type: workflow.workflow_type,
  reference_id: workflow.reference_id,
  reference_type: workflow.reference_type,
  reference_number: workflow.reference_number,
  requested_by: workflow.requested_by,
  request_date: workflow.request_date,
  priority: workflow.priority,
  status: workflow.status,
  current_step: workflow.current_step,
  total_steps: workflow.total_steps,
  request_data: workflow.request_data,
  final_approved_by: workflow.final_approved_by,
  final_approved_at: workflow.final_approved_at,
  rejected_by: workflow.rejected_by,
  rejected_at: workflow.rejected_at,
  rejection_reason: workflow.rejection_reason,
  is_active: workflow.is_active,
  createdate: workflow.createdate,
  updatedate: workflow.updatedate,
  requester: workflow.users_approval_workflows_requested_byTousers
    ? {
        id: workflow.users_approval_workflows_requested_byTousers.id,
        name: workflow.users_approval_workflows_requested_byTousers.name,
        email: workflow.users_approval_workflows_requested_byTousers.email,
      }
    : null,
  approver: workflow.users_approval_workflows_final_approved_byTousers
    ? {
        id: workflow.users_approval_workflows_final_approved_byTousers.id,
        name: workflow.users_approval_workflows_final_approved_byTousers.name,
        email: workflow.users_approval_workflows_final_approved_byTousers.email,
      }
    : null,
  steps:
    workflow.workflow_steps?.map((step: any) => ({
      id: step.id,
      step_number: step.step_number,
      step_name: step.step_name,
      assigned_role: step.assigned_role,
      status: step.status,
      processed_by: step.processed_by,
      processed_at: step.processed_at,
    })) || [],
});

export const approvalWorkflowsController = {
  async getApprovalWorkflows(req: any, res: any) {
    try {
      const { workflow_type, status } = req.query;

      const filters: any = { is_active: 'Y' };

      if (workflow_type) {
        filters.workflow_type = workflow_type as string;
      }

      if (status) {
        filters.status = status as string;
      }

      const workflows = await prisma.approval_workflows.findMany({
        where: filters,
        include: {
          users_approval_workflows_requested_byTousers: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          users_approval_workflows_final_approved_byTousers: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          workflow_steps: {
            orderBy: {
              step_number: 'asc',
            },
          },
        },
        orderBy: { createdate: 'desc' },
      });

      res.success(
        workflows.map(serializeApprovalWorkflow),
        'Approval workflows fetched successfully'
      );
    } catch (error: any) {
      console.error('Get approval workflows error:', error);
      res.error(error.message || 'Failed to fetch approval workflows', 500);
    }
  },

  async getApprovalWorkflowById(req: any, res: any) {
    try {
      const { id } = req.params;

      // Validate id parameter
      if (!id) {
        return res.error('ID parameter is required', 400);
      }

      const workflowId = parseInt(id);
      if (isNaN(workflowId)) {
        return res.error('Invalid ID format', 400);
      }

      const workflow = await prisma.approval_workflows.findUnique({
        where: { id: workflowId },
        include: {
          users_approval_workflows_requested_byTousers: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          users_approval_workflows_final_approved_byTousers: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          workflow_steps: {
            include: {
              users_workflow_steps_assigned_user_idTousers: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
              users_workflow_steps_processed_byTousers: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
            orderBy: {
              step_number: 'asc',
            },
          },
        },
      });

      if (!workflow) {
        res.error('Approval workflow not found', 404);
        return;
      }

      res.success(
        'Approval workflow fetched successfully',
        serializeApprovalWorkflow(workflow)
      );
    } catch (error: any) {
      console.error('Get approval workflow error:', error);
      res.error(error.message || 'Failed to fetch approval workflow', 500);
    }
  },

  async approveWorkflow(req: any, res: any) {
    try {
      const { id } = req.params;

      const workflow = await prisma.approval_workflows.findUnique({
        where: { id: parseInt(id) },
      });

      if (!workflow) {
        res.error('Approval workflow not found', 404);
        return;
      }

      if (workflow.status !== 'pending') {
        res.error('Workflow is already processed', 400);
        return;
      }

      const updatedWorkflow = await prisma.approval_workflows.update({
        where: { id: parseInt(id) },
        data: {
          status: 'approved',
          final_approved_by: req.user?.id || 1,
          final_approved_at: new Date(),
          updatedby: req.user?.id || 1,
          updatedate: new Date(),
        },
        include: {
          users_approval_workflows_requested_byTousers: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      switch (workflow.workflow_type) {
        case 'LEAVE_APPROVAL':
          await prisma.leave_applications.update({
            where: { id: parseInt(workflow.reference_id) },
            data: {
              approval_status: 'Approved',
              approved_by: req.user?.id || 1,
              approved_date: new Date(),
            },
          });
          break;
      }

      res.success(
        'Workflow approved successfully',
        serializeApprovalWorkflow(updatedWorkflow)
      );
    } catch (error: any) {
      console.error('Approve workflow error:', error);
      res.error(error.message || 'Failed to approve workflow', 500);
    }
  },

  async rejectWorkflow(req: any, res: any) {
    try {
      const { id } = req.params;
      const { rejection_reason } = req.body;

      const workflow = await prisma.approval_workflows.findUnique({
        where: { id: parseInt(id) },
      });

      if (!workflow) {
        res.error('Approval workflow not found', 404);
        return;
      }

      if (workflow.status !== 'pending') {
        res.error('Workflow is already processed', 400);
        return;
      }

      const updatedWorkflow = await prisma.approval_workflows.update({
        where: { id: parseInt(id) },
        data: {
          status: 'rejected',
          rejected_by: req.user?.id || 1,
          rejected_at: new Date(),
          rejection_reason,
          updatedby: req.user?.id || 1,
          updatedate: new Date(),
        },
        include: {
          users_approval_workflows_requested_byTousers: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      switch (workflow.workflow_type) {
        case 'LEAVE_APPROVAL':
          await prisma.leave_applications.update({
            where: { id: parseInt(workflow.reference_id) },
            data: {
              approval_status: 'Rejected',
              approved_by: req.user?.id || 1,
              approved_date: new Date(),
              rejection_reason,
            },
          });
          break;
      }

      res.success(
        'Workflow rejected successfully',
        serializeApprovalWorkflow(updatedWorkflow)
      );
    } catch (error: any) {
      console.error('Reject workflow error:', error);
      res.error(error.message || 'Failed to reject workflow', 500);
    }
  },
};
