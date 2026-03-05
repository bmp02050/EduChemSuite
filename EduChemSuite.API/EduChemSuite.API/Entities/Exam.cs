namespace EduChemSuite.API.Entities;

public class Exam : BaseEntity
{
    public required string Name { get; set; }
    public string? Description { get; set; }
    public int? TimeLimitMinutes { get; set; }
    public bool AllowRetakes { get; set; }
    public int MaxAttempts { get; set; } = 1;
    public bool IsTest { get; set; }
    public bool StrictDiagramGrading { get; set; }
    public virtual required ICollection<ExamQuestion> ExamQuestions { get; set; }
    public virtual required ICollection<Grade> Grades { get; set; }
    public virtual ICollection<ExamAssignment>? ExamAssignments { get; set; }
}