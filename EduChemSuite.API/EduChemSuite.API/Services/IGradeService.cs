using AutoMapper;
using EduChemSuite.API.Dao;
using EduChemSuite.API.Entities;
using EduChemSuite.API.Models;

namespace EduChemSuite.API.Services;

public interface IGradeService
{
    Task<GradeModel?> GetById(Guid id);
    Task<GradeModel> Create(GradeModel grade);
    Task<GradeModel?> Update(GradeModel grade);
    Task<IEnumerable<GradeModel?>> Find(Guid id);
}

public class GradeService(IGradeRepository gradeRepository, IMapper mapper)
    : IGradeService
{
    public async Task<GradeModel?> GetById(Guid id)
    {
        return mapper.Map<GradeModel>(await gradeRepository.GetById(id));
    }

    public async Task<GradeModel> Create(GradeModel grade)
    {
        return mapper.Map<GradeModel>(await gradeRepository.Create(mapper.Map<Grade>(grade)));
    }

    public async Task<GradeModel?> Update(GradeModel grade)
    {
        return mapper.Map<GradeModel>(await gradeRepository.Update(mapper.Map<Grade>(grade)));
    }

    public async Task<IEnumerable<GradeModel?>> Find(Guid id)
    {
        return mapper.Map<IEnumerable<GradeModel?>>(await gradeRepository.Find(id));
    }
}
