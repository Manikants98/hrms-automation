import { Box } from '@mui/material';
import { useFormik } from 'formik';
import {
  useCreateHiringStage,
  useUpdateHiringStage,
  type HiringStage,
} from 'hooks/useHiringStages';
import React from 'react';
import { hiringStageValidationSchema } from 'schemas/hiringStage.schema';
import ActiveInactiveField from 'shared/ActiveInactiveField';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';

interface ManageHiringStageProps {
  selectedHiringStage?: HiringStage | null;
  setSelectedHiringStage: (hiringStage: HiringStage | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const ManageHiringStage: React.FC<ManageHiringStageProps> = ({
  selectedHiringStage,
  setSelectedHiringStage,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedHiringStage;

  const handleCancel = () => {
    setSelectedHiringStage(null);
    setDrawerOpen(false);
  };

  const createHiringStageMutation = useCreateHiringStage();
  const updateHiringStageMutation = useUpdateHiringStage();

  const formik = useFormik({
    initialValues: {
      name: selectedHiringStage?.name || '',
      code: selectedHiringStage?.code || '',
      description: selectedHiringStage?.description || '',
      sequence_order: selectedHiringStage?.sequence_order || 0,
      is_active: selectedHiringStage?.is_active || 'Y',
    },
    validationSchema: hiringStageValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const hiringStageData = {
          name: values.name,
          code: values.code.toUpperCase().replace(/\s+/g, '_'),
          description: values.description || undefined,
          sequence_order: values.sequence_order,
          is_active: values.is_active,
        };

        if (isEdit && selectedHiringStage) {
          await updateHiringStageMutation.mutateAsync({
            id: selectedHiringStage.id,
            ...hiringStageData,
          });
        } else {
          await createHiringStageMutation.mutateAsync(hiringStageData);
        }

        handleCancel();
      } catch (error) {
        console.error('Error saving hiring stage:', error);
      }
    },
  });

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Hiring Stage' : 'Create Hiring Stage'}
      size="medium"
    >
      <Box className="!p-5">
        <form onSubmit={formik.handleSubmit}>
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-x-5 !gap-y-4">
            <Input
              name="name"
              label="Hiring Stage Name"
              placeholder="Enter hiring stage name"
              formik={formik}
              required
            />

            <Input
              name="code"
              label="Code"
              placeholder="Enter code (e.g., APP_REC)"
              formik={formik}
              required
            />

            <Input
              name="sequence_order"
              label="Sequence Order"
              type="number"
              placeholder="Enter sequence order"
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
                createHiringStageMutation.isPending ||
                updateHiringStageMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createHiringStageMutation.isPending ||
                updateHiringStageMutation.isPending
              }
            >
              {createHiringStageMutation.isPending ||
              updateHiringStageMutation.isPending
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

export default ManageHiringStage;
