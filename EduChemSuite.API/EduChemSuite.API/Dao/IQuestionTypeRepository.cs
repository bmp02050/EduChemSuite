using EduChemSuite.API.Entities;
using EduChemSuite.API.Services;
using Microsoft.EntityFrameworkCore;

namespace EduChemSuite.API.Dao;

public interface IQuestionTypeRepository
{
    Task<QuestionType?> GetById(Guid id);
    Task<QuestionType> Create(QuestionType questionType);
    Task<QuestionType?> Update(QuestionType questionType);
    Task<IEnumerable<QuestionType>> List();
}

public class QuestionTypeRepository(Context context)
    : BaseService<QuestionType>(context), IQuestionTypeRepository
{
    private readonly Context _context = context;

    public async Task<IEnumerable<QuestionType>> List()
    {
        return await _context.Set<QuestionType>().AsNoTracking().ToListAsync();
    }
}
