using System.Globalization;
using CsvHelper;
using EduChemSuite.API.Dao;
using EduChemSuite.API.Entities;
using EduChemSuite.API.Helpers;
using EduChemSuite.API.Models;

namespace EduChemSuite.API.Services;

public interface IExportService
{
    Task<byte[]> ExportUsers(SearchQueryModel query);
    Task<byte[]> ExportQuestions(SearchQueryModel query);
    Task<byte[]> ExportExams(SearchQueryModel query);
    Task<byte[]> ExportGrades(SearchQueryModel query);
    Task<byte[]> ExportExamResponses(SearchQueryModel query);
    Task<byte[]> ExportDistricts(SearchQueryModel query);
    Task<byte[]> ExportSchools(SearchQueryModel query);
}

public class ExportService(ISearchRepository searchRepository) : IExportService
{
    private const int MaxExportSize = 100_000;

    public async Task<byte[]> ExportUsers(SearchQueryModel query)
    {
        query.Page = 1;
        query.PageSize = MaxExportSize;
        var (items, _) = await searchRepository.SearchUsers(query);

        var rows = items.Select(u => new UserCsvRow
        {
            FirstName = u.FirstName,
            LastName = u.LastName,
            Email = u.Email,
            AccountType = u.AccountType.ToString(),
            Address = u.Address1,
            City = u.City,
            State = u.State,
            Country = u.Country,
            Zip = u.Zip,
            Phone = u.Phone,
            VerifiedEmail = u.VerifiedEmail,
            IsActive = u.IsActive,
            Schools = string.Join(", ", u.UserSchools?.Select(us => us.School?.Name).Where(n => n != null) ?? []),
            Districts = string.Join(", ", u.UserDistricts?.Select(ud => ud.District?.DistrictName).Where(n => n != null) ?? []),
            CreatedAt = u.CreatedAt
        });

        return WriteCsv<UserCsvRow, UserCsvMap>(rows);
    }

    public async Task<byte[]> ExportQuestions(SearchQueryModel query)
    {
        query.Page = 1;
        query.PageSize = MaxExportSize;
        var (items, _) = await searchRepository.SearchQuestions(query);

        var rows = items.Select(q => new QuestionCsvRow
        {
            QuestionText = q.QuestionText,
            QuestionType = q.QuestionType?.Description ?? "",
            AuthorEmail = q.User?.Email ?? "",
            AuthorName = q.User != null ? $"{q.User.FirstName} {q.User.LastName}" : "",
            AnswerCount = q.Answers?.Count ?? 0,
            Tags = string.Join(", ", q.QuestionTags?.Select(qt => qt.Tag?.TagText).Where(n => n != null) ?? []),
            Version = q.Version,
            IsActive = q.IsActive,
            CreatedAt = q.CreatedAt
        });

        return WriteCsv<QuestionCsvRow, QuestionCsvMap>(rows);
    }

    public async Task<byte[]> ExportExams(SearchQueryModel query)
    {
        query.Page = 1;
        query.PageSize = MaxExportSize;
        var (items, _) = await searchRepository.SearchExams(query);

        var rows = items.Select(e => new ExamCsvRow
        {
            Name = e.Name,
            Description = e.Description ?? "",
            TimeLimitMinutes = e.TimeLimitMinutes,
            AllowRetakes = e.AllowRetakes,
            MaxAttempts = e.MaxAttempts,
            IsTest = e.IsTest,
            QuestionCount = e.ExamQuestions.Count,
            IsActive = e.IsActive,
            CreatedAt = e.CreatedAt
        });

        return WriteCsv<ExamCsvRow, ExamCsvMap>(rows);
    }

    public async Task<byte[]> ExportGrades(SearchQueryModel query)
    {
        query.Page = 1;
        query.PageSize = MaxExportSize;
        var (items, _) = await searchRepository.SearchGrades(query);

        var rows = items.Select(g => new GradeCsvRow
        {
            StudentEmail = g.User?.Email ?? "",
            StudentName = g.User != null ? $"{g.User.FirstName} {g.User.LastName}" : "",
            ExamName = g.Exam?.Name ?? "",
            Grade = g.GradeValue,
            CreatedAt = g.CreatedAt
        });

        return WriteCsv<GradeCsvRow, GradeCsvMap>(rows);
    }

    public async Task<byte[]> ExportExamResponses(SearchQueryModel query)
    {
        query.Page = 1;
        query.PageSize = MaxExportSize;
        var (items, _) = await searchRepository.SearchExamResponses(query);

        var rows = items.Select(er => new ExamResponseCsvRow
        {
            StudentEmail = er.User?.Email ?? "",
            StudentName = er.User != null ? $"{er.User.FirstName} {er.User.LastName}" : "",
            ExamName = er.Exam?.Name ?? "",
            QuestionText = er.Question?.QuestionText ?? "",
            ResponseText = er.ResponseText ?? "",
            SelectedAnswer = er.Answer?.AnswerText ?? "",
            IsCorrect = er.IsCorrect,
            IsGraded = er.IsGraded,
            CreatedAt = er.CreatedAt
        });

        return WriteCsv<ExamResponseCsvRow, ExamResponseCsvMap>(rows);
    }

    public async Task<byte[]> ExportDistricts(SearchQueryModel query)
    {
        query.Page = 1;
        query.PageSize = MaxExportSize;
        var (items, _) = await searchRepository.SearchDistricts(query);

        var rows = items.Select(d => new DistrictCsvRow
        {
            DistrictName = d.DistrictName,
            SchoolCount = d.Schools?.Count ?? 0,
            AdministratorCount = d.Administrators?.Count ?? 0,
            IsActive = d.IsActive,
            CreatedAt = d.CreatedAt
        });

        return WriteCsv<DistrictCsvRow, DistrictCsvMap>(rows);
    }

    public async Task<byte[]> ExportSchools(SearchQueryModel query)
    {
        query.Page = 1;
        query.PageSize = MaxExportSize;
        var (items, _) = await searchRepository.SearchSchools(query);

        var rows = items.Select(s => new SchoolCsvRow
        {
            Name = s.Name,
            District = string.Join(", ", s.DistrictSchools?.Select(ds => ds.District?.DistrictName).Where(n => n != null) ?? []),
            StaffCount = s.UserSchools?.Count(us => us.User != null && (us.User.AccountType == AccountType.Staff || us.User.AccountType == AccountType.AdminStaff)) ?? 0,
            StudentCount = s.UserSchools?.Count(us => us.User != null && us.User.AccountType == AccountType.Student) ?? 0,
            IsActive = s.IsActive,
            CreatedAt = s.CreatedAt
        });

        return WriteCsv<SchoolCsvRow, SchoolCsvMap>(rows);
    }

    private static byte[] WriteCsv<T, TMap>(IEnumerable<T> records) where TMap : CsvHelper.Configuration.ClassMap<T>
    {
        using var memoryStream = new MemoryStream();
        using var writer = new StreamWriter(memoryStream);
        using var csv = new CsvWriter(writer, CultureInfo.InvariantCulture);
        csv.Context.RegisterClassMap<TMap>();
        csv.WriteRecords(records);
        writer.Flush();
        return memoryStream.ToArray();
    }
}
