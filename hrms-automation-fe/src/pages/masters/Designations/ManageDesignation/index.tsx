import { Box } from '@mui/material';
import { useFormik } from 'formik';
import {
  useCreateDesignation,
  useUpdateDesignation,
  type Designation,
} from 'hooks/useDesignations';
import React from 'react';
import * as yup from 'yup';
import ActiveInactiveField from 'shared/ActiveInactiveField';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';

const designationValidationSchema = yup.object({
  name: yup.string().required('Designation name is required'),
  code: yup.string().required('Code is required'),
  description: yup.string(),
  is_active: yup.string().oneOf(['Y', 'N']).required('Status is required'),
});

interface ManageDesignationProps {
  selectedDesignation?: Designation | null;
  setSelectedDesignation: (designation: Designation | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const ManageDesignation: React.FC<ManageDesignationProps> = ({
  selectedDesignation,
  setSelectedDesignation,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedDesignation;

  const handleCancel = () => {
    setSelectedDesignation(null);
    setDrawerOpen(false);
  };

  const createDesignationMutation = useCreateDesignation();
  const updateDesignationMutation = useUpdateDesignation();

  const formik = useFormik({
    initialValues: {
      name: selectedDesignation?.name || '',
      code: selectedDesignation?.code || '',
      description: selectedDesignation?.description || '',
      is_active: selectedDesignation?.is_active || 'Y',
    },
    validationSchema: designationValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const designationData = {
          name: values.name,
          code: values.code.toUpperCase().replace(/\s+/g, '_'),
          description: values.description || undefined,
          is_active: values.is_active as 'Y' | 'N',
        };

        if (isEdit && selectedDesignation) {
          await updateDesignationMutation.mutateAsync({
            id: selectedDesignation.id,
            ...designationData,
          });
        } else {
          await createDesignationMutation.mutateAsync(designationData);
        }

        handleCancel();
      } catch (error) {
        console.error('Error saving designation:', error);
      }
    },
  });

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Designation' : 'Create Designation'}
      size="medium"
    >
      <Box className="!p-5">
        <form onSubmit={formik.handleSubmit}>
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-x-5 !gap-y-4">
            <Input
              name="name"
              label="Designation Name"
              placeholder="Enter designation name"
              formik={formik}
              required
            />

            <Input
              name="code"
              label="Code"
              placeholder="Enter code (e.g., SE)"
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
                createDesignationMutation.isPending ||
                updateDesignationMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createDesignationMutation.isPending ||
                updateDesignationMutation.isPending
              }
            >
              {createDesignationMutation.isPending ||
              updateDesignationMutation.isPending
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

export default ManageDesignation;
