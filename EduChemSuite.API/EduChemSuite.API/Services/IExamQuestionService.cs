using AutoMapper;
using EduChemSuite.API.Dao;
using EduChemSuite.API.Entities;
using EduChemSuite.API.Models;

namespace EduChemSuite.API.Services;

public interface IExamQuestionService
{
    Task<ExamQuestionModel?> GetById(Guid id);
    Task<ExamQuestionModel> Create(ExamQuestionModel examQuestion);
    Task<ExamQuestionModel?> Update(ExamQuestionModel examQuestion);
    Task<IEnumerable<ExamQuestionModel?>> Find(Guid id);
    Task<IEnumerable<ExamQuestionModel>> ListByExam(Guid examId);
    Task<ExamQuestionModel?> FindByExamAndQuestion(Guid examId, Guid questionId);
    Task<bool> Delete(Guid id);
}

public class ExamQuestionService(IExamQuestionRepository examQuestionRepository, IMapper mapper)
    : IExamQuestionService
{
    public async Task<ExamQuestionModel?> GetById(Guid id)
    {
        return mapper.Map<ExamQuestionModel>(await examQuestionRepository.GetById(id));
    }

    public async Task<ExamQuestionModel> Create(ExamQuestionModel examQuestion)
    {
        return mapper.Map<ExamQuestionModel>(await examQuestionRepository.Create(mapper.Map<ExamQuestion>(examQuestion)));
    }

    public async Task<ExamQuestionModel?> Update(ExamQuestionModel examQuestion)
    {
        return mapper.Map<ExamQuestionModel>(await examQuestionRepository.Update(mapper.Map<ExamQuestion>(examQuestion)));
    }

    public async Task<IEnumerable<ExamQuestionModel?>> Find(Guid id)
    {
        return mapper.Map<IEnumerable<ExamQuestionModel?>>(await examQuestionRepository.Find(id));
    }

    public async Task<IEnumerable<ExamQuestionModel>> ListByExam(Guid examId)
    {
        return mapper.Map<IEnumerable<ExamQuestionModel>>(await examQuestionRepository.ListByExam(examId));
    }

    public async Task<ExamQuestionModel?> FindByExamAndQuestion(Guid examId, Guid questionId)
    {
        return mapper.Map<ExamQuestionModel>(await examQuestionRepository.FindByExamAndQuestion(examId, questionId));
    }

    public async Task<bool> Delete(Guid id)
    {
        return await examQuestionRepository.Delete(id);
    }
}
