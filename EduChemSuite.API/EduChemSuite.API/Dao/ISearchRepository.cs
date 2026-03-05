using System.Linq.Expressions;
using EduChemSuite.API.Entities;
using EduChemSuite.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EduChemSuite.API.Dao;

public interface ISearchRepository
{
    Task<(List<User> Items, int TotalCount)> SearchUsers(SearchQueryModel query);
    Task<(List<Question> Items, int TotalCount)> SearchQuestions(SearchQueryModel query);
    Task<(List<Exam> Items, int TotalCount)> SearchExams(SearchQueryModel query);
    Task<(List<Grade> Items, int TotalCount)> SearchGrades(SearchQueryModel query);
    Task<(List<ExamResponse> Items, int TotalCount)> SearchExamResponses(SearchQueryModel query);
    Task<(List<District> Items, int TotalCount)> SearchDistricts(SearchQueryModel query);
    Task<(List<School> Items, int TotalCount)> SearchSchools(SearchQueryModel query);
}

public class SearchRepository(Context context) : ISearchRepository
{
    public async Task<(List<User> Items, int TotalCount)> SearchUsers(SearchQueryModel query)
    {
        var q = context.Users
            .AsNoTracking()
            .AsSplitQuery()
            .Include(u => u.UserSchools!).ThenInclude(us => us.School)
            .Include(u => u.UserDistricts!).ThenInclude(ud => ud.District)
            .AsQueryable();

        if (!query.IncludeInactive)
            q = q.Where(u => u.IsActive);

        if (!string.IsNullOrWhiteSpace(query.SearchText))
        {
            var text = query.SearchText.ToLower();
            q = q.Where(u => u.FirstName.ToLower().Contains(text)
                           || u.LastName.ToLower().Contains(text)
                           || u.Email.ToLower().Contains(text));
        }

        if (query.DistrictId.HasValue)
            q = q.Where(u => u.UserDistricts != null && u.UserDistricts.Any(ud => ud.DistrictId == query.DistrictId.Value));

        if (query.SchoolId.HasValue)
            q = q.Where(u => u.UserSchools != null && u.UserSchools.Any(us => us.SchoolId == query.SchoolId.Value));

        if (!string.IsNullOrWhiteSpace(query.AccountType) && Enum.TryParse<AccountType>(query.AccountType, true, out var accountType))
            q = q.Where(u => u.AccountType == accountType);

        if (query.DateFrom.HasValue)
            q = q.Where(u => u.CreatedAt >= query.DateFrom.Value);

        if (query.DateTo.HasValue)
            q = q.Where(u => u.CreatedAt <= query.DateTo.Value);

        var totalCount = await q.CountAsync();
        q = ApplySorting(q, query.SortBy, query.SortDescending, "LastName");
        var items = await q.Skip((query.Page - 1) * query.PageSize).Take(query.PageSize).ToListAsync();

        return (items, totalCount);
    }

    public async Task<(List<Question> Items, int TotalCount)> SearchQuestions(SearchQueryModel query)
    {
        var q = context.Questions
            .AsNoTracking()
            .AsSplitQuery()
            .Include(x => x.User)
            .Include(x => x.QuestionType)
            .Include(x => x.QuestionTags!).ThenInclude(qt => qt.Tag)
            .Include(x => x.Answers)
            .AsQueryable();

        if (!query.IncludeInactive)
            q = q.Where(x => x.IsActive);

        if (!string.IsNullOrWhiteSpace(query.SearchText))
        {
            var text = query.SearchText.ToLower();
            q = q.Where(x => x.QuestionText.ToLower().Contains(text));
        }

        if (query.DistrictId.HasValue)
            q = q.Where(x => x.User != null && x.User.UserDistricts != null && x.User.UserDistricts.Any(ud => ud.DistrictId == query.DistrictId.Value));

        if (query.SchoolId.HasValue)
            q = q.Where(x => x.User != null && x.User.UserSchools != null && x.User.UserSchools.Any(us => us.SchoolId == query.SchoolId.Value));

        if (query.TeacherId.HasValue)
            q = q.Where(x => x.UserId == query.TeacherId.Value);

        if (query.ExamId.HasValue)
            q = q.Where(x => x.ExamQuestions != null && x.ExamQuestions.Any(eq => eq.ExamId == query.ExamId.Value));

        if (query.DateFrom.HasValue)
            q = q.Where(x => x.CreatedAt >= query.DateFrom.Value);

        if (query.DateTo.HasValue)
            q = q.Where(x => x.CreatedAt <= query.DateTo.Value);

        var totalCount = await q.CountAsync();
        q = ApplySorting(q, query.SortBy, query.SortDescending, "CreatedAt");
        var items = await q.Skip((query.Page - 1) * query.PageSize).Take(query.PageSize).ToListAsync();

        return (items, totalCount);
    }

