using EduChemSuite.API.Entities;
using EduChemSuite.API.Services;
using Microsoft.EntityFrameworkCore;

namespace EduChemSuite.API.Dao;

public interface IExamRepository
{
    Task<Exam?> GetById(Guid id);
    Task<Exam> Create(Exam exam);
    Task<Exam?> Update(Exam exam);
    Task<IEnumerable<Exam?>> Find(Guid id);
}

public class ExamRepository(Context context)
    : BaseService<Exam>(context), IExamRepository
{
    private readonly Context _context = context;

    public async Task<IEnumerable<Exam?>> Find(Guid id)
    {
        return await _context.Exams.Where(x =>
                x.Id == id ||
                x.ExamQuestions.Any(y =>
                    y.QuestionId == id
                    || y.ExamId == id))
            .ToListAsync();
    }
}
