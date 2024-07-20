using EduChemSuite.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduChemSuite.API.Services;

public interface IDistrictService : IBaseService<District>
{
    Task<IEnumerable<District>> List();
}

public class DistrictService(Context context, DbSet<District> districts)
    : BaseService<District>(context, districts), IDistrictService
{
    private readonly Context _context = context;

    public async Task<IEnumerable<District>> List()
    {
        return await _context.Districts.ToListAsync();
    }
}