using EduChemSuite.API.Models;
using EduChemSuite.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduChemSuite.API.Controllers;

[Authorize(Policy = "IsElevatedUser")]
[ApiController]
[Route("api/[controller]")]
public class ImageTypeController(
    ILogger<ImageTypeController> logger,
    IImageTypeService imageTypeService) : Controller
{
    [HttpGet("")]
    public async Task<IActionResult> List()
    {
        try
        {
            var result = await imageTypeService.List();
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred listing image types");
            return BadRequest(ex);
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var result = await imageTypeService.GetById(id);
            if (result == null) return NotFound();
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while retrieving image type {Id}", id);
            return BadRequest(ex);
        }
    }

    [HttpPost("")]
    public async Task<IActionResult> Create([FromBody] ImageTypeModel imageTypeModel)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        try
        {
            var result = await imageTypeService.Create(imageTypeModel);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred during ImageType creation");
            return BadRequest(ex);
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] ImageTypeModel imageType)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        try
        {
            imageType.Id = id;
            var result = await imageTypeService.Update(imageType);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred during ImageType update");
            return BadRequest(ex);
        }
    }
}
