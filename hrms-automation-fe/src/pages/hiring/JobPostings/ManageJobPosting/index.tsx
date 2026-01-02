import { Add, Delete, DragIndicator } from '@mui/icons-material';
import {
  Badge,
  Box,
  IconButton,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import {
  useCreateJobPosting,
  useUpdateJobPosting,
  type JobPosting,
} from 'hooks/useJobPostings';
import { useHiringStages } from 'hooks/useHiringStages';
import React, { useEffect, useMemo, useState } from 'react';
import { jobPostingValidationSchema } from 'schemas/jobPosting.schema';
import ActiveInactiveField from 'shared/ActiveInactiveField';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';
import UserSelect from 'shared/UserSelect';

interface ManageJobPostingProps {
  selectedJobPosting?: JobPosting | null;
  setSelectedJobPosting: (jobPosting: JobPosting | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const mockDepartments = [
  { id: 1, name: 'Engineering' },
  { id: 2, name: 'Product' },
  { id: 3, name: 'Design' },
  { id: 4, name: 'Analytics' },
  { id: 5, name: 'Marketing' },
  { id: 6, name: 'Sales' },
  { id: 7, name: 'HR' },
  { id: 8, name: 'Finance' },
];

const mockDesignations = [
  { id: 1, name: 'Senior Engineer' },
  { id: 2, name: 'Product Manager' },
  { id: 3, name: 'UX Designer' },
  { id: 4, name: 'Data Analyst' },
  { id: 5, name: 'Marketing Manager' },
  { id: 6, name: 'Sales Executive' },
  { id: 7, name: 'HR Manager' },
  { id: 8, name: 'Finance Manager' },
];

const mockAttachmentTypes = [
  { id: 1, name: 'Resume / CV' },
  { id: 2, name: 'Cover Letter' },
  { id: 3, name: 'Portfolio' },
  { id: 4, name: 'Portfolio' },
  { id: 5, name: 'Aadhaar card' },
  { id: 6, name: 'Experience Letter' },
  { id: 7, name: 'Driving License' },
  { id: 8, name: 'Offer Letter' },
  { id: 9, name: 'DCC Noida' },
  { id: 10, name: 'Life Insurance' },
];

const ManageJobPosting: React.FC<ManageJobPostingProps> = ({
  selectedJobPosting,
  setSelectedJobPosting,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedJobPosting;

  const [selectedHiringStages, setSelectedHiringStages] = useState<
    Array<{
      hiring_stage_id: number;
      sequence: number;
      name: string;
      code: string;
    }>
  >([]);
  const [selectedAttachments, setSelectedAttachments] = useState<
    Array<{ attachment_type_id: number; sequence: number; name: string }>
  >([]);

  const { data: hiringStagesResponse } = useHiringStages({ isActive: 'Y' });
  const availableHiringStages = hiringStagesResponse?.data || [];

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
        })) || []
      );
      setSelectedAttachments(
        selectedJobPosting.attachments_required?.map(at => ({
          attachment_type_id: at.attachment_type_id,
          sequence: at.sequence,
          name: at.attachment_type_name,
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
          })),
          attachments_required: selectedAttachments.map(at => ({
            attachment_type_id: at.attachment_type_id,
            sequence: at.sequence,
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
    return mockAttachmentTypes.filter(
      attachment => !selectedIds.includes(attachment.id)
    );
  }, [selectedAttachments]);

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
    const attachment = mockAttachmentTypes.find(a => a.id === attachmentId);
    if (attachment) {
      const newSequence = selectedAttachments.length + 1;
      setSelectedAttachments([
        ...selectedAttachments,
        {
          attachment_type_id: attachment.id,
          sequence: newSequence,
          name: attachment.name,
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
            <Box>
              <Typography
                variant="h6"
                className="!font-semibold !text-gray-900 !mb-4"
              >
                General Job Information
              </Typography>
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
                  nameToSearch={
                    selectedJobPosting?.reporting_manager_name || ''
                  }
                />

                <Select name="department_id" label="Department" formik={formik}>
                  <MenuItem value="">-- Select --</MenuItem>
                  {mockDepartments.map(dept => (
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

                <Select
                  name="currency_code"
                  label="Currency Code"
                  formik={formik}
                >
                  <MenuItem value="">-- Select --</MenuItem>
                  <MenuItem value="USD">USD</MenuItem>
                  <MenuItem value="EUR">EUR</MenuItem>
                  <MenuItem value="GBP">GBP</MenuItem>
                  <MenuItem value="INR">INR</MenuItem>
                </Select>

                <Select
                  name="designation_id"
                  label="Designation"
                  formik={formik}
                >
                  <MenuItem value="">-- Select --</MenuItem>
                  {mockDesignations.map(des => (
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

                <Select
                  name="is_internal_job"
                  label="Is Internal Job?"
                  formik={formik}
                >
                  <MenuItem value="N">No</MenuItem>
                  <MenuItem value="Y">Yes</MenuItem>
                </Select>
              </Box>
            </Box>

            <Box>
              <Typography
                variant="h6"
                className="!font-semibold !text-gray-900 !mb-4"
              >
                Hiring Stage
              </Typography>
              <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">
                <Box className="!border !border-gray-200 !rounded-lg !p-4">
                  <Box className="!flex !items-center !justify-between !mb-3">
                    <Typography variant="subtitle1" className="!font-medium">
                      Available Hiring Stages
                    </Typography>
                    <Badge
                      badgeContent={availableHiringStagesForSelection.length}
                      color="primary"
                    />
                  </Box>
                  <Typography variant="body2" className="!text-gray-600 !mb-3">
                    Drag stages to add to sequence
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Stage</TableCell>
                          <TableCell>Code</TableCell>
                          <TableCell>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {availableHiringStagesForSelection.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={3}
                              className="!text-center !text-gray-400"
                            >
                              No available stages
                            </TableCell>
                          </TableRow>
                        ) : (
                          availableHiringStagesForSelection.map(stage => (
                            <TableRow key={stage.id}>
                              <TableCell>{stage.name}</TableCell>
                              <TableCell>{stage.code}</TableCell>
                              <TableCell>
                                <IconButton
                                  size="small"
                                  onClick={() => handleAddHiringStage(stage.id)}
                                >
                                  <Add fontSize="small" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>

                <Box className="!border !border-gray-200 !rounded-lg !p-4">
                  <Box className="!flex !items-center !justify-between !mb-3">
                    <Typography variant="subtitle1" className="!font-medium">
                      Selected Stages Sequence
                    </Typography>
                    <Badge
                      badgeContent={selectedHiringStages.length}
                      color="primary"
                    />
                  </Box>
                  <Typography variant="body2" className="!text-gray-600 !mb-3">
                    Drag to reorder sequence
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell width="40px"></TableCell>
                          <TableCell>Stage</TableCell>
                          <TableCell>Sequence</TableCell>
                          <TableCell>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedHiringStages.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={4}
                              className="!text-center !text-gray-400"
                            >
                              ← Drag stages from the left to add to sequence
                            </TableCell>
                          </TableRow>
                        ) : (
                          selectedHiringStages.map((hs, index) => (
                            <TableRow key={`${hs.hiring_stage_id}-${index}`}>
                              <TableCell>
                                <DragIndicator className="!text-gray-400 !cursor-move" />
                              </TableCell>
                              <TableCell>{hs.name}</TableCell>
                              <TableCell>{hs.sequence}</TableCell>
                              <TableCell>
                                <IconButton
                                  size="small"
                                  onClick={() => handleRemoveHiringStage(index)}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Box>
            </Box>

            <Box>
              <Typography
                variant="h6"
                className="!font-semibold !text-gray-900 !mb-4"
              >
                Attachments Required
              </Typography>
              <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">
                <Box className="!border !border-gray-200 !rounded-lg !p-4">
                  <Box className="!flex !items-center !justify-between !mb-3">
                    <Typography variant="subtitle1" className="!font-medium">
                      Available Attachments Required
                    </Typography>
                    <Badge
                      badgeContent={availableAttachmentsForSelection.length}
                      color="primary"
                    />
                  </Box>
                  <Typography variant="body2" className="!text-gray-600 !mb-3">
                    Drag document types to add
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Attachments Required</TableCell>
                          <TableCell>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {availableAttachmentsForSelection.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={2}
                              className="!text-center !text-gray-400"
                            >
                              No available attachments
                            </TableCell>
                          </TableRow>
                        ) : (
                          availableAttachmentsForSelection.map(attachment => (
                            <TableRow key={attachment.id}>
                              <TableCell>{attachment.name}</TableCell>
                              <TableCell>
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    handleAddAttachment(attachment.id)
                                  }
                                >
                                  <Add fontSize="small" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>

                <Box className="!border !border-gray-200 !rounded-lg !p-4">
                  <Box className="!flex !items-center !justify-between !mb-3">
                    <Typography variant="subtitle1" className="!font-medium">
                      Selected Attachments Required
                    </Typography>
                    <Badge
                      badgeContent={selectedAttachments.length}
                      color="primary"
                    />
                  </Box>
                  <Typography variant="body2" className="!text-gray-600 !mb-3">
                    Drag to reorder
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell width="40px"></TableCell>
                          <TableCell>Attachments Required</TableCell>
                          <TableCell>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedAttachments.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={3}
                              className="!text-center !text-gray-400"
                            >
                              ← Drag document types from the left to add
                            </TableCell>
                          </TableRow>
                        ) : (
                          selectedAttachments.map((at, index) => (
                            <TableRow key={`${at.attachment_type_id}-${index}`}>
                              <TableCell>
                                <DragIndicator className="!text-gray-400 !cursor-move" />
                              </TableCell>
                              <TableCell>{at.name}</TableCell>
                              <TableCell>
                                <IconButton
                                  size="small"
                                  onClick={() => handleRemoveAttachment(index)}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Box>
            </Box>

            <Box>
              <Typography
                variant="h6"
                className="!font-semibold !text-gray-900 !mb-4"
              >
                Description
              </Typography>
              <Input
                name="description"
                label="Description"
                placeholder="Enter terms and conditions."
                formik={formik}
                multiline
                rows={6}
                required
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
