namespace EduChemSuite.API.Models;

public class UserDistrictModel
{
    public Guid UserId { get; set; }
    public UserModel? User { get; set; }
    public Guid DistrictId { get; set; }
    public DistrictModel? District { get; set; }
}