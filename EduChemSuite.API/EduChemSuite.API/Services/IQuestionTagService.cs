using EduChemSuite.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduChemSuite.API.Services;

public interface IQuestionTagService : IBaseService<QuestionTag>
{
}

public class QuestionTagService(Context context, DbSet<QuestionTag> questionTags)
    : BaseService<QuestionTag>(context, questionTags), IQuestionTagService
{
}