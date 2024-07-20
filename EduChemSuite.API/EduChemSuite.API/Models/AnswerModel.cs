namespace EduChemSuite.API.Models;

public class AnswerModel : BaseModel
{
    public required Guid QuestionId { get; set; }
    public QuestionModel Question { get; set; }
    public required String AnswerText { get; set; }
    public required Boolean IsCorrect { get; set; }
}