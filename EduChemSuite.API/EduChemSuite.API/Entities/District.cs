using Microsoft.EntityFrameworkCore;

namespace EduChemSuite.API.Entities;

public class District : BaseEntity
{
    public required String DistrictName { get; set; }
    public ICollection<User>? Administrators { get; set; }
    public ICollection<School>? Schools { get; set; }
    public virtual ICollection<UserDistrict>? UserDistricts { get; set; }
}