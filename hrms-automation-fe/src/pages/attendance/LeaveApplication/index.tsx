import {
  Add,
  Cancel,
  CheckCircle,
  Download,
  Upload,
} from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Box,
  Chip,
  FormControl,
  MenuItem,
  Select as MuiSelect,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  useLeaveApplications,
  useDeleteLeaveApplication,
  useApproveLeaveApplication,
  useRejectLeaveApplication,
  type LeaveApplication,
  type ApprovalStatus,
  type LeaveType,
} from 'hooks/useLeaveApplications';
import { useExportToExcel } from 'hooks/useImportExport';
import { usePermission } from 'hooks/usePermission';
import { Calendar, User } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import SearchInput from 'shared/SearchInput';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from 'utils/dateUtils';
import ImportLeaveApplication from './ImportLeaveApplication';
import ManageLeaveApplication from './ManageLeaveApplication';

const LeaveApplicationPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [approvalStatusFilter, setApprovalStatusFilter] = useState<
    ApprovalStatus | 'all'
  >('all');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState<LeaveType | 'all'>(
    'all'
  );
  const [selectedLeaveApplication, setSelectedLeaveApplication] =
    useState<LeaveApplication | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { isCreate, isUpdate, isDelete, isRead } = usePermission('user' as any);

  const {
    data: leaveApplicationsResponse,
    isLoading,
    error,
  } = useLeaveApplications(
    {
      search,
      page,
      limit,
      approval_status:
        approvalStatusFilter !== 'all' ? approvalStatusFilter : undefined,
      leave_type_id: leaveTypeFilter !== 'all' ? Number(leaveTypeFilter) : undefined,
    },
    {
      enabled: isRead !== false,
    }
  );

  const leaveApplications = Array.isArray(leaveApplicationsResponse?.data) ? leaveApplicationsResponse.data : [];
  const totalCount = leaveApplicationsResponse?.meta?.total_count || 0;
  const currentPage = (leaveApplicationsResponse?.meta?.current_page || 1) - 1;

  const deleteLeaveApplicationMutation = useDeleteLeaveApplication();
  const approveLeaveApplicationMutation = useApproveLeaveApplication();
  const rejectLeaveApplicationMutation = useRejectLeaveApplication();
  const exportToExcelMutation = useExportToExcel();

  const stats = leaveApplicationsResponse?.stats as any;
  const totalApplications =
    stats?.total_applications ?? leaveApplications.length;
  const pendingApplications =
    stats?.pending_applications ??
    leaveApplications.filter(app => app.approval_status === 'Pending').length;
  const approvedApplications =
    stats?.approved_applications ??
    leaveApplications.filter(app => app.approval_status === 'Approved').length;
  const rejectedApplications =
    stats?.rejected_applications ??
    leaveApplications.filter(app => app.approval_status === 'Rejected').length;

  const handleCreateLeaveApplication = useCallback(() => {
    setSelectedLeaveApplication(null);
    setDrawerOpen(true);
  }, []);

  const handleEditLeaveApplication = useCallback(
    (application: LeaveApplication) => {
      setSelectedLeaveApplication(application);
      setDrawerOpen(true);
    },
    []
  );

  const handleDeleteLeaveApplication = useCallback(
    async (id: number) => {
      try {
        await deleteLeaveApplicationMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting leave application:', error);
      }
    },
    [deleteLeaveApplicationMutation]
  );

  const handleApproveLeaveApplication = useCallback(
    async (id: number) => {
      try {
        await approveLeaveApplicationMutation.mutateAsync({
          id,
          approval_status: 'Approved',
          approved_by: 1,
        });
      } catch (error) {
        console.error('Error approving leave application:', error);
      }
    },
    [approveLeaveApplicationMutation]
  );

  const handleRejectLeaveApplication = useCallback(
    async (id: number, rejectionReason: string) => {
      try {
        await rejectLeaveApplicationMutation.mutateAsync({
          id,
          rejected_by: 1,
          rejection_reason: rejectionReason,
        });
      } catch (error) {
        console.error('Error rejecting leave application:', error);
      }
    },
    [rejectLeaveApplicationMutation]
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handlePageChange = (newPage: number) => {
    setPage(newPage + 1);
  };

  const handleExportToExcel = useCallback(async () => {
    try {
      const filters = {
        search,
        approvalStatus:
          approvalStatusFilter !== 'all' ? approvalStatusFilter : undefined,
        leaveType: leaveTypeFilter !== 'all' ? leaveTypeFilter : undefined,
      };

      await exportToExcelMutation.mutateAsync({
        tableName: 'leave_applications',
        filters,
      });
    } catch (error) {
      console.error('Error exporting leave applications:', error);
    }
  }, [exportToExcelMutation, search, approvalStatusFilter, leaveTypeFilter]);

  const getApprovalStatusColor = (status: ApprovalStatus) => {
    switch (status) {
      case 'Approved':
        return 'success';
      case 'Rejected':
        return 'error';
      case 'Pending':
        return 'warning';
      case 'Cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  const getLeaveTypeColor = (type: LeaveType) => {
    switch (type) {
      case 'Annual':
        return 'info';
      case 'Sick':
        return 'error';
      case 'Casual':
        return 'info';
      case 'Emergency':
        return 'warning';
      default:
        return 'default';
    }
  };

  const leaveApplicationColumns: TableColumn<LeaveApplication>[] = [
    {
      id: 'employee_name',
      label: 'Employee',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.employee_name}
            className="!rounded !bg-primary-100 !text-primary-500"
          >
            <User className="w-5 h-5" />
          </Avatar>
          <Box className="!max-w-xs">
            <Typography
              variant="body1"
              className="!text-gray-900 !leading-tight"
            >
              {row.employee_name}
            </Typography>
            <Typography variant="caption" className="!text-gray-500">
              {row.employee_email}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'leave_type',
      label: 'Leave Type',
      render: (_value, row) => (
        <Chip
          label={row.leave_type_name}
          color={getLeaveTypeColor(row.leave_type_name as LeaveType) as any}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      id: 'start_date',
      label: 'Start Date',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {formatDate(row.start_date) || '-'}
        </Typography>
      ),
    },
    {
      id: 'end_date',
      label: 'End Date',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {formatDate(row.end_date) || '-'}
        </Typography>
      ),
    },
    {
      id: 'total_days',
      label: 'Days',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {row.total_days} {row.total_days === 1 ? 'day' : 'days'}
        </Typography>
      ),
    },
    {
      id: 'reason',
      label: 'Reason',
      render: (_value, row) => (
        <Tooltip title={row.reason || ''} placement="top" arrow>
          <Typography
            variant="body2"
            className="!text-gray-900"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              maxWidth: '300px',
              cursor: row.reason ? 'help' : 'default',
            }}
          >
            {row.reason || (
              <span className="italic text-gray-400">No reason provided</span>
            )}
          </Typography>
        </Tooltip>
      ),
    },
    {
      id: 'approval_status',
      label: 'Status',
      render: (_value, row) => (
        <Chip
          label={row.approval_status}
          color={getApprovalStatusColor(row.approval_status) as any}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      id: 'approved_by_name',
      label: 'Approved By',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {row.approved_by_name || '-'}
        </Typography>
      ),
    },
    {
      id: 'createdate',
      label: 'Applied Date',
      render: (_value, row) =>
        formatDate(row.createdate) || (
          <span className="italic text-gray-400">No Date</span>
        ),
    },
    ...(isUpdate || isDelete || isRead
      ? [
          {
            id: 'action',
            label: 'Actions',
            sortable: false,
            render: (_value: any, row: LeaveApplication) => (
              <div className="!flex !gap-2 !items-center">
                {isUpdate && row.approval_status === 'Pending' && (
                  <>
                    <Button
                      variant="outlined"
                      size="small"
                      color="success"
                      onClick={() => handleApproveLeaveApplication(row.id)}
                      disabled={
                        approveLeaveApplicationMutation.isPending ||
                        rejectLeaveApplicationMutation.isPending
                      }
                      className="!capitalize"
                    >
                      Approve
                    </Button>
                    <PopConfirm
                      title="Reject Leave Application"
                      description="Are you sure you want to reject this leave application?"
                      onConfirm={() => {
                        const reason = prompt(
                          'Please provide a reason for rejection:'
                        );
                        if (reason) {
                          handleRejectLeaveApplication(row.id, reason);
                        }
                      }}
                      confirmText="Reject"
                      cancelText="Cancel"
                      placement="top"
                    >
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        disabled={
                          approveLeaveApplicationMutation.isPending ||
                          rejectLeaveApplicationMutation.isPending
                        }
                        className="!capitalize"
                      >
                        Reject
                      </Button>
                    </PopConfirm>
                  </>
                )}
                {isUpdate && row.approval_status !== 'Pending' && (
                  <EditButton
                    onClick={() => handleEditLeaveApplication(row)}
                    tooltip={`Edit ${row.employee_name}'s Leave Application`}
                  />
                )}
                {isDelete && (
                  <DeleteButton
                    onClick={() => handleDeleteLeaveApplication(row.id)}
                    tooltip={`Delete ${row.employee_name}'s Leave Application`}
                    itemName={`${row.employee_name}'s leave application`}
                    confirmDelete={true}
                  />
                )}
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <>
      <Box className="!mb-3 !flex !justify-between !items-center">
        <Box>
          <p className="!font-bold text-xl !text-gray-900">
            Leave Applications
          </p>
          <p className="!text-gray-500 text-sm">
            Manage employee leave applications and approvals
          </p>
        </Box>
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Total Applications"
          value={totalApplications}
          icon={<Calendar className="w-6 h-6" />}
          color="blue"
          isLoading={isLoading}
        />
        <StatsCard
          title="Pending"
          value={pendingApplications}
          icon={<Cancel className="w-6 h-6" />}
          color="orange"
          isLoading={isLoading}
        />
        <StatsCard
          title="Approved"
          value={approvedApplications}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
          isLoading={isLoading}
        />
        <StatsCard
          title="Rejected"
          value={rejectedApplications}
          icon={<Cancel className="w-6 h-6" />}
          color="red"
          isLoading={isLoading}
        />
      </div>

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load leave applications. Please try again.
        </Alert>
      )}

      <Table
        data={leaveApplications}
        columns={leaveApplicationColumns}
        actions={
          isRead || isCreate ? (
            <div className="flex justify-between w-full items-center flex-wrap gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {isRead && (
                  <>
                    <SearchInput
                      placeholder="Search Leave Application"
                      value={search}
                      onChange={handleSearchChange}
                      debounceMs={400}
                      showClear={true}
                      className="!w-80"
                    />
                    <FormControl size="small" className="!w-40">
                      <MuiSelect
                        value={approvalStatusFilter}
                        onChange={e =>
                          setApprovalStatusFilter(
                            e.target.value as ApprovalStatus | 'all'
                          )
                        }
                      >
                        <MenuItem value="all">All Status</MenuItem>
                        <MenuItem value="Pending">Pending</MenuItem>
                        <MenuItem value="Approved">Approved</MenuItem>
                        <MenuItem value="Rejected">Rejected</MenuItem>
                        <MenuItem value="Cancelled">Cancelled</MenuItem>
                      </MuiSelect>
                    </FormControl>
                    <FormControl size="small" className="!w-40">
                      <MuiSelect
                        value={leaveTypeFilter}
                        onChange={e =>
                          setLeaveTypeFilter(
                            e.target.value as LeaveType | 'all'
                          )
                        }
                      >
                        <MenuItem value="all">All Types</MenuItem>
                        <MenuItem value="Annual">Annual</MenuItem>
                        <MenuItem value="Sick">Sick</MenuItem>
                        <MenuItem value="Casual">Casual</MenuItem>
                        <MenuItem value="Emergency">Emergency</MenuItem>
                        <MenuItem value="Maternity">Maternity</MenuItem>
                        <MenuItem value="Paternity">Paternity</MenuItem>
                        <MenuItem value="Unpaid">Unpaid</MenuItem>
                      </MuiSelect>
                    </FormControl>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isRead && (
                  <PopConfirm
                    title="Export Leave Applications"
                    description="Are you sure you want to export the current leave applications data to Excel? This will include all filtered results."
                    onConfirm={handleExportToExcel}
                    confirmText="Export"
                    cancelText="Cancel"
                    placement="top"
                  >
                    <Button
                      variant="outlined"
                      className="!capitalize"
                      startIcon={<Download />}
                      disabled={exportToExcelMutation.isPending}
                    >
                      {exportToExcelMutation.isPending
                        ? 'Exporting...'
                        : 'Export'}
                    </Button>
                  </PopConfirm>
                )}
                {isCreate && (
                  <Button
                    variant="outlined"
                    className="!capitalize"
                    startIcon={<Upload />}
                    onClick={() => setImportModalOpen(true)}
                  >
                    Import
                  </Button>
                )}
                {isCreate && (
                  <Button
                    variant="contained"
                    className="!capitalize"
                    disableElevation
                    startIcon={<Add />}
                    onClick={handleCreateLeaveApplication}
                  >
                    Create
                  </Button>
                )}
              </div>
            </div>
          ) : (
            false
          )
        }
        getRowId={application => application.id}
        initialOrderBy="createdate"
        loading={isLoading}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        isPermission={isRead !== false}
        onPageChange={handlePageChange}
        emptyMessage={
          search
            ? `No leave applications found matching "${search}"`
            : 'No leave applications found in the system'
        }
      />

      <ManageLeaveApplication
        selectedLeaveApplication={selectedLeaveApplication}
        setSelectedLeaveApplication={setSelectedLeaveApplication}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />

      <ImportLeaveApplication
        drawerOpen={importModalOpen}
        setDrawerOpen={setImportModalOpen}
      />
    </>
  );
};

export default LeaveApplicationPage;
