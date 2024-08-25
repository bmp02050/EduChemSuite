namespace EduChemSuite.API.Models;

public class DistrictSchoolsModel
{
        public Guid DistrictId { get; set; }
        public virtual DistrictModel? District { get; set; }
        public Guid SchoolId { get; set; }
        public virtual SchoolModel? School { get; set; }
}