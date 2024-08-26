using AutoMapper;
using EduChemSuite.API.Dao;
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
    public async Task<IActionResult> Create([FromBody] QuestionModel questionModel)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            if (questionModel.Id == Guid.Empty)
            {
                var result = await questionService.Create(questionModel);
                await userService.AddQuestionToUser(questionModel);
                return Ok(mapper.Map<QuestionModel>(result));
            }
            else throw new Exception("Question already exists");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred during Question creation");
            return BadRequest(ex);
        }
    }

    [HttpPost("{questionId}")]
    public async Task<IActionResult> Update([FromBody] QuestionModel question)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            if (question.Id == Guid.Empty) 
                throw new Exception("Question ID is empty or does not exist");
            
            var result = await questionService.Update(question);
            return Ok(mapper.Map<QuestionModel>(result));

        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred during Question creation");
            return BadRequest(ex);
        }
    }
    
}