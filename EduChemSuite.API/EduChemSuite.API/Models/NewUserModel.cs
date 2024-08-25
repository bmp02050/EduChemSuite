using System.ComponentModel.DataAnnotations;

namespace EduChemSuite.API.Models;

public class NewUserModel
{
    [Required] public string Email { get; set; }
    [Required] public Boolean IsAdmin { get; set; }
    [Required] public String FirstName { get; set; }

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