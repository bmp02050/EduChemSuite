namespace EduChemSuite.API.Models;

public class ImportResultModel
{
    public int TotalRows { get; set; }
    public int SuccessCount { get; set; }
    public int ErrorCount { get; set; }
    public int CreatedCount { get; set; }
    public int UpdatedCount { get; set; }
    public List<ImportRowError> Errors { get; set; } = [];
}

public class ImportRowError
{
    public int RowNumber { get; set; }
    public string RawData { get; set; } = "";
    public string ErrorMessage { get; set; } = "";
}
