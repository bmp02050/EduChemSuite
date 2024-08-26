using AutoMapper;
using EduChemSuite.API.Entities;
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
    IMapper mapper) : Controller
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
            var school = mapper.Map<School>(model);
            School? result;
            if (school.Id == Guid.Empty)
                result = await schoolService.Create(school);
            else
                result = await schoolService.Update(school);

            return Ok(mapper.Map<SchoolModel>(result));
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
            return Ok(mapper.Map<List<SchoolModel>>(result));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred during School creation");
            
            return BadRequest(ex);
        }
    }
}