namespace EduChemSuite.API.Models;

public class SearchQueryModel
{
    public string? SearchText { get; set; }
    public Guid? DistrictId { get; set; }
    public Guid? SchoolId { get; set; }
    public Guid? TeacherId { get; set; }
    public Guid? StudentId { get; set; }
    public Guid? ExamId { get; set; }
    public string? AccountType { get; set; }
    public DateTime? DateFrom { get; set; }
    public DateTime? DateTo { get; set; }
    public decimal? GradeMin { get; set; }
    public decimal? GradeMax { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? SortBy { get; set; }
    public bool SortDescending { get; set; }
    public bool IncludeInactive { get; set; }
}
