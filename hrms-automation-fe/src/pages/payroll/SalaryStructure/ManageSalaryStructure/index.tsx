import { Add, Delete } from '@mui/icons-material';
import { Box, MenuItem, Typography } from '@mui/material';
import { useFormik } from 'formik';
import {
  useCreateSalaryStructure,
  useUpdateSalaryStructure,
  type SalaryStructure,
  type SalaryStructureItem,
  type SalaryStructureStatus,
  type SalaryStructureType,
  type SalaryStructureCategory,
  defaultStructureTypes,
} from 'hooks/useSalaryStructures';
import React, { useMemo } from 'react';
import { salaryStructureValidationSchema } from 'schemas/salaryStructure.schema';
import { ActionButton } from 'shared/ActionButton';
import ActiveInactiveField from 'shared/ActiveInactiveField';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import EmployeeSelect from 'shared/EmployeeSelect';
import Input from 'shared/Input';
import Select from 'shared/Select';
import Table, { type TableColumn } from 'shared/Table';

interface ManageSalaryStructureProps {
  selectedSalaryStructure?: SalaryStructure | null;
  setSelectedSalaryStructure: (structure: SalaryStructure | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const structureTypeOptions: SalaryStructureType[] = [
  'Basic Salary',
  'HRA',
  'Transport Allowance',
  'Medical Allowance',
  'Provident Fund',
  'Tax Deduction',
  'Insurance',
  'Bonus',
  'Overtime',
  'Allowance',
  'Loan Deduction',
  'Other Deduction',
  'Other Earnings',
] as SalaryStructureType[];

const categoryOptions: SalaryStructureCategory[] = ['Earnings', 'Deductions'];

const getDefaultStructureItems = (): SalaryStructureItem[] => {
  return defaultStructureTypes.map(item => ({
    structure_type: item.type,
    value: 0,
    category: item.category,
    is_default: item.is_default,
  }));
};

const ManageSalaryStructure: React.FC<ManageSalaryStructureProps> = ({
  selectedSalaryStructure,
  setSelectedSalaryStructure,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedSalaryStructure && selectedSalaryStructure.id > 0;

  const handleCancel = () => {
    setSelectedSalaryStructure(null);
    setDrawerOpen(false);
  };

  const createSalaryStructureMutation = useCreateSalaryStructure();
  const updateSalaryStructureMutation = useUpdateSalaryStructure();

  const getInitialStructureItems = (): SalaryStructureItem[] => {
    const items =
      selectedSalaryStructure?.structure_items || getDefaultStructureItems();
    return items.map(item => ({
      ...item,
      value: Number(item.value || 0),
    }));
  };

  const formik = useFormik({
    initialValues: {
      employee_id: selectedSalaryStructure?.employee_id || 0,
      start_date: selectedSalaryStructure?.start_date || '',
      end_date: selectedSalaryStructure?.end_date || '',
      status: (selectedSalaryStructure?.status || 'Active') as
        | 'Active'
        | 'Inactive',
      statusField:
        selectedSalaryStructure?.status === 'Active' ||
        !selectedSalaryStructure?.status
          ? 'Y'
          : 'N',
      structure_items: getInitialStructureItems(),
    },
    validationSchema: salaryStructureValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const salaryStructureData = {
          employee_id: values.employee_id,
          start_date: values.start_date,
          end_date: values.end_date,
          status: (values.statusField === 'Y'
            ? 'Active'
            : 'Inactive') as SalaryStructureStatus,
          structure_items: values.structure_items.map(item => ({
            structure_type: item.structure_type,
            value: item.value,
            category: item.category,
            is_default: item.is_default,
          })),
        };

        if (isEdit && selectedSalaryStructure) {
          await updateSalaryStructureMutation.mutateAsync({
            id: selectedSalaryStructure.id,
            ...salaryStructureData,
          });
        } else {
          await createSalaryStructureMutation.mutateAsync(salaryStructureData);
        }

        handleCancel();
      } catch (error) {
        console.error('Error saving salary structure:', error);
      }
    },
  });

  const handleAddStructureItem = () => {
    const newItem: SalaryStructureItem = {
      structure_type: 'Basic Salary',
      value: 0,
      category: 'Earnings',
      is_default: false,
    };
    formik.setFieldValue('structure_items', [
      ...formik.values.structure_items,
      newItem,
    ]);
  };

  const handleRemoveStructureItem = (index: number) => {
    const newItems = formik.values.structure_items.filter(
      (_, i) => i !== index
    );
    formik.setFieldValue('structure_items', newItems);
  };

  const handleStructureItemChange = (
    index: number,
    field: keyof SalaryStructureItem,
    value: string | number | boolean
  ) => {
    const items = [...formik.values.structure_items];
    items[index] = {
      ...items[index],
      [field]: field === 'value' ? Number(value || 0) : value,
    };

    if (field === 'structure_type') {
      const defaultType = defaultStructureTypes.find(dt => dt.type === value);
      if (defaultType) {
        items[index].category = defaultType.category;
        items[index].is_default = defaultType.is_default;
      }
    }

    formik.setFieldValue('structure_items', items);
  };

  const structureItemColumns: TableColumn<
    SalaryStructureItem & { index: number }
  >[] = [
    {
      id: 'structure_type',
      label: 'Structure Type',
      sortable: false,
      width: '25%',
      render: (_value, row) => (
        <Select
          name={`structure_items.${row.index}.structure_type`}
          formik={formik}
          value={row.structure_type}
          fullWidth
          size="small"
          className="!w-48"
          onChange={e => {
            handleStructureItemChange(
              row.index,
              'structure_type',
              e.target.value as SalaryStructureType
            );
          }}
        >
          {structureTypeOptions.map(type => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </Select>
      ),
    },
    {
      id: 'category',
      label: 'Category',
      sortable: false,
      width: '20%',
      render: (_value, row) => (
        <Select
          name={`structure_items.${row.index}.category`}
          formik={formik}
          value={row.category}
          fullWidth
          size="small"
          onChange={e => {
            handleStructureItemChange(
              row.index,
              'category',
              e.target.value as SalaryStructureCategory
            );
          }}
        >
          {categoryOptions.map(category => (
            <MenuItem key={category} value={category}>
              {category}
            </MenuItem>
          ))}
        </Select>
      ),
    },
    {
      id: 'value',
      label: 'Value',
      sortable: false,
      width: '20%',
      render: (_value, row) => (
        <Input
          name={`structure_items.${row.index}.value`}
          type="number"
          formik={formik}
          value={row.value || 0}
          size="small"
          slotProps={{
            htmlInput: {
              min: 0,
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                handleStructureItemChange(
                  row.index,
                  'value',
                  Number(e.target.value) || 0
                );
              },
            },
          }}
        />
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      sortable: false,
      width: '10%',
      render: (_value, row) => (
        <Box className="!flex !justify-center">
          <ActionButton
            size="small"
            color="error"
            icon={<Delete />}
            tooltip="Delete Structure Item"
            onClick={() => handleRemoveStructureItem(row.index)}
          />
        </Box>
      ),
    },
  ];

  const tableData = useMemo(() => {
    return formik.values.structure_items.map((item, index) => ({
      ...item,
      index,
    }));
  }, [formik.values.structure_items]);

  const earningsTotal = useMemo(() => {
    return formik.values.structure_items
      .filter(item => item.category === 'Earnings')
      .reduce((sum, item) => sum + Number(item.value || 0), 0);
  }, [formik.values.structure_items]);

  const deductionsTotal = useMemo(() => {
    return formik.values.structure_items
      .filter(item => item.category === 'Deductions')
      .reduce((sum, item) => sum + Number(item.value || 0), 0);
  }, [formik.values.structure_items]);

  const netSalary = earningsTotal - deductionsTotal;

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={
        isEdit && selectedSalaryStructure?.id
          ? 'Edit Salary Structure'
          : 'Create Salary Structure'
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
              nameToSearch={selectedSalaryStructure?.employee_name || ''}
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
                    Salary Structure Items
                  </Typography>
                  <Button
                    type="button"
                    variant="outlined"
                    size="small"
                    startIcon={<Add />}
                    onClick={handleAddStructureItem}
                  >
                    Add Structure Item
                  </Button>
                </Box>
              }
              data={tableData}
              columns={structureItemColumns}
              pagination={false}
              sortable={false}
              compact
              emptyMessage="No structure items. Click 'Add Structure Item' to add one."
            />
          </Box>

          <Box className="!mb-6 !p-4 !bg-gray-50 !rounded-lg">
            <Typography
              variant="subtitle1"
              className="!font-semibold !mb-3 !text-gray-900"
            >
              Summary
            </Typography>
            <Box className="!grid !grid-cols-3 !gap-4">
              <Box>
                <Typography variant="body2" className="!text-gray-600 !mb-1">
                  Total Earnings
                </Typography>
                <Typography variant="h6" className="!text-green-600">
                  ₹{earningsTotal.toLocaleString()}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" className="!text-gray-600 !mb-1">
                  Total Deductions
                </Typography>
                <Typography variant="h6" className="!text-red-600">
                  ₹{deductionsTotal.toLocaleString()}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" className="!text-gray-600 !mb-1">
                  Net Salary
                </Typography>
                <Typography variant="h6" className="!text-blue-600">
                  ₹{netSalary.toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box className="!flex !justify-end gap-1 !mt-6">
            <Button
              type="button"
              variant="outlined"
              onClick={handleCancel}
              className="!mr-3"
              disabled={
                createSalaryStructureMutation.isPending ||
                updateSalaryStructureMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createSalaryStructureMutation.isPending ||
                updateSalaryStructureMutation.isPending
              }
            >
              {createSalaryStructureMutation.isPending ||
              updateSalaryStructureMutation.isPending
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

export default ManageSalaryStructure;
