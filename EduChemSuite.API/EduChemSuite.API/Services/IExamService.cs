using EduChemSuite.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduChemSuite.API.Services;

public interface IExamService : IBaseService<Exam>
{
    Task<IEnumerable<Exam?>> Find(Guid id);
}

public class ExamService(Context context, DbSet<Exam> exams) : BaseService<Exam>(context, exams), IExamService 
{
    private readonly Context _context = context;
    
    public async Task<IEnumerable<Exam?>> Find(Guid id)
    {
        return await _context.Exams.Where(x =>
                x.Id == id ||
                x.ExamQuestions.Any(y =>
                    y.QuestionId == id
                    || y.ExamId == id))
            .ToListAsync();
    }
}