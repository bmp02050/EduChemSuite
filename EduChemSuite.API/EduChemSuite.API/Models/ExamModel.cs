namespace EduChemSuite.API.Models;

public class ExamModel : BaseModel
{
    public required string Name { get; set; }
    public string? Description { get; set; }
    public int? TimeLimitMinutes { get; set; }
    public bool AllowRetakes { get; set; }
    public int MaxAttempts { get; set; } = 1;
    public bool IsTest { get; set; }
    public bool StrictDiagramGrading { get; set; }
    public ICollection<ExamQuestionModel>? ExamQuestions { get; set; }
    public ICollection<GradeModel>? Grades { get; set; }
}