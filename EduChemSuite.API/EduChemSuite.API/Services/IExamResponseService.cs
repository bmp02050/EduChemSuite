using AutoMapper;
using EduChemSuite.API.Dao;
using EduChemSuite.API.Entities;
using EduChemSuite.API.Models;

namespace EduChemSuite.API.Services;

public interface IExamResponseService
{
    Task<ExamResponseModel?> GetById(Guid id);
    Task<ExamResponseModel> Create(ExamResponseModel examResponse);
    Task<ExamResponseModel?> Update(ExamResponseModel examResponse);
    Task<IEnumerable<ExamResponseModel>> Find(Guid id);
    Task<IEnumerable<ExamResponseModel>> ListByExam(Guid examId);
    Task<IEnumerable<ExamResponseModel>> ListByUser(Guid userId);
    Task<ExamResponseModel?> FindByExamUserQuestion(Guid examId, Guid userId, Guid questionId);
    Task<ExamResponseModel?> FindByExamUserExamQuestion(Guid examId, Guid userId, Guid examQuestionId);
    Task<IEnumerable<ExamResponseModel>> ListByExamAndUser(Guid examId, Guid userId);
    Task<bool> Delete(Guid id);
    Task<int> DeleteByExamAndUser(Guid examId, Guid userId);
}

public class ExamResponseService(IExamResponseRepository examResponseRepository, IMapper mapper)
    : IExamResponseService
{
    public async Task<ExamResponseModel?> GetById(Guid id)
    {
        return mapper.Map<ExamResponseModel>(await examResponseRepository.GetById(id));
    }

    public async Task<ExamResponseModel> Create(ExamResponseModel examResponse)
    {
        return mapper.Map<ExamResponseModel>(await examResponseRepository.Create(mapper.Map<ExamResponse>(examResponse)));
    }

    public async Task<ExamResponseModel?> Update(ExamResponseModel examResponse)
    {
        return mapper.Map<ExamResponseModel>(await examResponseRepository.Update(mapper.Map<ExamResponse>(examResponse)));
    }

    public async Task<IEnumerable<ExamResponseModel>> Find(Guid id)
    {
        return mapper.Map<IEnumerable<ExamResponseModel>>(await examResponseRepository.Find(id));
    }

    public async Task<IEnumerable<ExamResponseModel>> ListByExam(Guid examId)
    {
        return mapper.Map<IEnumerable<ExamResponseModel>>(await examResponseRepository.ListByExam(examId));
    }

    public async Task<IEnumerable<ExamResponseModel>> ListByUser(Guid userId)
    {
        return mapper.Map<IEnumerable<ExamResponseModel>>(await examResponseRepository.ListByUser(userId));
    }

    public async Task<ExamResponseModel?> FindByExamUserQuestion(Guid examId, Guid userId, Guid questionId)
    {
        return mapper.Map<ExamResponseModel>(await examResponseRepository.FindByExamUserQuestion(examId, userId, questionId));
    }

    public async Task<ExamResponseModel?> FindByExamUserExamQuestion(Guid examId, Guid userId, Guid examQuestionId)
    {
        return mapper.Map<ExamResponseModel>(await examResponseRepository.FindByExamUserExamQuestion(examId, userId, examQuestionId));
    }

    public async Task<IEnumerable<ExamResponseModel>> ListByExamAndUser(Guid examId, Guid userId)
    {
        return mapper.Map<IEnumerable<ExamResponseModel>>(await examResponseRepository.ListByExamAndUser(examId, userId));
    }

    public async Task<bool> Delete(Guid id)
    {
        return await examResponseRepository.Delete(id);
    }

    public async Task<int> DeleteByExamAndUser(Guid examId, Guid userId)
    {
        return await examResponseRepository.DeleteByExamAndUser(examId, userId);
    }
}
