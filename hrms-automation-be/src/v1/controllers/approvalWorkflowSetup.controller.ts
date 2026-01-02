import prisma from '../../configs/prisma.client';

export const approvalWorkflowSetupController = {
  async getApprovalWorkflowSetups(req: any, res: any) {
    try {
      const workflows = await prisma.approval_workflows.findMany({
        where: { is_active: 'Y' },
        include: {
          users_approval_workflows_requested_byTousers: {
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
            },
          },
        },
        orderBy: { createdate: 'desc' },
      });

      res.success('Approval workflows fetched successfully', workflows);
    } catch (error: any) {
      console.error('Get approval workflows error:', error);
      res.error(error.message || 'Failed to fetch approval workflows', 500);
    }
  },

  async getApprovalWorkflowSetupById(req: any, res: any) {
    try {
      const { id } = req.params;

      const workflow = await prisma.approval_workflows.findUnique({
        where: { id: parseInt(id) },
        include: {
          users_approval_workflows_requested_byTousers: {
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
            },
          },
        },
      });

      if (!workflow) {
        res.error('Approval workflow not found', 404);
        return;
      }

      res.success('Approval workflow fetched successfully', workflow);
    } catch (error: any) {
      console.error('Get approval workflow error:', error);
      res.error(error.message || 'Failed to fetch approval workflow', 500);
    }
  },
};
