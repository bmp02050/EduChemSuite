using EduChemSuite.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduChemSuite.API.Services;

public interface IUserSchoolService : IBaseService<UserSchool>
{
    Task<IEnumerable<UserSchool>> GetBySchool(Guid schoolId);
    Task<IEnumerable<UserSchool>> GetByUser(Guid userId);
}
public class UserSchoolService(Context context) :  
    BaseService<UserSchool>(context), IUserSchoolService
{
    private readonly Context _context = context;

    public Task<IEnumerable<UserSchool>> GetBySchool(Guid schoolId)
    {
        return Task.FromResult<IEnumerable<UserSchool>>(_context.UserSchools.Where(x => x.SchoolId == schoolId));
    }

    public Task<IEnumerable<UserSchool>> GetByUser(Guid userId)
    {
        return Task.FromResult<IEnumerable<UserSchool>>(_context.UserSchools.Where(x => x.UserId == userId));
    }
}