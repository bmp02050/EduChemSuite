using System.ComponentModel.DataAnnotations;

namespace EduChemSuite.API.Models;

public abstract class BaseModel
{
    public Guid? Id { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public Boolean? IsActive { get; set; }
}