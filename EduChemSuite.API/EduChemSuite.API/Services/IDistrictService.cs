using EduChemSuite.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduChemSuite.API.Services;

public interface IDistrictService : IBaseService<District>
{
    Task<IEnumerable<District>> List(Guid? userId);
    Task<District?> AddUserToDistrict(Guid districtId, Guid userId);
    Task<District?> AddSchoolToDistrict(DistrictSchools districtSchool);
}

public class DistrictService(Context context)
    : BaseService<District>(context), IDistrictService
{
    private readonly Context _context = context;

    public new async Task<District?> GetById(Guid districtId)
    {
        return await _context.Districts
            .Include(d => d.Schools)
            .ThenInclude(a => a.School)
            .Include(d => d.Administrators)
            .ThenInclude(a => a.User)
            .FirstOrDefaultAsync(d => d.Id == districtId);
    }

    public new async Task<District> Create(District district)
    {
        var existingDistrict = await _context.Districts
            .Include(d => d.Schools)
            .ThenInclude(a => a.School)
            .Include(d => d.Administrators)
            .ThenInclude(a => a.User)
            .FirstOrDefaultAsync(d => d.Id == district.Id);

        if (existingDistrict != null)
        {
            // Update existing district
            existingDistrict.DistrictName = district.DistrictName;

            // Update Schools
            existingDistrict.Schools = district.Schools;

            // Update Administrators
            existingDistrict.Administrators = district.Administrators;

            _context.Districts.Update(existingDistrict);
        }
        else
        {
            // Create new district
            await _context.Districts.AddAsync(district);
        }

        await _context.SaveChangesAsync();
        return district;
    }

    public async Task<IEnumerable<District>> List(Guid? userId = null)
    {
        if (userId is null)
            return await _context.Districts.ToListAsync();

        return await _context.Districts
            .Where(x => x.Administrators != null && x.Administrators.Any(y => y.UserId == userId))
            .Include(d => d.Schools)
            .ThenInclude(a => a.School)
            .Include(d => d.Administrators)
            .ThenInclude(a => a.User)
            .ToListAsync();
    }

    public async Task<District?> AddUserToDistrict(Guid districtId, Guid userId)
    {
        var district = await _context.Districts.Include(district => district.Administrators)
            .FirstOrDefaultAsync(x => x.Id == districtId);
        if (district != null && (district is { Administrators: null } || district.Administrators.Count == 0))
            district.Administrators = new List<UserDistrict>();
        district?.Administrators?.Add(new UserDistrict()
        {
            DistrictId = districtId,
            UserId = userId
        });
        await _context.SaveChangesAsync();
        return district;
    }

    public async Task<District?> AddSchoolToDistrict(DistrictSchools districtSchools)
    {
        var district = await _context.Districts.Include(district => district.Schools)
            .FirstOrDefaultAsync(x => x.Id == districtSchools.DistrictId);

        if (district != null && (district is { Schools: null } || district.Schools.Count == 0))
            district.Schools = new List<DistrictSchools>();

        if (district is { Schools: not null } && 
            district.Schools.All(x => x.SchoolId != districtSchools.SchoolId))
        {
            district.Schools.Add(districtSchools);
            await _context.SaveChangesAsync();
        }
        return district;
    }
}