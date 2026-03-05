using AutoMapper;
using EduChemSuite.API.Dao;
using EduChemSuite.API.Entities;
using EduChemSuite.API.Models;

namespace EduChemSuite.API.Services;

public interface IQuestionTypeService
{
    Task<QuestionTypeModel?> GetById(Guid id);
    Task<QuestionTypeModel> Create(QuestionTypeModel questionType);
    Task<QuestionTypeModel?> Update(QuestionTypeModel questionType);
    Task<IEnumerable<QuestionTypeModel>> List();
}

public class QuestionTypeService(IQuestionTypeRepository questionTypeRepository, IMapper mapper)
    : IQuestionTypeService
{
    public async Task<QuestionTypeModel?> GetById(Guid id)
    {
        return mapper.Map<QuestionTypeModel>(await questionTypeRepository.GetById(id));
    }

    public async Task<QuestionTypeModel> Create(QuestionTypeModel questionType)
    {
        return mapper.Map<QuestionTypeModel>(await questionTypeRepository.Create(mapper.Map<QuestionType>(questionType)));
    }

    public async Task<QuestionTypeModel?> Update(QuestionTypeModel questionType)
    {
        return mapper.Map<QuestionTypeModel>(await questionTypeRepository.Update(mapper.Map<QuestionType>(questionType)));
    }

    public async Task<IEnumerable<QuestionTypeModel>> List()
    {
        return mapper.Map<IEnumerable<QuestionTypeModel>>(await questionTypeRepository.List());
    }
}
