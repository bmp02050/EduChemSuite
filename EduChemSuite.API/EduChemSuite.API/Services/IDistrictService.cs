using AutoMapper;
using EduChemSuite.API.Dao;
using EduChemSuite.API.Entities;
using EduChemSuite.API.Models;

namespace EduChemSuite.API.Services;

public interface IDistrictService
{
    Task<IEnumerable<DistrictModel>> List(Guid? userId);
    Task<DistrictModel?> AddUserToDistrict(Guid districtId, Guid userId);
    Task<bool> RemoveUserFromDistrict(Guid districtId, Guid userId);
    Task<DistrictModel?> AddSchoolToDistrict(DistrictSchoolsModel districtSchoolModel);
    Task<DistrictModel?> GetById(Guid id);
    Task<DistrictModel> Create(DistrictModel district);
    Task<DistrictModel?> Update(DistrictModel district);
    Task<bool> Delete(Guid id);
}

public class DistrictService(IDistrictRepository districtRepository, IMapper mapper, ILogger<DistrictService> logger)
    : IDistrictService
{
    public async Task<IEnumerable<DistrictModel>> List(Guid? userId)
    {
        return mapper.Map<IEnumerable<DistrictModel>>(await districtRepository.List(userId));
    }

    public async Task<DistrictModel?> AddUserToDistrict(Guid districtId, Guid userId)
    {
        var district = await districtRepository.AddUserToDistrict(districtId, userId);
        if (district == null)
        {
            logger.LogError("District returned NULL");
            return null;
        }

        return mapper.Map<DistrictModel>(district);
    }


    public async Task<bool> RemoveUserFromDistrict(Guid districtId, Guid userId)
    {
        return await districtRepository.RemoveUserFromDistrict(districtId, userId);
    }

    public async Task<DistrictModel?> AddSchoolToDistrict(DistrictSchoolsModel districtSchoolModel)
    {
        var districtSchool = mapper.Map<DistrictSchools>(districtSchoolModel);
        return mapper.Map<DistrictModel>(await districtRepository.AddSchoolToDistrict(districtSchool));
    }

    public async Task<DistrictModel?> GetById(Guid id)
    {
        return mapper.Map<DistrictModel>(await districtRepository.GetById(id));
    }

    public async Task<DistrictModel> Create(DistrictModel district)
    {
        return mapper.Map<DistrictModel>(await districtRepository.Create(mapper.Map<District>(district)));
    }

    public async Task<DistrictModel?> Update(DistrictModel district)
    {
        return mapper.Map<DistrictModel>(await districtRepository.Update(mapper.Map<District>(district)));
    }

    public async Task<bool> Delete(Guid id)
    {
        return await districtRepository.Delete(id);
    }
}