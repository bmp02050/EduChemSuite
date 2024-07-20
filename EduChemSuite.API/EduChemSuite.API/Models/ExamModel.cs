namespace EduChemSuite.API.Models;

public class ExamModel : BaseModel
{
    public required ICollection<ExamQuestionModel> ExamQuestions { get; set; }
    public required ICollection<GradeModel> Grades { get; set; }
}