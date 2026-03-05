using EduChemSuite.API.Entities;
using EduChemSuite.API.Services;
using Microsoft.EntityFrameworkCore;

namespace EduChemSuite.API.Dao;

public interface IQuestionRepository
{
    Task<Question?> GetById(Guid id);
    Task<Question> Create(Question question);
    Task<Question?> Update(Question question);
    Task<IEnumerable<Question>> FindById(Guid id);
    Task<IEnumerable<Question>> SearchTags(IEnumerable<string> tags);
    Task<IEnumerable<Question>> ListByUser(Guid userId);
    Task<IEnumerable<Question>> ListAll(bool includeInactive);
    Task<bool> IsUsedInActiveExam(Guid questionId);
    Task<Question> ToggleActive(Guid id);
    Task<bool> Delete(Guid id);
}

public class QuestionRepository(Context context)
    : BaseService<Question>(context), IQuestionRepository
{
    private readonly Context _context = context;

    public new async Task<Question> Create(Question question)
    {
        question.IsActive = true;
        var entry = await _context.Questions.AddAsync(question);
        await _context.SaveChangesAsync();
        return entry.Entity;
    }

    public new async Task<Question?> GetById(Guid id)
    {
        return await _context.Questions
            .AsNoTracking()
            .AsSplitQuery()
            .Include(q => q.Answers)
            .Include(q => q.QuestionTags)!.ThenInclude(qt => qt.Tag)
            .Include(q => q.QuestionType)
            .Include(q => q.User)
            .FirstOrDefaultAsync(q => q.Id == id && q.IsActive);
    }

    public async Task<IEnumerable<Question>> FindById(Guid id)
    {
        return await _context.Questions
            .AsNoTracking()
            .AsSplitQuery()
            .Include(q => q.Answers)
            .Include(q => q.QuestionTags)!.ThenInclude(qt => qt.Tag)
            .Include(q => q.QuestionType)
            .Include(q => q.User)
            .Where(x => x.IsActive && (x.Id == id || x.UserId == id || x.QuestionTypeId == id))
            .ToListAsync();
    }

    public async Task<IEnumerable<Question>> SearchTags(IEnumerable<string> tags)
    {
        var tagList = tags.ToList();
        return await _context.Questions
            .AsNoTracking()
            .AsSplitQuery()
            .Include(q => q.Answers)
            .Include(q => q.QuestionTags)!.ThenInclude(qt => qt.Tag)
            .Include(q => q.QuestionType)
            .Include(q => q.User)
            .Where(q => q.IsActive && q.QuestionTags != null && q.QuestionTags
                .Any(qt => qt.Tag != null && tagList.Contains(qt.Tag.TagText)))
            .ToListAsync();
    }

    public new async Task<Question?> Update(Question question)
    {
        var oldQuestion = await _context.Questions
            .Include(q => q.Answers)
            .Include(q => q.QuestionTags)
            .FirstOrDefaultAsync(q => q.Id == question.Id);
        if (oldQuestion is not { IsActive: true })
            throw new Exception("Question not found or is already inactive.");

        // Create new version
        var newQuestion = new Question
        {
            Id = Guid.NewGuid(),
            UserId = question.UserId,
            QuestionText = question.QuestionText,
            QuestionTypeId = question.QuestionTypeId,
            Version = oldQuestion.Version + 1,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _context.Questions.AddAsync(newQuestion);

        // Copy active answers to new question
        if (oldQuestion.Answers != null)
        {
            foreach (var answer in oldQuestion.Answers.Where(a => a.IsActive))
            {
                await _context.Answers.AddAsync(new Answer
                {
                    Id = Guid.NewGuid(),
                    QuestionId = newQuestion.Id,
                    AnswerText = answer.AnswerText,
                    IsCorrect = answer.IsCorrect,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                });
            }
        }

        // Copy active tags to new question
        if (oldQuestion.QuestionTags != null)
        {
            foreach (var qt in oldQuestion.QuestionTags.Where(qt => qt.IsActive))
            {
                await _context.QuestionTags.AddAsync(new QuestionTag
                {
                    Id = Guid.NewGuid(),
                    QuestionId = newQuestion.Id,
                    TagId = qt.TagId,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                });
            }
        }

        oldQuestion.IsActive = false;
        _context.Questions.Update(oldQuestion);
        await _context.SaveChangesAsync();

        // Reload with includes
        return await GetById(newQuestion.Id);
    }

    public async Task<IEnumerable<Question>> ListByUser(Guid userId)
    {
        return await _context.Questions
            .AsNoTracking()
            .AsSplitQuery()
            .Include(q => q.Answers)
            .Include(q => q.QuestionTags)!.ThenInclude(qt => qt.Tag)
            .Include(q => q.QuestionType)
            .Where(q => q.IsActive && q.UserId == userId)
            .OrderByDescending(q => q.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Question>> ListAll(bool includeInactive)
    {
        var query = _context.Questions
            .AsNoTracking()
            .AsSplitQuery()
            .Include(q => q.Answers)
            .Include(q => q.QuestionTags)!.ThenInclude(qt => qt.Tag)
            .Include(q => q.QuestionType)
            .Include(q => q.User)
            .AsQueryable();

        if (!includeInactive)
            query = query.Where(q => q.IsActive);

        return await query.OrderByDescending(q => q.CreatedAt).ToListAsync();
    }

    public async Task<bool> IsUsedInActiveExam(Guid questionId)
    {
        return await _context.ExamQuestions
            .AsNoTracking()
            .AnyAsync(eq => eq.IsActive && eq.QuestionId == questionId && eq.Exam.IsActive);
    }

    public async Task<Question> ToggleActive(Guid id)
    {
        var question = await _context.Questions.FindAsync(id);
        if (question == null)
            throw new KeyNotFoundException("Question not found");

        if (question.IsActive && await IsUsedInActiveExam(id))
            throw new InvalidOperationException("Cannot deactivate a question that is used in an active exam.");

        question.IsActive = !question.IsActive;
        _context.Questions.Update(question);
        await _context.SaveChangesAsync();

        return (await GetById(id))!;
    }

    public async Task<bool> Delete(Guid id)
    {
        var question = await _context.Questions.FindAsync(id);
        if (question == null || !question.IsActive) return false;
        question.IsActive = false;
        _context.Questions.Update(question);
        await _context.SaveChangesAsync();
        return true;
    }
}
