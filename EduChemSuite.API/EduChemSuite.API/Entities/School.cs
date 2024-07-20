using System.ComponentModel.DataAnnotations.Schema;

namespace EduChemSuite.API.Entities;

public class School : BaseEntity
{
    public required String Name { get; set; }
    public ICollection<User>? Staff { get; set; }
    public ICollection<User>? Students { get; set; }
    [ForeignKey("DistrictId")] public required Guid DistrictId { get; set; }
    public District? District { get; set; }
    public virtual ICollection<UserSchool>? UserSchools { get; set; }
}