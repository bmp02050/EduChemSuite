using System.ComponentModel.DataAnnotations;

namespace EduChemSuite.API.Models;

public abstract class BaseModel
{
    [Required] public required Guid Id { get; set; }
    [Required] public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public Boolean? IsActive { get; set; }
}