    public async Task<(List<Exam> Items, int TotalCount)> SearchExams(SearchQueryModel query)
    {
        var q = context.Exams
            .AsNoTracking()
            .AsSplitQuery()
            .Include(e => e.ExamQuestions).ThenInclude(eq => eq.Question)
            .Include(e => e.Grades)
            .AsQueryable();

        if (!query.IncludeInactive)
            q = q.Where(e => e.IsActive);

        if (!string.IsNullOrWhiteSpace(query.SearchText))
        {
            var text = query.SearchText.ToLower();
            q = q.Where(e => e.Name.ToLower().Contains(text)
                           || (e.Description != null && e.Description.ToLower().Contains(text)));
        }

        if (query.ExamId.HasValue)
            q = q.Where(e => e.Id == query.ExamId.Value);

        if (query.DateFrom.HasValue)
            q = q.Where(e => e.CreatedAt >= query.DateFrom.Value);

        if (query.DateTo.HasValue)
            q = q.Where(e => e.CreatedAt <= query.DateTo.Value);

        var totalCount = await q.CountAsync();
        q = ApplySorting(q, query.SortBy, query.SortDescending, "Name");
        var items = await q.Skip((query.Page - 1) * query.PageSize).Take(query.PageSize).ToListAsync();

        return (items, totalCount);
    }

    public async Task<(List<Grade> Items, int TotalCount)> SearchGrades(SearchQueryModel query)
    {
        var q = context.Grades
            .AsNoTracking()
            .Include(g => g.User)
            .Include(g => g.Exam)
            .AsQueryable();

        if (!query.IncludeInactive)
            q = q.Where(g => g.IsActive);

        if (query.DistrictId.HasValue)
            q = q.Where(g => g.User != null && g.User.UserDistricts != null && g.User.UserDistricts.Any(ud => ud.DistrictId == query.DistrictId.Value));

        if (query.SchoolId.HasValue)
            q = q.Where(g => g.User != null && g.User.UserSchools != null && g.User.UserSchools.Any(us => us.SchoolId == query.SchoolId.Value));

        if (query.StudentId.HasValue)
            q = q.Where(g => g.UserId == query.StudentId.Value);

        if (query.ExamId.HasValue)
            q = q.Where(g => g.ExamId == query.ExamId.Value);

        if (query.GradeMin.HasValue)
            q = q.Where(g => g.GradeValue >= query.GradeMin.Value);

        if (query.GradeMax.HasValue)
            q = q.Where(g => g.GradeValue <= query.GradeMax.Value);

        if (query.DateFrom.HasValue)
            q = q.Where(g => g.CreatedAt >= query.DateFrom.Value);

        if (query.DateTo.HasValue)
            q = q.Where(g => g.CreatedAt <= query.DateTo.Value);

        var totalCount = await q.CountAsync();
        q = ApplySorting(q, query.SortBy, query.SortDescending, "CreatedAt");
        var items = await q.Skip((query.Page - 1) * query.PageSize).Take(query.PageSize).ToListAsync();

        return (items, totalCount);
    }

    public async Task<(List<ExamResponse> Items, int TotalCount)> SearchExamResponses(SearchQueryModel query)
    {
        var q = context.ExamResponses
            .AsNoTracking()
            .Include(er => er.User)
            .Include(er => er.Exam)
            .Include(er => er.Question)
            .Include(er => er.Answer)
            .AsQueryable();

        if (!query.IncludeInactive)
            q = q.Where(er => er.IsActive);

        if (!string.IsNullOrWhiteSpace(query.SearchText))
        {
            var text = query.SearchText.ToLower();
            q = q.Where(er => er.ResponseText != null && er.ResponseText.ToLower().Contains(text));
        }

        if (query.DistrictId.HasValue)
            q = q.Where(er => er.User != null && er.User.UserDistricts != null && er.User.UserDistricts.Any(ud => ud.DistrictId == query.DistrictId.Value));

        if (query.SchoolId.HasValue)
            q = q.Where(er => er.User != null && er.User.UserSchools != null && er.User.UserSchools.Any(us => us.SchoolId == query.SchoolId.Value));

        if (query.StudentId.HasValue)
            q = q.Where(er => er.UserId == query.StudentId.Value);

        if (query.ExamId.HasValue)
            q = q.Where(er => er.ExamId == query.ExamId.Value);

        if (query.DateFrom.HasValue)
            q = q.Where(er => er.CreatedAt >= query.DateFrom.Value);

        if (query.DateTo.HasValue)
            q = q.Where(er => er.CreatedAt <= query.DateTo.Value);

        var totalCount = await q.CountAsync();
        q = ApplySorting(q, query.SortBy, query.SortDescending, "CreatedAt");
        var items = await q.Skip((query.Page - 1) * query.PageSize).Take(query.PageSize).ToListAsync();

        return (items, totalCount);
    }

