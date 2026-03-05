using EduChemSuite.API.Models;
using EduChemSuite.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduChemSuite.API.Controllers;

[Authorize(Policy = "IsAdminOrStaff")]
[ApiController]
[Route("api/[controller]")]
public class ExportController(
    ILogger<ExportController> logger,
    IExportService exportService) : Controller
{
    [HttpGet("users")]
    public async Task<IActionResult> ExportUsers([FromQuery] SearchQueryModel query)
    {
        try
        {
            var bytes = await exportService.ExportUsers(query);
            return File(bytes, "text/csv", "users.csv");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while exporting users");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("questions")]
    public async Task<IActionResult> ExportQuestions([FromQuery] SearchQueryModel query)
    {
        try
        {
            var bytes = await exportService.ExportQuestions(query);
            return File(bytes, "text/csv", "questions.csv");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while exporting questions");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("exams")]
    public async Task<IActionResult> ExportExams([FromQuery] SearchQueryModel query)
    {
        try
        {
            var bytes = await exportService.ExportExams(query);
            return File(bytes, "text/csv", "exams.csv");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while exporting exams");
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize(Policy = "IsElevatedUser")]
    [HttpGet("grades")]
    public async Task<IActionResult> ExportGrades([FromQuery] SearchQueryModel query)
    {
        try
        {
            var bytes = await exportService.ExportGrades(query);
            return File(bytes, "text/csv", "grades.csv");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while exporting grades");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("exam-responses")]
    public async Task<IActionResult> ExportExamResponses([FromQuery] SearchQueryModel query)
    {
        try
        {
            var bytes = await exportService.ExportExamResponses(query);
            return File(bytes, "text/csv", "exam-responses.csv");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while exporting exam responses");
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize(Policy = "IsElevatedUser")]
    [HttpGet("districts")]
    public async Task<IActionResult> ExportDistricts([FromQuery] SearchQueryModel query)
    {
        try
        {
            var bytes = await exportService.ExportDistricts(query);
            return File(bytes, "text/csv", "districts.csv");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while exporting districts");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("schools")]
    public async Task<IActionResult> ExportSchools([FromQuery] SearchQueryModel query)
    {
        try
        {
            var bytes = await exportService.ExportSchools(query);
            return File(bytes, "text/csv", "schools.csv");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while exporting schools");
            return BadRequest(new { message = ex.Message });
        }
    }
}
