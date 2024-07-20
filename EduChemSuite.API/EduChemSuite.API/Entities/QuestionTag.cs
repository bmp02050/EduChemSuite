using System.ComponentModel.DataAnnotations.Schema;

namespace EduChemSuite.API.Entities;

public class QuestionTag : BaseEntity
{
    [ForeignKey("QuestionId")] public required Guid QuestionId { get; set; }
    public Question? Question { get; set; }
    [ForeignKey("TagId")] public required Guid TagId { get; set; }
    public Tag? Tag { get; set; }
}