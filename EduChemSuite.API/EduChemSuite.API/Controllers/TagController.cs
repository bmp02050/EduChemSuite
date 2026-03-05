using EduChemSuite.API.Models;
using EduChemSuite.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduChemSuite.API.Controllers;

[Authorize(Policy = "IsElevatedUser")]
[ApiController]
[Route("api/[controller]")]
public class TagController(
    ILogger<TagController> logger,
    ITagService tagService) : Controller
{
    [HttpGet]
    public async Task<IActionResult> List()
    {
        try
        {
            var result = await tagService.List();
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred during Tag listing");
            return BadRequest(ex);
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var result = await tagService.GetById(id);
            if (result == null) return NotFound();
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while retrieving tag {Id}", id);
            return BadRequest(ex);
        }
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] TagModel model)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        try
        {
            var result = await tagService.Create(model);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred during Tag creation");
            return BadRequest(ex);
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] TagModel model)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        try
        {
            model.Id = id;
            var result = await tagService.Update(model);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred during Tag update");
            return BadRequest(ex);
        }
    }
}
