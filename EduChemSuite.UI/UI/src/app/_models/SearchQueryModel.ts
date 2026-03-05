export interface SearchQueryModel {
  searchText?: string;
  districtId?: string;
  schoolId?: string;
  teacherId?: string;
  studentId?: string;
  examId?: string;
  accountType?: string;
  dateFrom?: string;
  dateTo?: string;
  gradeMin?: number;
  gradeMax?: number;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDescending?: boolean;
  includeInactive?: boolean;
}
