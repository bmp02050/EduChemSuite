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
}

public class ExamResponseRepository(Context context)
    : BaseService<ExamResponse>(context), IExamResponseRepository
{
    private readonly Context _context = context;

    public async Task<IEnumerable<ExamResponse>> Find(Guid id)
    {
        return await _context.ExamResponses
            .Where(x => x.Id == id ||
                        x.QuestionId == id ||
                        x.AnswerId == id ||
                        x.UserId == id)
            .ToListAsync();
    }
}
