import { Box, MenuItem, Typography } from '@mui/material';
import { useFormik } from 'formik';
import {
  useCreateEmployee,
  useUpdateEmployee,
  type Employee,
} from 'hooks/useEmployees';
import { useDepartmentsDropdown } from 'hooks/useDepartments';
import { useDesignationsDropdown } from 'hooks/useDesignations';
import { useShiftsDropdown } from 'hooks/useShifts';
import { useRolesDropdown } from 'hooks/useRoles';
import React from 'react';
import { employeeValidationSchema } from 'schemas/employee.schema';
import ActiveInactiveField from 'shared/ActiveInactiveField';
import Button from 'shared/Button';
import CustomDrawer from 'shared/Drawer';
import Input from 'shared/Input';
import Select from 'shared/Select';

// Function to generate random password
const generateRandomPassword = (length = 8): string => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

interface ManageEmployeeProps {
  selectedEmployee?: Employee | null;
  setSelectedEmployee: (employee: Employee | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
}

const ManageEmployee: React.FC<ManageEmployeeProps> = ({
  selectedEmployee,
  setSelectedEmployee,
  drawerOpen,
  setDrawerOpen,
}) => {
  const isEdit = !!selectedEmployee;

  const { data: departmentsResponse } = useDepartmentsDropdown();
  const departments = Array.isArray(departmentsResponse?.data)
    ? departmentsResponse.data
    : [];

  const { data: designationsResponse } = useDesignationsDropdown();
  const designations = Array.isArray(designationsResponse?.data)
    ? designationsResponse.data
    : [];

  const { data: shiftsResponse } = useShiftsDropdown();
  const shifts = Array.isArray(shiftsResponse?.data) ? shiftsResponse.data : [];

  const { data: rolesResponse } = useRolesDropdown();
  const roles = Array.isArray(rolesResponse?.data) ? rolesResponse.data : [];

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
      role_id: selectedEmployee?.role_id || '',
      department_id: selectedEmployee?.department_id || '',
      designation_id: selectedEmployee?.designation_id || '',
      shift_id: selectedEmployee?.shift_id || '',
      joining_date: selectedEmployee?.joining_date || '',
      address: selectedEmployee?.address || '',
      profile_image: selectedEmployee?.profile_image || '',
      salary: selectedEmployee?.salary || '',
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
          role_id: Number(values.role_id),
          department_id: values.department_id
            ? Number(values.department_id)
            : undefined,
          designation_id: values.designation_id
            ? Number(values.designation_id)
            : undefined,
          shift_id: values.shift_id ? Number(values.shift_id) : undefined,
          joining_date: values.joining_date || undefined,
          address: values.address || undefined,
          profile_image: values.profile_image || undefined,
          salary: values.salary ? Number(values.salary) : undefined,
          is_active: values.is_active as 'Y' | 'N',
        };

        if (isEdit && selectedEmployee) {
          await updateEmployeeMutation.mutateAsync({
            id: selectedEmployee.id,
            ...employeeData,
          });
        } else {
          // Generate random password for new employees
          const randomPassword = generateRandomPassword(12);
          await createEmployeeMutation.mutateAsync({
            ...employeeData,
            password: randomPassword,
          });
          
          console.log(`Employee created with password: ${randomPassword}`);
        }

        handleCancel();
      } catch (error: any) {
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
                  {departments.map(dept => (
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
                  {designations.map(des => (
                    <MenuItem key={des.id} value={des.id}>
                      {des.name}
                    </MenuItem>
                  ))}
                </Select>

                <Select name="shift_id" label="Shift" formik={formik} required>
                  <MenuItem value="">-- Select --</MenuItem>
                  {shifts.map(shift => (
                    <MenuItem key={shift.id} value={shift.id}>
                      {shift.name} ({shift.start_time} - {shift.end_time})
                    </MenuItem>
                  ))}
                </Select>

                <Select name="role_id" label="Role" formik={formik} required>
                  <MenuItem value="">-- Select --</MenuItem>
                  {roles.map(role => (
                    <MenuItem key={role.id} value={role.id}>
                      {role.name}
                    </MenuItem>
                  ))}
                </Select>

                <Input
                  name="joining_date"
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

                <Box className="md:!col-span-2">
                  <ActiveInactiveField
                    name="is_active"
                    label="Status"
                    formik={formik}
                  />
                </Box>
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
