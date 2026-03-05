using EduChemSuite.API.Entities;
using EduChemSuite.API.Services;
using Microsoft.EntityFrameworkCore;

namespace EduChemSuite.API.Dao;

public interface IQuestionTagRepository
{
    Task<QuestionTag?> GetById(Guid id);
    Task<QuestionTag> Create(QuestionTag questionTag);
    Task<QuestionTag?> Update(QuestionTag questionTag);
    Task<IEnumerable<QuestionTag>> ListByQuestion(Guid questionId);
    Task<bool> Delete(Guid id);
}

public class QuestionTagRepository(Context context)
    : BaseService<QuestionTag>(context), IQuestionTagRepository
{
    private readonly Context _context = context;

    public async Task<IEnumerable<QuestionTag>> ListByQuestion(Guid questionId)
    {
        return await _context.QuestionTags
            .AsNoTracking()
            .Include(qt => qt.Tag)
            .Where(qt => qt.IsActive && qt.QuestionId == questionId)
            .ToListAsync();
    }

    public async Task<bool> Delete(Guid id)
    {
        var questionTag = await _context.QuestionTags.FindAsync(id);
        if (questionTag == null || !questionTag.IsActive) return false;
        questionTag.IsActive = false;
        _context.QuestionTags.Update(questionTag);
        await _context.SaveChangesAsync();
        return true;
    }
}
