using EduChemSuite.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduChemSuite.API.Services;

public interface IQuestionService : IBaseService<Question>
{
    public Task<IEnumerable<Question>> FindById(Guid id);
    public Task<IEnumerable<Question>> SearchTags(IEnumerable<String> tags);
}

public class QuestionService(Context context)
    : BaseService<Question>(context), IQuestionService
{

    public async Task<IEnumerable<Question>> FindById(Guid id)
    {
        return await context.Questions.Where(
                x => x.Id == id ||
                     x.UserId == id ||
                     x.QuestionTypeId == id)
            .ToListAsync();
    }

    public async Task<IEnumerable<Question>> SearchTags(IEnumerable<string> tags)
    {
        var tagList = tags.ToList();
        var results = await context.Questions
            .Where(q => q.QuestionTags != null && q.QuestionTags
                .Any(qt => qt.Tag != null && tagList.Contains(qt.Tag.TagText)))
            .ToListAsync();
        return results;
    }
}