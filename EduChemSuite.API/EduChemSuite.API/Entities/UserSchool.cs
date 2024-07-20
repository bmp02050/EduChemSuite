namespace EduChemSuite.API.Entities;

public class UserSchool
{
    public Guid UserId { get; set; }
    public User? User { get; set; }
    public Guid SchoolId { get; set; }
    public School? School { get; set; }
}
