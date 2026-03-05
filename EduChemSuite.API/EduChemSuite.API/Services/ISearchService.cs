using AutoMapper;
using EduChemSuite.API.Dao;
using EduChemSuite.API.Models;

namespace EduChemSuite.API.Services;

public interface ISearchService
{
    Task<PagedResult<UserModel>> SearchUsers(SearchQueryModel query);
    Task<PagedResult<QuestionModel>> SearchQuestions(SearchQueryModel query);
    Task<PagedResult<ExamModel>> SearchExams(SearchQueryModel query);
    Task<PagedResult<GradeModel>> SearchGrades(SearchQueryModel query);
    Task<PagedResult<ExamResponseModel>> SearchExamResponses(SearchQueryModel query);
    Task<PagedResult<DistrictModel>> SearchDistricts(SearchQueryModel query);
    Task<PagedResult<SchoolModel>> SearchSchools(SearchQueryModel query);
}

public class SearchService(ISearchRepository searchRepository, IMapper mapper) : ISearchService
{
    public async Task<PagedResult<UserModel>> SearchUsers(SearchQueryModel query)
    {
        var (items, totalCount) = await searchRepository.SearchUsers(query);
        return new PagedResult<UserModel>
        {
            Items = mapper.Map<List<UserModel>>(items),
            TotalCount = totalCount,
            Page = query.Page,
            PageSize = query.PageSize
        };
    }

    public async Task<PagedResult<QuestionModel>> SearchQuestions(SearchQueryModel query)
    {
        var (items, totalCount) = await searchRepository.SearchQuestions(query);
        return new PagedResult<QuestionModel>
        {
            Items = mapper.Map<List<QuestionModel>>(items),
            TotalCount = totalCount,
            Page = query.Page,
            PageSize = query.PageSize
        };
    }

    public async Task<PagedResult<ExamModel>> SearchExams(SearchQueryModel query)
    {
        var (items, totalCount) = await searchRepository.SearchExams(query);
        return new PagedResult<ExamModel>
        {
            Items = mapper.Map<List<ExamModel>>(items),
            TotalCount = totalCount,
            Page = query.Page,
            PageSize = query.PageSize
        };
    }

    public async Task<PagedResult<GradeModel>> SearchGrades(SearchQueryModel query)
    {
        var (items, totalCount) = await searchRepository.SearchGrades(query);
        return new PagedResult<GradeModel>
        {
            Items = mapper.Map<List<GradeModel>>(items),
            TotalCount = totalCount,
            Page = query.Page,
            PageSize = query.PageSize
        };
    }

    public async Task<PagedResult<ExamResponseModel>> SearchExamResponses(SearchQueryModel query)
    {
        var (items, totalCount) = await searchRepository.SearchExamResponses(query);
        return new PagedResult<ExamResponseModel>
        {
            Items = mapper.Map<List<ExamResponseModel>>(items),
            TotalCount = totalCount,
            Page = query.Page,
            PageSize = query.PageSize
        };
    }

    public async Task<PagedResult<DistrictModel>> SearchDistricts(SearchQueryModel query)
    {
        var (items, totalCount) = await searchRepository.SearchDistricts(query);
        return new PagedResult<DistrictModel>
        {
            Items = mapper.Map<List<DistrictModel>>(items),
            TotalCount = totalCount,
            Page = query.Page,
            PageSize = query.PageSize
        };
    }

    public async Task<PagedResult<SchoolModel>> SearchSchools(SearchQueryModel query)
    {
        var (items, totalCount) = await searchRepository.SearchSchools(query);
        return new PagedResult<SchoolModel>
        {
            Items = mapper.Map<List<SchoolModel>>(items),
            TotalCount = totalCount,
            Page = query.Page,
            PageSize = query.PageSize
        };
    }
}
