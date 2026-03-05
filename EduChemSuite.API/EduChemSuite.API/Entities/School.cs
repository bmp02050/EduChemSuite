using System.ComponentModel.DataAnnotations.Schema;

namespace EduChemSuite.API.Entities;

public class School : BaseEntity
{
    public required String Name { get; set; }
    public virtual ICollection<UserSchool>? UserSchools { get; set; }
    public virtual ICollection<DistrictSchools>? DistrictSchools { get; set; }
}