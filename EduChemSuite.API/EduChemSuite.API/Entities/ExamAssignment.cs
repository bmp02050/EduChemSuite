using System.ComponentModel.DataAnnotations.Schema;

namespace EduChemSuite.API.Entities;

public class ExamAssignment : BaseEntity
{
    [ForeignKey("ExamId")] public required Guid ExamId { get; set; }
    public virtual Exam? Exam { get; set; }

    [ForeignKey("UserId")] public required Guid UserId { get; set; }
    public virtual User? User { get; set; }

    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
}
