using AutoMapper;
using EduChemSuite.API.Dao;
using EduChemSuite.API.Entities;
using EduChemSuite.API.Models;

namespace EduChemSuite.API.Services;

public interface ITagService
{
    Task<TagModel?> GetById(Guid id);
    Task<TagModel> Create(TagModel tag);
    Task<TagModel?> Update(TagModel tag);
    Task<IEnumerable<TagModel>> List();
}

public class TagService(ITagRepository tagRepository, IMapper mapper)
    : ITagService
{
    public async Task<TagModel?> GetById(Guid id)
    {
        return mapper.Map<TagModel>(await tagRepository.GetById(id));
    }

    public async Task<TagModel> Create(TagModel tag)
    {
        return mapper.Map<TagModel>(await tagRepository.Create(mapper.Map<Tag>(tag)));
    }

    public async Task<TagModel?> Update(TagModel tag)
    {
        return mapper.Map<TagModel>(await tagRepository.Update(mapper.Map<Tag>(tag)));
    }

    public async Task<IEnumerable<TagModel>> List()
    {
        return mapper.Map<IEnumerable<TagModel>>(await tagRepository.List());
    }
}
