import { Person, Work, Description, Timeline } from '@mui/icons-material';
import {
  Alert,
  Box,
  Chip,
  Paper,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import { useCandidate } from 'hooks/useCandidates';
import { useHiringStages } from 'hooks/useHiringStages';
import React from 'react';
import { useParams } from 'react-router-dom';
import { ActionButton } from 'shared/ActionButton';
import { formatDate } from 'utils/dateUtils';

interface CandidateTimeline {
  id: number;
  candidate_id: number;
  hiring_stage_id: number;
  stage_name: string;
  remarks: string;
  created_by: string;
  createdate: string;
  updatedate: string;
}

const CandidateDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const {
    data: candidateResponse,
    isLoading,
    error,
  } = useCandidate(parseInt(id || '0'), {
    enabled: !!id,
  });

  const candidate = candidateResponse?.data;

  const { data: hiringStagesResponse } = useHiringStages({ isActive: 'Y' });
  const hiringStages = Array.isArray(hiringStagesResponse?.data)
    ? hiringStagesResponse.data
    : [];

  const candidateTimeline: CandidateTimeline[] = [
    {
      id: 1,
      candidate_id: parseInt(id || '0'),
      hiring_stage_id: 1,
      stage_name: 'Applied',
      remarks:
        'Initial application received via website. Candidate has strong background in software development.',
      created_by: 'John Doe',
      createdate: '2024-01-15T10:30:00Z',
      updatedate: '2024-01-15T10:30:00Z',
    },
    {
      id: 2,
      candidate_id: parseInt(id || '0'),
      hiring_stage_id: 2,
      stage_name: 'Screening',
      remarks:
        'Phone screening completed. Candidate demonstrated good communication skills and technical knowledge. Recommended for technical interview.',
      created_by: 'Jane Smith',
      createdate: '2024-01-17T14:00:00Z',
      updatedate: '2024-01-17T14:00:00Z',
    },
    {
      id: 3,
      candidate_id: parseInt(id || '0'),
      hiring_stage_id: 3,
      stage_name: 'Interview',
      remarks:
        'Technical interview completed. Candidate performed well in coding challenges and system design questions. Strong problem-solving skills.',
      created_by: 'Mike Johnson',
      createdate: '2024-01-20T11:00:00Z',
      updatedate: '2024-01-20T11:00:00Z',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Applied':
        return 'default';
      case 'Screening':
        return 'info';
      case 'Interview':
        return 'warning';
      case 'Offer':
        return 'primary';
      case 'Hired':
        return 'success';
      case 'Rejected':
        return 'error';
      case 'Withdrawn':
        return 'default';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return (
      <Box className="!flex !justify-center !items-center !min-h-screen">
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (error || !candidate) {
    return (
      <Box className="!flex !justify-center !items-center !min-h-screen">
        <Alert severity="error">Candidate not found</Alert>
      </Box>
    );
  }

  return (
    <>
      {/* Main Content Area */}
      <Box className="lg:!col-span-8 !flex !flex-col !gap-5">
        <div className="grid grid-cols-2 gap-4">
          {/* Personal Information Card */}
          <Box className="!bg-white !rounded-lg !shadow !border !border-gray-200 !p-6">
            <Typography
              variant="h6"
              className="!font-semibold !mb-4 !flex !items-center !gap-2"
            >
              <ActionButton color="info" tooltip="" icon={<Person />} />
              Personal Information
            </Typography>
            <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">
              <Box>
                <Typography variant="caption" className="!text-gray-500">
                  Full Name
                </Typography>
                <Typography variant="body2" className="!text-gray-900">
                  {candidate.name}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" className="!text-gray-500">
                  Email Address
                </Typography>
                <Typography variant="body2" className="!text-gray-900">
                  {candidate.email}
                </Typography>
              </Box>
              {candidate.phone_number && (
                <Box>
                  <Typography variant="caption" className="!text-gray-500">
                    Phone Number
                  </Typography>
                  <Typography variant="body2" className="!text-gray-900">
                    {candidate.phone_number}
                  </Typography>
                </Box>
              )}
              <Box className="flex flex-col items-start">
                <Typography variant="caption" className="!text-gray-500">
                  Status
                </Typography>
                <Chip
                  label={candidate.is_active === 'Y' ? 'Active' : 'Inactive'}
                  color={candidate.is_active === 'Y' ? 'success' : 'error'}
                  size="small"
                  variant="outlined"
                />
              </Box>
            </Box>
          </Box>

          {/* Job Information Card */}
          <Box className="!bg-white !rounded-lg !shadow !border !border-gray-200 !p-6">
            <Typography
              variant="h6"
              className="!font-semibold !mb-4 !flex !items-center !gap-2"
            >
              <ActionButton color="info" tooltip="" icon={<Work />} />
              Job Information
            </Typography>
            <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">
              <Box className="!flex !flex-col">
                <Typography variant="caption" className="!text-gray-500">
                  Applied Position
                </Typography>
                <Typography variant="body2" className="!text-gray-900">
                  {candidate.job_posting?.job_title || '-'}
                </Typography>
              </Box>
              <Box className="!flex !flex-col !items-start">
                <Typography variant="caption" className="!text-gray-500">
                  Current Stage
                </Typography>
                <Chip
                  label={candidate.hiring_stage?.name || '-'}
                  color={getStatusColor(candidate.hiring_stage?.name || '')}
                  size="small"
                  variant="outlined"
                />
              </Box>
              <Box className="!flex !flex-col !items-start">
                <Typography variant="caption" className="!text-gray-500">
                  Application Date
                </Typography>
                <Typography variant="body2" className="!text-gray-900">
                  {formatDate(candidate.application_date) || '-'}
                </Typography>
              </Box>
              <Box className="!flex !flex-col !items-start">
                <Typography variant="caption" className="!text-gray-500">
                  Current Status
                </Typography>
                <Chip
                  label={candidate.status}
                  color={getStatusColor(candidate.status) as any}
                  size="small"
                  variant="outlined"
                />
              </Box>
            </Box>
          </Box>

          {/* Professional Details Card */}
          <Box className="!bg-white !rounded-lg !shadow !border !border-gray-200 !p-6">
            <Typography
              variant="h6"
              className="!font-semibold !mb-4 !flex !items-center !gap-2"
            >
              <ActionButton color="info" tooltip="" icon={<Work />} />
              Professional Details
            </Typography>
            <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">
              {candidate.experience_years && (
                <Box>
                  <Typography variant="caption" className="!text-gray-500">
                    Experience
                  </Typography>
                  <Typography variant="body2" className="!text-gray-900">
                    {candidate.experience_years} years
                  </Typography>
                </Box>
              )}
              {candidate.skills && (
                <Box>
                  <Typography variant="caption" className="!text-gray-500">
                    Skills
                  </Typography>
                  <Typography variant="body2" className="!text-gray-900">
                    {candidate.skills}
                  </Typography>
                </Box>
              )}
              {candidate.expected_salary && (
                <Box>
                  <Typography variant="caption" className="!text-gray-500">
                    Expected Salary
                  </Typography>
                  <Typography variant="body2" className="!text-gray-900">
                    {candidate.expected_salary}
                  </Typography>
                </Box>
              )}
              {candidate.current_salary && (
                <Box>
                  <Typography variant="caption" className="!text-gray-500">
                    Current Salary
                  </Typography>
                  <Typography variant="body2" className="!text-gray-900">
                    {candidate.current_salary}
                  </Typography>
                </Box>
              )}
              {candidate.notice_period && (
                <Box>
                  <Typography variant="caption" className="!text-gray-500">
                    Notice Period
                  </Typography>
                  <Typography variant="body2" className="!text-gray-900">
                    {candidate.notice_period}
                  </Typography>
                </Box>
              )}
              {candidate.availability_date && (
                <Box>
                  <Typography variant="caption" className="!text-gray-500">
                    Available From
                  </Typography>
                  <Typography variant="body2" className="!text-gray-900">
                    {formatDate(candidate.availability_date) || '-'}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          {/* Documents Card */}
          <Box className="!bg-white !rounded-lg !shadow !border !border-gray-200 !p-6">
            <Typography
              variant="h6"
              className="!font-semibold !mb-4 !flex !items-center !gap-2"
            >
              <ActionButton color="info" tooltip="" icon={<Description />} />
              Documents
            </Typography>
            <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">
              {candidate.resume_url && (
                <Box className="flex !whitespace-nowrap !gap-1">
                  <Typography variant="caption" className="!text-gray-500">
                    Resume :
                  </Typography>
                  <Typography
                    variant="body2"
                    className="!text-blue-600 !whitespace-nowrap !cursor-pointer"
                  >
                    {candidate.resume_url}
                  </Typography>
                </Box>
              )}
              {candidate.cover_letter_url && (
                <Box className="flex flex-col">
                  <Typography variant="caption" className="!text-gray-500">
                    Cover Letter
                  </Typography>
                  <Typography
                    variant="body2"
                    className="!text-blue-600 !cursor-pointer"
                  >
                    {candidate.cover_letter_url}
                  </Typography>
                </Box>
              )}
              {!candidate.resume_url && !candidate.cover_letter_url && (
                <Box className="!md:!col-span-2">
                  <Typography
                    variant="body2"
                    className="!text-gray-500 !italic"
                  >
                    No documents available
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </div>

        {/* Hiring Stage Timeline Card */}
        <Box className="!bg-white !rounded-lg !shadow !border !border-gray-200 !p-6">
          <Typography
            variant="h6"
            className="!font-semibold !mb-4 !flex !items-center !gap-2"
          >
            <ActionButton color="info" icon={<Timeline />} />
            Hiring Stage Progress
          </Typography>

          <Stepper orientation="vertical" className="!mb-6">
            {hiringStages.map(stage => {
              const timelineEntry = candidateTimeline.find(
                t => t.hiring_stage_id === stage.id
              );
              return (
                <Step key={stage.id}>
                  <StepLabel
                    optional={
                      timelineEntry && (
                        <Typography variant="caption">
                          {formatDate(timelineEntry.createdate)} by{' '}
                          {timelineEntry.created_by}
                        </Typography>
                      )
                    }
                  >
                    <Typography variant="body1" className="!font-medium">
                      {stage.name}
                    </Typography>
                  </StepLabel>
                  <StepContent>
                    <Typography
                      variant="body2"
                      className="!text-gray-600 !mb-2"
                    >
                      {stage.description || 'No description available'}
                    </Typography>
                    {timelineEntry?.remarks && (
                      <Paper className="!p-3 !bg-gray-50">
                        <Typography variant="body2" className="!text-gray-700">
                          <strong>Remarks:</strong> {timelineEntry.remarks}
                        </Typography>
                      </Paper>
                    )}
                  </StepContent>
                </Step>
              );
            })}
          </Stepper>
        </Box>

        {/* Additional Notes Card */}
        {candidate.notes && (
          <Box className="!bg-white !rounded-lg !shadow !border !border-gray-200 !p-6">
            <Typography variant="h6" className="!font-semibold !mb-3">
              Additional Notes
            </Typography>
            <Typography variant="body2" className="!text-gray-700">
              {candidate.notes}
            </Typography>
          </Box>
        )}
      </Box>
    </>
  );
};

export default CandidateDetailPage;
