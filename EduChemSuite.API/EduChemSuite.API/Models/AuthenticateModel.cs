using System.ComponentModel.DataAnnotations;

namespace EduChemSuite.API.Models;

public class AuthenticateModel
{
    [Required] public required String Email { get; set; }
    [Required] public required String Password { get; set; }
}