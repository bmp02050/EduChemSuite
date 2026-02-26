using EduChemSuite.API.Entities;
using EduChemSuite.API.Services;
using Microsoft.EntityFrameworkCore;

namespace EduChemSuite.API.Dao;

public interface IExamQuestionRepository
{
    Task<ExamQuestion?> GetById(Guid id);
    Task<ExamQuestion> Create(ExamQuestion examQuestion);
    Task<ExamQuestion?> Update(ExamQuestion examQuestion);
    Task<IEnumerable<ExamQuestion?>> Find(Guid id);
}

public class ExamQuestionRepository(Context context)
    : BaseService<ExamQuestion>(context), IExamQuestionRepository
{
    private readonly Context _context = context;

    public async Task<IEnumerable<ExamQuestion?>> Find(Guid id)
    {
        return await _context.ExamQuestions
            .Where(x => x.Id == id || x.QuestionId == id || x.ExamId == id)
            .ToListAsync();
    }
}
