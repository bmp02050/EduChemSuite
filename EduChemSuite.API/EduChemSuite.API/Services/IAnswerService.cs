using AutoMapper;
using EduChemSuite.API.Dao;
using EduChemSuite.API.Entities;
using EduChemSuite.API.Models;

namespace EduChemSuite.API.Services;

public interface IAnswerService
{
    Task<AnswerModel?> GetById(Guid id);
    Task<AnswerModel> Create(AnswerModel answer);
    Task<AnswerModel?> Update(AnswerModel answer);
    Task<IEnumerable<AnswerModel>> ListByQuestion(Guid questionId);
}

public class AnswerService(IAnswerRepository answerRepository, IMapper mapper)
    : IAnswerService
{
    public async Task<AnswerModel?> GetById(Guid id)
    {
        return mapper.Map<AnswerModel>(await answerRepository.GetById(id));
    }

    public async Task<AnswerModel> Create(AnswerModel answer)
    {
        return mapper.Map<AnswerModel>(await answerRepository.Create(mapper.Map<Answer>(answer)));
    }

    public async Task<AnswerModel?> Update(AnswerModel answer)
    {
        return mapper.Map<AnswerModel>(await answerRepository.Update(mapper.Map<Answer>(answer)));
    }

    public async Task<IEnumerable<AnswerModel>> ListByQuestion(Guid questionId)
    {
        return mapper.Map<IEnumerable<AnswerModel>>(await answerRepository.ListByQuestion(questionId));
    }
}
