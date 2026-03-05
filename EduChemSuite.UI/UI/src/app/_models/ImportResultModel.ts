export interface ImportResultModel {
  totalRows: number;
  successCount: number;
  errorCount: number;
  createdCount: number;
  updatedCount: number;
  errors: ImportRowError[];
}

export interface ImportRowError {
  rowNumber: number;
  rawData: string;
  errorMessage: string;
}
