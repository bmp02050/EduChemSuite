using EduChemSuite.API.Models;
using EduChemSuite.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduChemSuite.API.Controllers;

[Authorize(Policy = "IsElevatedUser")]
[ApiController]
[Route("api/[controller]")]
public class QuestionTypeController(
    ILogger<QuestionTypeController> logger,
    IQuestionTypeService questionTypeService) : Controller
{
    [HttpGet]
    public async Task<IActionResult> List()
    {
        try
        {
            var result = await questionTypeService.List();
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred during QuestionType listing");
            return BadRequest(ex);
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var result = await questionTypeService.GetById(id);
            if (result == null) return NotFound();
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while retrieving question type {Id}", id);
            return BadRequest(ex);
        }
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] QuestionTypeModel model)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        try
        {
            var result = await questionTypeService.Create(model);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred during QuestionType creation");
            return BadRequest(ex);
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] QuestionTypeModel model)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        try
        {
            model.Id = id;
            var result = await questionTypeService.Update(model);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred during QuestionType update");
            return BadRequest(ex);
        }
    }
}
