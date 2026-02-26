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
    ISchoolService schoolService) : Controller
{
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
}
