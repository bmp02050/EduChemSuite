namespace EduChemSuite.API.Entities;

public class Tag : BaseEntity
{
    public required String TagText { get; set; }
    public virtual ICollection<QuestionTag>? QuestionTags { get; set; }
}