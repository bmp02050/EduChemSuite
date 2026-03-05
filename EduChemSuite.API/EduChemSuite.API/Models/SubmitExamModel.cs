namespace EduChemSuite.API.Models;

public class SubmitExamModel
{
    public required ICollection<SubmitResponseModel> Responses { get; set; }
}

public class SubmitResponseModel
{
    public required Guid QuestionId { get; set; }
    public Guid? ExamQuestionId { get; set; }
    public Guid? AnswerId { get; set; }
    public string? ResponseText { get; set; }
    public string? ResponseImage { get; set; }
}
