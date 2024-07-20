using System.ComponentModel.DataAnnotations.Schema;

namespace EduChemSuite.API.Entities;

public class Grade : BaseEntity
{
    [ForeignKey("UserId")] public required Guid UserId { get; set; }
    public User? User { get; set; }

    [ForeignKey("ExamId")] public required Guid ExamId { get; set; }
    public Exam? Exam { get; set; }

    public decimal GradeValue { get; set; }
}
