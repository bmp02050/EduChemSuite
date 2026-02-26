using AutoMapper;
using EduChemSuite.API.Dao;
using EduChemSuite.API.Entities;
using EduChemSuite.API.Models;

namespace EduChemSuite.API.Services;

public interface IImageTypeService
{
    Task<ImageTypeModel?> GetById(Guid id);
    Task<ImageTypeModel> Create(ImageTypeModel imageType);
    Task<ImageTypeModel?> Update(ImageTypeModel imageType);
    Task<IEnumerable<ImageTypeModel>> List();
}

public class ImageTypeService(IImageTypeRepository imageTypeRepository, IMapper mapper)
    : IImageTypeService
{
    public async Task<ImageTypeModel?> GetById(Guid id)
    {
        return mapper.Map<ImageTypeModel>(await imageTypeRepository.GetById(id));
    }

    public async Task<ImageTypeModel> Create(ImageTypeModel imageType)
    {
        return mapper.Map<ImageTypeModel>(await imageTypeRepository.Create(mapper.Map<ImageType>(imageType)));
    }

    public async Task<ImageTypeModel?> Update(ImageTypeModel imageType)
    {
        return mapper.Map<ImageTypeModel>(await imageTypeRepository.Update(mapper.Map<ImageType>(imageType)));
    }

    public async Task<IEnumerable<ImageTypeModel>> List()
    {
        return mapper.Map<IEnumerable<ImageTypeModel>>(await imageTypeRepository.List());
    }
}
