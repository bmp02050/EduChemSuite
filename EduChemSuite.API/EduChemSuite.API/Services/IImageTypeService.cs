using EduChemSuite.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduChemSuite.API.Services;

public interface IImageTypeService : IBaseService<ImageType>
{
    Task<IEnumerable<ImageType>> List();
}

public class ImageTypeService(Context context, DbSet<ImageType> imageTypes)
    : BaseService<ImageType>(context, imageTypes), IImageTypeService
{
    private readonly Context _context = context;

    public async Task<IEnumerable<ImageType>> List()
    {
        return await _context.ImageTypes.ToListAsync();
    }
}