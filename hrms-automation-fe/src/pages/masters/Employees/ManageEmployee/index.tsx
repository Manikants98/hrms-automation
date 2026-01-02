import { Box, MenuItem, Typography } from '@mui/material';
import { useFormik } from 'formik';
import {
  useCreateEmployee,
  useUpdateEmployee,
  type Employee,
} from 'hooks/useEmployees';
import React from 'react';
import { employeeValidationSchema } from 'schemas/employee.schema';
import ActiveInactiveField from 'shared/ActiveInactiveField';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';

interface ManageEmployeeProps {
  selectedEmployee?: Employee | null;
  setSelectedEmployee: (employee: Employee | null) => void;
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

const mockShifts = [
  { id: 1, name: 'Day Shift', start_time: '09:00', end_time: '18:00' },
  { id: 2, name: 'Evening Shift', start_time: '14:00', end_time: '23:00' },
  { id: 3, name: 'Night Shift', start_time: '22:00', end_time: '06:00' },
  { id: 4, name: 'Flexible', start_time: 'Flexible', end_time: 'Flexible' },
];

const ManageEmployee: React.FC<ManageEmployeeProps> = ({
  selectedEmployee,
  setSelectedEmployee,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedEmployee;

  const createEmployeeMutation = useCreateEmployee();
  const updateEmployeeMutation = useUpdateEmployee();

  const handleCancel = () => {
    setSelectedEmployee(null);
    setDrawerOpen(false);
  };

  const formik = useFormik({
    initialValues: {
      name: selectedEmployee?.name || '',
      email: selectedEmployee?.email || '',
      phone_number: selectedEmployee?.phone_number || '',
      employee_id: selectedEmployee?.employee_id || '',
      role_id: selectedEmployee?.role_id || '',
      department_id: selectedEmployee?.department_id || '',
      designation_id: selectedEmployee?.designation_id || '',
      shift_id: selectedEmployee?.shift_id || '',
      date_of_joining: selectedEmployee?.date_of_joining || '',
      address: selectedEmployee?.address || '',
      profile_image: selectedEmployee?.profile_image || '',
      salary: selectedEmployee?.salary || '',
      status: selectedEmployee?.status || 'Active',
      is_active: selectedEmployee?.is_active || 'Y',
    },
    validationSchema: employeeValidationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      try {
        const employeeData = {
          name: values.name,
          email: values.email,
          phone_number: values.phone_number || undefined,
          employee_id: values.employee_id || undefined,
          role_id: Number(values.role_id),
          department_id: values.department_id
            ? Number(values.department_id)
            : undefined,
          designation_id: values.designation_id
            ? Number(values.designation_id)
            : undefined,
          shift_id: values.shift_id ? Number(values.shift_id) : undefined,
          date_of_joining: values.date_of_joining || undefined,
          address: values.address || undefined,
          profile_image: values.profile_image || undefined,
          salary: values.salary ? Number(values.salary) : undefined,
          status: values.status as Employee['status'],
          is_active: values.is_active as 'Y' | 'N',
        };

        if (isEdit && selectedEmployee) {
          await updateEmployeeMutation.mutateAsync({
            id: selectedEmployee.id,
            ...employeeData,
          });
        } else {
          await createEmployeeMutation.mutateAsync(employeeData);
        }

        handleCancel();
      } catch (error) {
        console.error('Error saving employee:', error);
      }
    },
  });

  return (
    <CustomDrawer
      open={drawerOpen}
      setOpen={handleCancel}
      title={isEdit ? 'Edit Employee' : 'Add Employee'}
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
                  placeholder="Enter employee name"
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

                <Input
                  name="employee_id"
                  label="Employee ID"
                  placeholder="Enter employee ID"
                  formik={formik}
                />
              </Box>
            </Box>

            <Box>
              <Typography
                variant="h6"
                className="!font-semibold !text-gray-900 !mb-4"
              >
                Employment Details
              </Typography>
              <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-x-5 !gap-y-4">
                <Select
                  name="department_id"
                  label="Department"
                  formik={formik}
                  required
                >
                  <MenuItem value="">-- Select --</MenuItem>
                  {mockDepartments.map(dept => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>

                <Select
                  name="designation_id"
                  label="Designation"
                  formik={formik}
                  required
                >
                  <MenuItem value="">-- Select --</MenuItem>
                  {mockDesignations.map(des => (
                    <MenuItem key={des.id} value={des.id}>
                      {des.name}
                    </MenuItem>
                  ))}
                </Select>

                <Select name="shift_id" label="Shift" formik={formik} required>
                  <MenuItem value="">-- Select --</MenuItem>
                  {mockShifts.map(shift => (
                    <MenuItem key={shift.id} value={shift.id}>
                      {shift.name} ({shift.start_time} - {shift.end_time})
                    </MenuItem>
                  ))}
                </Select>

                <Select name="role_id" label="Role" formik={formik} required>
                  <MenuItem value="">-- Select --</MenuItem>
                </Select>

                <Input
                  name="date_of_joining"
                  label="Joining Date"
                  type="date"
                  formik={formik}
                  required
                />

                <Input
                  name="salary"
                  label="Salary"
                  type="number"
                  placeholder="Enter salary"
                  formik={formik}
                />

                <Select name="status" label="Status" formik={formik} required>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                  <MenuItem value="On Leave">On Leave</MenuItem>
                  <MenuItem value="Terminated">Terminated</MenuItem>
                </Select>
              </Box>
            </Box>

            <Box>
              <Typography
                variant="h6"
                className="!font-semibold !text-gray-900 !mb-4"
              >
                Additional Information
              </Typography>
              <Box className="!grid !grid-cols-1 md:!grid-cols-2 !gap-x-5 !gap-y-4">
                <Box className="md:!col-span-2">
                  <Input
                    name="address"
                    label="Address"
                    placeholder="Enter address"
                    formik={formik}
                    multiline
                    rows={3}
                  />
                </Box>

                <Input
                  name="profile_image"
                  label="Profile Image URL"
                  placeholder="Enter profile image URL or file path"
                  formik={formik}
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
                createEmployeeMutation.isPending ||
                updateEmployeeMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createEmployeeMutation.isPending ||
                updateEmployeeMutation.isPending
              }
            >
              {createEmployeeMutation.isPending ||
              updateEmployeeMutation.isPending
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

export default ManageEmployee;
