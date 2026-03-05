using EduChemSuite.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduChemSuite.API;

public class Context(DbContextOptions<Context> options) : DbContext(options)
{
    public DbSet<User> Users { get; set; }
    public DbSet<Token> Token { get; set; }
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
    public DbSet<UserSchool> UserSchools { get; set; }
    public DbSet<UserDistrict> UserDistricts { get; set; }
    public DbSet<Tag> Tags { get; set; }
    public DbSet<ExamAssignment> ExamAssignments { get; set; }
    public DbSet<RegistrationInviteToken> RegistrationInviteTokens { get; set; }
    public DbSet<PasswordResetToken> PasswordResetTokens { get; set; }
    public DbSet<MolecularStructure> MolecularStructures { get; set; }
    public DbSet<Message> Messages { get; set; }

    public override int SaveChanges()
    {
        var entries = ChangeTracker
            .Entries()
            .Where(e => e is { Entity: BaseEntity, State: EntityState.Added });

        foreach (var entityEntry in entries)
        {
            ((BaseEntity)entityEntry.Entity).CreatedAt = DateTime.UtcNow;
        }
        
        var updates = ChangeTracker
            .Entries()
            .Where(e => e is { Entity: BaseEntity, State: EntityState.Modified });

        foreach (var entityEntry in updates)
        {
            ((BaseEntity)entityEntry.Entity).UpdatedAt = DateTime.UtcNow;
        }

        return base.SaveChanges();
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var entries = ChangeTracker
            .Entries()
            .Where(e => e is { Entity: BaseEntity, State: EntityState.Added });

        foreach (var entityEntry in entries)
        {
            ((BaseEntity)entityEntry.Entity).CreatedAt = DateTime.UtcNow;
        }
        var updates = ChangeTracker
            .Entries()
            .Where(e => e is { Entity: BaseEntity, State: EntityState.Modified });

        foreach (var entityEntry in updates)
        {
            ((BaseEntity)entityEntry.Entity).UpdatedAt = DateTime.UtcNow;
        }
        return base.SaveChangesAsync(cancellationToken);
    }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

// Configure the many-to-many relationship between District and School
        modelBuilder.Entity<DistrictSchools>()
            .HasKey(ds => new { ds.DistrictId, ds.SchoolId });

        modelBuilder.Entity<DistrictSchools>()
            .HasOne(ds => ds.District)
            .WithMany(d => d.Schools)
            .HasForeignKey(ds => ds.DistrictId);

        modelBuilder.Entity<DistrictSchools>()
            .HasOne(ds => ds.School)
            .WithMany(s => s.DistrictSchools)
            .HasForeignKey(ds => ds.SchoolId);

        // Configure the many-to-many relationship between District and UserDistrict
        modelBuilder.Entity<UserDistrict>()
            .HasKey(ud => new { ud.DistrictId, ud.UserId });

        modelBuilder.Entity<UserDistrict>()
            .HasOne(ud => ud.District)
            .WithMany(d => d.Administrators)
            .HasForeignKey(ud => ud.DistrictId);

        modelBuilder.Entity<UserDistrict>()
            .HasOne(ud => ud.User)
            .WithMany(u => u.UserDistricts)
            .HasForeignKey(ud => ud.UserId);

        modelBuilder.Entity<UserSchool>()
            .HasKey(us => new { us.UserId, us.SchoolId });

        modelBuilder.Entity<UserSchool>()
            .HasOne(us => us.User)
            .WithMany(u => u.UserSchools)
            .HasForeignKey(us => us.UserId);

        modelBuilder.Entity<UserSchool>()
            .HasOne(us => us.School)
            .WithMany(s => s.UserSchools)
            .HasForeignKey(us => us.SchoolId);
        
        // Exam and ExamQuestion (one-to-many)
        modelBuilder.Entity<ExamQuestion>()
            .HasOne(eq => eq.Exam)
            .WithMany(e => e.ExamQuestions)
            .HasForeignKey(eq => eq.ExamId);

