using EduChemSuite.API.Entities;
using EduChemSuite.API.Services;

namespace EduChemSuite.API.Dao;

public interface IQuestionTagRepository
{
    Task<QuestionTag?> GetById(Guid id);
    Task<QuestionTag> Create(QuestionTag questionTag);
    Task<QuestionTag?> Update(QuestionTag questionTag);
}

public class QuestionTagRepository(Context context)
    : BaseService<QuestionTag>(context), IQuestionTagRepository;
