using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EduChemSuite.API.Entities;

public abstract class BaseEntity
{
    [Key] public required Guid Id { get; set; } = Guid.NewGuid();
    public required DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public required Boolean IsActive { get; set; }
}