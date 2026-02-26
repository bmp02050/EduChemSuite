using EduChemSuite.API.Entities;
using EduChemSuite.API.Services;
using Microsoft.EntityFrameworkCore;

namespace EduChemSuite.API.Dao;

public interface IAnswerRepository
{
    Task<Answer?> GetById(Guid id);
    Task<Answer> Create(Answer answer);
    Task<Answer?> Update(Answer answer);
    Task<IEnumerable<Answer>> ListByQuestion(Guid questionId);
}

public class AnswerRepository(Context context)
    : BaseService<Answer>(context), IAnswerRepository
{
    private readonly Context _context = context;

    public async Task<IEnumerable<Answer>> ListByQuestion(Guid questionId)
    {
        return await _context.Answers
            .Where(x => x.QuestionId == questionId)
            .ToListAsync();
    }
}
