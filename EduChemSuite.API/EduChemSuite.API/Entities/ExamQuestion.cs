using System.ComponentModel.DataAnnotations.Schema;

namespace EduChemSuite.API.Entities;

public class ExamQuestion : BaseEntity
{
    [ForeignKey("ExamId")] public required Guid ExamId { get; set; }
    public virtual required Exam Exam { get; set; }

    [ForeignKey("QuestionId")] public required Guid QuestionId { get; set; }
    public virtual required Question Question { get; set; }

    public double? AngleTolerancePercent { get; set; }
}