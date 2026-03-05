using AutoMapper;
using EduChemSuite.API.Models;
using EduChemSuite.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduChemSuite.API.Controllers;

[Authorize(Policy = "IsAdminOrStaff")]
[ApiController]
[Route("api/[controller]")]
public class QuestionsController(
    ILogger<QuestionsController> logger,
    IQuestionService questionService,
    ISearchService searchService,
    IAnswerService answerService,
    IQuestionTagService questionTagService,
    IMapper mapper) : Controller
{
    [HttpGet("search/advanced")]
    public async Task<IActionResult> SearchAdvanced([FromQuery] SearchQueryModel query)
    {
        try
        {
            var result = await searchService.SearchQuestions(query);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while searching questions");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("")]
    public async Task<IActionResult> Create([FromBody] QuestionModel questionModel)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        try
        {
            if (questionModel.Id != Guid.Empty)
                throw new Exception("Question already exists");

            var result = await questionService.Create(questionModel);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred during Question creation");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("")]
    public async Task<IActionResult> ListAll([FromQuery] bool includeInactive = false)
    {
        try
        {
            var result = await questionService.ListAll(includeInactive);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred listing all questions");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPatch("{id}/toggle-active")]
    public async Task<IActionResult> ToggleActive(Guid id)
    {
        try
        {
            var result = await questionService.ToggleActive(id);
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred toggling active status for question {Id}", id);
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{questionId}")]
    public async Task<IActionResult> Update(Guid questionId, [FromBody] QuestionModel question)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        try
        {
            question.Id = questionId;
            var result = await questionService.Update(question);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred during Question update");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var result = await questionService.GetById(id);
            if (result == null) return NotFound();
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while retrieving question {Id}", id);
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> ListByUser(Guid userId)
    {
        try
        {
            var result = await questionService.ListByUser(userId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred during Question listing for user {UserId}", userId);
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            var result = await questionService.Delete(id);
            if (!result) return NotFound();
            return Ok();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while deleting question {Id}", id);
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("search")]
    public async Task<IActionResult> SearchTags([FromQuery] string tags)
    {
        try
        {
            var tagList = tags.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            var result = await questionService.SearchTags(tagList);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred during Question search by tags");
            return BadRequest(new { message = ex.Message });
        }
    }

    // Suggested answers from similarly-tagged questions
    [HttpGet("{questionId}/suggested-answers")]
    public async Task<IActionResult> GetSuggestedAnswers(Guid questionId)
    {
        try
        {
            var question = await questionService.GetById(questionId);
            if (question == null) return NotFound();

            var tagIds = question.QuestionTags?.Select(qt => qt.TagId).ToList();
            if (tagIds == null || tagIds.Count == 0) return Ok(Array.Empty<AnswerModel>());

            var suggestedAnswers = await answerService.ListByTags(tagIds!, questionId);
            return Ok(suggestedAnswers);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred getting suggested answers for question {QuestionId}", questionId);
            return BadRequest(new { message = ex.Message });
        }
    }

    // Answer sub-resource endpoints

    [HttpGet("{questionId}/answers")]
    public async Task<IActionResult> ListAnswers(Guid questionId)
    {
        try
        {
            var result = await answerService.ListByQuestion(questionId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred listing answers for question {QuestionId}", questionId);
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{questionId}/answers")]
    public async Task<IActionResult> CreateAnswer(Guid questionId, [FromBody] AnswerModel answer)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        try
        {
            answer.QuestionId = questionId;
            var result = await answerService.Create(answer);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred creating answer for question {QuestionId}", questionId);
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{questionId}/answers/{answerId}")]
    public async Task<IActionResult> UpdateAnswer(Guid questionId, Guid answerId, [FromBody] AnswerModel answer)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        try
        {
            answer.Id = answerId;
            answer.QuestionId = questionId;
            var result = await answerService.Update(answer);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred updating answer {AnswerId}", answerId);
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{questionId}/answers/{answerId}")]
    public async Task<IActionResult> DeleteAnswer(Guid questionId, Guid answerId)
    {
        try
        {
            var result = await answerService.Delete(answerId);
            if (!result) return NotFound();
            return Ok();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred deleting answer {AnswerId}", answerId);
            return BadRequest(new { message = ex.Message });
        }
    }

    // Tag sub-resource endpoints

    [HttpGet("{questionId}/tags")]
    public async Task<IActionResult> ListTags(Guid questionId)
    {
        try
        {
            var result = await questionTagService.ListByQuestion(questionId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred listing tags for question {QuestionId}", questionId);
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{questionId}/tags")]
    public async Task<IActionResult> AddTag(Guid questionId, [FromBody] QuestionTagModel questionTag)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        try
        {
            questionTag.QuestionId = questionId;
            var result = await questionTagService.Create(questionTag);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred adding tag to question {QuestionId}", questionId);
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{questionId}/tags/{questionTagId}")]
    public async Task<IActionResult> RemoveTag(Guid questionId, Guid questionTagId)
    {
        try
        {
            var result = await questionTagService.Delete(questionTagId);
            if (!result) return NotFound();
            return Ok();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred removing tag {QuestionTagId} from question {QuestionId}", questionTagId, questionId);
            return BadRequest(new { message = ex.Message });
        }
    }
}
