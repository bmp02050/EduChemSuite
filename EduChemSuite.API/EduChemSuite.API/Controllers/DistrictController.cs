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
public class DistrictController(
    ILogger<DistrictController> logger, 
    IDistrictService districtService, 
    IUserService userService,
    IMapper mapper)
    : Controller
{
    [HttpPost("")]
    public async Task<IActionResult> Upsert([FromBody] UpsertDistrictModel model)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        model.IsActive ??= true;
        try
        {
            var district = mapper.Map<District>(model);
            District? result;
            
            if (district.Id == Guid.Empty)
            {
                await districtService.Create(district);
                result = await districtService.AddUserToDistrict(district.Id, model.UserId);
            }
            else
                result = await districtService.Update(district);

            var updatedDistrict = await districtService.GetById(district.Id);
            return Ok(mapper.Map<DistrictModel>(updatedDistrict));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred during district creation");
            // return error message if there was an exception
            return BadRequest(ex);
        }
    }

    [HttpGet("{userId}")]
    public async Task<IActionResult> ListMine(Guid userId)
    {
        try
        {
            var result = await districtService.List(userId);
            return Ok(mapper.Map<List<DistrictModel>>(result));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred during district creation");
            // return error message if there was an exception
            return BadRequest(ex);
        }
    }
    
    [HttpGet("")]
    public async Task<IActionResult> ListAll()
    {
        try
        {
            var result = await districtService.List(null);
            return Ok(mapper.Map<List<DistrictModel>>(result));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred during district creation");
            // return error message if there was an exception
            return BadRequest(ex);
        }
    }

    [HttpPost("Schools")]
    public async Task<IActionResult> AddSchool([FromBody] DistrictSchools districtSchools)
    {
        try
        {
            var results = await districtService.AddSchoolToDistrict(districtSchools);
            return Ok(mapper.Map<DistrictModel>(results));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while adding a school to a district-");
            // return error message if there was an exception
            return BadRequest(ex);
        }
    }
    
}