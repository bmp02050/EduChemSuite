namespace EduChemSuite.API.Models;

public class ExamResultModel
{
    public required GradeModel Grade { get; set; }
    public required ExamModel Exam { get; set; }
    public required ICollection<ExamResponseModel> Responses { get; set; }
    public int TotalQuestions { get; set; }
    public int CorrectAnswers { get; set; }
    public int PendingReview { get; set; }
}
