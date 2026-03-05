namespace EduChemSuite.API.Models;

public class ExamResponseModel : BaseModel
{
    public required Guid ExamId { get; set; }
    public ExamModel? Exam { get; set; }
    public required Guid UserId { get; set; }
    public UserModel? User { get; set; }
    public required Guid QuestionId { get; set; }
    public QuestionModel? Question { get; set; }
    public Guid? ExamQuestionId { get; set; }
    public Guid? AnswerId { get; set; }
    public AnswerModel? Answer { get; set; }
    public String? ResponseText { get; set; }
    public String? ResponseImage { get; set; }
    public Guid? ImageTypeId { get; set; }
    public ImageTypeModel? ImageType { get; set; }
    public bool? IsCorrect { get; set; }
    public bool IsGraded { get; set; }
}
