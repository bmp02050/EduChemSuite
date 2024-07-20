using System.ComponentModel.DataAnnotations;

namespace EduChemSuite.API.Entities;

public class AccountType: BaseEntity
{
    public required String Description { get; set; }
}