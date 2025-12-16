import { Box, MenuItem, Typography } from '@mui/material';
import { useFormik } from 'formik';
import {
  useCreateCandidate,
  useUpdateCandidate,
  type Candidate,
} from 'hooks/useCandidates';
import { useJobPostings } from 'hooks/useJobPostings';
import { useHiringStages } from 'hooks/useHiringStages';
import React, { useMemo } from 'react';
import { candidateValidationSchema } from 'schemas/candidate.schema';
import ActiveInactiveField from 'shared/ActiveInactiveField';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';

interface ManageCandidateProps {
  selectedCandidate?: Candidate | null;
  setSelectedCandidate: (candidate: Candidate | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const ManageCandidate: React.FC<ManageCandidateProps> = ({
  selectedCandidate,
  setSelectedCandidate,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedCandidate;

  const { data: jobPostingsResponse } = useJobPostings({ isActive: 'Y' });
  const availableJobPostings = jobPostingsResponse?.data || [];

  const { data: hiringStagesResponse } = useHiringStages({ isActive: 'Y' });
  const availableHiringStages = hiringStagesResponse?.data || [];

  const createCandidateMutation = useCreateCandidate();
  const updateCandidateMutation = useUpdateCandidate();

  const handleCancel = () => {
    setSelectedCandidate(null);
    setDrawerOpen(false);
  };

  const formik = useFormik({
    initialValues: {
      name: selectedCandidate?.name || '',
      email: selectedCandidate?.email || '',
      phone_number: selectedCandidate?.phone_number || '',
      job_posting_id: selectedCandidate?.job_posting_id || '',
      current_hiring_stage_id: selectedCandidate?.current_hiring_stage_id || '',
      resume_url: selectedCandidate?.resume_url || '',
      cover_letter_url: selectedCandidate?.cover_letter_url || '',
      application_date: selectedCandidate?.application_date || '',
      status: selectedCandidate?.status || 'Applied',
      notes: selectedCandidate?.notes || '',
      experience_years: selectedCandidate?.experience_years || '',
      skills: selectedCandidate?.skills || '',
      expected_salary: selectedCandidate?.expected_salary || '',
      current_salary: selectedCandidate?.current_salary || '',
      notice_period: selectedCandidate?.notice_period || '',
      availability_date: selectedCandidate?.availability_date || '',
      is_active: selectedCandidate?.is_active || 'Y',
    },
    validationSchema: candidateValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const candidateData = {
          name: values.name,
          email: values.email,
          phone_number: values.phone_number || undefined,
          job_posting_id: Number(values.job_posting_id),
          current_hiring_stage_id: values.current_hiring_stage_id
            ? Number(values.current_hiring_stage_id)
            : undefined,
          resume_url: values.resume_url || undefined,
          cover_letter_url: values.cover_letter_url || undefined,
          application_date: values.application_date || undefined,
          status: values.status as Candidate['status'],
          notes: values.notes || undefined,
          experience_years: values.experience_years
            ? Number(values.experience_years)
            : undefined,
          skills: values.skills || undefined,
          expected_salary: values.expected_salary
            ? Number(values.expected_salary)
            : undefined,
          current_salary: values.current_salary
            ? Number(values.current_salary)
            : undefined,
          notice_period: values.notice_period || undefined,
          availability_date: values.availability_date || undefined,
          is_active: values.is_active as 'Y' | 'N',
        };

        if (isEdit && selectedCandidate) {
          await updateCandidateMutation.mutateAsync({
            id: selectedCandidate.id,
            ...candidateData,
          });
        } else {
          await createCandidateMutation.mutateAsync(candidateData);
        }

        handleCancel();
      } catch (error) {
        console.error('Error saving candidate:', error);
      }
    },
  });

  const filteredHiringStages = useMemo(() => {
    if (!formik.values.job_posting_id) return [];
    const jobPosting = availableJobPostings.find(
      jp => jp.id === Number(formik.values.job_posting_id)
    );
    if (!jobPosting?.hiring_stages) return availableHiringStages;
    const stageIds = jobPosting.hiring_stages.map(hs => hs.hiring_stage_id);
    return availableHiringStages.filter(stage => stageIds.includes(stage.id));
  }, [
    formik.values.job_posting_id,
    availableJobPostings,
    availableHiringStages,
  ]);

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Candidate' : 'Add Candidate'}
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
                Personal Information
              </Typography>
              <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-x-5 !gap-y-4">
                <Input
                  name="name"
                  label="Name"
                  placeholder="Enter candidate name"
                  formik={formik}
                  required
                />

                <Input
                  name="email"
                  label="Email"
                  type="email"
                  placeholder="Enter email address"
                  formik={formik}
                  required
                />

                <Input
                  name="phone_number"
                  label="Phone Number"
                  placeholder="Enter phone number"
                  formik={formik}
                />
              </Box>
            </Box>

            <Box>
              <Typography
                variant="h6"
                className="!font-semibold !text-gray-900 !mb-4"
              >
                Application Details
              </Typography>
              <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-x-5 !gap-y-4">
                <Select
                  name="job_posting_id"
                  label="Job Posting"
                  formik={formik}
                  required
                >
                  <MenuItem value="">-- Select --</MenuItem>
                  {availableJobPostings.map(jp => (
                    <MenuItem key={jp.id} value={jp.id}>
                      {jp.job_title}
                    </MenuItem>
                  ))}
                </Select>

                <Select
                  name="current_hiring_stage_id"
                  label="Current Hiring Stage"
                  formik={formik}
                >
                  <MenuItem value="">-- Select --</MenuItem>
                  {filteredHiringStages.map(stage => (
                    <MenuItem key={stage.id} value={stage.id}>
                      {stage.name}
                    </MenuItem>
                  ))}
                </Select>

                <Input
                  name="application_date"
                  label="Application Date"
                  type="date"
                  formik={formik}
                  required
                />

                <Select name="status" label="Status" formik={formik} required>
                  <MenuItem value="Applied">Applied</MenuItem>
                  <MenuItem value="Screening">Screening</MenuItem>
                  <MenuItem value="Interview">Interview</MenuItem>
                  <MenuItem value="Offer">Offer</MenuItem>
                  <MenuItem value="Hired">Hired</MenuItem>
                  <MenuItem value="Rejected">Rejected</MenuItem>
                  <MenuItem value="Withdrawn">Withdrawn</MenuItem>
                </Select>
              </Box>
            </Box>

            <Box>
              <Typography
                variant="h6"
                className="!font-semibold !text-gray-900 !mb-4"
              >
                Professional Information
              </Typography>
              <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-x-5 !gap-y-4">
                <Input
                  name="experience_years"
                  label="Experience (Years)"
                  type="number"
                  placeholder="Enter years of experience"
                  formik={formik}
                />

                <Input
                  name="skills"
                  label="Skills"
                  placeholder="Enter skills (comma separated)"
                  formik={formik}
                />

                <Input
                  name="current_salary"
                  label="Current Salary"
                  type="number"
                  placeholder="Enter current salary"
                  formik={formik}
                />

                <Input
                  name="expected_salary"
                  label="Expected Salary"
                  type="number"
                  placeholder="Enter expected salary"
                  formik={formik}
                />

                <Input
                  name="notice_period"
                  label="Notice Period"
                  placeholder="Enter notice period"
                  formik={formik}
                />

                <Input
                  name="availability_date"
                  label="Availability Date"
                  type="date"
                  formik={formik}
                />
              </Box>
            </Box>

            <Box>
              <Typography
                variant="h6"
                className="!font-semibold !text-gray-900 !mb-4"
              >
                Documents
              </Typography>
              <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-x-5 !gap-y-4">
                <Input
                  name="resume_url"
                  label="Resume URL"
                  placeholder="Enter resume URL or file path"
                  formik={formik}
                />

                <Input
                  name="cover_letter_url"
                  label="Cover Letter URL"
                  placeholder="Enter cover letter URL or file path"
                  formik={formik}
                />
              </Box>
            </Box>

            <Box>
              <Typography
                variant="h6"
                className="!font-semibold !text-gray-900 !mb-4"
              >
                Additional Information
              </Typography>
              <Box className="md:!col-span-2">
                <Input
                  name="notes"
                  label="Notes"
                  placeholder="Enter additional notes or comments"
                  formik={formik}
                  multiline
                  rows={4}
                />
              </Box>
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
                createCandidateMutation.isPending ||
                updateCandidateMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createCandidateMutation.isPending ||
                updateCandidateMutation.isPending
              }
            >
              {createCandidateMutation.isPending ||
              updateCandidateMutation.isPending
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

export default ManageCandidate;
