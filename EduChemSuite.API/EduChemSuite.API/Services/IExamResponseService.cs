using EduChemSuite.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduChemSuite.API.Services;

public interface IExamResponseService : IBaseService<ExamResponse>
{
    Task<IEnumerable<ExamResponse>> Find(Guid id);
}

public class ExamResponseService(Context context)
    : BaseService<ExamResponse>(context), IExamResponseService
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