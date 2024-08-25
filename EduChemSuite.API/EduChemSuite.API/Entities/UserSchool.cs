namespace EduChemSuite.API.Entities;

public class UserSchool
{
    public Guid UserId { get; set; }
    public virtual User? User { get; set; }
    public Guid SchoolId { get; set; }
    public virtual School? School { get; set; }
}