using AutoMapper;
using EduChemSuite.API.Dao;
using EduChemSuite.API.Entities;
using EduChemSuite.API.Models;

namespace EduChemSuite.API.Services;

public interface IQuestionService
{
    Task<QuestionModel?> GetById(Guid id);
    Task<QuestionModel> Create(QuestionModel question);
    Task<QuestionModel?> Update(QuestionModel question);
    Task<IEnumerable<QuestionModel>> FindById(Guid id);
    Task<IEnumerable<QuestionModel>> SearchTags(IEnumerable<string> tags);
    Task<IEnumerable<QuestionModel>> ListByUser(Guid userId);
    Task<IEnumerable<QuestionModel>> ListAll(bool includeInactive);
    Task<QuestionModel> ToggleActive(Guid id);
    Task<bool> Delete(Guid id);
}

public class QuestionService(IQuestionRepository questionRepository, IMapper mapper) : IQuestionService
{
    public async Task<QuestionModel?> GetById(Guid id)
    {
        var question = await questionRepository.GetById(id);
        if (question is null)
            throw new KeyNotFoundException("Question not found");
        return mapper.Map<QuestionModel>(question);
    }

    public async Task<QuestionModel> Create(QuestionModel questionModel)
    {
        var question = mapper.Map<Question>(questionModel);
        if (question is null)
            throw new KeyNotFoundException("Question could not be created");
        return mapper.Map<QuestionModel>(await questionRepository.Create(question));
    }

    public async Task<QuestionModel?> Update(QuestionModel questionModel)
    {
        var question = mapper.Map<Question>(questionModel);
        return mapper.Map<QuestionModel>(await questionRepository.Update(question));
    }

    public async Task<IEnumerable<QuestionModel>> FindById(Guid id)
    {
        return mapper.Map<IEnumerable<QuestionModel>>(await questionRepository.FindById(id));
    }

    public async Task<IEnumerable<QuestionModel>> SearchTags(IEnumerable<string> tags)
    {
        return mapper.Map<IEnumerable<QuestionModel>>(await questionRepository.SearchTags(tags));
    }

    public async Task<IEnumerable<QuestionModel>> ListByUser(Guid userId)
    {
        return mapper.Map<IEnumerable<QuestionModel>>(await questionRepository.ListByUser(userId));
    }

    public async Task<IEnumerable<QuestionModel>> ListAll(bool includeInactive)
    {
        return mapper.Map<IEnumerable<QuestionModel>>(await questionRepository.ListAll(includeInactive));
    }

    public async Task<QuestionModel> ToggleActive(Guid id)
    {
        return mapper.Map<QuestionModel>(await questionRepository.ToggleActive(id));
    }

    public async Task<bool> Delete(Guid id)
    {
        return await questionRepository.Delete(id);
    }
}
