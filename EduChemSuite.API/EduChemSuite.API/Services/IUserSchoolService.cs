using AutoMapper;
using EduChemSuite.API.Dao;
using EduChemSuite.API.Models;

namespace EduChemSuite.API.Services;

public interface IUserSchoolService
{
    Task<IEnumerable<UserSchoolModel>> GetBySchool(Guid schoolId);
    Task<IEnumerable<UserSchoolModel>> GetByUser(Guid userId);
}

public class UserSchoolService(IUserSchoolRepository userSchoolRepository, IMapper mapper)
    : IUserSchoolService
{
    public async Task<IEnumerable<UserSchoolModel>> GetBySchool(Guid schoolId)
    {
        return mapper.Map<IEnumerable<UserSchoolModel>>(await userSchoolRepository.GetBySchool(schoolId));
    }

    public async Task<IEnumerable<UserSchoolModel>> GetByUser(Guid userId)
    {
        return mapper.Map<IEnumerable<UserSchoolModel>>(await userSchoolRepository.GetByUser(userId));
    }
}