    public async Task<(List<District> Items, int TotalCount)> SearchDistricts(SearchQueryModel query)
    {
        var q = context.Districts
            .AsNoTracking()
            .AsSplitQuery()
            .Include(d => d.Schools!).ThenInclude(ds => ds.School)
            .Include(d => d.Administrators!).ThenInclude(a => a.User)
            .AsQueryable();

        if (!query.IncludeInactive)
            q = q.Where(d => d.IsActive);

        if (!string.IsNullOrWhiteSpace(query.SearchText))
        {
            var text = query.SearchText.ToLower();
            q = q.Where(d => d.DistrictName.ToLower().Contains(text));
        }

        if (query.DistrictId.HasValue)
            q = q.Where(d => d.Id == query.DistrictId.Value);

        if (query.SchoolId.HasValue)
            q = q.Where(d => d.Schools != null && d.Schools.Any(ds => ds.SchoolId == query.SchoolId.Value));

        if (query.DateFrom.HasValue)
            q = q.Where(d => d.CreatedAt >= query.DateFrom.Value);

        if (query.DateTo.HasValue)
            q = q.Where(d => d.CreatedAt <= query.DateTo.Value);

        var totalCount = await q.CountAsync();
        q = ApplySorting(q, query.SortBy, query.SortDescending, "DistrictName");
        var items = await q.Skip((query.Page - 1) * query.PageSize).Take(query.PageSize).ToListAsync();

        return (items, totalCount);
    }

    public async Task<(List<School> Items, int TotalCount)> SearchSchools(SearchQueryModel query)
    {
        var q = context.Schools
            .AsNoTracking()
            .AsSplitQuery()
            .Include(s => s.UserSchools!).ThenInclude(us => us.User)
            .Include(s => s.DistrictSchools!).ThenInclude(ds => ds.District)
            .AsQueryable();

        if (!query.IncludeInactive)
            q = q.Where(s => s.IsActive);

        if (!string.IsNullOrWhiteSpace(query.SearchText))
        {
            var text = query.SearchText.ToLower();
            q = q.Where(s => s.Name.ToLower().Contains(text));
        }

        if (query.DistrictId.HasValue)
            q = q.Where(s => s.DistrictSchools != null && s.DistrictSchools.Any(ds => ds.DistrictId == query.DistrictId.Value));

        if (query.SchoolId.HasValue)
            q = q.Where(s => s.Id == query.SchoolId.Value);

        if (query.DateFrom.HasValue)
            q = q.Where(s => s.CreatedAt >= query.DateFrom.Value);

        if (query.DateTo.HasValue)
            q = q.Where(s => s.CreatedAt <= query.DateTo.Value);

        var totalCount = await q.CountAsync();
        q = ApplySorting(q, query.SortBy, query.SortDescending, "Name");
        var items = await q.Skip((query.Page - 1) * query.PageSize).Take(query.PageSize).ToListAsync();

        return (items, totalCount);
    }

    private static IQueryable<T> ApplySorting<T>(IQueryable<T> query, string? sortBy, bool descending, string defaultSort) where T : class
    {
        var property = typeof(T).GetProperty(sortBy ?? defaultSort,
            System.Reflection.BindingFlags.IgnoreCase | System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance);

        if (property == null)
            property = typeof(T).GetProperty(defaultSort,
                System.Reflection.BindingFlags.IgnoreCase | System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance);

        if (property == null)
            return query;

        var parameter = System.Linq.Expressions.Expression.Parameter(typeof(T), "x");
        var propertyAccess = System.Linq.Expressions.Expression.Property(parameter, property);
        var orderByExpression = System.Linq.Expressions.Expression.Lambda(propertyAccess, parameter);

        var methodName = descending ? "OrderByDescending" : "OrderBy";
        var resultExpression = System.Linq.Expressions.Expression.Call(
            typeof(Queryable), methodName, [typeof(T), property.PropertyType],
            query.Expression, System.Linq.Expressions.Expression.Quote(orderByExpression));

        return query.Provider.CreateQuery<T>(resultExpression);
    }
}
