using EduChemSuite.API.Entities;
using EduChemSuite.API.Services;
using Microsoft.EntityFrameworkCore;

namespace EduChemSuite.API.Dao;

public interface IDistrictRepository
{
    Task<IEnumerable<District>> List(Guid? userId);
    Task<District?> AddUserToDistrict(Guid districtId, Guid userId);
    Task<bool> RemoveUserFromDistrict(Guid districtId, Guid userId);
    Task<District?> AddSchoolToDistrict(DistrictSchools districtSchool);
    Task<District?> GetById(Guid id);
    Task<District> Create(District district);
    Task<District?> Update(District district);
    Task<bool> Delete(Guid id);
}

public class DistrictRepository(Context context, ILogger<DistrictRepository> logger)
    : BaseService<District>(context), IDistrictRepository
{
    private readonly Context _context = context;

    public new async Task<District?> GetById(Guid districtId)
    {
        return await _context.Districts
            .AsNoTracking()
            .AsSplitQuery()
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
            return await _context.Districts
                .AsNoTracking()
                .AsSplitQuery()
                .Where(d => d.IsActive)
                .Include(d => d.Schools)
                .ThenInclude(a => a.School)
                .Include(d => d.Administrators)
                .ThenInclude(a => a.User)
                .ToListAsync();

        return await _context.Districts
            .AsNoTracking()
            .AsSplitQuery()
            .Where(d => d.IsActive)
            .Where(x => x.Administrators != null && x.Administrators.Any(y => y.UserId == userId))
            .Include(d => d.Schools)
            .ThenInclude(a => a.School)
            .Include(d => d.Administrators)
            .ThenInclude(a => a.User)
            .ToListAsync();
    }

    public async Task<bool> Delete(Guid id)
    {
        var district = await _context.Districts.FirstOrDefaultAsync(d => d.Id == id);
        if (district == null) return false;
        district.IsActive = false;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<District?> AddUserToDistrict(Guid districtId, Guid userId)
    {
        var district = await _context.Districts
            .Include(district => district.Administrators)
            .FirstOrDefaultAsync(x => x.Id == districtId);

        if (district == null)
        {
            logger.LogError("Could not find district with ID {DistrictId}", districtId);
            return null;
        }

        district.Administrators ??= new List<UserDistrict>();

        district.Administrators.Add(new UserDistrict()
        {
            DistrictId = districtId,
            UserId = userId
        });

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException("Could not add user to district.", ex);
        }

        return district;
    }


    public async Task<bool> RemoveUserFromDistrict(Guid districtId, Guid userId)
    {
        var userDistrict = await _context.UserDistricts
            .FirstOrDefaultAsync(ud => ud.DistrictId == districtId && ud.UserId == userId);

        if (userDistrict == null) return false;

        _context.UserDistricts.Remove(userDistrict);
        await _context.SaveChangesAsync();
        return true;
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