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
}

public class GradeRepository(Context context)
    : BaseService<Grade>(context), IGradeRepository
{
    private readonly Context _context = context;

    public async Task<IEnumerable<Grade?>> Find(Guid id)
    {
        return await _context.Grades.Where(
                x => x.Id == id ||
                     x.UserId == id ||
                     x.ExamId == id)
            .ToListAsync();
    }
}
