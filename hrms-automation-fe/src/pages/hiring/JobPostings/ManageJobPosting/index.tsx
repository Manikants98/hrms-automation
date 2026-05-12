import { Add, Delete } from '@mui/icons-material';
import { Box, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import { useAttachmentTypesDropdown } from 'hooks/useAttachmentTypes';
import { useDepartmentsDropdown } from 'hooks/useDepartments';
import { useDesignationsDropdown } from 'hooks/useDesignations';
import { useHiringStages } from 'hooks/useHiringStages';
import {
  useCreateJobPosting,
  useUpdateJobPosting,
  type JobPosting,
} from 'hooks/useJobPostings';
import React, { useEffect, useMemo, useState } from 'react';
import { jobPostingValidationSchema } from 'schemas/jobPosting.schema';
import { ActionButton } from 'shared/ActionButton';
import ActiveInactiveField from 'shared/ActiveInactiveField';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import RichTextEditor from 'shared/RichTextEditor';
import Select from 'shared/Select';
import UserSelect from 'shared/UserSelect';

interface ManageJobPostingProps {
  selectedJobPosting?: JobPosting | null;
  setSelectedJobPosting: (jobPosting: JobPosting | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const ManageJobPosting: React.FC<ManageJobPostingProps> = ({
  selectedJobPosting,
  setSelectedJobPosting,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedJobPosting;

  const [selectedHiringStages, setSelectedHiringStages] = useState<
    Array<{
      description?: string;
      hiring_stage_id: number;
      sequence: number;
      name: string;
      code: string;
    }>
  >([]);
  const [selectedAttachments, setSelectedAttachments] = useState<
    Array<{
      attachment_type_id: number;
      sequence: number;
      name: string;
      description?: string;
    }>
  >([]);

  console.log('selectedHiringStages:', selectedHiringStages);

  const { data: hiringStagesResponse } = useHiringStages({ isActive: 'Y' });
  const availableHiringStages = Array.isArray(hiringStagesResponse?.data)
    ? hiringStagesResponse.data
    : [];

  const { data: departmentsResponse } = useDepartmentsDropdown();
  const departments = Array.isArray(departmentsResponse?.data)
    ? departmentsResponse.data
    : [];

  const { data: designationsResponse } = useDesignationsDropdown();
  const designations = Array.isArray(designationsResponse?.data)
    ? designationsResponse.data
    : [];

  const { data: attachmentTypesResponse } = useAttachmentTypesDropdown();
  const attachmentTypes = Array.isArray(attachmentTypesResponse?.data)
    ? attachmentTypesResponse.data
    : [];

  const createJobPostingMutation = useCreateJobPosting();
  const updateJobPostingMutation = useUpdateJobPosting();

  const handleCancel = () => {
    setSelectedJobPosting(null);
    setDrawerOpen(false);
    setSelectedHiringStages([]);
    setSelectedAttachments([]);
  };

  useEffect(() => {
    if (selectedJobPosting) {
      setSelectedHiringStages(
        selectedJobPosting.hiring_stages?.map(hs => ({
          hiring_stage_id: hs.hiring_stage_id,
          sequence: hs.sequence,
          name: hs.hiring_stage_name,
          code: hs.hiring_stage_code,
          description: hs.description || '',
        })) || []
      );
      setSelectedAttachments(
        selectedJobPosting.attachments_required?.map(at => ({
          attachment_type_id: at.attachment_type_id,
          sequence: at.sequence,
          name: at.attachment_type_name,
          description: at.description || '',
        })) || []
      );
    } else {
      setSelectedHiringStages([]);
      setSelectedAttachments([]);
    }
  }, [selectedJobPosting]);

  const formik = useFormik({
    initialValues: {
      job_title: selectedJobPosting?.job_title || '',
      reporting_manager_id: selectedJobPosting?.reporting_manager_id || '',
      department_id: selectedJobPosting?.department_id || '',
      due_date: selectedJobPosting?.due_date || '',
      annual_salary_from: selectedJobPosting?.annual_salary_from || '',
      annual_salary_to: selectedJobPosting?.annual_salary_to || '',
      currency_code: selectedJobPosting?.currency_code || '',
      designation_id: selectedJobPosting?.designation_id || '',
      experience: selectedJobPosting?.experience || '',
      posting_date: selectedJobPosting?.posting_date || '',
      closing_date: selectedJobPosting?.closing_date || '',
      is_internal_job: selectedJobPosting?.is_internal_job || 'N',
      description: selectedJobPosting?.description || '',
      status: selectedJobPosting?.status || 'Draft',
      is_active: selectedJobPosting?.is_active || 'Y',
    },
    validationSchema: jobPostingValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const jobPostingData = {
          job_title: values.job_title,
          reporting_manager_id: values.reporting_manager_id
            ? Number(values.reporting_manager_id)
            : undefined,
          department_id: values.department_id
            ? Number(values.department_id)
            : undefined,
          due_date: values.due_date || undefined,
          annual_salary_from: values.annual_salary_from
            ? Number(values.annual_salary_from)
            : undefined,
          annual_salary_to: values.annual_salary_to
            ? Number(values.annual_salary_to)
            : undefined,
          currency_code: values.currency_code || undefined,
          designation_id: values.designation_id
            ? Number(values.designation_id)
            : undefined,
          experience: values.experience || undefined,
          posting_date: values.posting_date,
          closing_date: values.closing_date || undefined,
          is_internal_job: values.is_internal_job as 'Y' | 'N',
          hiring_stages: selectedHiringStages.map(hs => ({
            hiring_stage_id: hs.hiring_stage_id,
            sequence: hs.sequence,
            description: hs.description || undefined,
          })),
          attachments_required: selectedAttachments.map(at => ({
            attachment_type_id: at.attachment_type_id,
            sequence: at.sequence,
            description: at.description || undefined,
          })),
          description: values.description || undefined,
          status: values.status as JobPosting['status'],
          is_active: values.is_active as 'Y' | 'N',
        };

        if (isEdit && selectedJobPosting) {
          await updateJobPostingMutation.mutateAsync({
            id: selectedJobPosting.id,
            ...jobPostingData,
          });
        } else {
          await createJobPostingMutation.mutateAsync(jobPostingData);
        }

        handleCancel();
      } catch (error) {
        console.error('Error saving job posting:', error);
      }
    },
  });

  const availableHiringStagesForSelection = useMemo(() => {
    const selectedIds = selectedHiringStages?.map(hs => hs.hiring_stage_id);
    return availableHiringStages?.filter(
      stage => !selectedIds.includes(stage.id)
    );
  }, [availableHiringStages, selectedHiringStages]);

  const availableAttachmentsForSelection = useMemo(() => {
    const selectedIds = selectedAttachments.map(at => at.attachment_type_id);
    return attachmentTypes.filter(
      attachment => !selectedIds.includes(attachment.id)
    );
  }, [attachmentTypes, selectedAttachments]);

  const handleAddHiringStage = (stageId: number) => {
    const stage = availableHiringStages.find(s => s.id === stageId);
    if (stage) {
      const newSequence = selectedHiringStages.length + 1;
      setSelectedHiringStages([
        ...selectedHiringStages,
        {
          hiring_stage_id: stage.id,
          sequence: newSequence,
          name: stage.name,
          code: stage.code,
          description: stage.description || '',
        },
      ]);
    }
  };

  const handleRemoveHiringStage = (index: number) => {
    const newStages = selectedHiringStages
      .filter((_, i) => i !== index)
      .map((hs, i) => ({ ...hs, sequence: i + 1 }));
    setSelectedHiringStages(newStages);
  };

  const handleAddAttachment = (attachmentId: number) => {
    const attachment = attachmentTypes.find(a => a.id === attachmentId);
    if (attachment) {
      const newSequence = selectedAttachments.length + 1;
      setSelectedAttachments([
        ...selectedAttachments,
        {
          attachment_type_id: attachment.id,
          sequence: newSequence,
          name: attachment.name,
          description: attachment.description || '',
        },
      ]);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    const newAttachments = selectedAttachments
      .filter((_, i) => i !== index)
      .map((at, i) => ({ ...at, sequence: i + 1 }));
    setSelectedAttachments(newAttachments);
  };
  console.log(formik.errors);

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Job Posting' : 'Add Job Posting'}
      size="large"
    >
      <Box className="!p-5">
        <form onSubmit={formik.handleSubmit}>
          <Box className="!space-y-6">
            <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-x-5 !gap-y-4">
              <Input
                name="job_title"
                label="Job Title"
                placeholder="Enter Job Title"
                formik={formik}
                required
              />

              <UserSelect
                name="reporting_manager_id"
                label="Reporting Manager"
                formik={formik}
                required
                nameToSearch={selectedJobPosting?.reporting_manager_name || ''}
              />

              <Select name="department_id" label="Department" formik={formik}>
                <MenuItem value="">-- Select --</MenuItem>
                {departments.map(dept => (
                  <MenuItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </MenuItem>
                ))}
              </Select>

              <Input
                name="due_date"
                label="Due Date"
                type="date"
                formik={formik}
                required
              />

              <Input
                name="annual_salary_from"
                label="Annual Salary From"
                type="number"
                placeholder="Enter Annual Salary From"
                formik={formik}
                required
              />

              <Input
                name="annual_salary_to"
                label="Annual Salary To"
                type="number"
                placeholder="Enter Annual Salary To"
                formik={formik}
                required
              />

              <Select name="designation_id" label="Designation" formik={formik}>
                <MenuItem value="">-- Select --</MenuItem>
                {designations.map(des => (
                  <MenuItem key={des.id} value={des.id}>
                    {des.name}
                  </MenuItem>
                ))}
              </Select>

              <Input
                name="experience"
                label="Experience"
                placeholder="Required Experience"
                formik={formik}
                required
              />

              <Input
                name="posting_date"
                label="Posting Date"
                type="date"
                formik={formik}
                required
              />

              <Input
                name="closing_date"
                label="Closing Date"
                type="date"
                formik={formik}
                required
              />

              <ActiveInactiveField
                name="is_internal_job"
                label="Is Internal Job?"
                formik={formik}
                labels={[{ true: 'Yes', false: 'No' }]}
              />
            </Box>

            <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">
              <Box className="!border !border-gray-200 !rounded-lg py-2 flex flex-col gap-1 px-2">
                <Box className="!flex flex-col">
                  <p className="!font-medium">Available Hiring Stages</p>
                  <p className="!text-gray-600 text-xs">
                    Drag stages to add to sequence
                  </p>
                </Box>
                {availableHiringStagesForSelection.map((hs, index) => (
                  <div
                    key={`${hs.id}-${index}`}
                    className="flex justify-between p-2 rounded border border-gray-200"
                  >
                    <div className="!flex !flex-col">
                      <span className="!font-medium text-sm">{hs.name}</span>
                      <span className="!text-[10px] !text-gray-500">
                        {hs.description}
                      </span>
                    </div>
                    <ActionButton
                      color="info"
                      size="small"
                      icon={<Add />}
                      onClick={() => handleAddHiringStage(hs.id)}
                    />
                  </div>
                ))}
              </Box>

              <Box className="!border !border-gray-200 !rounded-lg py-2 flex flex-col gap-1 px-2">
                <Box className="!flex flex-col">
                  <p className="!font-medium">Selected Stages Sequence</p>
                  <p className="!text-gray-600 text-xs">
                    Drag to reorder sequence
                  </p>
                </Box>
                {selectedHiringStages?.length === 0 ? (
                  <div className="!text-gray-500 text-italic !text-sm h-full border rounded border-gray-200 flex justify-center items-center">
                    No stages selected
                  </div>
                ) : (
                  selectedHiringStages.map((hs, index) => (
                    <div
                      key={`${hs.hiring_stage_id}-${index}`}
                      className="flex justify-between p-2 rounded border border-gray-200"
                    >
                      <div className="!flex !flex-col">
                        <span className="!font-medium text-sm">{hs.name}</span>
                        <span className="!text-[10px] !text-gray-500">
                          {hs.description}
                        </span>
                      </div>
                      <ActionButton
                        color="error"
                        size="small"
                        icon={<Delete />}
                        onClick={() => handleRemoveHiringStage(index)}
                      />
                    </div>
                  ))
                )}
              </Box>
            </Box>

            <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">
              <Box className="!border !border-gray-200 !rounded-lg py-2 flex flex-col gap-1 px-2">
                <Box className="!flex flex-col">
                  <p className="!font-medium">Available Attachments Required</p>
                  <p className="!text-gray-600 text-xs">
                    Drag document types to add
                  </p>
                </Box>
                {availableAttachmentsForSelection.map((attachment, index) => (
                  <div
                    key={`${attachment.id}-${index}`}
                    className="flex justify-between p-2 rounded border border-gray-200"
                  >
                    <div className="!flex !flex-col">
                      <span className="!font-medium text-sm">
                        {attachment.name}
                      </span>
                      <span className="!text-[10px] !text-gray-500">
                        {attachment.description}
                      </span>
                    </div>
                    <ActionButton
                      color="info"
                      size="small"
                      icon={<Add />}
                      onClick={() => handleAddAttachment(attachment.id)}
                    />
                  </div>
                ))}
              </Box>

              <Box className="!border !border-gray-200 !rounded-lg py-2 flex flex-col gap-1 px-2">
                <Box className="!flex flex-col">
                  <p className="!font-medium">Selected Attachments Required</p>
                  <p className="!text-gray-600 text-xs">Drag to reorder</p>
                </Box>
                {selectedAttachments.length === 0 ? (
                  <div className="!text-gray-500 text-italic !text-sm h-full border rounded border-gray-200 flex justify-center items-center">
                    No attachments selected
                  </div>
                ) : (
                  selectedAttachments.map((attachment, index) => (
                    <div
                      key={`${attachment.attachment_type_id}-${index}`}
                      className="flex justify-between p-2 rounded border border-gray-200"
                    >
                      <div className="!flex !flex-col">
                        <span className="!font-medium text-sm">
                          {attachment.name}
                        </span>
                        <span className="!text-[10px] !text-gray-500">
                          {attachment.description}
                        </span>
                      </div>
                      <ActionButton
                        color="error"
                        size="small"
                        icon={<Delete />}
                        onClick={() => handleRemoveAttachment(index)}
                      />
                    </div>
                  ))
                )}
              </Box>
            </Box>

            <RichTextEditor
              name="description"
              label="Job Description"
              placeholder="Enter terms and conditions..."
              formik={formik}
              height={200}
            />

            <Box className="md:!col-span-2">
              <ActiveInactiveField
                name="is_active"
                label="Status"
                formik={formik}
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
                createJobPostingMutation.isPending ||
                updateJobPostingMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createJobPostingMutation.isPending ||
                updateJobPostingMutation.isPending
              }
            >
              {createJobPostingMutation.isPending ||
              updateJobPostingMutation.isPending
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

export default ManageJobPosting;
