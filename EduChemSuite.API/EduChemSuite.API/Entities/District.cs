namespace EduChemSuite.API.Entities;

public class District : BaseEntity
{
    public required String DistrictName { get; set; }
    public virtual ICollection<DistrictSchools>? Schools { get; set; }
    public virtual ICollection<UserDistrict>? Administrators { get; set; }
}