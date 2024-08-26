using System.ComponentModel.DataAnnotations.Schema;
using System.Runtime.Serialization;

namespace EduChemSuite.API.Entities;

public class User : BaseEntity
{
    public required String FirstName { get; set; }
    public required String LastName { get; set; }
    public required String Address1 { get; set; }
    public String? Address2 { get; set; }
    public String? Address3 { get; set; }
    public required String City { get; set; }
    public required String State { get; set; }
    public required String Country { get; set; }
    public required String Zip { get; set; }
    public required String Phone { get; set; }
    public required string Email { get; set; }
    public required AccountType AccountType { get; set; }
    [IgnoreDataMember] public required byte[] PasswordHash { get; set; }
    [IgnoreDataMember] public required byte[] PasswordSalt { get; set; }
    [IgnoreDataMember] public DateTime? CreateDate { get; set; }
    [IgnoreDataMember] public DateTime? UpdatedDate { get; set; }
    public Boolean VerifiedEmail { get; set; }
    public virtual ICollection<Exam>? Exams { get; set; }
    public virtual ICollection<Grade>? Grades { get; set; }
    public virtual ICollection<ExamResponse>? ExamResponses { get; set; }
    public virtual ICollection<Question>? Questions { get; set; }
    public virtual ICollection<UserSchool>? UserSchools { get; set; }
    public virtual ICollection<UserDistrict>? UserDistricts { get; set; }
}