using EduChemSuite.API.Entities;
using EduChemSuite.API.Helpers;
using EduChemSuite.API.Models;
using EduChemSuite.API.Services;
using Hangfire;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduChemSuite.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class StudentExamController(
    ILogger<StudentExamController> logger,
    IExamAssignmentService examAssignmentService,
    IExamService examService,
    IExamQuestionService examQuestionService,
    IExamResponseService examResponseService,
    IGradeService gradeService,
    IAnswerService answerService,
    IBackgroundJobClient backgroundJobClient) : Controller
{
    private static bool IsDiagramQuestion(string? questionTypeDescription) =>
        QuestionTypeHelper.IsDiagram(questionTypeDescription);

    [HttpGet("")]
    public async Task<IActionResult> ListMyExams()
    {
        try
        {
            var userId = User.GetUserId();
            var assignments = await examAssignmentService.ListByUser(userId);

            var result = new List<object>();
            foreach (var assignment in assignments)
            {
                var grades = assignment.Exam?.Grades?
                    .Where(g => g.UserId == userId)
                    .ToList() ?? new List<GradeModel>();

                var attemptCount = grades.Count;
                var maxAttempts = assignment.Exam?.MaxAttempts ?? 1;
                var allowRetakes = assignment.Exam?.AllowRetakes ?? false;

                // Check for in-progress responses (saved but no grade yet)
                var hasResponses = false;
                if (assignment.ExamId != Guid.Empty)
                {
                    var responses = await examResponseService.ListByExamAndUser(assignment.ExamId, userId);
                    hasResponses = responses.Any();
                }

                string status;
                if (attemptCount == 0 && hasResponses)
                    status = "In Progress";
                else if (attemptCount == 0)
                    status = "Not Started";
                else if (allowRetakes && attemptCount < maxAttempts)
                    status = "Can Retake";
                else
                    status = "Completed";

                result.Add(new
                {
                    assignment.Id,
                    assignment.ExamId,
                    assignment.AssignedAt,
                    Exam = assignment.Exam != null ? new
                    {
                        assignment.Exam.Id,
                        assignment.Exam.Name,
                        assignment.Exam.Description,
                        assignment.Exam.TimeLimitMinutes,
                        assignment.Exam.AllowRetakes,
                        assignment.Exam.MaxAttempts,
                        QuestionCount = assignment.Exam.ExamQuestions?.Count ?? 0,
                    } : null,
                    Status = status,
                    AttemptCount = attemptCount,
                    LatestGrade = grades.OrderByDescending(g => g.CreatedAt).FirstOrDefault()?.GradeValue,
                });
            }

            return Ok(result);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred listing student exams");
            return BadRequest(ex);
        }
    }

    [HttpGet("{examId}")]
    public async Task<IActionResult> GetExamForTaking(Guid examId)
    {
        try
        {
            var userId = User.GetUserId();

            // Load exam first to check IsTest flag
            var exam = await examService.GetById(examId);
            if (exam == null) return NotFound();

            if (!exam.IsTest)
            {
                // Verify assignment (skip for test exams)
                var assignment = await examAssignmentService.GetByExamAndUser(examId, userId);
                if (assignment == null) return Forbid();

                // Check attempt limits (skip for test exams)
                var userGrades = exam.Grades?.Where(g => g.UserId == userId).ToList() ?? new List<GradeModel>();
                if (userGrades.Count > 0 && (!exam.AllowRetakes || userGrades.Count >= exam.MaxAttempts))
                    return Conflict(new { message = "Maximum attempts reached" });
            }

            // If a grade already exists, this is a retake — clear old responses
            var existingGrades = exam.Grades?.Where(g => g.UserId == userId).ToList() ?? new List<GradeModel>();
            if (existingGrades.Count > 0)
            {
                await examResponseService.DeleteByExamAndUser(examId, userId);
            }

            // Get exam with questions and answers for taking
            var examQuestions = await examQuestionService.ListByExam(examId);
            var questions = examQuestions
                .Where(eq => eq.Question != null)
                .OrderBy(_ => Guid.NewGuid()) // Randomize question order
                .Select(eq => new
                {
                    ExamQuestionId = eq.Id,
                    eq.Question!.Id,
                    eq.Question!.QuestionText,
                    eq.Question!.QuestionTypeId,
                    QuestionType = eq.Question!.QuestionType != null ? new { eq.Question!.QuestionType.Id, eq.Question!.QuestionType.Description } : null,
                    // Send selectable options only for non-diagram questions (no answer data for diagrams)
                    Options = IsDiagramQuestion(eq.Question!.QuestionType?.Description)
                        ? null
                        : eq.Question!.Answers?
                            .OrderBy(_ => Guid.NewGuid())
                            .Select(a => new { a.Id, Text = a.AnswerText })
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
        catch (UnauthorizedAccessException)
        {
            return Unauthorized();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred getting exam {ExamId} for student", examId);
            return BadRequest(ex);
        }
    }

    [HttpPut("{examId}/response")]
    public async Task<IActionResult> SaveResponse(Guid examId, [FromBody] SubmitResponseModel response)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        try
        {
            var userId = User.GetUserId();

            var exam = await examService.GetById(examId);
            if (exam == null) return NotFound();

            if (!exam.IsTest)
            {
                var assignment = await examAssignmentService.GetByExamAndUser(examId, userId);
                if (assignment == null) return Forbid();
            }

            // Check if a response already exists for this question slot
            var existing = response.ExamQuestionId.HasValue
                ? await examResponseService.FindByExamUserExamQuestion(examId, userId, response.ExamQuestionId.Value)
                : await examResponseService.FindByExamUserQuestion(examId, userId, response.QuestionId);
            if (existing != null)
            {
                existing.AnswerId = response.AnswerId;
                existing.ResponseText = response.ResponseText;
                existing.ResponseImage = response.ResponseImage;
                var updated = await examResponseService.Update(existing);
                return Ok(updated);
            }

            var examResponse = new ExamResponseModel
            {
                ExamId = examId,
                UserId = userId,
                QuestionId = response.QuestionId,
                ExamQuestionId = response.ExamQuestionId,
                AnswerId = response.AnswerId,
                ResponseText = response.ResponseText,
                ResponseImage = response.ResponseImage,
                IsCorrect = null,
                IsGraded = false,
            };
            var created = await examResponseService.Create(examResponse);
            return Ok(created);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred saving response for exam {ExamId}", examId);
            return BadRequest(ex);
        }
    }

    [HttpGet("{examId}/responses")]
    public async Task<IActionResult> GetMyResponses(Guid examId)
    {
        try
        {
            var userId = User.GetUserId();

            var exam = await examService.GetById(examId);
            if (exam == null) return NotFound();

            if (!exam.IsTest)
            {
                var assignment = await examAssignmentService.GetByExamAndUser(examId, userId);
                if (assignment == null) return Forbid();
            }

            var responses = await examResponseService.ListByExamAndUser(examId, userId);
            return Ok(responses);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred getting responses for exam {ExamId}", examId);
            return BadRequest(ex);
        }
    }

    [HttpPost("{examId}/submit")]
    public async Task<IActionResult> SubmitExam(Guid examId)
    {
        try
        {
            var userId = User.GetUserId();

            var exam = await examService.GetById(examId);
            if (exam == null) return NotFound();

            if (!exam.IsTest)
            {
                var assignment = await examAssignmentService.GetByExamAndUser(examId, userId);
                if (assignment == null) return Forbid();

                var existingGrades = exam.Grades?.Where(g => g.UserId == userId).ToList() ?? new List<GradeModel>();
                if (existingGrades.Count > 0 && (!exam.AllowRetakes || existingGrades.Count >= exam.MaxAttempts))
                    return Conflict(new { message = "Maximum attempts reached" });
            }

            // Create a pending grade record
            var grade = new GradeModel
            {
                UserId = userId,
                ExamId = examId,
                GradeValue = 0,
                GradingStatus = GradingStatus.Pending,
            };
            var createdGrade = await gradeService.Create(grade);

            // Enqueue background grading job
            backgroundJobClient.Enqueue<IExamGradingService>(
                svc => svc.GradeExamAsync(createdGrade.Id, examId, userId));

            return StatusCode(202, new
            {
                GradeId = createdGrade.Id,
                Status = "Pending",
            });
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred submitting exam {ExamId}", examId);
            return BadRequest(ex);
        }
    }

    [HttpGet("{examId}/result")]
    public async Task<IActionResult> GetResult(Guid examId)
    {
        try
        {
            var userId = User.GetUserId();

            var exam = await examService.GetById(examId);
            if (exam == null) return NotFound();

            // Get user's grades for this exam
            var grades = exam.Grades?.Where(g => g.UserId == userId)
                .OrderByDescending(g => g.CreatedAt)
                .ToList() ?? new List<GradeModel>();

            if (grades.Count == 0) return NotFound(new { message = "No grade found for this exam" });

            var latestGrade = grades.First();

            // If grading is still pending, return status only — no response data
            if (latestGrade.GradingStatus == GradingStatus.Pending)
            {
                return Ok(new
                {
                    Grade = latestGrade,
                    Exam = new { exam.Id, exam.Name, exam.Description },
                    GradingStatus = "Pending",
                });
            }

            if (latestGrade.GradingStatus == GradingStatus.Failed)
            {
                return Ok(new
                {
                    Grade = latestGrade,
                    Exam = new { exam.Id, exam.Name, exam.Description },
                    GradingStatus = "Failed",
                });
            }

            // Get user's responses
            var responses = await examResponseService.ListByExam(examId);
            var userResponses = responses.Where(r => r.UserId == userId).ToList();

            var totalQuestions = userResponses.Count;
            var correctCount = userResponses.Count(r => r.IsCorrect == true);
            var pendingReview = userResponses.Count(r => !r.IsGraded);

            // Strip answer correctness data — only include what students need for review
            var strippedResponses = userResponses.Select(r => new
            {
                r.Id,
                r.QuestionId,
                r.ExamQuestionId,
                r.ExamId,
                r.AnswerId,
                r.ResponseText,
                r.ResponseImage,
                r.IsCorrect,
                r.IsGraded,
                Question = r.Question != null ? new
                {
                    r.Question.Id,
                    r.Question.QuestionText,
                    r.Question.QuestionType,
                } : null,
                // Only include answer text (selected answer display), never IsCorrect on answers
                Answer = r.Answer != null ? new { r.Answer.Id, r.Answer.AnswerText } : null,
                // For incorrect diagram questions, include the correct answer graph for comparison overlay
                CorrectDiagramGraph = r.IsGraded && r.IsCorrect == false
                    && r.Question != null && IsDiagramQuestion(r.Question.QuestionType?.Description)
                    ? r.Question.Answers?.FirstOrDefault(a => a.IsCorrect)?.AnswerText
                    : null,
                // For incorrect multiple choice, include correct answer text for educational feedback
                CorrectAnswerText = r.IsGraded && r.IsCorrect == false
                    && r.Question != null && !IsDiagramQuestion(r.Question.QuestionType?.Description)
                    ? string.Join(", ", r.Question.Answers?.Where(a => a.IsCorrect).Select(a => a.AnswerText) ?? [])
                    : null,
            }).ToList();

            return Ok(new
            {
                Grade = latestGrade,
                Exam = new { exam.Id, exam.Name, exam.Description },
                GradingStatus = "Completed",
                Responses = strippedResponses,
                TotalQuestions = totalQuestions,
                CorrectAnswers = correctCount,
                PendingReview = pendingReview,
            });
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred getting result for exam {ExamId}", examId);
            return BadRequest(ex);
        }
    }
}
