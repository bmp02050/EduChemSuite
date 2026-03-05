using EduChemSuite.API.Models;
using EduChemSuite.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduChemSuite.API.Controllers;

[Authorize(Policy = "IsAdminOrStaff")]
[ApiController]
[Route("api/[controller]")]
public class ExamResponseController(
    ILogger<ExamResponseController> logger,
    IExamResponseService examResponseService,
    ISearchService searchService,
    IGradeService gradeService) : Controller
{
    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] SearchQueryModel query)
    {
        try
        {
            var result = await searchService.SearchExamResponses(query);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while searching exam responses");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var result = await examResponseService.GetById(id);
            if (result == null) return NotFound();
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while retrieving exam response {Id}", id);
            return BadRequest(ex);
        }
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> ListByUser(Guid userId)
    {
        try
        {
            var result = await examResponseService.ListByUser(userId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred listing exam responses for user {UserId}", userId);
            return BadRequest(ex);
        }
    }

    [HttpGet("exam/{examId}")]
    public async Task<IActionResult> ListByExam(Guid examId)
    {
        try
        {
            var result = await examResponseService.ListByExam(examId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred listing exam responses for exam {ExamId}", examId);
            return BadRequest(ex);
        }
    }

    [HttpGet("exam/{examId}/review")]
    public async Task<IActionResult> GetExamReview(Guid examId)
    {
        try
        {
            var responses = await examResponseService.ListByExam(examId);
            var responseList = responses.ToList();

            var studentGroups = responseList
                .GroupBy(r => r.UserId)
                .Select(g =>
                {
                    var studentResponses = g.ToList();
                    var user = studentResponses.FirstOrDefault()?.User;
                    var gradedCount = studentResponses.Count(r => r.IsGraded);
                    var correctCount = studentResponses.Count(r => r.IsCorrect == true);
                    var pendingCount = studentResponses.Count(r => !r.IsGraded);
                    var totalCount = studentResponses.Count;
                    var gradableCount = totalCount - pendingCount;
                    var grade = gradableCount > 0
                        ? Math.Round((decimal)correctCount / gradableCount * 100, 2)
                        : 0m;

                    return new
                    {
                        UserId = g.Key,
                        User = user,
                        Responses = studentResponses,
                        TotalCount = totalCount,
                        GradedCount = gradedCount,
                        CorrectCount = correctCount,
                        PendingCount = pendingCount,
                        Grade = grade,
                    };
                })
                .ToList();

            return Ok(studentGroups);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred getting exam review for exam {ExamId}", examId);
            return BadRequest(ex);
        }
    }

    [HttpPut("{id}/grade")]
    public async Task<IActionResult> GradeResponse(Guid id, [FromBody] GradeResponseModel model)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        try
        {
            var response = await examResponseService.GetById(id);
            if (response == null) return NotFound();

            response.IsCorrect = model.IsCorrect;
            response.IsGraded = true;

            await examResponseService.Update(response);

            // Recalculate grade for this user+exam
            await RecalculateGrade(response.ExamId, response.UserId);

            return Ok(response);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred grading exam response {Id}", id);
            return BadRequest(ex);
        }
    }

    private async Task RecalculateGrade(Guid examId, Guid userId)
    {
        var allResponses = await examResponseService.ListByExam(examId);
        var userResponses = allResponses.Where(r => r.UserId == userId).ToList();

        var correctCount = userResponses.Count(r => r.IsCorrect == true);
        var pendingCount = userResponses.Count(r => !r.IsGraded);
        var gradableCount = userResponses.Count - pendingCount;
        var gradeValue = gradableCount > 0
            ? Math.Round((decimal)correctCount / gradableCount * 100, 2)
            : 0m;

        // Find existing grade and update
        var grades = await gradeService.ListByExam(examId);
        var existingGrade = grades
            .Where(g => g.UserId == userId)
            .OrderByDescending(g => g.CreatedAt)
            .FirstOrDefault();

        if (existingGrade != null)
        {
            existingGrade.GradeValue = gradeValue;
            await gradeService.Update(existingGrade);
        }
    }

    [HttpPost("")]
    public async Task<IActionResult> Create([FromBody] ExamResponseModel examResponseModel)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        try
        {
            var result = await examResponseService.Create(examResponseModel);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred during ExamResponse creation");
            return BadRequest(ex);
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] ExamResponseModel examResponse)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        try
        {
            examResponse.Id = id;
            var result = await examResponseService.Update(examResponse);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred during ExamResponse update");
            return BadRequest(ex);
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            var result = await examResponseService.Delete(id);
            if (!result) return NotFound();
            return Ok();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while deleting exam response {Id}", id);
            return BadRequest(ex);
        }
    }
}
