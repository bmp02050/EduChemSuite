namespace EduChemSuite.API.Models;

public class DistrictModel : BaseModel
{
    public required String DistrictName { get; set; }
    public ICollection<UserModel>? Administrators { get; set; }
    public ICollection<SchoolModel>? Schools { get; set; }
}