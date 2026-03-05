using EduChemSuite.API.Models;
using EduChemSuite.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduChemSuite.API.Controllers;

[Authorize(Policy = "IsElevatedUser")]
[ApiController]
[Route("api/[controller]")]
public class GradeController(
    ILogger<GradeController> logger,
    IGradeService gradeService,
    ISearchService searchService) : Controller
{
    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] SearchQueryModel query)
    {
        try
        {
            var result = await searchService.SearchGrades(query);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while searching grades");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var result = await gradeService.GetById(id);
            if (result == null) return NotFound();
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while retrieving grade {Id}", id);
            return BadRequest(ex);
        }
    }

    [HttpGet("exam/{examId}")]
    public async Task<IActionResult> ListByExam(Guid examId)
    {
        try
        {
            var result = await gradeService.ListByExam(examId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred listing grades for exam {ExamId}", examId);
            return BadRequest(ex);
        }
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> ListByUser(Guid userId)
    {
        try
        {
            var result = await gradeService.ListByUser(userId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred listing grades for user {UserId}", userId);
            return BadRequest(ex);
        }
    }

    [HttpPost("")]
    public async Task<IActionResult> Create([FromBody] GradeModel gradeModel)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        try
        {
            var result = await gradeService.Create(gradeModel);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred during Grade creation");
            return BadRequest(ex);
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] GradeModel grade)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        try
        {
            grade.Id = id;
            var result = await gradeService.Update(grade);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred during Grade update");
            return BadRequest(ex);
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            var result = await gradeService.Delete(id);
            if (!result) return NotFound();
            return Ok();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while deleting grade {Id}", id);
            return BadRequest(ex);
        }
    }
}
