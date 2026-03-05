using EduChemSuite.API.Entities;

namespace EduChemSuite.API.Models;

public class InvitePermissionsModel
{
    public List<AccountType> AllowedAccountTypes { get; set; } = new();
    public List<DistrictModel>? AllowedDistricts { get; set; }
    public List<SchoolModel>? AllowedSchools { get; set; }
}
