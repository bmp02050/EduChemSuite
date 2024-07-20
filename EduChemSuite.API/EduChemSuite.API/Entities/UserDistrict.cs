namespace EduChemSuite.API.Entities;

public class UserDistrict
{
    public Guid UserId { get; set; }
    public User? User { get; set; }
    public Guid DistrictId { get; set; }
    public District? District { get; set; }
}