        // Question and ExamQuestion (one-to-many)
        modelBuilder.Entity<ExamQuestion>()
            .HasOne(eq => eq.Question)
            .WithMany(q => q.ExamQuestions)
            .HasForeignKey(eq => eq.QuestionId);

        // ExamAssignment and Exam (one-to-many)
        modelBuilder.Entity<ExamAssignment>()
            .HasOne(ea => ea.Exam)
            .WithMany(e => e.ExamAssignments)
            .HasForeignKey(ea => ea.ExamId);

        // ExamAssignment and User (one-to-many)
        modelBuilder.Entity<ExamAssignment>()
            .HasOne(ea => ea.User)
            .WithMany()
            .HasForeignKey(ea => ea.UserId);

        // Unique index on ExamAssignment (ExamId, UserId)
        modelBuilder.Entity<ExamAssignment>()
            .HasIndex(ea => new { ea.ExamId, ea.UserId })
            .IsUnique();

        // ExamResponse and Exam (one-to-many)
        modelBuilder.Entity<ExamResponse>()
            .HasOne(er => er.Exam)
            .WithMany()
            .HasForeignKey(er => er.ExamId);

        // ExamResponse and User (one-to-many)
        modelBuilder.Entity<ExamResponse>()
            .HasOne(er => er.User)
            .WithMany(u => u.ExamResponses)
            .HasForeignKey(er => er.UserId);

        // ExamResponse and Question (one-to-many)
        modelBuilder.Entity<ExamResponse>()
            .HasOne(er => er.Question)
            .WithMany(q => q.ExamResponses)
            .HasForeignKey(er => er.QuestionId);

        // ExamResponse and Answer (one-to-many)
        modelBuilder.Entity<ExamResponse>()
            .HasOne(er => er.Answer)
            .WithMany(a => a.ExamResponses)
            .HasForeignKey(er => er.AnswerId);

        // ExamResponse and ImageType (one-to-many)
        modelBuilder.Entity<ExamResponse>()
            .HasOne(er => er.ImageType)
            .WithMany(it => it.ExamResponses)
            .HasForeignKey(er => er.ImageTypeId);

        // Grade and User (one-to-many)
        modelBuilder.Entity<Grade>()
            .HasOne(g => g.User)
            .WithMany(u => u.Grades)
            .HasForeignKey(g => g.UserId);

        // Grade and Exam (one-to-many)
        modelBuilder.Entity<Grade>()
            .HasOne(g => g.Exam)
            .WithMany(e => e.Grades)
            .HasForeignKey(g => g.ExamId);

        // QuestionTag and Question (one-to-many)
        modelBuilder.Entity<QuestionTag>()
            .HasOne(qt => qt.Question)
            .WithMany(q => q.QuestionTags)
            .HasForeignKey(qt => qt.QuestionId);

        // QuestionTag and Tag (one-to-many)
        modelBuilder.Entity<QuestionTag>()
            .HasOne(qt => qt.Tag)
            .WithMany(t => t.QuestionTags)
            .HasForeignKey(qt => qt.TagId);

        // Question and QuestionType (one-to-many)
        modelBuilder.Entity<Question>()
            .HasOne(q => q.QuestionType)
            .WithMany(qt => qt.Questions)
            .HasForeignKey(q => q.QuestionTypeId);

        // Question and User (one-to-many)
        modelBuilder.Entity<Question>()
            .HasOne(q => q.User)
            .WithMany(u => u.Questions)
            .HasForeignKey(q => q.UserId);

        // Answer and Question (one-to-many)
        modelBuilder.Entity<Answer>()
            .HasOne(a => a.Question)
            .WithMany(q => q.Answers)
            .HasForeignKey(a => a.QuestionId);

        // MolecularStructure and User (one-to-many)
        modelBuilder.Entity<MolecularStructure>()
            .HasOne(ms => ms.User)
            .WithMany()
            .HasForeignKey(ms => ms.UserId);

