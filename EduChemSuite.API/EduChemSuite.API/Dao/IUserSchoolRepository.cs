using EduChemSuite.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduChemSuite.API.Dao;

public interface IUserSchoolRepository
{
    Task<IEnumerable<UserSchool>> GetBySchool(Guid schoolId);
    Task<IEnumerable<UserSchool>> GetByUser(Guid userId);
}

public class UserSchoolRepository(Context context) : IUserSchoolRepository
{
    public async Task<IEnumerable<UserSchool>> GetBySchool(Guid schoolId)
    {
        return await context.UserSchools
            .Where(x => x.SchoolId == schoolId)
            .ToListAsync();
    }

    public async Task<IEnumerable<UserSchool>> GetByUser(Guid userId)
    {
        return await context.UserSchools
            .Where(x => x.UserId == userId)
            .ToListAsync();
    }
}
