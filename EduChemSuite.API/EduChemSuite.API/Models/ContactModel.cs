using System.ComponentModel.DataAnnotations;

namespace EduChemSuite.API.Models;

public class ContactModel
{
    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required, EmailAddress, MaxLength(200)]
    public string Email { get; set; } = string.Empty;

    [Required, MaxLength(50)]
    public string SubjectType { get; set; } = string.Empty;

    [Required, MaxLength(2000)]
    public string Message { get; set; } = string.Empty;

    /// <summary>Honeypot field — should always be empty from real users.</summary>
    public string? Website { get; set; }
}
