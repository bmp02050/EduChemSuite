using EduChemSuite.API.Entities;
using EduChemSuite.API.Services;

namespace EduChemSuite.API.Dao;

public interface IQuestionTypeRepository
{
    Task<QuestionType?> GetById(Guid id);
    Task<QuestionType> Create(QuestionType questionType);
    Task<QuestionType?> Update(QuestionType questionType);
}

public class QuestionTypeRepository(Context context)
    : BaseService<QuestionType>(context), IQuestionTypeRepository;
