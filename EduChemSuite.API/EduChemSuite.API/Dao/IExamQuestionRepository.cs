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
    Task<IEnumerable<ExamQuestion>> ListByExam(Guid examId);
    Task<ExamQuestion?> FindByExamAndQuestion(Guid examId, Guid questionId);
    Task<bool> Delete(Guid id);
}

public class ExamQuestionRepository(Context context)
    : BaseService<ExamQuestion>(context), IExamQuestionRepository
{
    private readonly Context _context = context;

    public new async Task<ExamQuestion> Create(ExamQuestion examQuestion)
    {
        examQuestion.IsActive = true;
        var entry = await _context.ExamQuestions.AddAsync(examQuestion);
        await _context.SaveChangesAsync();
        return entry.Entity;
    }

    public new async Task<ExamQuestion?> GetById(Guid id)
    {
        return await _context.ExamQuestions
            .AsNoTracking()
            .Include(eq => eq.Question)
            .Include(eq => eq.Exam)
            .FirstOrDefaultAsync(eq => eq.Id == id && eq.IsActive);
    }

    public async Task<IEnumerable<ExamQuestion>> ListByExam(Guid examId)
    {
        return await _context.ExamQuestions
            .AsNoTracking()
            .AsSplitQuery()
            .Include(eq => eq.Question).ThenInclude(q => q.QuestionType)
            .Include(eq => eq.Question).ThenInclude(q => q.Answers)
            .Where(eq => eq.IsActive && eq.ExamId == examId && eq.Question.IsActive)
            .GroupBy(eq => eq.QuestionId)
            .Select(g => g.OrderBy(eq => eq.CreatedAt).First())
            .ToListAsync();
    }

    public async Task<ExamQuestion?> FindByExamAndQuestion(Guid examId, Guid questionId)
    {
        return await _context.ExamQuestions
            .AsNoTracking()
            .FirstOrDefaultAsync(eq => eq.IsActive && eq.ExamId == examId && eq.QuestionId == questionId);
    }

    public async Task<IEnumerable<ExamQuestion?>> Find(Guid id)
    {
        return await _context.ExamQuestions
            .AsNoTracking()
            .Where(x => x.IsActive && (x.Id == id || x.QuestionId == id || x.ExamId == id))
            .ToListAsync();
    }

    public async Task<bool> Delete(Guid id)
    {
        var examQuestion = await _context.ExamQuestions.FindAsync(id);
        if (examQuestion == null || !examQuestion.IsActive) return false;
        examQuestion.IsActive = false;
        _context.ExamQuestions.Update(examQuestion);
        await _context.SaveChangesAsync();
        return true;
    }
}
