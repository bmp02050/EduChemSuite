namespace EduChemSuite.API.Models;

public class ExamQuestionModel : BaseModel
{
    public required Guid ExamId { get; set; }
    public required ExamModel Exam { get; set; }
    public required Guid QuestionId { get; set; }
    public required QuestionModel Question { get; set; }
}