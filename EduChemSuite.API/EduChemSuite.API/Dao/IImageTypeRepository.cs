using EduChemSuite.API.Entities;
using EduChemSuite.API.Services;
using Microsoft.EntityFrameworkCore;

namespace EduChemSuite.API.Dao;

public interface IImageTypeRepository
{
    Task<ImageType?> GetById(Guid id);
    Task<ImageType> Create(ImageType imageType);
    Task<ImageType?> Update(ImageType imageType);
    Task<IEnumerable<ImageType>> List();
}

public class ImageTypeRepository(Context context)
    : BaseService<ImageType>(context), IImageTypeRepository
{
    private readonly Context _context = context;

    public async Task<IEnumerable<ImageType>> List()
    {
        return await _context.ImageTypes.ToListAsync();
    }
}
