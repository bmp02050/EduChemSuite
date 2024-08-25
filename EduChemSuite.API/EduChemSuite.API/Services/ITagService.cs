using EduChemSuite.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduChemSuite.API.Services;

public interface ITagService : IBaseService<Tag>
{
    Task<IEnumerable<Tag>> List();
}
public class TagService(Context context)
    : BaseService<Tag>(context), ITagService
{
    private readonly Context _context = context;

    public Task<IEnumerable<Tag>> List()
    {
        return Task.FromResult<IEnumerable<Tag>>(_context.Tags);
    }
}