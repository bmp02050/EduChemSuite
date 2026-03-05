namespace EduChemSuite.API.Models;

public class DistrictModel : BaseModel
{
    public required String DistrictName { get; set; }
    public virtual ICollection<UserDistrictModel>? Administrators { get; set; }
    public virtual ICollection<DistrictSchoolsModel>? Schools { get; set; }
}