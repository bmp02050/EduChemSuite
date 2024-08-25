namespace EduChemSuite.API.Entities;

public class UserDistrict
{
    public Guid UserId { get; set; }
    public virtual User? User { get; set; }
    public Guid DistrictId { get; set; }
    public virtual District? District { get; set; }
}