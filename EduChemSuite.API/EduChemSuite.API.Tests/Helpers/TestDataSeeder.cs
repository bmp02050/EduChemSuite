using System.Security.Cryptography;
using System.Text;
using EduChemSuite.API;
using EduChemSuite.API.Entities;

namespace EduChemSuite.API.Tests.Helpers;

public static class TestDataSeeder
{
    public static User CreateUser(
        Context context,
        string email,
        string password,
        AccountType accountType,
        Guid? id = null,
        bool verifiedEmail = true,
        bool isActive = true)
    {
        CreatePasswordHash(password, out var hash, out var salt);

        var user = new User
        {
            Id = id ?? Guid.NewGuid(),
            CreatedAt = DateTime.UtcNow,
            IsActive = isActive,
            FirstName = "Test",
            LastName = "User",
            Email = email,
            AccountType = accountType,
            PasswordHash = hash,
            PasswordSalt = salt,
            VerifiedEmail = verifiedEmail,
            Address1 = "123 Test St",
            City = "TestCity",
            State = "TS",
            Country = "US",
            Zip = "12345",
            Phone = "555-0100",
        };

        context.Users.Add(user);
        context.SaveChanges();
        return user;
    }

    public static District CreateDistrict(Context context, string name, Guid? id = null)
    {
        var district = new District
        {
            Id = id ?? Guid.NewGuid(),
            CreatedAt = DateTime.UtcNow,
            IsActive = true,
            DistrictName = name,
        };

        context.Districts.Add(district);
        context.SaveChanges();
        return district;
    }

    public static School CreateSchool(Context context, string name, Guid districtId, Guid? id = null)
    {
        var schoolId = id ?? Guid.NewGuid();
        var school = new School
        {
            Id = schoolId,
            CreatedAt = DateTime.UtcNow,
            IsActive = true,
            Name = name,
        };

        context.Schools.Add(school);
        context.SaveChanges();

        // Link school to district via join table
        if (districtId != Guid.Empty)
        {
            context.Set<DistrictSchools>().Add(new DistrictSchools
            {
                DistrictId = districtId,
                SchoolId = schoolId,
            });
            context.SaveChanges();
        }

        return school;
    }

    public static QuestionType CreateQuestionType(Context context, string description, Guid? id = null)
    {
        var qt = new QuestionType
        {
            Id = id ?? Guid.NewGuid(),
            CreatedAt = DateTime.UtcNow,
            IsActive = true,
            Description = description,
        };

        context.QuestionTypes.Add(qt);
        context.SaveChanges();
        return qt;
    }

    public static Question CreateQuestion(Context context, Guid userId, Guid questionTypeId, string text, Guid? id = null)
    {
        var question = new Question
        {
            Id = id ?? Guid.NewGuid(),
            CreatedAt = DateTime.UtcNow,
            IsActive = true,
            UserId = userId,
            QuestionTypeId = questionTypeId,
            QuestionText = text,
            Version = 1,
        };

        context.Questions.Add(question);
        context.SaveChanges();
        return question;
    }

    public static Exam CreateExam(Context context, string name, Guid? id = null)
    {
        var exam = new Exam
        {
            Id = id ?? Guid.NewGuid(),
            CreatedAt = DateTime.UtcNow,
            IsActive = true,
            Name = name,
            Description = "Test exam",
            ExamQuestions = new List<ExamQuestion>(),
            Grades = new List<Grade>(),
        };

        context.Exams.Add(exam);
        context.SaveChanges();
        return exam;
    }

    public static Tag CreateTag(Context context, string tagText, Guid? id = null)
    {
        var tag = new Tag
        {
            Id = id ?? Guid.NewGuid(),
            CreatedAt = DateTime.UtcNow,
            IsActive = true,
            TagText = tagText,
        };

        context.Tags.Add(tag);
        context.SaveChanges();
        return tag;
    }

    public static Grade CreateGrade(Context context, Guid userId, Guid examId, decimal gradeValue, Guid? id = null)
    {
        var grade = new Grade
        {
            Id = id ?? Guid.NewGuid(),
            CreatedAt = DateTime.UtcNow,
            IsActive = true,
            UserId = userId,
            ExamId = examId,
            GradeValue = gradeValue,
        };

        context.Grades.Add(grade);
        context.SaveChanges();
        return grade;
    }

    private static void CreatePasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
    {
        using var hmac = new HMACSHA512();
        passwordSalt = hmac.Key;
        passwordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
    }
}
