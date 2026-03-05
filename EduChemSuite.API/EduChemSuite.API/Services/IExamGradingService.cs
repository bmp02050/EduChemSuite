using EduChemSuite.API.Entities;
using EduChemSuite.API.Helpers;
using EduChemSuite.API.Hubs;
using EduChemSuite.API.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace EduChemSuite.API.Services;

public interface IExamGradingService
{
    Task GradeExamAsync(Guid gradeId, Guid examId, Guid userId);
}

public class ExamGradingService(
    IExamQuestionService examQuestionService,
    IExamResponseService examResponseService,
    IGradeService gradeService,
    IExamService examService,
    IHubContext<MessageHub> hubContext,
    ILogger<ExamGradingService> logger) : IExamGradingService
{
    private static bool IsDiagramQuestion(string? questionTypeDescription) =>
        QuestionTypeHelper.IsDiagram(questionTypeDescription);

    private static bool IsAtomicStructureQuestion(string? questionTypeDescription) =>
        QuestionTypeHelper.IsAtomicStructure(questionTypeDescription);

    private static bool IsChemicalEquationQuestion(string? desc) =>
        QuestionTypeHelper.IsChemicalEquation(desc);

    private static bool IsElectronConfigQuestion(string? desc) =>
        QuestionTypeHelper.IsElectronConfig(desc);

    private static bool IsPeriodicTableQuestion(string? desc) =>
        QuestionTypeHelper.IsPeriodicTable(desc);

    private static bool IsStoichiometryQuestion(string? desc) =>
        QuestionTypeHelper.IsStoichiometry(desc);

    private static bool IsLewisStructureQuestion(string? desc) =>
        QuestionTypeHelper.IsLewisStructure(desc);

    public async Task GradeExamAsync(Guid gradeId, Guid examId, Guid userId)
    {
        try
        {
            var exam = await examService.GetById(examId);
            if (exam == null)
            {
                logger.LogError("Exam {ExamId} not found during grading", examId);
                await FailGrade(gradeId);
                return;
            }

            var examQuestions = await examQuestionService.ListByExam(examId);
            var totalQuestions = examQuestions.Count();
            var correctCount = 0;
            var pendingReview = 0;

            var savedResponses = await examResponseService.ListByExamAndUser(examId, userId);
            var respondedSlotIds = new HashSet<Guid>();
            foreach (var r in savedResponses)
            {
                if (r.ExamQuestionId.HasValue)
                    respondedSlotIds.Add(r.ExamQuestionId.Value);
                else
                    // Legacy: fall back to marking all exam questions with this QuestionId
                    foreach (var eq in examQuestions.Where(eq => eq.QuestionId == r.QuestionId))
                        respondedSlotIds.Add(eq.Id);
            }

            foreach (var response in savedResponses)
            {
                var examQuestion = response.ExamQuestionId.HasValue
                    ? examQuestions.FirstOrDefault(eq => eq.Id == response.ExamQuestionId.Value)
                    : examQuestions.FirstOrDefault(eq => eq.QuestionId == response.QuestionId);
                if (examQuestion?.Question == null) continue;

                var hasAnswers = examQuestion.Question.Answers?.Any() == true;
                bool? isCorrect = null;
                var isGraded = false;
                var qtDesc = examQuestion.Question.QuestionType?.Description;
                var isDiagramType = IsDiagramQuestion(qtDesc);
                var isAtomicStructureType = IsAtomicStructureQuestion(qtDesc);
                var isChemicalEquationType = IsChemicalEquationQuestion(qtDesc);
                var isElectronConfigType = IsElectronConfigQuestion(qtDesc);
                var isPeriodicTableType = IsPeriodicTableQuestion(qtDesc);
                var isStoichiometryType = IsStoichiometryQuestion(qtDesc);
                var isLewisStructureType = IsLewisStructureQuestion(qtDesc);

                if (isAtomicStructureType && !string.IsNullOrEmpty(response.ResponseText))
                {
                    var correctAnswer = examQuestion.Question.Answers?.FirstOrDefault(a => a.IsCorrect);
                    if (correctAnswer != null)
                    {
                        var result = AtomicStructureComparer.Compare(
                            correctAnswer.AnswerText, response.ResponseText);

                        isCorrect = result == AtomicStructureResult.Correct;
                        isGraded = true;
                    }
                    else
                    {
                        isCorrect = false;
                        isGraded = true;
                    }
                    if (isCorrect == true) correctCount++;
                }
                else if (isDiagramType && !string.IsNullOrEmpty(response.ResponseText))
                {
                    var correctAnswer = examQuestion.Question.Answers?.FirstOrDefault(a => a.IsCorrect);
                    if (correctAnswer != null)
                    {
                        var result = MoleculeGraphComparer.CheckDiagram(
                            correctAnswer.AnswerText, response.ResponseText,
                            tolerancePercent: examQuestion.AngleTolerancePercent);

                        switch (result)
                        {
                            case DiagramResult.Correct:
                                isCorrect = true;
                                isGraded = true;
                                break;
                            case DiagramResult.TopologyWrong:
                                isCorrect = false;
                                isGraded = true;
                                break;
                            case DiagramResult.AnglesWrong:
                                // Right structure but angles off — flag for teacher review
                                isCorrect = null;
                                isGraded = false;
                                pendingReview++;
                                break;
                        }
                    }
                    else
                    {
                        isCorrect = false;
                        isGraded = true;
                    }
                    if (isCorrect == true) correctCount++;
                }
                else if (isChemicalEquationType && !string.IsNullOrEmpty(response.ResponseText))
                {
                    var correctAnswer = examQuestion.Question.Answers?.FirstOrDefault(a => a.IsCorrect);
                    if (correctAnswer != null)
                    {
                        var result = ChemicalEquationComparer.Compare(
                            correctAnswer.AnswerText, response.ResponseText);
                        isCorrect = result == ChemicalEquationResult.Correct;
                    }
                    else isCorrect = false;
                    isGraded = true;
                    if (isCorrect == true) correctCount++;
                }
                else if (isElectronConfigType && !string.IsNullOrEmpty(response.ResponseText))
                {
                    var correctAnswer = examQuestion.Question.Answers?.FirstOrDefault(a => a.IsCorrect);
                    if (correctAnswer != null)
                    {
                        var result = ElectronConfigComparer.Compare(
                            correctAnswer.AnswerText, response.ResponseText);
                        isCorrect = result == ElectronConfigResult.Correct;
                    }
                    else isCorrect = false;
                    isGraded = true;
                    if (isCorrect == true) correctCount++;
                }
                else if (isPeriodicTableType && !string.IsNullOrEmpty(response.ResponseText))
                {
                    var correctAnswer = examQuestion.Question.Answers?.FirstOrDefault(a => a.IsCorrect);
                    if (correctAnswer != null)
                    {
                        var result = PeriodicTableQuizComparer.Compare(
                            correctAnswer.AnswerText, response.ResponseText);
                        isCorrect = result == PeriodicTableResult.Correct;
                    }
                    else isCorrect = false;
                    isGraded = true;
                    if (isCorrect == true) correctCount++;
                }
                else if (isStoichiometryType && !string.IsNullOrEmpty(response.ResponseText))
                {
                    var correctAnswer = examQuestion.Question.Answers?.FirstOrDefault(a => a.IsCorrect);
                    if (correctAnswer != null)
                    {
                        var result = StoichiometryComparer.Compare(
                            correctAnswer.AnswerText, response.ResponseText);
                        isCorrect = result == StoichiometryResult.Correct;
                    }
                    else isCorrect = false;
                    isGraded = true;
                    if (isCorrect == true) correctCount++;
                }
                else if (isLewisStructureType && !string.IsNullOrEmpty(response.ResponseText))
                {
                    var correctAnswer = examQuestion.Question.Answers?.FirstOrDefault(a => a.IsCorrect);
                    if (correctAnswer != null)
                    {
                        var result = MoleculeGraphComparer.CheckLewisStructure(
                            correctAnswer.AnswerText, response.ResponseText);

                        switch (result)
                        {
                            case LewisStructureResult.Correct:
                                isCorrect = true;
                                isGraded = true;
                                break;
                            case LewisStructureResult.TopologyWrong:
                                isCorrect = false;
                                isGraded = true;
                                break;
                            case LewisStructureResult.LonePairsWrong:
                            case LewisStructureResult.FormalChargesWrong:
                                isCorrect = null;
                                isGraded = false;
                                pendingReview++;
                                break;
                        }
                    }
                    else
                    {
                        isCorrect = false;
                        isGraded = true;
                    }
                    if (isCorrect == true) correctCount++;
                }
                else if (hasAnswers && !isDiagramType)
                {
                    isGraded = true;
                    if (response.AnswerId.HasValue)
                    {
                        var selectedAnswer = examQuestion.Question.Answers?
                            .FirstOrDefault(a => a.Id == response.AnswerId.Value);
                        isCorrect = selectedAnswer?.IsCorrect == true;
                    }
                    else
                    {
                        isCorrect = false;
                    }
                    if (isCorrect == true) correctCount++;
                }
                else
                {
                    pendingReview++;
                }

                response.IsCorrect = isCorrect;
                response.IsGraded = isGraded;
                await examResponseService.Update(response);
            }

            foreach (var eq in examQuestions)
            {
                if (eq.Question == null) continue;
                if (respondedSlotIds.Contains(eq.Id)) continue;

                var hasAnswers = eq.Question.Answers?.Any() == true;
                var isToolType = QuestionTypeHelper.IsAutoGradedTool(eq.Question.QuestionType?.Description);

                if (!isToolType && !hasAnswers)
                {
                    pendingReview++;
                }
            }

            var gradableQuestions = totalQuestions - pendingReview;
            var gradeValue = gradableQuestions > 0
                ? Math.Round((decimal)correctCount / gradableQuestions * 100, 2)
                : 0m;

            // Update the grade record
            var grade = await gradeService.GetById(gradeId);
            if (grade == null)
            {
                logger.LogError("Grade {GradeId} not found during grading", gradeId);
                return;
            }

            grade.GradeValue = gradeValue;
            grade.GradingStatus = GradingStatus.Completed;
            await gradeService.Update(grade);

            // Notify student via SignalR
            var connectionIds = MessageHub.GetConnectionIds(userId.ToString()).ToList();
            if (connectionIds.Count > 0)
            {
                await hubContext.Clients.Clients(connectionIds)
                    .SendAsync("GradeReady", new { gradeId, examId, gradeValue });
            }

            logger.LogInformation("Graded exam {ExamId}", examId);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to grade exam {ExamId} for user {UserId}", examId, userId);
            await FailGrade(gradeId);
        }
    }

    private async Task FailGrade(Guid gradeId)
    {
        try
        {
            var grade = await gradeService.GetById(gradeId);
            if (grade != null)
            {
                grade.GradingStatus = GradingStatus.Failed;
                await gradeService.Update(grade);
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to update grade {GradeId} to Failed status", gradeId);
        }
    }
}
