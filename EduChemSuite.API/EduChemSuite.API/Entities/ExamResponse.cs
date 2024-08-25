using System.ComponentModel.DataAnnotations.Schema;

namespace EduChemSuite.API.Entities;

public class ExamResponse : BaseEntity
{
    [ForeignKey("UserId")] public required Guid UserId { get; set; }
    public virtual User? User { get; set; }
    [ForeignKey("QuestionId")] public required Guid QuestionId { get; set; }
    public virtual Question? Question { get; set; }
    [ForeignKey("AnswerId")] public Guid AnswerId { get; set; }
    public virtual Answer? Answer { get; set; }
    public String? ResponseText { get; set; }
    public String? ResponseImage { get; set; }
    [ForeignKey("ImageTypeId")] public required Guid ImageTypeId { get; set; }
    public virtual ImageType? ImageType { get; set; }
}