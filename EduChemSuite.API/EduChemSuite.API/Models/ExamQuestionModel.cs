namespace EduChemSuite.API.Models;

public class ExamQuestionModel : BaseModel
{
    public required Guid ExamId { get; set; }
    public ExamModel? Exam { get; set; }
    public required Guid QuestionId { get; set; }
    public QuestionModel? Question { get; set; }
    public double? AngleTolerancePercent { get; set; }
}