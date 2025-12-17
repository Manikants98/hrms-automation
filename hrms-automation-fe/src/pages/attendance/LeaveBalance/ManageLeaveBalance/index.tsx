import { Add, Delete } from '@mui/icons-material';
import { Box, IconButton, MenuItem, Typography } from '@mui/material';
import { useFormik } from 'formik';
import {
  useCreateLeaveBalance,
  useUpdateLeaveBalance,
  type LeaveBalance,
  type LeaveBalanceItem,
  type LeaveBalanceStatus,
  type LeaveType,
} from 'hooks/useLeaveBalances';
import React, { useMemo } from 'react';
import { leaveBalanceValidationSchema } from 'schemas/leaveBalance.schema';
import { ActionButton } from 'shared/ActionButton';
import ActiveInactiveField from 'shared/ActiveInactiveField';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import EmployeeSelect from 'shared/EmployeeSelect';
import Input from 'shared/Input';
import Select from 'shared/Select';
import Table, { type TableColumn } from 'shared/Table';

interface ManageLeaveBalanceProps {
  selectedLeaveBalance?: LeaveBalance | null;
  setSelectedLeaveBalance: (balance: LeaveBalance | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const leaveTypeOptions: LeaveType[] = [
  'Annual',
  'Sick',
  'Casual',
  'Emergency',
  'Maternity',
  'Paternity',
  'Unpaid',
  'Marriage',
  'Earned',
  'Informal',
  'Formal',
  'Normal',
] as LeaveType[];

const getDefaultLeaveTypeItems = (): LeaveBalanceItem[] => {
  return leaveTypeOptions.map(leaveType => ({
    leave_type: leaveType,
    total_allocated: 0,
    used: 0,
    leave_balance: 0,
  }));
};

const ManageLeaveBalance: React.FC<ManageLeaveBalanceProps> = ({
  selectedLeaveBalance,
  setSelectedLeaveBalance,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedLeaveBalance && selectedLeaveBalance.id > 0;

  const handleCancel = () => {
    setSelectedLeaveBalance(null);
    setDrawerOpen(false);
  };

  const createLeaveBalanceMutation = useCreateLeaveBalance();
  const updateLeaveBalanceMutation = useUpdateLeaveBalance();

  const getInitialLeaveTypeItems = (): LeaveBalanceItem[] => {
    const items =
      selectedLeaveBalance?.leave_type_items || getDefaultLeaveTypeItems();
    return items.map(item => ({
      ...item,
      total_allocated: item.total_allocated || 0,
      used: item.used || 0,
      leave_balance: (item.total_allocated || 0) - (item.used || 0),
    }));
  };

  const formik = useFormik({
    initialValues: {
      employee_id: selectedLeaveBalance?.employee_id || 0,
      start_date: selectedLeaveBalance?.start_date || '',
      end_date: selectedLeaveBalance?.end_date || '',
      status: (selectedLeaveBalance?.status || 'Active') as
        | 'Active'
        | 'Inactive',
      statusField:
        selectedLeaveBalance?.status === 'Active' ||
        !selectedLeaveBalance?.status
          ? 'Y'
          : 'N',
      leave_type_items: getInitialLeaveTypeItems(),
    },
    validationSchema: leaveBalanceValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const leaveBalanceData = {
          employee_id: values.employee_id,
          start_date: values.start_date,
          end_date: values.end_date,
          status: (values.statusField === 'Y'
            ? 'Active'
            : 'Inactive') as LeaveBalanceStatus,
          leave_type_items: values.leave_type_items.map(item => ({
            leave_type: item.leave_type,
            total_allocated: item.total_allocated,
            used: item.used,
            leave_balance: item.total_allocated - item.used,
          })),
        };

        if (isEdit && selectedLeaveBalance) {
          await updateLeaveBalanceMutation.mutateAsync({
            id: selectedLeaveBalance.id,
            ...leaveBalanceData,
          });
        } else {
          await createLeaveBalanceMutation.mutateAsync(leaveBalanceData);
        }

        handleCancel();
      } catch (error) {
        console.error('Error saving leave balance:', error);
      }
    },
  });

  const handleAddLeaveTypeItem = () => {
    const newItem: LeaveBalanceItem = {
      leave_type: 'Annual',
      total_allocated: 0,
      used: 0,
      leave_balance: 0,
    };
    formik.setFieldValue('leave_type_items', [
      ...formik.values.leave_type_items,
      newItem,
    ]);
  };

  const handleRemoveLeaveTypeItem = (index: number) => {
    const newItems = formik.values.leave_type_items.filter(
      (_, i) => i !== index
    );
    formik.setFieldValue('leave_type_items', newItems);
  };

  const handleLeaveTypeItemChange = (
    index: number,
    field: keyof LeaveBalanceItem,
    value: string | number
  ) => {
    const items = [...formik.values.leave_type_items];
    items[index] = {
      ...items[index],
      [field]: value,
    };

    if (field === 'total_allocated' || field === 'used') {
      items[index].leave_balance =
        items[index].total_allocated - items[index].used;
    }

    formik.setFieldValue('leave_type_items', items);
  };

  const leaveTypeItemColumns: TableColumn<
    LeaveBalanceItem & { index: number }
  >[] = [
    {
      id: 'leave_type',
      label: 'Leave Type',
      sortable: false,
      width: '30%',
      render: (_value, row) => (
        <Select
          name={`leave_type_items.${row.index}.leave_type`}
          formik={formik}
          value={row.leave_type}
          fullWidth
          size="small"
          className="!w-48"
        >
          {leaveTypeOptions.map(type => (
            <MenuItem key={type} value={type}>
              {type} Leave
            </MenuItem>
          ))}
        </Select>
      ),
    },
    {
      id: 'total_allocated',
      label: 'Total Leave',
      sortable: false,
      render: (_value, row) => (
        <Input
          name={`leave_type_items.${row.index}.total_allocated`}
          type="number"
          formik={formik}
          value={row.total_allocated || 0}
          size="small"
          slotProps={{
            htmlInput: {
              min: 0,
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                handleLeaveTypeItemChange(
                  row.index,
                  'total_allocated',
                  Number(e.target.value) || 0
                );
              },
            },
          }}
        />
      ),
    },
    {
      id: 'used',
      label: 'Leave Taken',
      sortable: false,
      render: (_value, row) => (
        <Input
          name={`leave_type_items.${row.index}.used`}
          type="number"
          formik={formik}
          value={row.used || 0}
          size="small"
          slotProps={{
            htmlInput: {
              min: 0,
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                handleLeaveTypeItemChange(
                  row.index,
                  'used',
                  Number(e.target.value) || 0
                );
              },
            },
          }}
        />
      ),
    },
    {
      id: 'leave_balance',
      label: 'Leave Balance',
      sortable: false,
      render: (_value, row) => {
        const balance = (row.total_allocated || 0) - (row.used || 0);
        return (
          <Input
            name={`leave_type_items.${row.index}.leave_balance`}
            type="number"
            formik={formik}
            value={balance}
            size="small"
            disabled
            slotProps={{
              htmlInput: {
                min: 0,
              },
            }}
          />
        );
      },
    },
    {
      id: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_value, row) => (
        <Box className="!flex !justify-center">
          <ActionButton
            size="small"
            color="error"
            icon={<Delete />}
            tooltip="Delete Leave Type"
            onClick={() => handleRemoveLeaveTypeItem(row.index)}
          />
        </Box>
      ),
    },
  ];

  const tableData = useMemo(() => {
    return formik.values.leave_type_items.map((item, index) => ({
      ...item,
      index,
    }));
  }, [formik.values.leave_type_items]);

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={
        isEdit && selectedLeaveBalance?.id
          ? 'Edit Leave Balance'
          : 'Create Leave Balance'
      }
      size="large"
    >
      <Box className="!p-5">
        <form onSubmit={formik.handleSubmit}>
          <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-x-5 !gap-y-4 !mb-3">
            <EmployeeSelect
              name="employee_id"
              label="Employee"
              formik={formik}
              required
              nameToSearch={selectedLeaveBalance?.employee_name || ''}
            />

            <Input
              name="start_date"
              label="Start Date"
              type="date"
              formik={formik}
              required
            />

            <Input
              name="end_date"
              label="End Date"
              type="date"
              formik={formik}
              required
            />
          </Box>
          <ActiveInactiveField
            name="statusField"
            label="Status"
            formik={formik}
            required
            className="!mb-3"
          />
          <Box className="!mb-6">
            <Table
              actions={
                <Box className="!flex !justify-between !items-center">
                  <Typography
                    component="p"
                    className="!text-gray-900 !font-medium"
                  >
                    Leave Type Items
                  </Typography>
                  <Button
                    type="button"
                    variant="outlined"
                    size="small"
                    startIcon={<Add />}
                    onClick={handleAddLeaveTypeItem}
                  >
                    Add Leave Type
                  </Button>
                </Box>
              }
              data={tableData}
              columns={leaveTypeItemColumns}
              pagination={false}
              sortable={false}
              compact
              emptyMessage="No leave type items. Click 'Add Leave Type' to add one."
            />
          </Box>

          <Box className="!flex !justify-end gap-1 !mt-6">
            <Button
              type="button"
              variant="outlined"
              onClick={handleCancel}
              className="!mr-3"
              disabled={
                createLeaveBalanceMutation.isPending ||
                updateLeaveBalanceMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createLeaveBalanceMutation.isPending ||
                updateLeaveBalanceMutation.isPending
              }
            >
              {createLeaveBalanceMutation.isPending ||
              updateLeaveBalanceMutation.isPending
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

export default ManageLeaveBalance;
