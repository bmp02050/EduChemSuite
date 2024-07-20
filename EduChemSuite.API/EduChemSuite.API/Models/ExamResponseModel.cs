namespace EduChemSuite.API.Models;

public class ExamResponseModel
{
    public required Guid UserId { get; set; }
    public UserModel? User { get; set; }
    public required Guid QuestionId { get; set; }
    public QuestionModel? Question { get; set; }
    public Guid AnswerId { get; set; }
    public AnswerModel? Answer { get; set; }
    public String? ResponseText { get; set; }
    public String? ResponseImage { get; set; }
    public required Guid ImageTypeModel { get; set; }
    public ImageTypeModel? ImageType { get; set; }
}