import { ImportExportService } from './base/import-export.service';

export class ImportExportFactory {
  static getService(modelName: string): ImportExportService<any> | null {
    const services: Record<string, any> = {};
    
    const service = services[modelName];
    if (!service) {
      console.warn(`No import-export service found for model: ${modelName}`);
      return null;
    }
    return new service();
  }

  static getSupportedModels(): string[] {
    return [];
  }
}
