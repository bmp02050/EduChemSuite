namespace EduChemSuite.API.Models;

public class UserSchoolModel
{
    public Guid UserId { get; set; }
    public UserModel? User { get; set; }
    public Guid SchoolId { get; set; }
    public SchoolModel? School { get; set; }
}