using EduChemSuite.API.Entities;
using EduChemSuite.API.Services;
using Microsoft.EntityFrameworkCore;

namespace EduChemSuite.API.Dao;

public interface IMolecularStructureRepository
{
    Task<MolecularStructure?> GetById(Guid id);
    Task<MolecularStructure> Create(MolecularStructure entity);
    Task<MolecularStructure?> Update(MolecularStructure entity);
    Task<IEnumerable<MolecularStructure>> ListAll();
    Task<IEnumerable<MolecularStructure>> ListByUser(Guid userId);
    Task<bool> Delete(Guid id);
}

public class MolecularStructureRepository(Context context)
    : BaseService<MolecularStructure>(context), IMolecularStructureRepository
{
    private readonly Context _context = context;

    public new async Task<MolecularStructure?> GetById(Guid id)
    {
        return await _context.MolecularStructures
            .AsNoTracking()
            .Include(ms => ms.User)
            .FirstOrDefaultAsync(ms => ms.Id == id && ms.IsActive);
    }

    public new async Task<MolecularStructure> Create(MolecularStructure entity)
    {
        entity.IsActive = true;
        var entry = await _context.MolecularStructures.AddAsync(entity);
        await _context.SaveChangesAsync();
        return entry.Entity;
    }

    public new async Task<MolecularStructure?> Update(MolecularStructure entity)
    {
        var existing = await _context.MolecularStructures.FindAsync(entity.Id);
        if (existing == null || !existing.IsActive) return null;

        existing.Name = entity.Name;
        existing.GraphData = entity.GraphData;
        existing.ImageData = entity.ImageData;
        _context.MolecularStructures.Update(existing);
        await _context.SaveChangesAsync();

        return await GetById(existing.Id);
    }

    public async Task<IEnumerable<MolecularStructure>> ListAll()
    {
        return await _context.MolecularStructures
            .AsNoTracking()
            .Include(ms => ms.User)
            .Where(ms => ms.IsActive)
            .OrderByDescending(ms => ms.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<MolecularStructure>> ListByUser(Guid userId)
    {
        return await _context.MolecularStructures
            .AsNoTracking()
            .Include(ms => ms.User)
            .Where(ms => ms.IsActive && ms.UserId == userId)
            .OrderByDescending(ms => ms.CreatedAt)
            .ToListAsync();
    }

    public async Task<bool> Delete(Guid id)
    {
        var entity = await _context.MolecularStructures.FindAsync(id);
        if (entity == null || !entity.IsActive) return false;
        entity.IsActive = false;
        _context.MolecularStructures.Update(entity);
        await _context.SaveChangesAsync();
        return true;
    }
}
