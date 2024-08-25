namespace EduChemSuite.API.Entities;

public class Exam : BaseEntity
{
    public virtual required ICollection<ExamQuestion> ExamQuestions { get; set; }
    public virtual required ICollection<Grade> Grades { get; set; }
}