namespace EduChemSuite.API.Models;

public class DashboardResponse
{
    public string Role { get; set; } = string.Empty;
    public AdminDashboard? Admin { get; set; }
    public AdminStaffDashboard? AdminStaff { get; set; }
    public StaffDashboard? Staff { get; set; }
    public StudentDashboard? Student { get; set; }
}

public class AdminDashboard
{
    public int TotalDistricts { get; set; }
    public int TotalSchools { get; set; }
    public int TotalUsers { get; set; }
    public int TotalExams { get; set; }
    public int TotalQuestions { get; set; }
    public List<RecentExamSummary> RecentExams { get; set; } = new();
}

public class AdminStaffDashboard
{
    public List<DistrictSummary> Districts { get; set; } = new();
    public int TotalSchools { get; set; }
    public int TotalUsers { get; set; }
    public List<RecentExamSummary> RecentExams { get; set; } = new();
}

public class StaffDashboard
{
    public List<SchoolSummary> Schools { get; set; } = new();
    public int TotalStudents { get; set; }
    public int MyExams { get; set; }
    public int MyQuestions { get; set; }
    public List<RecentExamSummary> RecentExams { get; set; } = new();
    public List<PendingGradeSummary> PendingReview { get; set; } = new();
}

public class StudentDashboard
{
    public List<AssignedExamSummary> AssignedExams { get; set; } = new();
    public List<GradeSummary> RecentGrades { get; set; } = new();
    public decimal OverallAverage { get; set; }
}

public class DistrictSummary
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int SchoolCount { get; set; }
    public int UserCount { get; set; }
}

public class SchoolSummary
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int StudentCount { get; set; }
    public int StaffCount { get; set; }
}

public class RecentExamSummary
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public int QuestionCount { get; set; }
    public int GradeCount { get; set; }
}

public class PendingGradeSummary
{
    public Guid ExamId { get; set; }
    public string ExamName { get; set; } = string.Empty;
    public int PendingCount { get; set; }
}

public class AssignedExamSummary
{
    public Guid ExamId { get; set; }
    public string ExamName { get; set; } = string.Empty;
    public bool IsCompleted { get; set; }
    public decimal? Grade { get; set; }
}

public class GradeSummary
{
    public Guid ExamId { get; set; }
    public string ExamName { get; set; } = string.Empty;
    public decimal GradeValue { get; set; }
    public DateTime CreatedAt { get; set; }
}
