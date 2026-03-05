using EduChemSuite.API.Models;
using EduChemSuite.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduChemSuite.API.Controllers;

[Authorize(Policy = "IsElevatedUser")]
[ApiController]
[Route("api/[controller]")]
public class MolecularStructureController(
    ILogger<MolecularStructureController> logger,
    IMolecularStructureService molecularStructureService) : Controller
{
    [HttpGet("")]
    public async Task<IActionResult> List()
    {
        try
        {
            var result = await molecularStructureService.ListAll();
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred listing molecular structures");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var result = await molecularStructureService.GetById(id);
            if (result == null) return NotFound();
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while retrieving molecular structure {Id}", id);
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> ListByUser(Guid userId)
    {
        try
        {
            var result = await molecularStructureService.ListByUser(userId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred listing molecular structures for user {UserId}", userId);
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("")]
    public async Task<IActionResult> Create([FromBody] MolecularStructureModel model)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        try
        {
            var result = await molecularStructureService.Create(model);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred during MolecularStructure creation");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] MolecularStructureModel model)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        try
        {
            model.Id = id;
            var result = await molecularStructureService.Update(model);
            if (result == null) return NotFound();
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred during MolecularStructure update");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            var result = await molecularStructureService.Delete(id);
            if (!result) return NotFound();
            return Ok();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred during MolecularStructure deletion");
            return BadRequest(new { message = ex.Message });
        }
    }
}
