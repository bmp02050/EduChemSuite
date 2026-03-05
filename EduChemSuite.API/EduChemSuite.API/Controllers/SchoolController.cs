using EduChemSuite.API.Models;
using EduChemSuite.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduChemSuite.API.Controllers;


[Authorize(Policy = "IsElevatedUser")]
[ApiController]
[Route("api/[controller]")]
public class SchoolController(
    ILogger<SchoolController> logger,
    ISchoolService schoolService,
    ISearchService searchService) : Controller
{
    [Authorize(Policy = "IsAdminOrStaff")]
    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] SearchQueryModel query)
    {
        try
        {
            var result = await searchService.SearchSchools(query);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while searching schools");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("")]
    public async Task<IActionResult> Upsert([FromBody] SchoolModel model)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            SchoolModel? result;
            if (model.Id == Guid.Empty)
                result = await schoolService.Create(model);
            else
                result = await schoolService.Update(model);

            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred during School creation");

            return BadRequest(ex);
        }
    }

    [HttpGet]
    public async Task<IActionResult> List()
    {
        try
        {
            var result = await schoolService.List();
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred during School listing");

            return BadRequest(ex);
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var result = await schoolService.GetById(id);
            if (result == null) return NotFound();
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while retrieving school {SchoolId}", id);
            return BadRequest(ex);
        }
    }

    [HttpPost("{schoolId}/users/{userId}")]
    public async Task<IActionResult> AddUser(Guid schoolId, Guid userId)
    {
        try
        {
            var result = await schoolService.AddUserToSchool(new UserSchoolModel { SchoolId = schoolId, UserId = userId });
            if (result == null) return NotFound();
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while adding user to school");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{schoolId}/users/{userId}")]
    public async Task<IActionResult> RemoveUser(Guid schoolId, Guid userId)
    {
        try
        {
            var result = await schoolService.RemoveUserFromSchool(schoolId, userId);
            if (!result) return NotFound();
            return Ok();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while removing user from school");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            var result = await schoolService.Delete(id);
            if (!result) return NotFound();
            return Ok();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while deleting school {SchoolId}", id);
            return BadRequest(ex);
        }
    }
}
