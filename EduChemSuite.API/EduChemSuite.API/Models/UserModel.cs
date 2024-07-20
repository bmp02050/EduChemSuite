using System.ComponentModel.DataAnnotations;
using EduChemSuite.API.Entities;

namespace EduChemSuite.API.Models;

public class UserModel : BaseModel
{
    [Required] public required AccountType AccountType { get; set; }
    [Required] public required string Email { get; set; }
    [Required] public required Boolean IsAdmin { get; set; }
    public ICollection<ExamModel>? Exams { get; set; }
    public ICollection<ExamResponseModel>? ExamResponses { get; set; }
    public ICollection<UserSchoolModel>? UserSchools { get; set; }
    public ICollection<UserDistrictModel>? UserDistricts { get; set; }
    [Required] public String? FirstName { get; set; }

    [Required] public String? LastName { get; set; }

    [Required] public String? Username { get; set; }

    [Required] public String Password { get; set; }
    
    public String? Address1 { get; set; }
    public String? Address2 { get; set; }
    public String? Address3 { get; set; }
    public String? City { get; set; }
    public String? State { get; set; }
    public String? Country { get; set; }
    public String? Zip { get; set; }
    public String? Phone { get; set; }
}