using EduChemSuite.API.Entities;

namespace EduChemSuite.API.Models;

public class UserSummaryModel
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public AccountType AccountType { get; set; }
    public string? Email { get; set; }
}
