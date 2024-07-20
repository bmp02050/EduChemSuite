using EduChemSuite.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduChemSuite.API.Services;

public interface IQuestionService : IBaseService<Question>
{
    public Task<IEnumerable<Question>> FindById(Guid id);
    public Task<IEnumerable<Question>> SearchTags(IEnumerable<String> tags);
}

public class QuestionService(Context context, DbSet<Question> questions)
    : BaseService<Question>(context, questions), IQuestionService
{
    private readonly DbSet<Question> _questions = questions;

    public async Task<IEnumerable<Question>> FindById(Guid id)
    {
        return await _questions.Where(
                x => x.Id == id ||
                     x.UserId == id ||
                     x.QuestionTypeId == id)
            .ToListAsync();
    }

    public async Task<IEnumerable<Question>> SearchTags(IEnumerable<string> tags)
    {
        var tagList = tags.ToList();
        var results = await _questions
            .Where(q => q.QuestionTags != null && q.QuestionTags
                .Any(qt => qt.Tag != null && tagList.Contains(qt.Tag.TagText)))
            .ToListAsync();
        return results;
    }
}