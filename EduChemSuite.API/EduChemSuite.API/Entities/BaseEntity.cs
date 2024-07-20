using System.ComponentModel.DataAnnotations;

namespace EduChemSuite.API.Entities;

public abstract class BaseEntity
{
    [Key] public virtual required Guid Id { get; set; }
    public required DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public Boolean? IsActive { get; set; }
}