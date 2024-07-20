using EduChemSuite.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduChemSuite.API;

public class Context(DbContextOptions<Context> options) : DbContext(options)
{
    public DbSet<User> Users { get; set; }
    public DbSet<TokenRepository> TokenRepository { get; set; }
    public DbSet<AccountType> AccountTypes { get; set; }
    public DbSet<Answer> Answers { get; set; }
    public DbSet<District> Districts { get; set; }
    public DbSet<Exam> Exams { get; set; }
    public DbSet<ExamQuestion> ExamQuestions { get; set; }
    public DbSet<ExamResponse> ExamResponses { get; set; }
    public DbSet<Grade> Grades { get; set; }
    public DbSet<ImageType> ImageTypes { get; set; }
    public DbSet<Question> Questions { get; set; }
    public DbSet<QuestionTag> QuestionTags { get; set; }
    public DbSet<QuestionType> QuestionTypes { get; set; }
    public DbSet<School> Schools { get; set; }
    public DbSet<Tag> Tags { get; set; }
    public DbSet<RegistrationInviteToken> RegistrationInviteTokens { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
    }
}