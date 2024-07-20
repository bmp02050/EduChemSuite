using EduChemSuite.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduChemSuite.API.Services;

public interface ITagService : IBaseService<Tag>
{
    Task<IEnumerable<Tag>> List();
}
public class TagService(Context context, DbSet<Tag> tags)
    : BaseService<Tag>(context, tags), ITagService
{
    private readonly DbSet<Tag> _tags = tags;

    public Task<IEnumerable<Tag>> List()
    {
        return Task.FromResult<IEnumerable<Tag>>(_tags);
    }
}