using EduChemSuite.API.Entities;
using EduChemSuite.API.Services;
using Microsoft.EntityFrameworkCore;

namespace EduChemSuite.API.Dao;

public interface ITagRepository
{
    Task<Tag?> GetById(Guid id);
    Task<Tag> Create(Tag tag);
    Task<Tag?> Update(Tag tag);
    Task<IEnumerable<Tag>> List();
}

public class TagRepository(Context context)
    : BaseService<Tag>(context), ITagRepository
{
    private readonly Context _context = context;

    public async Task<IEnumerable<Tag>> List()
    {
        return await _context.Tags.ToListAsync();
    }
}
