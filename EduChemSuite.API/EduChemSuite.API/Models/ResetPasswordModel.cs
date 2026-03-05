using System.ComponentModel.DataAnnotations;

namespace EduChemSuite.API.Models;

public class ResetPasswordModel
{
    [Required] public Guid UserId { get; set; }
    [Required] public string Token { get; set; } = default!;
    [Required][MinLength(6)] public string NewPassword { get; set; } = default!;
}
