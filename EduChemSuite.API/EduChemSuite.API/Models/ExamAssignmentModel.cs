namespace EduChemSuite.API.Models;

public class ExamAssignmentModel : BaseModel
{
    public required Guid ExamId { get; set; }
    public ExamModel? Exam { get; set; }

    public required Guid UserId { get; set; }
    public UserModel? User { get; set; }

    public DateTime? AssignedAt { get; set; }
}
