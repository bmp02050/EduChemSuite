namespace EduChemSuite.API.Models;

public class UpsertDistrictModel : DistrictModel
{
    public required Guid UserId { get; set; }
}