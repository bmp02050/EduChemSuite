using System.ComponentModel.DataAnnotations.Schema;

namespace EduChemSuite.API.Entities;

public class MolecularStructure : BaseEntity
{
    public required string Name { get; set; }
    public required string GraphData { get; set; }
    public string? ImageData { get; set; }
    [ForeignKey("UserId")] public required Guid UserId { get; set; }
    public virtual User? User { get; set; }
}
