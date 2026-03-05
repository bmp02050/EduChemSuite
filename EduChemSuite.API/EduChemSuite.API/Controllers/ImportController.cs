using EduChemSuite.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduChemSuite.API.Controllers;

[Authorize(Policy = "IsAdminOrStaff")]
[ApiController]
[Route("api/[controller]")]
public class ImportController(
    ILogger<ImportController> logger,
    IImportService importService) : Controller
{
    [Authorize(Policy = "IsElevatedUser")]
    [HttpPost("districts")]
    public async Task<IActionResult> ImportDistricts(IFormFile file)
    {
        try
        {
            using var stream = file.OpenReadStream();
            var result = await importService.ImportDistricts(stream);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while importing districts");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("schools")]
    public async Task<IActionResult> ImportSchools(IFormFile file)
    {
        try
        {
            using var stream = file.OpenReadStream();
            var result = await importService.ImportSchools(stream);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while importing schools");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("users")]
    public async Task<IActionResult> ImportUsers(IFormFile file)
    {
        try
        {
            using var stream = file.OpenReadStream();
            var result = await importService.ImportUsers(stream);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while importing users");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("questions")]
    public async Task<IActionResult> ImportQuestions(IFormFile file)
    {
        try
        {
            using var stream = file.OpenReadStream();
            var result = await importService.ImportQuestions(stream);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while importing questions");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("answers")]
    public async Task<IActionResult> ImportAnswers(IFormFile file)
    {
        try
        {
            using var stream = file.OpenReadStream();
            var result = await importService.ImportAnswers(stream);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while importing answers");
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize(Policy = "IsElevatedUser")]
    [HttpPost("grades")]
    public async Task<IActionResult> ImportGrades(IFormFile file)
    {
        try
        {
            using var stream = file.OpenReadStream();
            var result = await importService.ImportGrades(stream);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while importing grades");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("template/{entityType}")]
    public IActionResult DownloadTemplate(string entityType)
    {
        try
        {
            var bytes = importService.GenerateTemplate(entityType);
            return File(bytes, "text/csv", $"{entityType}-template.csv");
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while generating template for {EntityType}", entityType);
            return BadRequest(new { message = ex.Message });
        }
    }
}
