namespace EduChemSuite.API.Entities;

public class DistrictSchools
{
    public Guid DistrictId { get; set; }
    public virtual District? District { get; set; }
    public Guid SchoolId { get; set; }
    public virtual School? School { get; set; }
}