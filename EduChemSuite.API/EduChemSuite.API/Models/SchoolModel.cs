namespace EduChemSuite.API.Models;

public class SchoolModel : BaseModel
{
    public required String Name { get; set; }
    public ICollection<UserModel>? Staff { get; set; }
    public ICollection<UserModel>? Students { get; set; }
    public required Guid DistrictId { get; set; }
    public DistrictModel? District { get; set; }
}