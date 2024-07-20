using EduChemSuite.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduChemSuite.API.Services;

public interface IUserSchoolService
{
    Task<IEnumerable<UserSchool>> GetBySchool(Guid schooldId);
    Task<IEnumerable<UserSchool>> GetByUser(Guid userId);
}
public class UserSchoolService(DbSet<UserSchool> userSchools) :IUserSchoolService
{
    public Task<IEnumerable<UserSchool>> GetBySchool(Guid schoolId)
    {
        return Task.FromResult<IEnumerable<UserSchool>>(userSchools.Where(x => x.SchoolId == schoolId));
    }

    public Task<IEnumerable<UserSchool>> GetByUser(Guid userId)
    {
        return Task.FromResult<IEnumerable<UserSchool>>(userSchools.Where(x => x.UserId == userId));
    }
}