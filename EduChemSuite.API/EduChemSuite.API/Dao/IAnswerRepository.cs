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
    Task<IEnumerable<Answer>> ListByTags(IEnumerable<Guid> tagIds, Guid excludeQuestionId);
    Task<bool> Delete(Guid id);
}

public class AnswerRepository(Context context)
    : BaseService<Answer>(context), IAnswerRepository
{
    private readonly Context _context = context;

    public async Task<IEnumerable<Answer>> ListByQuestion(Guid questionId)
    {
        return await _context.Answers
            .AsNoTracking()
            .Where(x => x.QuestionId == questionId)
            .ToListAsync();
    }

    public async Task<IEnumerable<Answer>> ListByTags(IEnumerable<Guid> tagIds, Guid excludeQuestionId)
    {
        var tagIdList = tagIds.ToList();
        return await _context.Answers
            .AsNoTracking()
            .AsSplitQuery()
            .Include(a => a.Question)
                .ThenInclude(q => q!.QuestionTags)
                    .ThenInclude(qt => qt.Tag)
            .Where(a => a.IsActive
                && a.QuestionId != excludeQuestionId
                && a.Question != null
                && a.Question.IsActive
                && a.Question.QuestionTags!.Any(qt => tagIdList.Contains(qt.TagId)))
            .ToListAsync();
    }

    public async Task<bool> Delete(Guid id)
    {
        var answer = await _context.Answers.FindAsync(id);
        if (answer == null || !answer.IsActive) return false;
        answer.IsActive = false;
        _context.Answers.Update(answer);
        await _context.SaveChangesAsync();
        return true;
    }
}
