using EduChemSuite.API.Models;
using EduChemSuite.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduChemSuite.API.Controllers;

[Authorize(Policy = "IsAdminOrStaff")]
[ApiController]
[Route("api/[controller]")]
public class ExamController(
    ILogger<ExamController> logger,
    IExamService examService,
    ISearchService searchService,
    IExamQuestionService examQuestionService,
    IExamAssignmentService examAssignmentService) : Controller
{
    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] SearchQueryModel query)
    {
        try
        {
            var result = await searchService.SearchExams(query);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while searching exams");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("")]
    public async Task<IActionResult> ListAll([FromQuery] bool includeInactive = false)
    {
        try
        {
            var result = await examService.ListAll(includeInactive);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred listing exams");
            return BadRequest(ex);
        }
    }

    [HttpPatch("{id}/toggle-active")]
    public async Task<IActionResult> ToggleActive(Guid id)
    {
        try
        {
            var result = await examService.ToggleActive(id);
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred toggling active status for exam {Id}", id);
            return BadRequest(ex);
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var result = await examService.GetById(id);
            if (result == null) return NotFound();
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while retrieving exam {Id}", id);
            return BadRequest(ex);
        }
    }

    [HttpPost("")]
    public async Task<IActionResult> Create([FromBody] ExamModel examModel)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        try
        {
            if (examModel.Id != Guid.Empty)
                throw new Exception("Exam already exists");

            var result = await examService.Create(examModel);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred during Exam creation");
            return BadRequest(ex);
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] ExamModel exam)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        try
        {
            exam.Id = id;
            var result = await examService.Update(exam);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred during Exam update");
            return BadRequest(ex);
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            var result = await examService.Delete(id);
            if (!result) return NotFound();
            return Ok();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while deleting exam {Id}", id);
            return BadRequest(ex);
        }
    }

    // ExamQuestion sub-resource endpoints

    [HttpGet("{examId}/questions")]
    public async Task<IActionResult> ListQuestions(Guid examId)
    {
        try
        {
            var result = await examQuestionService.ListByExam(examId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred listing questions for exam {ExamId}", examId);
            return BadRequest(ex);
        }
    }

    [HttpPost("{examId}/questions")]
    public async Task<IActionResult> AddQuestion(Guid examId, [FromBody] ExamQuestionModel examQuestion)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        try
        {
            examQuestion.ExamId = examId;
            var result = await examQuestionService.Create(examQuestion);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred adding question to exam {ExamId}", examId);
            return BadRequest(ex);
        }
    }

    [HttpPut("{examId}/questions/{examQuestionId}")]
    public async Task<IActionResult> UpdateQuestion(Guid examId, Guid examQuestionId, [FromBody] ExamQuestionModel examQuestion)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        try
        {
            examQuestion.Id = examQuestionId;
            examQuestion.ExamId = examId;
            var result = await examQuestionService.Update(examQuestion);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred updating question {ExamQuestionId} on exam {ExamId}", examQuestionId, examId);
            return BadRequest(ex);
        }
    }

    [HttpDelete("{examId}/questions/{examQuestionId}")]
    public async Task<IActionResult> RemoveQuestion(Guid examId, Guid examQuestionId)
    {
        try
        {
            var result = await examQuestionService.Delete(examQuestionId);
            if (!result) return NotFound();
            return Ok();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred removing question {ExamQuestionId} from exam {ExamId}", examQuestionId, examId);
            return BadRequest(ex);
        }
    }

    // ExamAssignment endpoints

    [HttpGet("{examId}/assignments")]
    public async Task<IActionResult> ListAssignments(Guid examId)
    {
        try
        {
            var result = await examAssignmentService.ListByExam(examId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred listing assignments for exam {ExamId}", examId);
            return BadRequest(ex);
        }
    }

    [HttpPost("{examId}/assign/{userId}")]
    public async Task<IActionResult> AssignStudent(Guid examId, Guid userId)
    {
        try
        {
            var existing = await examAssignmentService.GetByExamAndUser(examId, userId);
            if (existing != null) return Conflict(new { message = "Student is already assigned to this exam" });

            var assignment = new ExamAssignmentModel
            {
                ExamId = examId,
                UserId = userId,
            };
            var result = await examAssignmentService.Create(assignment);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred assigning user {UserId} to exam {ExamId}", userId, examId);
            return BadRequest(ex);
        }
    }

    [HttpGet("{examId}/preview")]
    public async Task<IActionResult> Preview(Guid examId)
    {
        try
        {
            var exam = await examService.GetById(examId);
            if (exam == null) return NotFound();

            var examQuestions = await examQuestionService.ListByExam(examId);
            var questions = examQuestions
                .Where(eq => eq.Question != null)
                .Select(eq => eq.Question!)
                .OrderBy(_ => Guid.NewGuid())
                .Select(q => new
                {
                    q.Id,
                    q.QuestionText,
                    q.QuestionTypeId,
                    QuestionType = q.QuestionType != null ? new { q.QuestionType.Id, q.QuestionType.Description } : null,
                    Answers = q.Answers?
                        .OrderBy(_ => Guid.NewGuid())
                        .Select(a => new { a.Id, a.AnswerText, a.IsCorrect })
                        .ToList(),
                })
                .ToList();

            return Ok(new
            {
                exam.Id,
                exam.Name,
                exam.Description,
                exam.TimeLimitMinutes,
                Questions = questions,
            });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred previewing exam {ExamId}", examId);
            return BadRequest(ex);
        }
    }

    [HttpDelete("{examId}/assign/{userId}")]
    public async Task<IActionResult> UnassignStudent(Guid examId, Guid userId)
    {
        try
        {
            var result = await examAssignmentService.DeleteByExamAndUser(examId, userId);
            if (!result) return NotFound();
            return Ok();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred unassigning user {UserId} from exam {ExamId}", userId, examId);
            return BadRequest(ex);
        }
    }
}
