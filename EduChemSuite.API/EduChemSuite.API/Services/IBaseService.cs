using Microsoft.EntityFrameworkCore;

namespace EduChemSuite.API.Services;

public interface IBaseService<T>
{
    Task<T?> GetById(Guid id);
    Task<T> Create(T t);
    Task<T?> Update(T t);
}

public class BaseService<T>(Context context) : IBaseService<T> where T : class
{
    public async Task<T?> GetById(Guid id)
    {
        var entityType = typeof(T);
        var keyProperty = entityType.GetProperty("Id");
        if (keyProperty == null)
        {
            throw new Exception($"Entity {entityType.Name} does not have an Id property.");
        }

        return await context.Set<T>()
            .FirstOrDefaultAsync(x => EF.Property<Guid>(x, "Id") == id);
    }

    public async Task<T> Create(T t)
    {
        var entityEntry = await context.Set<T>().AddAsync(t);
        await context.SaveChangesAsync();
        return entityEntry.Entity;
    }

    public async Task<T?> Update(T t)
    {
        var entityType = typeof(T);
        var keyProperty = entityType.GetProperty("Id");
        if (keyProperty == null)
        {
            throw new Exception($"Entity {entityType.Name} does not have an Id property.");
        }

        var id = (Guid)keyProperty.GetValue(t);

        var existingEntity = await GetById(id);
        if (existingEntity == null)
        {
            throw new Exception($"{entityType.Name} with ID {id} does not exist.");
        }

        context.Entry(existingEntity).CurrentValues.SetValues(t);
        await context.SaveChangesAsync();
        return await GetById(id);
    }
}