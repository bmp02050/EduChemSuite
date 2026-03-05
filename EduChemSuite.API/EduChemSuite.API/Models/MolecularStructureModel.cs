namespace EduChemSuite.API.Models;

public class MolecularStructureModel : BaseModel
{
    public string? Name { get; set; }
    public string? GraphData { get; set; }
    public string? ImageData { get; set; }
    public Guid? UserId { get; set; }
    public UserModel? User { get; set; }
}
