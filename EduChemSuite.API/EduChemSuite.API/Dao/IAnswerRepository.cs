using EduChemSuite.API.Entities;

namespace EduChemSuite.API.Dao;

public interface IAnswerRepository
{
    Task<Answer?> GetById(Guid id);
    Task<Answer> Create(Answer answer);
    Task<Answer?> Update(Answer answer);
}