using EduChemSuite.API.Entities;
using EduChemSuite.API.Services;
using Microsoft.EntityFrameworkCore;

namespace EduChemSuite.API.Dao;

public interface IExamResponseRepository
{
    Task<ExamResponse?> GetById(Guid id);
    Task<ExamResponse> Create(ExamResponse examResponse);
    Task<ExamResponse?> Update(ExamResponse examResponse);
    Task<IEnumerable<ExamResponse>> Find(Guid id);
    Task<IEnumerable<ExamResponse>> ListByExam(Guid examId);
    Task<IEnumerable<ExamResponse>> ListByUser(Guid userId);
    Task<ExamResponse?> FindByExamUserQuestion(Guid examId, Guid userId, Guid questionId);
    Task<ExamResponse?> FindByExamUserExamQuestion(Guid examId, Guid userId, Guid examQuestionId);
    Task<IEnumerable<ExamResponse>> ListByExamAndUser(Guid examId, Guid userId);
    Task<bool> Delete(Guid id);
    Task<int> DeleteByExamAndUser(Guid examId, Guid userId);
}

public class ExamResponseRepository(Context context)
    : BaseService<ExamResponse>(context), IExamResponseRepository
{
    private readonly Context _context = context;

    public new async Task<ExamResponse?> GetById(Guid id)
    {
        return await _context.ExamResponses
            .AsNoTracking()
            .Include(er => er.User)
            .Include(er => er.Question)
            .Include(er => er.Answer)
            .Include(er => er.ImageType)
            .FirstOrDefaultAsync(er => er.Id == id && er.IsActive);
    }

    public async Task<IEnumerable<ExamResponse>> Find(Guid id)
    {
        return await _context.ExamResponses
            .AsNoTracking()
            .Where(x => x.IsActive &&
                        (x.Id == id ||
                         x.QuestionId == id ||
                         x.AnswerId == id ||
                         x.UserId == id))
            .ToListAsync();
    }

    public async Task<IEnumerable<ExamResponse>> ListByExam(Guid examId)
    {
        return await _context.ExamResponses
            .AsNoTracking()
            .AsSplitQuery()
            .Include(er => er.User)
            .Include(er => er.Question).ThenInclude(q => q!.QuestionType)
            .Include(er => er.Question).ThenInclude(q => q!.Answers)
            .Include(er => er.Answer)
            .Where(er => er.IsActive &&
                         _context.ExamQuestions.Any(eq => eq.IsActive && eq.ExamId == examId && eq.QuestionId == er.QuestionId))
            .ToListAsync();
    }

    public async Task<IEnumerable<ExamResponse>> ListByUser(Guid userId)
    {
        return await _context.ExamResponses
            .AsNoTracking()
            .Include(er => er.Question)
            .Include(er => er.Answer)
            .Where(er => er.IsActive && er.UserId == userId)
            .ToListAsync();
    }

    public async Task<ExamResponse?> FindByExamUserQuestion(Guid examId, Guid userId, Guid questionId)
    {
        return await _context.ExamResponses
            .AsNoTracking()
            .Include(er => er.Question)
            .Include(er => er.Answer)
            .FirstOrDefaultAsync(er => er.IsActive &&
                                       er.ExamId == examId &&
                                       er.UserId == userId &&
                                       er.QuestionId == questionId);
    }

    public async Task<ExamResponse?> FindByExamUserExamQuestion(Guid examId, Guid userId, Guid examQuestionId)
    {
        return await _context.ExamResponses
            .AsNoTracking()
            .Include(er => er.Question)
            .Include(er => er.Answer)
            .FirstOrDefaultAsync(er => er.IsActive &&
                                       er.ExamId == examId &&
                                       er.UserId == userId &&
                                       er.ExamQuestionId == examQuestionId);
    }

    public async Task<IEnumerable<ExamResponse>> ListByExamAndUser(Guid examId, Guid userId)
    {
        return await _context.ExamResponses
            .AsNoTracking()
            .AsSplitQuery()
            .Include(er => er.Question).ThenInclude(q => q!.QuestionType)
            .Include(er => er.Question).ThenInclude(q => q!.Answers)
            .Include(er => er.Answer)
            .Where(er => er.IsActive && er.ExamId == examId && er.UserId == userId)
            .ToListAsync();
    }

    public async Task<bool> Delete(Guid id)
    {
        var examResponse = await _context.ExamResponses.FindAsync(id);
        if (examResponse == null || !examResponse.IsActive) return false;
        examResponse.IsActive = false;
        _context.ExamResponses.Update(examResponse);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<int> DeleteByExamAndUser(Guid examId, Guid userId)
    {
        var responses = await _context.ExamResponses
            .Where(er => er.IsActive && er.ExamId == examId && er.UserId == userId)
            .ToListAsync();
        foreach (var r in responses)
            r.IsActive = false;
        return await _context.SaveChangesAsync();
    }
}
