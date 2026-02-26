using AutoMapper;
using EduChemSuite.API.Dao;
using EduChemSuite.API.Entities;
using EduChemSuite.API.Models;

namespace EduChemSuite.API.Services;

public interface ISchoolService
{
    Task<SchoolModel?> GetById(Guid id);
    Task<SchoolModel> Create(SchoolModel school);
    Task<SchoolModel?> Update(SchoolModel school);
    Task<IEnumerable<SchoolModel>> List();
    Task<SchoolModel?> AddUserToSchool(UserSchoolModel userSchoolModel);
}

public class SchoolService(ISchoolRepository schoolRepository, IMapper mapper)
    : ISchoolService
{
    public async Task<SchoolModel?> GetById(Guid id)
    {
        return mapper.Map<SchoolModel>(await schoolRepository.GetById(id));
    }

    public async Task<SchoolModel> Create(SchoolModel school)
    {
        return mapper.Map<SchoolModel>(await schoolRepository.Create(mapper.Map<School>(school)));
    }

    public async Task<SchoolModel?> Update(SchoolModel school)
    {
        return mapper.Map<SchoolModel>(await schoolRepository.Update(mapper.Map<School>(school)));
    }

    public async Task<IEnumerable<SchoolModel>> List()
    {
        return mapper.Map<IEnumerable<SchoolModel>>(await schoolRepository.List());
    }

    public async Task<SchoolModel?> AddUserToSchool(UserSchoolModel userSchoolModel)
    {
        var userSchool = mapper.Map<UserSchool>(userSchoolModel);
        return mapper.Map<SchoolModel>(await schoolRepository.AddUserToSchool(userSchool));
    }
}
