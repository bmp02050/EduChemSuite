using AutoMapper;
using EduChemSuite.API.Dao;
using EduChemSuite.API.Entities;
using EduChemSuite.API.Models;

namespace EduChemSuite.API.Services;

public interface IExamAssignmentService
{
    Task<ExamAssignmentModel?> GetById(Guid id);
    Task<ExamAssignmentModel> Create(ExamAssignmentModel assignment);
    Task<IEnumerable<ExamAssignmentModel>> ListByExam(Guid examId);
    Task<IEnumerable<ExamAssignmentModel>> ListByUser(Guid userId);
    Task<ExamAssignmentModel?> GetByExamAndUser(Guid examId, Guid userId);
    Task<bool> Delete(Guid id);
    Task<bool> DeleteByExamAndUser(Guid examId, Guid userId);
}

public class ExamAssignmentService(IExamAssignmentRepository repository, IMapper mapper)
    : IExamAssignmentService
{
    public async Task<ExamAssignmentModel?> GetById(Guid id)
    {
        return mapper.Map<ExamAssignmentModel>(await repository.GetById(id));
    }

    public async Task<ExamAssignmentModel> Create(ExamAssignmentModel assignment)
    {
        return mapper.Map<ExamAssignmentModel>(
            await repository.Create(mapper.Map<ExamAssignment>(assignment)));
    }

    public async Task<IEnumerable<ExamAssignmentModel>> ListByExam(Guid examId)
    {
        return mapper.Map<IEnumerable<ExamAssignmentModel>>(await repository.ListByExam(examId));
    }

    public async Task<IEnumerable<ExamAssignmentModel>> ListByUser(Guid userId)
    {
        return mapper.Map<IEnumerable<ExamAssignmentModel>>(await repository.ListByUser(userId));
    }

    public async Task<ExamAssignmentModel?> GetByExamAndUser(Guid examId, Guid userId)
    {
        return mapper.Map<ExamAssignmentModel>(await repository.GetByExamAndUser(examId, userId));
    }

    public async Task<bool> Delete(Guid id)
    {
        return await repository.Delete(id);
    }

    public async Task<bool> DeleteByExamAndUser(Guid examId, Guid userId)
    {
        return await repository.DeleteByExamAndUser(examId, userId);
    }
}
