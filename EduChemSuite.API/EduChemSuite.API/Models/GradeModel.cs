namespace EduChemSuite.API.Models;

public class GradeModel : BaseModel
{
    public required Guid UserId { get; set; }
    public UserModel? User { get; set; }

    public required Guid ExamId { get; set; }
    public ExamModel? Exam { get; set; }

    public decimal GradeValue { get; set; }
}