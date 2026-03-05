using System.ComponentModel.DataAnnotations;

namespace EduChemSuite.API.Models;

public class ForgotPasswordModel
{
    [Required] public string Email { get; set; } = default!;
}
