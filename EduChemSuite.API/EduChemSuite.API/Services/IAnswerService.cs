using EduChemSuite.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduChemSuite.API.Services;

public interface IAnswerService : IBaseService<Answer>
{
    Task<IEnumerable<Answer>> ListByQuestion(Guid questionId);
}

public class AnswerService(Context context, DbSet<Answer> answers)
    : BaseService<Answer>(context, answers), IAnswerService
{
    private readonly Context _context = context;

    public Task<IEnumerable<Answer>> ListByQuestion(Guid questionId)
    {
        return Task.FromResult<IEnumerable<Answer>>(_context.Answers
            .Where(x => x.QuestionId == questionId));
    }
}