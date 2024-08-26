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
    public Task<IEnumerable<QuestionModel>> FindById(Guid id);
    public Task<IEnumerable<QuestionModel>> SearchTags(IEnumerable<String> tags);
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

    public async Task<QuestionModel?> Update(QuestionModel question)
    {
        throw new NotImplementedException();
    }

    public async Task<IEnumerable<QuestionModel>> FindById(Guid id)
    {
        throw new NotImplementedException();
    }

    public async Task<IEnumerable<QuestionModel>> SearchTags(IEnumerable<string> tags)
    {
        throw new NotImplementedException();
    }
}