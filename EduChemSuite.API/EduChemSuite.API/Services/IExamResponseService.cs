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
}
