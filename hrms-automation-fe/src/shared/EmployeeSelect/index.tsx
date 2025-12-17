import {
  Autocomplete,
  CircularProgress,
  TextField,
  Box,
  Avatar,
} from '@mui/material';
import type { FormikProps } from 'formik';
import { useEmployees, useEmployee, type Employee } from 'hooks/useEmployees';
import React, { useCallback, useEffect, useState } from 'react';

interface EmployeeSelectProps {
  name?: string;
  label?: string;
  required?: boolean;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
  formik?: FormikProps<any>;
  setValue?: (value: any) => void;
  value?: string | number;
  onChange?: (event: any, value: Employee | null) => void;
  nameToSearch?: string;
  className?: string;
}

const EmployeeSelect: React.FC<EmployeeSelectProps> = ({
  name = 'employee_id',
  label = 'Employee',
  required = false,
  fullWidth = true,
  size = 'small',
  formik,
  setValue,
  value,
  nameToSearch = '',
  onChange,
  className,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedEmployeeData, setSelectedEmployeeData] =
    useState<Employee | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  const currentValue = formik ? formik.values[name] : value;

  const normalizedValue =
    currentValue && currentValue !== 0
      ? typeof currentValue === 'number'
        ? currentValue.toString()
        : String(currentValue).trim()
      : '';

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isSelecting) {
        setDebouncedSearch(inputValue);
        if (inputValue) {
          setHasInitialized(true);
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue, isSelecting]);

  const effectiveSearch = React.useMemo(() => {
    if (hasInitialized || inputValue) {
      return debouncedSearch;
    }
    if (normalizedValue && nameToSearch && !hasInitialized) {
      return nameToSearch;
    }
    return debouncedSearch;
  }, [
    debouncedSearch,
    nameToSearch,
    hasInitialized,
    normalizedValue,
    inputValue,
  ]);

  const employeeId =
    normalizedValue && normalizedValue !== '0'
      ? Number(normalizedValue)
      : undefined;

  const shouldFetchById = !!employeeId && !effectiveSearch && !hasInitialized;

  const { data: employeeResponse } = useEmployee(employeeId!, {
    enabled: shouldFetchById && !!employeeId,
  });

  const { data: employeesResponse, isLoading } = useEmployees(
    {
      search: effectiveSearch || undefined,
      isActive: 'Y',
      limit: 50,
    },
    {
      enabled: !!effectiveSearch || hasInitialized,
    }
  );

  const searchResults: Employee[] = React.useMemo(() => {
    const results = employeesResponse?.data || [];
    if (employeeResponse?.data && shouldFetchById) {
      const employee = employeeResponse.data;
      const exists = results.some(e => e.id === employee.id);
      if (!exists) {
        return [employee];
      }
    }
    return results;
  }, [employeesResponse?.data, employeeResponse?.data, shouldFetchById]);

  useEffect(() => {
    if (
      normalizedValue &&
      !selectedEmployeeData &&
      !isLoading &&
      searchResults.length > 0
    ) {
      const found = searchResults.find(
        employee => employee.id.toString() === normalizedValue
      );
      if (found) {
        setSelectedEmployeeData(found);
        if (!inputValue) {
          setInputValue(found.name);
        }
        setHasInitialized(true);
      }
    }
  }, [
    normalizedValue,
    selectedEmployeeData,
    inputValue,
    searchResults,
    isLoading,
  ]);

  const selectedEmployee = React.useMemo(() => {
    if (!normalizedValue) {
      return null;
    }

    const foundInResults = searchResults.find(
      employee => employee.id.toString() === normalizedValue
    );

    if (foundInResults) {
      return foundInResults;
    }

    if (
      selectedEmployeeData &&
      selectedEmployeeData.id.toString() === normalizedValue
    ) {
      return selectedEmployeeData;
    }

    return null;
  }, [normalizedValue, searchResults, selectedEmployeeData]);

  useEffect(() => {
    if (selectedEmployee && selectedEmployee !== selectedEmployeeData) {
      setSelectedEmployeeData(selectedEmployee);
      if (!inputValue && selectedEmployee.name) {
        setInputValue(selectedEmployee.name);
      }
    } else if (!normalizedValue && selectedEmployeeData) {
      setSelectedEmployeeData(null);
      setInputValue('');
    } else if (selectedEmployeeData && !inputValue && normalizedValue) {
      setInputValue(selectedEmployeeData.name);
    }
  }, [selectedEmployee, normalizedValue, selectedEmployeeData, inputValue]);

  useEffect(() => {
    if (!normalizedValue) {
      if (selectedEmployeeData || inputValue) {
        setInputValue('');
        setSelectedEmployeeData(null);
        setHasInitialized(false);
      }
    } else if (
      selectedEmployeeData &&
      selectedEmployeeData.id.toString() !== normalizedValue
    ) {
      setSelectedEmployeeData(null);
      setInputValue('');
      setHasInitialized(false);
    }
  }, [normalizedValue]);

  const employees: Employee[] = React.useMemo(() => {
    const allEmployees: Employee[] = [];

    if (selectedEmployee && selectedEmployee.id) {
      const isSelectedInResults = searchResults.some(
        employee => employee?.id === selectedEmployee.id
      );

      if (!isSelectedInResults) {
        allEmployees.push(selectedEmployee);
      }
    }

    const seenIds = new Set<number>();
    if (selectedEmployee?.id) {
      seenIds.add(selectedEmployee.id);
    }

    searchResults
      .filter(employee => employee && employee.id)
      .forEach(employee => {
        if (!seenIds.has(employee.id)) {
          allEmployees.push(employee);
          seenIds.add(employee.id);
        }
      });

    return allEmployees;
  }, [searchResults, selectedEmployee]);

  const error = formik?.touched?.[name] && formik?.errors?.[name];
  const helperText = typeof error === 'string' ? error : undefined;

  const handleChange = useCallback(
    (event: any, newValue: Employee | null) => {
      try {
        setIsSelecting(true);
        setSelectedEmployeeData(newValue);

        const selectedValue = newValue ? newValue.id : '';

        if (formik) {
          formik.setFieldValue(name, selectedValue);
        } else if (setValue) {
          setValue(selectedValue);
        }

        if (onChange) {
          onChange(event, newValue);
        }

        if (!newValue) {
          setInputValue('');
          setDebouncedSearch('');
        }

        setTimeout(() => setIsSelecting(false), 100);
      } catch (error) {
        console.error('Error in handleChange:', error);
        setIsSelecting(false);
      }
    },
    [formik, name, setValue, onChange]
  );

  const handleInputChange = useCallback(
    (_event: any, newInputValue: string, reason: string) => {
      if (reason === 'reset' || reason === 'clear') {
        setIsSelecting(true);
        setInputValue('');
        setDebouncedSearch('');
        setTimeout(() => setIsSelecting(false), 100);
        return;
      }

      setInputValue(newInputValue);
    },
    []
  );

  return (
    <Autocomplete
      options={employees}
      getOptionLabel={(option: Employee) => option?.name || ''}
      value={selectedEmployee}
      loading={isLoading}
      onChange={handleChange}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      isOptionEqualToValue={(
        option: Employee | null,
        value: Employee | null
      ) => {
        if (!option || !value) return false;
        return option.id === value.id;
      }}
      size={size}
      fullWidth={fullWidth}
      className={className}
      slotProps={{
        listbox: {
          className: '!py-0.5',
        },
      }}
      filterOptions={options => options}
      renderOption={(props, option: Employee) => (
        <Box
          component="li"
          {...props}
          key={option.id}
          className="!flex !items-center !gap-2 cursor-pointer py-1 px-2 hover:!bg-gray-50"
        >
          <Avatar
            src={option.profile_image || 'mkx'}
            alt={option.name}
            className="!rounded !bg-primary-100 !text-primary-600"
          />
          <Box>
            <p className="!text-gray-900 !text-sm">{option.name || ''}</p>
            {option.email && (
              <p className="!text-gray-500 !text-xs">{option.email}</p>
            )}
          </Box>
        </Box>
      )}
      renderInput={(params: any) => (
        <TextField
          {...params}
          label={label}
          required={required}
          error={!!error}
          helperText={helperText}
          onBlur={formik?.handleBlur}
          name={name}
          size={size}
          className={className}
        />
      )}
      noOptionsText={
        debouncedSearch && !isLoading
          ? 'No employees found'
          : 'Type to search employees'
      }
      loadingText={
        <span className="flex items-center gap-2">
          <CircularProgress thickness={6} size={16} color="inherit" /> Loading
          employees...
        </span>
      }
    />
  );
};

export default EmployeeSelect;
