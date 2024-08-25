using EduChemSuite.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduChemSuite.API.Services;

public interface IQuestionTypeService : IBaseService<QuestionType>
{
}

public class QuestionTypeService(Context context)
    : BaseService<QuestionType>(context), IQuestionTypeService
{
    
}