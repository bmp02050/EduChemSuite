using System.ComponentModel.DataAnnotations;
using EduChemSuite.API.Entities;

namespace EduChemSuite.API.Models;

public class UserModel : BaseModel
{
    public AccountType AccountType { get; set; }
    [Required] public string Email { get; set; }
    [Required] public Boolean IsAdmin { get; set; }
    public virtual ICollection<QuestionModel>? Questions { get; set; }
    public virtual ICollection<ExamModel>? Exams { get; set; }
    public virtual ICollection<ExamResponseModel>? ExamResponses { get; set; }
    public virtual ICollection<UserSchoolModel>? UserSchools { get; set; }
    public virtual ICollection<UserDistrictModel>? UserDistricts { get; set; }
    [Required] public String FirstName { get; set; }
    public Boolean VerifiedEmail { get; set; }
    [Required] public String LastName { get; set; }
    [Required] public String Password { get; set; }

    [Required] public String? Address1 { get; set; }
    public String? Address2 { get; set; }
    public String? Address3 { get; set; }
    [Required] public String? City { get; set; }
    [Required] public String? State { get; set; }
    [Required] public String? Country { get; set; }
    [Required] public String? Zip { get; set; }
    [Required] public String? Phone { get; set; }
}