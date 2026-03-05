using AutoMapper;
using EduChemSuite.API.Dao;
using EduChemSuite.API.Entities;
using EduChemSuite.API.Models;

namespace EduChemSuite.API.Services;

public interface IQuestionTagService
{
    Task<QuestionTagModel?> GetById(Guid id);
    Task<QuestionTagModel> Create(QuestionTagModel questionTag);
    Task<QuestionTagModel?> Update(QuestionTagModel questionTag);
    Task<IEnumerable<QuestionTagModel>> ListByQuestion(Guid questionId);
    Task<bool> Delete(Guid id);
}

public class QuestionTagService(IQuestionTagRepository questionTagRepository, IMapper mapper)
    : IQuestionTagService
{
    public async Task<QuestionTagModel?> GetById(Guid id)
    {
        return mapper.Map<QuestionTagModel>(await questionTagRepository.GetById(id));
    }

    public async Task<QuestionTagModel> Create(QuestionTagModel questionTag)
    {
        return mapper.Map<QuestionTagModel>(await questionTagRepository.Create(mapper.Map<QuestionTag>(questionTag)));
    }

    public async Task<QuestionTagModel?> Update(QuestionTagModel questionTag)
    {
        return mapper.Map<QuestionTagModel>(await questionTagRepository.Update(mapper.Map<QuestionTag>(questionTag)));
    }

    public async Task<IEnumerable<QuestionTagModel>> ListByQuestion(Guid questionId)
    {
        return mapper.Map<IEnumerable<QuestionTagModel>>(await questionTagRepository.ListByQuestion(questionId));
    }

    public async Task<bool> Delete(Guid id)
    {
        return await questionTagRepository.Delete(id);
    }
}
