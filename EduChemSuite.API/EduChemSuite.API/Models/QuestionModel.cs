namespace EduChemSuite.API.Models;

public class QuestionModel : BaseModel
{
    public required Guid UserId { get; set; }
    public UserModel? User { get; set; }
    public required String QuestionText { get; set; }
    public required Guid QuestionTypeId { get; set; }
    public virtual QuestionTypeModel? QuestionType { get; set; }
    public virtual ICollection<QuestionTagModel>? QuestionTags { get; set; }
}