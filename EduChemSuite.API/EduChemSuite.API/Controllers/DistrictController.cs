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
    ISearchService searchService,
    IUserService userService,
    IMapper mapper)
    : Controller
{
    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] SearchQueryModel query)
    {
        try
        {
            var result = await searchService.SearchDistricts(query);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while searching districts");
            return BadRequest(new { message = ex.Message });
        }
    }

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
            DistrictModel district = model;
            DistrictModel? result;

            if (district.Id == Guid.Empty)
            {
                district = await districtService.Create(district);
                result = await districtService.AddUserToDistrict(district.Id, model.UserId);
            }
            else
                result = await districtService.Update(district);

            var updatedDistrict = await districtService.GetById(district.Id);
            return Ok(updatedDistrict);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred during district creation");
            
            return BadRequest(new { message = ex.Message });
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
            logger.LogError(ex, "An error occurred while listing districts");
            return BadRequest(new { message = ex.Message });
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
            logger.LogError(ex, "An error occurred while listing all districts");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("Schools")]
    public async Task<IActionResult> AddSchool([FromBody] DistrictSchoolsModel districtSchools)
    {
        try
        {
            var results = await districtService.AddSchoolToDistrict(districtSchools);
            return Ok(mapper.Map<DistrictModel>(results));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while adding a school to a district");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{districtId}/users/{userId}")]
    public async Task<IActionResult> AddUser(Guid districtId, Guid userId)
    {
        try
        {
            var result = await districtService.AddUserToDistrict(districtId, userId);
            if (result == null) return NotFound();
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while adding user to district");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{districtId}/users/{userId}")]
    public async Task<IActionResult> RemoveUser(Guid districtId, Guid userId)
    {
        try
        {
            var result = await districtService.RemoveUserFromDistrict(districtId, userId);
            if (!result) return NotFound();
            return Ok();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while removing user from district");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("details/{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var result = await districtService.GetById(id);
            if (result == null) return NotFound();
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while retrieving district {DistrictId}", id);
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            var result = await districtService.Delete(id);
            if (!result) return NotFound();
            return Ok();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while deleting district {DistrictId}", id);
            return BadRequest(new { message = ex.Message });
        }
    }
}