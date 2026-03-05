using AutoMapper;
using EduChemSuite.API.Dao;
using EduChemSuite.API.Entities;
using EduChemSuite.API.Models;

namespace EduChemSuite.API.Services;

public interface IInviteService
{
    List<AccountType> GetAllowedAccountTypes(AccountType inviterRole);
    Task<InvitePermissionsModel> GetInvitePermissions(Guid inviterId, AccountType inviterRole);
}

public class InviteService(
    IUserRepository userRepository,
    IDistrictService districtService,
    ISchoolService schoolService,
    IMapper mapper) : IInviteService
{
    public List<AccountType> GetAllowedAccountTypes(AccountType inviterRole)
    {
        return inviterRole switch
        {
            AccountType.Admin => new List<AccountType>
            {
                AccountType.Admin, AccountType.AdminStaff, AccountType.Staff, AccountType.Student
            },
            AccountType.AdminStaff => new List<AccountType>
            {
                AccountType.Staff, AccountType.Student
            },
            AccountType.Staff => new List<AccountType>
            {
                AccountType.Student
            },
            _ => new List<AccountType>()
        };
    }

    public async Task<InvitePermissionsModel> GetInvitePermissions(Guid inviterId, AccountType inviterRole)
    {
        var allowedTypes = GetAllowedAccountTypes(inviterRole);

        if (inviterRole == AccountType.Admin)
        {
            // Admin sees all districts and schools
            var allDistricts = await districtService.List(null);
            var allSchools = await schoolService.List();
            return new InvitePermissionsModel
            {
                AllowedAccountTypes = allowedTypes,
                AllowedDistricts = allDistricts.ToList(),
                AllowedSchools = allSchools.ToList(),
            };
        }

        // Non-admin elevated users see only their assigned orgs
        var inviter = await userRepository.GetById(inviterId);
        if (inviter is null)
            return new InvitePermissionsModel { AllowedAccountTypes = allowedTypes };

        var districts = inviter.UserDistricts?
            .Select(ud => mapper.Map<DistrictModel>(ud.District))
            .ToList() ?? new List<DistrictModel>();

        var schools = inviter.UserSchools?
            .Select(us => mapper.Map<SchoolModel>(us.School))
            .ToList() ?? new List<SchoolModel>();

        return new InvitePermissionsModel
        {
            AllowedAccountTypes = allowedTypes,
            AllowedDistricts = districts,
            AllowedSchools = schools,
        };
    }
}
