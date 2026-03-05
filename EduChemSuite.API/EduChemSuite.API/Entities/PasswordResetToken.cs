using System.ComponentModel.DataAnnotations;

namespace EduChemSuite.API.Entities;

public class PasswordResetToken
{
    [Key] public virtual Guid Id { get; set; }
    public required string Token { get; set; }
    public required Guid UserId { get; set; }
    public required Boolean Used { get; set; }
    public required DateTime Expiration { get; set; }
}
