using EduChemSuite.API.Entities;
using EduChemSuite.API.Services;
using Microsoft.EntityFrameworkCore;

namespace EduChemSuite.API.Dao;

public interface IQuestionRepository
{
    Task<Question?> GetById(Guid id);
    Task<Question> Create(Question question);
    Task<Question?> Update(Question question);
    public Task<IEnumerable<Question>> FindById(Guid id);
    public Task<IEnumerable<Question>> SearchTags(IEnumerable<String> tags);
    
}

public class QuestionRepository(Context context)
    : BaseService<Question>(context), IQuestionRepository
{
    private readonly Context _context = context;

    public async Task<IEnumerable<Question>> FindById(Guid id)
    {
        return await _context.Questions.Where(
                x => x.Id == id ||
                     x.UserId == id ||
                     x.QuestionTypeId == id)
            .ToListAsync();
    }

    public async Task<IEnumerable<Question>> SearchTags(IEnumerable<string> tags)
    {
        var tagList = tags.ToList();
        var results = await _context.Questions
            .Where(q => q.QuestionTags != null && q.QuestionTags
                .Any(qt => qt.Tag != null && tagList.Contains(qt.Tag.TagText)))
            .ToListAsync();
        return results;
    }

    public new async Task<Question?> Update(Guid questionId, Question question)
    {
        var oldQuestion = await _context.Questions.FindAsync(questionId);
        if (oldQuestion is not { IsActive: true })
            throw new Exception("Question not found or is already inactive.");

        question.IsActive = true;
        question.Version++;

        await _context.AddAsync(question);
        oldQuestion.IsActive = false;
        await Update(oldQuestion);
        await _context.SaveChangesAsync();
        return question;
    }
}