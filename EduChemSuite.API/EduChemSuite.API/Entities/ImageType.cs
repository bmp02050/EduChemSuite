namespace EduChemSuite.API.Entities;

public class ImageType : BaseEntity
{
    public required String Description { get; set; }
    public virtual ICollection<ExamResponse>? ExamResponses { get; set; }
}