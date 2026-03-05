using EduChemSuite.API.Entities;
using EduChemSuite.API.Services;
using Microsoft.EntityFrameworkCore;

namespace EduChemSuite.API.Dao;

public interface IGradeRepository
{
    Task<Grade?> GetById(Guid id);
    Task<Grade> Create(Grade grade);
    Task<Grade?> Update(Grade grade);
    Task<IEnumerable<Grade?>> Find(Guid id);
    Task<IEnumerable<Grade>> ListByExam(Guid examId);
    Task<IEnumerable<Grade>> ListByUser(Guid userId);
    Task<bool> Delete(Guid id);
}

public class GradeRepository(Context context)
    : BaseService<Grade>(context), IGradeRepository
{
    private readonly Context _context = context;

    public new async Task<Grade?> GetById(Guid id)
    {
        return await _context.Grades
            .AsNoTracking()
            .Include(g => g.User)
            .Include(g => g.Exam)
            .FirstOrDefaultAsync(g => g.Id == id && g.IsActive);
    }

    public async Task<IEnumerable<Grade>> ListByExam(Guid examId)
    {
        return await _context.Grades
            .AsNoTracking()
            .Include(g => g.User)
            .Where(g => g.IsActive && g.ExamId == examId)
            .OrderBy(g => g.User!.LastName)
            .ToListAsync();
    }

    public async Task<IEnumerable<Grade>> ListByUser(Guid userId)
    {
        return await _context.Grades
            .AsNoTracking()
            .Include(g => g.Exam)
            .Where(g => g.IsActive && g.UserId == userId)
            .OrderByDescending(g => g.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<Grade?>> Find(Guid id)
    {
        return await _context.Grades
            .AsNoTracking()
            .Where(
                x => x.IsActive && (x.Id == id ||
                     x.UserId == id ||
                     x.ExamId == id))
            .ToListAsync();
    }

    public async Task<bool> Delete(Guid id)
    {
        var grade = await _context.Grades.FindAsync(id);
        if (grade == null || !grade.IsActive) return false;
        grade.IsActive = false;
        _context.Grades.Update(grade);
        await _context.SaveChangesAsync();
        return true;
    }
}
