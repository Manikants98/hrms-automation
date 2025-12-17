import axiosInstance from '../../configs/axio.config';

export interface SupportedTable {
  name: string;
  displayName: string;
  count: number;
  columns: number;
}

export interface ImportPreview {
  data: any[];
  errors: Array<{
    row: number;
    column: string;
    message: string;
  }>;
  validCount: number;
  totalCount: number;
  fileInfo?: {
    originalName: string;
    size: number;
    mimetype: string;
  };
  columns?: Array<{
    name: string;
    label: string;
    type: string;
  }>;
}

export interface ImportResult {
  success: number;
  failed: number;
  skipped: number;
  totalProcessed?: number;
  errors?: Array<{
    row: number;
    message: string;
  }>;
  fileInfo?: {
    originalName: string;
    rows: number;
  };
}

export interface ImportOptions {
  batchSize?: number;
  skipDuplicates?: boolean;
  updateExisting?: boolean;
}

export const getSupportedTables = async (): Promise<SupportedTable[]> => {
  const response = await axiosInstance.get('/v1/import-export/tables');
  return response.data.data.details || [];
};

export const downloadTemplate = async (tableName: string): Promise<Blob> => {
  const response = await axiosInstance.get(
    `/v1/import-export/${tableName}/template`,
    {
      responseType: 'blob',
    }
  );
  return response.data;
};

export const previewImport = async (
  tableName: string,
  file: File
): Promise<ImportPreview> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axiosInstance.post(
    `/v1/import-export/${tableName}/import`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      params: {
        preview: true,
      },
    }
  );

  return response.data.data;
};

export const importData = async (
  tableName: string,
  file: File,
  options?: ImportOptions
): Promise<ImportResult> => {
  const formData = new FormData();
  formData.append('file', file);
  if (options) {
    if (options.batchSize) {
      formData.append('batchSize', options.batchSize.toString());
    }
    if (options.skipDuplicates !== undefined) {
      formData.append('skipDuplicates', options.skipDuplicates.toString());
    }
    if (options.updateExisting !== undefined) {
      formData.append('updateExisting', options.updateExisting.toString());
    }
  }

  const response = await axiosInstance.post(
    `/v1/import-export/${tableName}/import`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data.data;
};

export const exportToExcel = async (
  tableName: string,
  filters?: Record<string, any>
): Promise<Blob> => {
  const response = await axiosInstance.get(
    `/v1/import-export/${tableName}/export/excel`,
    {
      params: filters,
      responseType: 'blob',
    }
  );
  return response.data;
};

export const exportToPDF = async (
  tableName: string,
  filters?: Record<string, any>
): Promise<Blob> => {
  const response = await axiosInstance.get(
    `/v1/import-export/${tableName}/export/pdf`,
    {
      params: filters,
      responseType: 'blob',
    }
  );
  return response.data;
};
