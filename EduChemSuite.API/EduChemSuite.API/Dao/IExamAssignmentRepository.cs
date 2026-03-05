using EduChemSuite.API.Entities;
using EduChemSuite.API.Services;
using Microsoft.EntityFrameworkCore;

namespace EduChemSuite.API.Dao;

public interface IExamAssignmentRepository
{
    Task<ExamAssignment?> GetById(Guid id);
    Task<ExamAssignment> Create(ExamAssignment assignment);
    Task<IEnumerable<ExamAssignment>> ListByExam(Guid examId);
    Task<IEnumerable<ExamAssignment>> ListByUser(Guid userId);
    Task<ExamAssignment?> GetByExamAndUser(Guid examId, Guid userId);
    Task<bool> Delete(Guid id);
    Task<bool> DeleteByExamAndUser(Guid examId, Guid userId);
}

public class ExamAssignmentRepository(Context context)
    : BaseService<ExamAssignment>(context), IExamAssignmentRepository
{
    private readonly Context _context = context;

    public new async Task<ExamAssignment?> GetById(Guid id)
    {
        return await _context.ExamAssignments
            .AsNoTracking()
            .Include(ea => ea.Exam)
            .Include(ea => ea.User)
            .FirstOrDefaultAsync(ea => ea.Id == id && ea.IsActive);
    }

    public new async Task<ExamAssignment> Create(ExamAssignment assignment)
    {
        assignment.IsActive = true;
        assignment.AssignedAt = DateTime.UtcNow;
        var entry = await _context.ExamAssignments.AddAsync(assignment);
        await _context.SaveChangesAsync();
        return entry.Entity;
    }

    public async Task<IEnumerable<ExamAssignment>> ListByExam(Guid examId)
    {
        return await _context.ExamAssignments
            .AsNoTracking()
            .Include(ea => ea.User)
            .Where(ea => ea.IsActive && ea.ExamId == examId)
            .OrderByDescending(ea => ea.AssignedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<ExamAssignment>> ListByUser(Guid userId)
    {
        return await _context.ExamAssignments
            .AsNoTracking()
            .AsSplitQuery()
            .Include(ea => ea.Exam)
                .ThenInclude(e => e!.ExamQuestions)
            .Include(ea => ea.Exam)
                .ThenInclude(e => e!.Grades)
            .Where(ea => ea.IsActive && ea.UserId == userId && ea.Exam!.IsActive)
            .OrderByDescending(ea => ea.AssignedAt)
            .ToListAsync();
    }

    public async Task<ExamAssignment?> GetByExamAndUser(Guid examId, Guid userId)
    {
        return await _context.ExamAssignments
            .AsNoTracking()
            .Include(ea => ea.Exam)
            .Include(ea => ea.User)
            .FirstOrDefaultAsync(ea => ea.IsActive && ea.ExamId == examId && ea.UserId == userId);
    }

    public async Task<bool> Delete(Guid id)
    {
        var assignment = await _context.ExamAssignments.FindAsync(id);
        if (assignment == null || !assignment.IsActive) return false;
        assignment.IsActive = false;
        _context.ExamAssignments.Update(assignment);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteByExamAndUser(Guid examId, Guid userId)
    {
        var assignment = await _context.ExamAssignments
            .FirstOrDefaultAsync(ea => ea.IsActive && ea.ExamId == examId && ea.UserId == userId);
        if (assignment == null) return false;
        assignment.IsActive = false;
        _context.ExamAssignments.Update(assignment);
        await _context.SaveChangesAsync();
        return true;
    }
}
