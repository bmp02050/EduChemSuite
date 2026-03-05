export interface DashboardResponse {
  role: string;
  admin?: AdminDashboard;
  adminStaff?: AdminStaffDashboard;
  staff?: StaffDashboard;
  student?: StudentDashboard;
}

export interface AdminDashboard {
  totalDistricts: number;
  totalSchools: number;
  totalUsers: number;
  totalExams: number;
  totalQuestions: number;
  recentExams: RecentExamSummary[];
}

export interface AdminStaffDashboard {
  districts: DistrictSummary[];
  totalSchools: number;
  totalUsers: number;
  recentExams: RecentExamSummary[];
}

export interface StaffDashboard {
  schools: SchoolSummary[];
  totalStudents: number;
  myExams: number;
  myQuestions: number;
  recentExams: RecentExamSummary[];
  pendingReview: PendingGradeSummary[];
}

export interface StudentDashboard {
  assignedExams: AssignedExamSummary[];
  recentGrades: GradeSummary[];
  overallAverage: number;
}

export interface DistrictSummary {
  id: string;
  name: string;
  schoolCount: number;
  userCount: number;
}

export interface SchoolSummary {
  id: string;
  name: string;
  studentCount: number;
  staffCount: number;
}

export interface RecentExamSummary {
  id: string;
  name: string;
  createdAt: string;
  questionCount: number;
  gradeCount: number;
}

export interface PendingGradeSummary {
  examId: string;
  examName: string;
  pendingCount: number;
}

export interface AssignedExamSummary {
  examId: string;
  examName: string;
  isCompleted: boolean;
  grade?: number;
}

export interface GradeSummary {
  examId: string;
  examName: string;
  gradeValue: number;
  createdAt: string;
}
