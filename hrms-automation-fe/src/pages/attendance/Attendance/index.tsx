import { AccessTime, Cancel, CheckCircle, Download } from '@mui/icons-material';
import { Alert, Avatar, Box, Chip, Typography } from '@mui/material';
import {
  useAttendance,
  type AttendanceRecord,
  type AttendanceStatus,
} from 'hooks/useAttendance';
import { useEmployees } from 'hooks/useEmployees';
import { useExportToExcel } from 'hooks/useImportExport';
import { usePermission } from 'hooks/usePermission';
import { Calendar, User } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import Button from 'shared/Button';
import { PopConfirm } from 'shared/DeleteConfirmation';
import Input from 'shared/Input';
import SearchInput from 'shared/SearchInput';
import StatsCard from 'shared/StatsCard';
import Table, { type TableColumn } from 'shared/Table';
import MarkAttendance from './MarkAttendance/index';

const AttendancePage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [search, setSearch] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<{
    employee_id: number;
    employee_name: string;
    record?: AttendanceRecord;
  } | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);

  const { isCreate, isUpdate, isRead } = usePermission('user' as any);

  const { data: employeesResponse, isLoading: employeesLoading } = useEmployees(
    {
      isActive: 'Y',
      limit: 1000,
    },
    {
      enabled: isRead !== false,
    }
  );

  const {
    data: attendanceResponse,
    isLoading: attendanceLoading,
    error,
  } = useAttendance(
    {
      attendance_date: selectedDate,
      limit: 1000,
    },
    {
      enabled: isRead !== false,
    }
  );

  const employees = Array.isArray(employeesResponse?.data) ? employeesResponse.data : [];
  const attendanceRecords = Array.isArray(attendanceResponse?.data) ? attendanceResponse.data : [];

  const exportToExcelMutation = useExportToExcel();

  const attendanceMap = useMemo(() => {
    const map = new Map<number, AttendanceRecord>();
    attendanceRecords.forEach(record => {
      map.set(record.employee_id, record);
    });
    return map;
  }, [attendanceRecords]);

  const attendanceData = useMemo(() => {
    return employees
      .map(employee => {
        const record = attendanceMap.get(employee.id);
        return {
          employee_id: employee.id,
          employee_name: employee.name,
          employee_email: employee.email,
          employee_department: employee.department_name,
          record: record,
        };
      })
      .filter(item => {
        if (!search) return true;
        const searchLower = search.toLowerCase();
        return (
          item.employee_name.toLowerCase().includes(searchLower) ||
          item.employee_email.toLowerCase().includes(searchLower) ||
          item.employee_department?.toLowerCase().includes(searchLower)
        );
      });
  }, [employees, attendanceMap, search]);

  const paginatedData = useMemo(() => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return attendanceData.slice(startIndex, endIndex);
  }, [attendanceData, page, rowsPerPage]);

  const stats = useMemo(() => {
    const total = attendanceData.length;
    const present = attendanceData.filter(
      item => item.record?.status === 'Present'
    ).length;
    const absent = attendanceData.filter(
      item => item.record?.status === 'Absent'
    ).length;
    const halfDay = attendanceData.filter(
      item => item.record?.status === 'Half Day'
    ).length;
    const leave = attendanceData.filter(
      item => item.record?.status === 'Leave'
    ).length;
    const pending = attendanceData.filter(item => !item.record).length;

    return { total, present, absent, halfDay, leave, pending };
  }, [attendanceData]);

  const handleMarkAttendance = useCallback(
    (employeeId: number, employeeName: string) => {
      const record = attendanceMap.get(employeeId);
      setSelectedEmployee({
        employee_id: employeeId,
        employee_name: employeeName,
        record,
      });
      setDrawerOpen(true);
    },
    [attendanceMap]
  );

  const handleExportToExcel = useCallback(async () => {
    try {
      const filters = {
        attendance_date: selectedDate,
        search,
      };

      await exportToExcelMutation.mutateAsync({
        tableName: 'attendance',
        filters,
      });
    } catch (error) {
      console.error('Error exporting attendance:', error);
    }
  }, [exportToExcelMutation, selectedDate, search]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(0);
  }, []);

  const getStatusColor = (status?: AttendanceStatus) => {
    switch (status) {
      case 'Present':
        return 'success';
      case 'Absent':
        return 'error';
      case 'Half Day':
        return 'warning';
      case 'Leave':
        return 'info';
      case 'Holiday':
      case 'Weekend':
        return 'default';
      default:
        return 'default';
    }
  };

  const columns: TableColumn<(typeof attendanceData)[0]>[] = [
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
      id: 'employee_department',
      label: 'Department',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {row.employee_department || '-'}
        </Typography>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      render: (_value, row) => {
        if (!row.record) {
          return (
            <Chip
              label="Not Marked"
              color="default"
              size="small"
              variant="outlined"
            />
          );
        }
        return (
          <Chip
            label={row.record.status}
            color={getStatusColor(row.record.status) as any}
            size="small"
            variant="outlined"
          />
        );
      },
    },
    {
      id: 'punch_in_time',
      label: 'Punch In',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {row.record?.punch_in_time || '-'}
        </Typography>
      ),
    },
    {
      id: 'punch_out_time',
      label: 'Punch Out',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {row.record?.punch_out_time || '-'}
        </Typography>
      ),
    },
    {
      id: 'total_hours',
      label: 'Total Hours',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {row.record?.total_hours ? `${row.record.total_hours} hrs` : '-'}
        </Typography>
      ),
    },
    {
      id: 'remarks',
      label: 'Remarks',
      render: (_value, row) => (
        <Typography variant="body2" className="!text-gray-900">
          {row.record?.remarks || '-'}
        </Typography>
      ),
    },
    ...(isCreate || isUpdate
      ? [
          {
            id: 'action',
            label: 'Action',
            sortable: false,
            render: (_value: any, row: (typeof attendanceData)[0]) => (
              <Button
                variant="outlined"
                size="small"
                onClick={() =>
                  handleMarkAttendance(row.employee_id, row.employee_name)
                }
                className="!capitalize"
              >
                {row.record ? 'Edit' : 'Mark'}
              </Button>
            ),
          },
        ]
      : []),
  ];

  return (
    <>
      <Box className="!mb-3 !flex !justify-between !items-center">
        <Box>
          <p className="!font-bold text-xl !text-gray-900">Daily Attendance</p>
          <p className="!text-gray-500 text-sm">
            Mark and manage daily attendance for all employees
          </p>
        </Box>
      </Box>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Present"
          value={stats.present}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
          isLoading={attendanceLoading}
        />
        <StatsCard
          title="Absent"
          value={stats.absent}
          icon={<Cancel className="w-6 h-6" />}
          color="red"
          isLoading={attendanceLoading}
        />
        <StatsCard
          title="Half Day"
          value={stats.halfDay}
          icon={<AccessTime className="w-6 h-6" />}
          color="orange"
          isLoading={attendanceLoading}
        />
        <StatsCard
          title="Leave"
          value={stats.leave}
          icon={<Calendar className="w-6 h-6" />}
          color="purple"
          isLoading={attendanceLoading}
        />
      </div>

      {error && (
        <Alert severity="error" className="!mb-4">
          Failed to load attendance records. Please try again.
        </Alert>
      )}

      <Table
        data={paginatedData}
        columns={columns}
        actions={
          isRead || isCreate ? (
            <div className="flex justify-between w-full items-center flex-wrap gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {isRead && (
                  <>
                    <Input
                      type="date"
                      label="Date"
                      value={selectedDate}
                      setValue={setSelectedDate}
                      size="small"
                      fullWidth={false}
                      className="!w-48"
                    />
                    <SearchInput
                      placeholder="Search Employee"
                      value={search}
                      onChange={handleSearchChange}
                      debounceMs={400}
                      showClear={true}
                      className="!w-80"
                    />
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isRead && (
                  <PopConfirm
                    title="Export Attendance"
                    description="Are you sure you want to export the current attendance data to Excel? This will include all filtered results."
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
              </div>
            </div>
          ) : (
            false
          )
        }
        getRowId={row => row.employee_id}
        initialOrderBy="employee_name"
        loading={employeesLoading || attendanceLoading}
        totalCount={attendanceData.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        isPermission={isRead !== false}
        sortable={false}
        emptyMessage={
          search
            ? `No employees found matching "${search}"`
            : 'No employees found in the system'
        }
      />

      <MarkAttendance
        selectedEmployee={selectedEmployee}
        selectedDate={selectedDate}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
        onSuccess={() => {
          setDrawerOpen(false);
          setSelectedEmployee(null);
        }}
      />
    </>
  );
};

export default AttendancePage;
