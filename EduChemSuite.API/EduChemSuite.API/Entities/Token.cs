using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EduChemSuite.API.Entities;

public class Token : BaseEntity
{
    [ForeignKey("UserId")] [Required] public Guid UserId { get; set; }
    public required String RefreshToken { get; set; }
    public required DateTime Expiration { get; set; }
    public required Boolean Expired { get; set; }
}