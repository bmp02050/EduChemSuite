using EduChemSuite.API.Entities;
using EduChemSuite.API.Models;

namespace EduChemSuite.API.Services;

public interface IDashboardService
{
    Task<DashboardResponse> GetDashboard(Guid userId, AccountType role);
}

public class DashboardService(
    IDistrictService districtService,
    ISchoolService schoolService,
    IUserService userService,
    IExamService examService,
    IQuestionService questionService,
    IGradeService gradeService,
    IExamAssignmentService examAssignmentService,
    IExamResponseService examResponseService,
    ILogger<DashboardService> logger) : IDashboardService
{
    public async Task<DashboardResponse> GetDashboard(Guid userId, AccountType role)
    {
        var response = new DashboardResponse { Role = role.ToString() };

        switch (role)
        {
            case AccountType.Admin:
                response.Admin = await BuildAdminDashboard();
                break;
            case AccountType.AdminStaff:
                response.AdminStaff = await BuildAdminStaffDashboard(userId);
                break;
            case AccountType.Staff:
                response.Staff = await BuildStaffDashboard(userId);
                break;
            case AccountType.Student:
                response.Student = await BuildStudentDashboard(userId);
                break;
        }

        return response;
    }

    private async Task<AdminDashboard> BuildAdminDashboard()
    {
        var districts = await districtService.List(null);
        var schools = await schoolService.List();
        var users = await userService.ListAll();
        var exams = await examService.ListAll(false);
        var questions = await questionService.ListAll(false);

        var districtList = districts.ToList();
        var schoolList = schools.ToList();
        var userList = users.ToList();
        var examList = exams.ToList();
        var questionList = questions.ToList();

        return new AdminDashboard
        {
            TotalDistricts = districtList.Count,
            TotalSchools = schoolList.Count,
            TotalUsers = userList.Count,
            TotalExams = examList.Count,
            TotalQuestions = questionList.Count,
            RecentExams = examList
                .OrderByDescending(e => e.CreatedAt)
                .Take(5)
                .Select(e => new RecentExamSummary
                {
                    Id = e.Id,
                    Name = e.Name,
                    CreatedAt = e.CreatedAt ?? DateTime.UtcNow,
                    QuestionCount = e.ExamQuestions?
                        .Where(eq => eq.IsActive == true)
                        .Select(eq => eq.QuestionId)
                        .Distinct()
                        .Count() ?? 0,
                    GradeCount = e.Grades?.Count ?? 0
                })
                .ToList()
        };
    }

    private async Task<AdminStaffDashboard> BuildAdminStaffDashboard(Guid userId)
    {
        var districts = (await districtService.List(userId)).ToList();
        var totalSchools = 0;
        var totalUsers = 0;
        var districtSummaries = new List<DistrictSummary>();

        foreach (var district in districts)
        {
            var schoolCount = district.Schools?.Count ?? 0;
            var userCount = district.Administrators?.Count ?? 0;
            totalSchools += schoolCount;
            totalUsers += userCount;

            districtSummaries.Add(new DistrictSummary
            {
                Id = district.Id,
                Name = district.DistrictName,
                SchoolCount = schoolCount,
                UserCount = userCount
            });
        }

        var exams = (await examService.ListAll(false)).ToList();
        var recentExams = exams
            .OrderByDescending(e => e.CreatedAt)
            .Take(5)
            .Select(e => new RecentExamSummary
            {
                Id = e.Id,
                Name = e.Name,
                CreatedAt = e.CreatedAt ?? DateTime.UtcNow,
                QuestionCount = e.ExamQuestions?
                    .Where(eq => eq.IsActive == true)
                    .Select(eq => eq.QuestionId)
                    .Distinct()
                    .Count() ?? 0,
                GradeCount = e.Grades?.Count ?? 0
            })
            .ToList();

        return new AdminStaffDashboard
        {
            Districts = districtSummaries,
            TotalSchools = totalSchools,
            TotalUsers = totalUsers,
            RecentExams = recentExams
        };
    }

    private async Task<StaffDashboard> BuildStaffDashboard(Guid userId)
    {
        var user = await userService.GetById(userId);
        var schools = new List<SchoolSummary>();
        var totalStudents = 0;

        if (user?.UserSchools != null)
        {
            foreach (var userSchool in user.UserSchools)
            {
                if (userSchool.SchoolId == Guid.Empty) continue;

                var school = await schoolService.GetById(userSchool.SchoolId);
                if (school == null) continue;

                var studentCount = school.Students?.Count ?? 0;
                var staffCount = school.Staff?.Count ?? 0;
                totalStudents += studentCount;

                schools.Add(new SchoolSummary
                {
                    Id = school.Id,
                    Name = school.Name,
                    StudentCount = studentCount,
                    StaffCount = staffCount
                });
            }
        }

        var myExams = (await examService.Find(userId)).ToList();
        var myQuestions = (await questionService.ListByUser(userId)).ToList();

        // Build pending review: exams created by this user that have ungraded responses
        var pendingReview = new List<PendingGradeSummary>();
        foreach (var exam in myExams)
        {
            if (exam == null) continue;
            var responses = (await examResponseService.ListByExam(exam.Id)).ToList();
            var ungradedCount = responses.Count(r => r.IsCorrect == null);
            if (ungradedCount > 0)
            {
                pendingReview.Add(new PendingGradeSummary
                {
                    ExamId = exam.Id,
                    ExamName = exam.Name,
                    PendingCount = ungradedCount
                });
            }
        }

        return new StaffDashboard
        {
            Schools = schools,
            TotalStudents = totalStudents,
            MyExams = myExams.Count,
            MyQuestions = myQuestions.Count,
            RecentExams = myExams
                .Where(e => e != null)
                .OrderByDescending(e => e!.CreatedAt)
                .Take(5)
                .Select(e => new RecentExamSummary
                {
                    Id = e!.Id,
                    Name = e.Name,
                    CreatedAt = e.CreatedAt ?? DateTime.UtcNow,
                    QuestionCount = e.ExamQuestions?
                        .Where(eq => eq.IsActive == true)
                        .Select(eq => eq.QuestionId)
                        .Distinct()
                        .Count() ?? 0,
                    GradeCount = e.Grades?.Count ?? 0
                })
                .ToList(),
            PendingReview = pendingReview
        };
    }

    private async Task<StudentDashboard> BuildStudentDashboard(Guid userId)
    {
        var assignments = (await examAssignmentService.ListByUser(userId)).ToList();
        var grades = (await gradeService.ListByUser(userId)).ToList();

        var assignedExams = assignments.Select(a => new AssignedExamSummary
        {
            ExamId = a.ExamId,
            ExamName = a.Exam?.Name ?? "Unknown",
            IsCompleted = grades.Any(g => g.ExamId == a.ExamId),
            Grade = grades.FirstOrDefault(g => g.ExamId == a.ExamId)?.GradeValue
        }).ToList();

        var recentGrades = grades
            .OrderByDescending(g => g.CreatedAt)
            .Take(10)
            .Select(g => new GradeSummary
            {
                ExamId = g.ExamId,
                ExamName = g.Exam?.Name ?? "Unknown",
                GradeValue = g.GradeValue,
                CreatedAt = g.CreatedAt ?? DateTime.UtcNow
            })
            .ToList();

        var overallAverage = grades.Count > 0
            ? Math.Round(grades.Average(g => g.GradeValue), 2)
            : 0;

        return new StudentDashboard
        {
            AssignedExams = assignedExams,
            RecentGrades = recentGrades,
            OverallAverage = overallAverage
        };
    }

}
