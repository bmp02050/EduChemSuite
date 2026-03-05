using EduChemSuite.API.Entities;
using EduChemSuite.API.Services;
using Microsoft.EntityFrameworkCore;

namespace EduChemSuite.API.Dao;

public interface IExamRepository
{
    Task<Exam?> GetById(Guid id);
    Task<Exam> Create(Exam exam);
    Task<Exam?> Update(Exam exam);
    Task<IEnumerable<Exam?>> Find(Guid id);
    Task<IEnumerable<Exam>> List();
    Task<IEnumerable<Exam>> ListAll(bool includeInactive);
    Task<Exam> ToggleActive(Guid id);
    Task<bool> Delete(Guid id);
}

public class ExamRepository(Context context)
    : BaseService<Exam>(context), IExamRepository
{
    private readonly Context _context = context;

    public new async Task<Exam> Create(Exam exam)
    {
        exam.IsActive = true;
        var entry = await _context.Exams.AddAsync(exam);
        await _context.SaveChangesAsync();
        return entry.Entity;
    }

    public new async Task<Exam?> GetById(Guid id)
    {
        return await _context.Exams
            .AsNoTracking()
            .AsSplitQuery()
            .Include(e => e.ExamQuestions).ThenInclude(eq => eq.Question)
            .Include(e => e.Grades).ThenInclude(g => g.User)
            .FirstOrDefaultAsync(e => e.Id == id);
    }

    public async Task<IEnumerable<Exam>> List()
    {
        return await _context.Exams
            .AsNoTracking()
            .AsSplitQuery()
            .Include(e => e.ExamQuestions)
            .Include(e => e.Grades)
            .Where(e => e.IsActive)
            .OrderByDescending(e => e.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Exam?>> Find(Guid id)
    {
        return await _context.Exams
            .AsNoTracking()
            .Where(x =>
                x.IsActive && (x.Id == id ||
                x.ExamQuestions.Any(y =>
                    y.QuestionId == id
                    || y.ExamId == id)))
            .ToListAsync();
    }

    public async Task<IEnumerable<Exam>> ListAll(bool includeInactive)
    {
        var query = _context.Exams
            .AsNoTracking()
            .AsSplitQuery()
            .Include(e => e.ExamQuestions)
            .Include(e => e.Grades)
            .AsQueryable();

        if (!includeInactive)
            query = query.Where(e => e.IsActive);

        return await query.OrderByDescending(e => e.CreatedAt).ToListAsync();
    }

    public async Task<Exam> ToggleActive(Guid id)
    {
        var exam = await _context.Exams.FindAsync(id);
        if (exam == null)
            throw new KeyNotFoundException("Exam not found");

        exam.IsActive = !exam.IsActive;
        _context.Exams.Update(exam);
        await _context.SaveChangesAsync();

        return (await GetById(id))!;
    }

    public async Task<bool> Delete(Guid id)
    {
        var exam = await _context.Exams.FindAsync(id);
        if (exam == null || !exam.IsActive) return false;
        exam.IsActive = false;
        _context.Exams.Update(exam);
        await _context.SaveChangesAsync();
        return true;
    }
}
