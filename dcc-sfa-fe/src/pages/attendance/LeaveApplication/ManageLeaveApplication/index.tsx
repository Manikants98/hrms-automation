import { Box, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import {
  useCreateLeaveApplication,
  useUpdateLeaveApplication,
  type LeaveApplication,
} from 'hooks/useLeaveApplications';
import React from 'react';
import { leaveApplicationValidationSchema } from 'schemas/leaveApplication.schema';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';
import UserSelect from 'shared/UserSelect';

interface ManageLeaveApplicationProps {
  selectedLeaveApplication?: LeaveApplication | null;
  setSelectedLeaveApplication: (application: LeaveApplication | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const ManageLeaveApplication: React.FC<ManageLeaveApplicationProps> = ({
  selectedLeaveApplication,
  setSelectedLeaveApplication,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedLeaveApplication;

  const handleCancel = () => {
    setSelectedLeaveApplication(null);
    setDrawerOpen(false);
  };

  const createLeaveApplicationMutation = useCreateLeaveApplication();
  const updateLeaveApplicationMutation = useUpdateLeaveApplication();

  const formik = useFormik({
    initialValues: {
      employee_id: selectedLeaveApplication?.employee_id || 0,
      leave_type: selectedLeaveApplication?.leave_type || 'Annual',
      start_date: selectedLeaveApplication?.start_date || '',
      end_date: selectedLeaveApplication?.end_date || '',
      reason: selectedLeaveApplication?.reason || '',
    },
    validationSchema: leaveApplicationValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const leaveApplicationData = {
          employee_id: values.employee_id,
          leave_type: values.leave_type,
          start_date: values.start_date,
          end_date: values.end_date,
          reason: values.reason,
        };

        if (isEdit && selectedLeaveApplication) {
          await updateLeaveApplicationMutation.mutateAsync({
            id: selectedLeaveApplication.id,
            ...leaveApplicationData,
          });
        } else {
          await createLeaveApplicationMutation.mutateAsync(
            leaveApplicationData
          );
        }

        handleCancel();
      } catch (error) {
        console.error('Error saving leave application:', error);
      }
    },
  });

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Leave Application' : 'Create Leave Application'}
      size="medium"
    >
      <Box className="!p-5">
        <form onSubmit={formik.handleSubmit}>
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-x-5 !gap-y-4">
            <UserSelect
              name="employee_id"
              label="Employee"
              formik={formik}
              required
              nameToSearch={selectedLeaveApplication?.employee_name || ''}
            />

            <Select
              name="leave_type"
              label="Leave Type"
              formik={formik}
              required
              fullWidth
            >
              <MenuItem value="Annual">Annual</MenuItem>
              <MenuItem value="Sick">Sick</MenuItem>
              <MenuItem value="Casual">Casual</MenuItem>
              <MenuItem value="Emergency">Emergency</MenuItem>
              <MenuItem value="Maternity">Maternity</MenuItem>
              <MenuItem value="Paternity">Paternity</MenuItem>
              <MenuItem value="Unpaid">Unpaid</MenuItem>
            </Select>

            <Input
              name="start_date"
              label="Start Date"
              type="date"
              formik={formik}
              required
            />

            <Input
              name="end_date"
              label="End Date"
              type="date"
              formik={formik}
              required
            />

            <Box className="md:!col-span-2">
              <Input
                name="reason"
                label="Reason"
                placeholder="Enter reason for leave"
                formik={formik}
                required
                multiline
                rows={4}
              />
            </Box>
          </Box>

          <Box className="!flex !justify-end gap-1 !mt-6">
            <Button
              type="button"
              variant="outlined"
              onClick={handleCancel}
              className="!mr-3"
              disabled={
                createLeaveApplicationMutation.isPending ||
                updateLeaveApplicationMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createLeaveApplicationMutation.isPending ||
                updateLeaveApplicationMutation.isPending
              }
            >
              {createLeaveApplicationMutation.isPending ||
              updateLeaveApplicationMutation.isPending
                ? isEdit
                  ? 'Updating...'
                  : 'Creating...'
                : isEdit
                  ? 'Update'
                  : 'Create'}
            </Button>
          </Box>
        </form>
      </Box>
    </CustomDrawer>
  );
};

export default ManageLeaveApplication;
