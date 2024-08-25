using System.ComponentModel.DataAnnotations.Schema;

namespace EduChemSuite.API.Entities;

public class Grade : BaseEntity
{
    [ForeignKey("UserId")] public required Guid UserId { get; set; }
    public virtual User? User { get; set; }

    [ForeignKey("ExamId")] public required Guid ExamId { get; set; }
    public virtual Exam? Exam { get; set; }

    public decimal GradeValue { get; set; }
}