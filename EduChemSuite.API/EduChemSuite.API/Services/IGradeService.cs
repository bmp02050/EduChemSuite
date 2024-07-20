using EduChemSuite.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduChemSuite.API.Services;

public interface IGradeService : IBaseService<Grade>
{
    Task<IEnumerable<Grade?>> Find(Guid id);
}

public class GradeService(Context context, DbSet<Grade> grades) : BaseService<Grade>(context, grades), IGradeService
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