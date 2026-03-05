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
    Task<bool> RemoveUserFromSchool(Guid schoolId, Guid userId);
    Task<bool> Delete(Guid id);
}

public class SchoolRepository(Context context)
    : BaseService<School>(context), ISchoolRepository
{
    private readonly Context _context = context;

    public new async Task<School?> GetById(Guid id)
    {
        return await _context.Schools
            .AsNoTracking()
            .AsSplitQuery()
            .Include(s => s.DistrictSchools)
            .ThenInclude(ds => ds.District)
            .Include(s => s.UserSchools)
            .ThenInclude(us => us.User)
            .FirstOrDefaultAsync(s => s.Id == id);
    }

    public async Task<IEnumerable<School>> List()
    {
        return await _context.Schools
            .AsNoTracking()
            .AsSplitQuery()
            .Where(s => s.IsActive)
            .Include(s => s.DistrictSchools)
            .ThenInclude(ds => ds.District)
            .Include(s => s.UserSchools)
            .ThenInclude(us => us.User)
            .ToListAsync();
    }

    public async Task<bool> Delete(Guid id)
    {
        var school = await _context.Schools.FirstOrDefaultAsync(s => s.Id == id);
        if (school == null) return false;
        school.IsActive = false;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RemoveUserFromSchool(Guid schoolId, Guid userId)
    {
        var userSchool = await _context.UserSchools
            .FirstOrDefaultAsync(us => us.SchoolId == schoolId && us.UserId == userId);

        if (userSchool == null) return false;

        _context.UserSchools.Remove(userSchool);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<School?> AddUserToSchool(UserSchool userSchool)
    {
        var school = await _context.Schools.Include(school => school.UserSchools)
            .FirstOrDefaultAsync(x => x.Id == userSchool.SchoolId);

        if (school != null && (school is { UserSchools: null } || school.UserSchools.Count == 0))
            school.UserSchools = new List<UserSchool>();

        if (school is { UserSchools: not null } && school.UserSchools.All(x => x.UserId != userSchool.UserId))
            school.UserSchools.Add(userSchool);

        await _context.SaveChangesAsync();
        return school;
    }
}
