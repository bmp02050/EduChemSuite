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
public class QuestionsController(
    ILogger<QuestionsController> logger,
    IQuestionService questionService,
    IUserService userService,
    IMapper mapper) : Controller
{
    [HttpPost("")]
    public async Task<IActionResult> Create([FromBody] QuestionModel model)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var question = mapper.Map<Question>(model);
            if (question.Id == Guid.Empty)
            {
                var result = await questionService.Create(question);
                await userService.AddQuestionToUser(question);
                return Ok(mapper.Map<QuestionModel>(result));
            }
            else throw new Exception("Question already exists");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred during Question creation");
            // return error message if there was an exception
            return BadRequest(ex);
        }
    }

    [HttpPost("{questionId}")]
    public async Task<IActionResult> Update([FromBody] QuestionModel model)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var question = mapper.Map<Question>(model);
            if (question.Id != Guid.Empty)
            {
                var result = await questionService.Update(question);
                return Ok(mapper.Map<QuestionModel>(result));
            }
            else throw new Exception("Question ID is empty or does not exist");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred during Question creation");
            // return error message if there was an exception
            return BadRequest(ex);
        }
    }
}