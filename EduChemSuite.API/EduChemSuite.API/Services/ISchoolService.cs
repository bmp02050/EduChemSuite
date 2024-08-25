using EduChemSuite.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduChemSuite.API.Services;

public interface ISchoolService : IBaseService<School>
{
    Task<IEnumerable<School>> List();
    Task<School?> AddUserToSchool(UserSchool userSchool);
}

public class SchoolService(Context context)
    : BaseService<School>(context), ISchoolService
{
    private readonly Context _context = context;

    public async Task<IEnumerable<School>> List()
    {
        return await _context.Schools.ToListAsync();
    }

    public async Task<School?> AddUserToSchool(UserSchool userSchool)
    {
        var school = await _context.Schools.Include(school => school.UserSchools)
            .FirstOrDefaultAsync(x => x.Id == userSchool.SchoolId);
        
        if (school != null && (school is { UserSchools: null } || school.UserSchools.Count == 0))
            school.UserSchools = new List<UserSchool>();
        
        if (school is { UserSchools: not null } && school.UserSchools.All(x => x.SchoolId != userSchool.SchoolId))
            school?.UserSchools?.Add(userSchool);

        await _context.SaveChangesAsync();
        return school;
    }
}