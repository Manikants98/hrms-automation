import { Box } from '@mui/material';
import { useFormik } from 'formik';
import {
  useCreateAttachmentType,
  useUpdateAttachmentType,
  type AttachmentType,
} from 'hooks/useAttachmentTypes';
import React from 'react';
import * as yup from 'yup';
import ActiveInactiveField from 'shared/ActiveInactiveField';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';

const attachmentTypeValidationSchema = yup.object({
  name: yup.string().required('Attachment type name is required'),
  code: yup.string().required('Code is required'),
  description: yup.string(),
  is_active: yup.string().oneOf(['Y', 'N']).required('Status is required'),
});

interface ManageAttachmentTypeProps {
  selectedAttachmentType?: AttachmentType | null;
  setSelectedAttachmentType: (attachmentType: AttachmentType | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const ManageAttachmentType: React.FC<ManageAttachmentTypeProps> = ({
  selectedAttachmentType,
  setSelectedAttachmentType,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedAttachmentType;

  const handleCancel = () => {
    setSelectedAttachmentType(null);
    setDrawerOpen(false);
  };

  const createAttachmentTypeMutation = useCreateAttachmentType();
  const updateAttachmentTypeMutation = useUpdateAttachmentType();

  const formik = useFormik({
    initialValues: {
      name: selectedAttachmentType?.name || '',
      code: selectedAttachmentType?.code || '',
      description: selectedAttachmentType?.description || '',
      is_active: selectedAttachmentType?.is_active || 'Y',
    },
    validationSchema: attachmentTypeValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const attachmentTypeData = {
          name: values.name,
          code: values.code.toUpperCase().replace(/\s+/g, '_'),
          description: values.description || undefined,
          is_active: values.is_active as 'Y' | 'N',
        };

        if (isEdit && selectedAttachmentType) {
          await updateAttachmentTypeMutation.mutateAsync({
            id: selectedAttachmentType.id,
            ...attachmentTypeData,
          });
        } else {
          await createAttachmentTypeMutation.mutateAsync(attachmentTypeData);
        }

        handleCancel();
      } catch (error) {
        console.error('Error saving attachment type:', error);
      }
    },
  });

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Attachment Type' : 'Create Attachment Type'}
      size="medium"
    >
      <Box className="!p-5">
        <form onSubmit={formik.handleSubmit}>
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-x-5 !gap-y-4">
            <Input
              name="name"
              label="Attachment Type Name"
              placeholder="Enter attachment type name"
              formik={formik}
              required
            />

            <Input
              name="code"
              label="Code"
              placeholder="Enter code (e.g., RESUME)"
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
                createAttachmentTypeMutation.isPending ||
                updateAttachmentTypeMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createAttachmentTypeMutation.isPending ||
                updateAttachmentTypeMutation.isPending
              }
            >
              {createAttachmentTypeMutation.isPending ||
              updateAttachmentTypeMutation.isPending
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

export default ManageAttachmentType;
