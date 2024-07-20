namespace EduChemSuite.API.Models;

public class QuestionTagModel : BaseModel
{
    public required Guid QuestionId { get; set; }
    public QuestionModel? Question { get; set; }
    public required Guid TagId { get; set; }
    public TagModel? Tag { get; set; }
}