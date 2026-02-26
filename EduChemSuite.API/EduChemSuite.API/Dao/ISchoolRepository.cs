using EduChemSuite.API.Entities;
using EduChemSuite.API.Services;
using Microsoft.EntityFrameworkCore;

namespace EduChemSuite.API.Dao;

public interface ISchoolRepository
{
    Task<School?> GetById(Guid id);
    Task<School> Create(School school);
    Task<School?> Update(School school);
    Task<IEnumerable<School>> List();
    Task<School?> AddUserToSchool(UserSchool userSchool);
}

public class SchoolRepository(Context context)
    : BaseService<School>(context), ISchoolRepository
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
            school.UserSchools.Add(userSchool);

        await _context.SaveChangesAsync();
        return school;
    }
}
