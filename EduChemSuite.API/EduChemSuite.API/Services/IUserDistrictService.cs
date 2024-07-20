using System.Collections;
using EduChemSuite.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduChemSuite.API.Services;

public interface IUserDistrictService
{
    Task<IEnumerable<UserDistrict>> GetByDistrict(Guid districtId);
    Task<IEnumerable<UserDistrict>> GetByUser(Guid userId);
}

public class UserDistrictService(DbSet<UserDistrict> userDistricts) :IUserDistrictService
{
    public Task<IEnumerable<UserDistrict>> GetByDistrict(Guid districtId)
    {
        return Task.FromResult<IEnumerable<UserDistrict>>(userDistricts.Where(x => x.DistrictId == districtId));
    }

    public Task<IEnumerable<UserDistrict>> GetByUser(Guid userId)
    {
        return Task.FromResult<IEnumerable<UserDistrict>>(userDistricts.Where(x => x.UserId == userId));
    }
}