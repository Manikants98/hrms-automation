import { Box } from '@mui/material';
import { useFormik } from 'formik';
import {
  useCreateDepartment,
  useUpdateDepartment,
  type Department,
} from 'hooks/useDepartments';
import React from 'react';
import * as yup from 'yup';
import ActiveInactiveField from 'shared/ActiveInactiveField';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';

const departmentValidationSchema = yup.object({
  name: yup.string().required('Department name is required'),
  code: yup.string().required('Code is required'),
  description: yup.string(),
  is_active: yup.string().oneOf(['Y', 'N']).required('Status is required'),
});

interface ManageDepartmentProps {
  selectedDepartment?: Department | null;
  setSelectedDepartment: (department: Department | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const ManageDepartment: React.FC<ManageDepartmentProps> = ({
  selectedDepartment,
  setSelectedDepartment,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedDepartment;

  const handleCancel = () => {
    setSelectedDepartment(null);
    setDrawerOpen(false);
  };

  const createDepartmentMutation = useCreateDepartment();
  const updateDepartmentMutation = useUpdateDepartment();

  const formik = useFormik({
    initialValues: {
      name: selectedDepartment?.name || '',
      code: selectedDepartment?.code || '',
      description: selectedDepartment?.description || '',
      is_active: selectedDepartment?.is_active || 'Y',
    },
    validationSchema: departmentValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const departmentData = {
          name: values.name,
          code: values.code.toUpperCase().replace(/\s+/g, '_'),
          description: values.description || undefined,
          is_active: values.is_active as 'Y' | 'N',
        };

        if (isEdit && selectedDepartment) {
          await updateDepartmentMutation.mutateAsync({
            id: selectedDepartment.id,
            ...departmentData,
          });
        } else {
          await createDepartmentMutation.mutateAsync(departmentData);
        }

        handleCancel();
      } catch (error) {
        console.error('Error saving department:', error);
      }
    },
  });

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Department' : 'Create Department'}
      size="medium"
    >
      <Box className="!p-5">
        <form onSubmit={formik.handleSubmit}>
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-x-5 !gap-y-4">
            <Input
              name="name"
              label="Department Name"
              placeholder="Enter department name"
              formik={formik}
              required
            />

            <Input
              name="code"
              label="Code"
              placeholder="Enter code (e.g., ENG)"
              formik={formik}
              required
            />

            <Box className="md:!col-span-2">
              <Input
                name="description"
                label="Description"
                placeholder="Enter description"
                formik={formik}
                multiline
                rows={3}
              />
            </Box>
            <Box className="md:!col-span-2">
              <ActiveInactiveField
                name="is_active"
                label="Status"
                formik={formik}
              />
            </Box>
          </Box>

          <Box className="!flex !justify-end gap-1">
            <Button
              type="button"
              variant="outlined"
              onClick={handleCancel}
              className="!mr-3"
              disabled={
                createDepartmentMutation.isPending ||
                updateDepartmentMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createDepartmentMutation.isPending ||
                updateDepartmentMutation.isPending
              }
            >
              {createDepartmentMutation.isPending ||
              updateDepartmentMutation.isPending
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

export default ManageDepartment;
