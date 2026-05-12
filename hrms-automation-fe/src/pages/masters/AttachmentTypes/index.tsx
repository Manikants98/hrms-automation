import { Add, Block, CheckCircle } from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Box,
  FormControl,
  MenuItem,
  Select as MuiSelect,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  useAttachmentTypes,
  useDeleteAttachmentType,
  type AttachmentType,
} from 'hooks/useAttachmentTypes';
import { usePermission } from 'hooks/usePermission';
import { Paperclip } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { DeleteButton, EditButton } from 'shared/ActionButton';
import Button from 'shared/Button';
import SearchInput from 'shared/SearchInput';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import { formatDate } from 'utils/dateUtils';
import ManageAttachmentType from './ManageAttachmentType';

const AttachmentTypesPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAttachmentType, setSelectedAttachmentType] =
    useState<AttachmentType | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { isCreate, isUpdate, isDelete, isRead } = usePermission(
    'attachment-type' as any
  );

  const {
    data: attachmentTypesResponse,
    isLoading,
    error,
  } = useAttachmentTypes(
    {
      search,
      page,
      limit,
      isActive:
        statusFilter === 'all'
          ? undefined
          : statusFilter === 'active'
            ? 'Y'
            : 'N',
    },
    {
      enabled: isRead !== false,
    }
  );

  const attachmentTypes = Array.isArray(attachmentTypesResponse?.data)
    ? attachmentTypesResponse.data
    : [];
  const totalCount = attachmentTypesResponse?.meta?.total_count || 0;
  const currentPage = (attachmentTypesResponse?.meta?.current_page || 1) - 1;

  const deleteAttachmentTypeMutation = useDeleteAttachmentType();

  const stats = attachmentTypesResponse?.stats as any;
  const totalAttachmentTypes =
    stats?.total_attachment_types ?? attachmentTypes.length;
  const activeAttachmentTypes =
    stats?.active_attachment_types ??
    attachmentTypes.filter(at => at.is_active === 'Y').length;
  const inactiveAttachmentTypes =
    stats?.inactive_attachment_types ??
    attachmentTypes.filter(at => at.is_active === 'N').length;

  const handleCreateAttachmentType = useCallback(() => {
    setSelectedAttachmentType(null);
    setDrawerOpen(true);
  }, []);

  const handleEditAttachmentType = useCallback(
    (attachmentType: AttachmentType) => {
      setSelectedAttachmentType(attachmentType);
      setDrawerOpen(true);
    },
    []
  );

  const handleDeleteAttachmentType = useCallback(
    async (id: number) => {
      try {
        await deleteAttachmentTypeMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting attachment type:', error);
      }
    },
    [deleteAttachmentTypeMutation]
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handlePageChange = (newPage: number) => {
    setPage(newPage + 1);
  };

  const attachmentTypeColumns: TableColumn<AttachmentType>[] = [
    {
      id: 'name',
      label: 'Name',
      render: (_value, row) => (
        <Box className="!flex !gap-2 !items-center">
          <Avatar
            alt={row.name}
            className="!rounded !bg-primary-100 !text-primary-500"
          >
            <Paperclip className="w-5 h-5" />
          </Avatar>
          <Box className="!max-w-xs">
            <Typography
              variant="body1"
              className="!text-gray-900 !leading-tight"
            >
              {row.name}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'code',
      label: 'Code',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {row.code}
        </Typography>
      ),
    },
    {
      id: 'description',
      label: 'Description',
      render: (_value, row) => (
        <Tooltip title={row.description || ''} placement="top" arrow>
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
              cursor: row.description ? 'help' : 'default',
            }}
          >
            {row.description || (
              <span className="italic text-gray-400">No Description</span>
            )}
          </Typography>
        </Tooltip>
      ),
    },
    {
      id: 'createdate',
      label: 'Created Date',
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
            render: (_value: any, row: AttachmentType) => (
              <div className="!flex !gap-2 !items-center">
                {isUpdate && (
                  <EditButton
                    onClick={() => handleEditAttachmentType(row)}
                    tooltip={`Edit ${row.name}`}
                  />
                )}
                {isDelete && (
                  <DeleteButton
                    onClick={() => handleDeleteAttachmentType(row.id)}
                    tooltip={`Delete ${row.name}`}
                    itemName={row.name}
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
          <p className="!font-bold text-xl !text-gray-900">Attachment Types</p>
          <p className="!text-gray-500 text-sm">
            Manage attachment types for job postings
          </p>
        </Box>
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatsCard
          title="Total Attachment Types"
          value={totalAttachmentTypes}
          icon={<Paperclip className="w-6 h-6" />}
          color="blue"
          isLoading={isLoading}
        />
        <StatsCard
          title="Active Types"
          value={activeAttachmentTypes}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
          isLoading={isLoading}
        />
        <StatsCard
          title="Inactive Types"
          value={inactiveAttachmentTypes}
          icon={<Block className="w-6 h-6" />}
          color="red"
          isLoading={isLoading}
        />
      </div>

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load attachment types. Please try again.
        </Alert>
      )}

      <Table
        data={attachmentTypes}
        columns={attachmentTypeColumns}
        actions={
          isRead || isCreate ? (
            <div className="flex justify-between w-full items-center flex-wrap gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {isRead && (
                  <>
                    <SearchInput
                      placeholder="Search Attachment Type"
                      value={search}
                      onChange={handleSearchChange}
                      debounceMs={400}
                      showClear={true}
                      className="!w-80"
                    />
                    <FormControl size="small" className="!w-32">
                      <MuiSelect
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                      >
                        <MenuItem value="all">All Status</MenuItem>
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="inactive">Inactive</MenuItem>
                      </MuiSelect>
                    </FormControl>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isCreate && (
                  <Button
                    variant="contained"
                    className="!capitalize"
                    disableElevation
                    startIcon={<Add />}
                    onClick={handleCreateAttachmentType}
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
        getRowId={attachmentType => attachmentType.id}
        initialOrderBy="name"
        loading={isLoading}
        totalCount={totalCount}
        page={currentPage}
        rowsPerPage={limit}
        isPermission={isRead !== false}
        onPageChange={handlePageChange}
        emptyMessage={
          search
            ? `No attachment types found matching "${search}"`
            : 'No attachment types found in the system'
        }
      />

      <ManageAttachmentType
        selectedAttachmentType={selectedAttachmentType}
        setSelectedAttachmentType={setSelectedAttachmentType}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />
    </>
  );
};

export default AttachmentTypesPage;
