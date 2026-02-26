using AutoMapper;
using EduChemSuite.API.Dao;
using EduChemSuite.API.Entities;
using EduChemSuite.API.Models;

namespace EduChemSuite.API.Services;

public interface IExamService
{
    Task<ExamModel?> GetById(Guid id);
    Task<ExamModel> Create(ExamModel exam);
    Task<ExamModel?> Update(ExamModel exam);
    Task<IEnumerable<ExamModel?>> Find(Guid id);
}

public class ExamService(IExamRepository examRepository, IMapper mapper)
    : IExamService
{
    public async Task<ExamModel?> GetById(Guid id)
    {
        return mapper.Map<ExamModel>(await examRepository.GetById(id));
    }

    public async Task<ExamModel> Create(ExamModel exam)
    {
        return mapper.Map<ExamModel>(await examRepository.Create(mapper.Map<Exam>(exam)));
    }

    public async Task<ExamModel?> Update(ExamModel exam)
    {
        return mapper.Map<ExamModel>(await examRepository.Update(mapper.Map<Exam>(exam)));
    }

    public async Task<IEnumerable<ExamModel?>> Find(Guid id)
    {
        return mapper.Map<IEnumerable<ExamModel?>>(await examRepository.Find(id));
    }
}
