namespace EduChemSuite.API.Entities;

public class QuestionType : BaseEntity
{
    public required String Description { get; set; }
    public virtual ICollection<Question> Questions { get; set; }
}