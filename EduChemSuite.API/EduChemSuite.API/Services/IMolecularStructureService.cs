using AutoMapper;
using EduChemSuite.API.Dao;
using EduChemSuite.API.Entities;
using EduChemSuite.API.Models;

namespace EduChemSuite.API.Services;

public interface IMolecularStructureService
{
    Task<MolecularStructureModel?> GetById(Guid id);
    Task<MolecularStructureModel> Create(MolecularStructureModel model);
    Task<MolecularStructureModel?> Update(MolecularStructureModel model);
    Task<IEnumerable<MolecularStructureModel>> ListAll();
    Task<IEnumerable<MolecularStructureModel>> ListByUser(Guid userId);
    Task<bool> Delete(Guid id);
}

public class MolecularStructureService(IMolecularStructureRepository repository, IMapper mapper)
    : IMolecularStructureService
{
    public async Task<MolecularStructureModel?> GetById(Guid id)
    {
        return mapper.Map<MolecularStructureModel>(await repository.GetById(id));
    }

    public async Task<MolecularStructureModel> Create(MolecularStructureModel model)
    {
        var entity = mapper.Map<MolecularStructure>(model);
        return mapper.Map<MolecularStructureModel>(await repository.Create(entity));
    }

    public async Task<MolecularStructureModel?> Update(MolecularStructureModel model)
    {
        var entity = mapper.Map<MolecularStructure>(model);
        return mapper.Map<MolecularStructureModel>(await repository.Update(entity));
    }

    public async Task<IEnumerable<MolecularStructureModel>> ListAll()
    {
        return mapper.Map<IEnumerable<MolecularStructureModel>>(await repository.ListAll());
    }

    public async Task<IEnumerable<MolecularStructureModel>> ListByUser(Guid userId)
    {
        return mapper.Map<IEnumerable<MolecularStructureModel>>(await repository.ListByUser(userId));
    }

    public async Task<bool> Delete(Guid id)
    {
        return await repository.Delete(id);
    }
}
