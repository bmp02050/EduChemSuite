using System.ComponentModel.DataAnnotations.Schema;

namespace EduChemSuite.API.Entities;

public class Answer : BaseEntity
{
    [ForeignKey("QuestionId")] public required Guid QuestionId { get; set; }
    public virtual Question? Question { get; set; }
    public required String AnswerText { get; set; }
    public required Boolean IsCorrect { get; set; }
    public virtual ICollection<ExamResponse>? ExamResponses { get; set; }
}