        // Message and User (sender)
        modelBuilder.Entity<Message>()
            .HasOne(m => m.Sender)
            .WithMany(u => u.SentMessages)
            .HasForeignKey(m => m.SenderId)
            .OnDelete(DeleteBehavior.Restrict);

        // Message and User (recipient)
        modelBuilder.Entity<Message>()
            .HasOne(m => m.Recipient)
            .WithMany(u => u.ReceivedMessages)
            .HasForeignKey(m => m.RecipientId)
            .OnDelete(DeleteBehavior.Restrict);

        // Message self-referencing (parent/replies)
        modelBuilder.Entity<Message>()
            .HasOne(m => m.ParentMessage)
            .WithMany(m => m.Replies)
            .HasForeignKey(m => m.ParentMessageId)
            .OnDelete(DeleteBehavior.Restrict);

        // Message indexes
        modelBuilder.Entity<Message>()
            .HasIndex(m => new { m.RecipientId, m.IsRead, m.IsActive });

        modelBuilder.Entity<Message>()
            .HasIndex(m => new { m.ConversationId, m.CreatedAt });

        // Performance indexes
        modelBuilder.Entity<Question>().HasIndex(q => q.UserId);
        modelBuilder.Entity<Question>().HasIndex(q => q.IsActive);
        modelBuilder.Entity<ExamResponse>().HasIndex(er => new { er.ExamId, er.UserId });
        modelBuilder.Entity<Grade>().HasIndex(g => new { g.ExamId, g.UserId });
        modelBuilder.Entity<ExamQuestion>().HasIndex(eq => eq.ExamId);
        modelBuilder.Entity<MolecularStructure>().HasIndex(ms => ms.UserId);
        modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
        modelBuilder.Entity<Message>().HasIndex(m => m.SenderId);

        modelBuilder.Entity<Answer>().Property(e => e.Id).ValueGeneratedOnAdd();
        modelBuilder.Entity<District>().Property(e => e.Id).ValueGeneratedOnAdd();
        modelBuilder.Entity<Exam>().Property(e => e.Id).ValueGeneratedOnAdd();
        modelBuilder.Entity<ExamAssignment>().Property(e => e.Id).ValueGeneratedOnAdd();
        modelBuilder.Entity<ExamQuestion>().Property(e => e.Id).ValueGeneratedOnAdd();
        modelBuilder.Entity<ExamResponse>().Property(e => e.Id).ValueGeneratedOnAdd();
        modelBuilder.Entity<Grade>().Property(e => e.Id).ValueGeneratedOnAdd();
        modelBuilder.Entity<ImageType>().Property(e => e.Id).ValueGeneratedOnAdd();
        modelBuilder.Entity<Question>().Property(e => e.Id).ValueGeneratedOnAdd();
        modelBuilder.Entity<QuestionTag>().Property(e => e.Id).ValueGeneratedOnAdd();
        modelBuilder.Entity<QuestionType>().Property(e => e.Id).ValueGeneratedOnAdd();
        modelBuilder.Entity<PasswordResetToken>().Property(e => e.Id).ValueGeneratedOnAdd();
        modelBuilder.Entity<RegistrationInviteToken>().Property(e => e.Id).ValueGeneratedOnAdd();
        modelBuilder.Entity<School>().Property(e => e.Id).ValueGeneratedOnAdd();
        modelBuilder.Entity<Tag>().Property(e => e.Id).ValueGeneratedOnAdd();
        modelBuilder.Entity<Token>().Property(e => e.Id).ValueGeneratedOnAdd();
        modelBuilder.Entity<User>().Property(e => e.Id).ValueGeneratedOnAdd();
        modelBuilder.Entity<MolecularStructure>().Property(e => e.Id).ValueGeneratedOnAdd();
        modelBuilder.Entity<Message>().Property(e => e.Id).ValueGeneratedOnAdd();
    }
}