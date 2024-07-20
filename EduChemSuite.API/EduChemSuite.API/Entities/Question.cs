using System.ComponentModel.DataAnnotations.Schema;

namespace EduChemSuite.API.Entities;

public class Question : BaseEntity
{
    [ForeignKey("UserId")] public required Guid UserId { get; set; }
    public User? User { get; set; }
    public required String QuestionText { get; set; }
    [ForeignKey("QuestionTypeId")] public required Guid QuestionTypeId { get; set; }
    public required QuestionType QuestionType { get; set; }
    public ICollection<QuestionTag>? QuestionTags { get; set; }
}