using EduChemSuite.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduChemSuite.API.Services;

public interface IExamQuestionService : IBaseService<ExamQuestion>
{
    Task<IEnumerable<ExamQuestion?>> Find(Guid id);
}

public class ExamQuestionService(Context context, DbSet<ExamQuestion> examQuestions)
    : BaseService<ExamQuestion>(context, examQuestions), IExamQuestionService
{
    private readonly Context _context = context;

    public async Task<IEnumerable<ExamQuestion?>> Find(Guid id)
    {
        return await _context.ExamQuestions
            .Where(x => x.Id == id || x.QuestionId == id || x.ExamId == id)
            .ToListAsync();
    }
}