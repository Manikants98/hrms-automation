import prisma from '../../configs/prisma.client';

export const workflowController = {
  async getWorkflows(req: any, res: any) {
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
          workflow_steps: true,
        },
        orderBy: { createdate: 'desc' },
      });

      res.success('Workflows fetched successfully', workflows);
    } catch (error: any) {
      console.error('Get workflows error:', error);
      res.error(error.message || 'Failed to fetch workflows', 500);
    }
  },

  async getWorkflowById(req: any, res: any) {
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
        res.error('Workflow not found', 404);
        return;
      }

      res.success('Workflow fetched successfully', workflow);
    } catch (error: any) {
      console.error('Get workflow error:', error);
      res.error(error.message || 'Failed to fetch workflow', 500);
    }
  },
};
