using CsvHelper.Configuration;

namespace EduChemSuite.API.Helpers;

public class UserCsvRow
{
    public string FirstName { get; set; } = "";
    public string LastName { get; set; } = "";
    public string Email { get; set; } = "";
    public string AccountType { get; set; } = "";
    public string Address { get; set; } = "";
    public string City { get; set; } = "";
    public string State { get; set; } = "";
    public string Country { get; set; } = "";
    public string Zip { get; set; } = "";
    public string Phone { get; set; } = "";
    public bool VerifiedEmail { get; set; }
    public bool IsActive { get; set; }
    public string Schools { get; set; } = "";
    public string Districts { get; set; } = "";
    public DateTime CreatedAt { get; set; }
}

public sealed class UserCsvMap : ClassMap<UserCsvRow>
{
    public UserCsvMap()
    {
        Map(m => m.FirstName).Name("First Name");
        Map(m => m.LastName).Name("Last Name");
        Map(m => m.Email).Name("Email");
        Map(m => m.AccountType).Name("Account Type");
        Map(m => m.Address).Name("Address");
        Map(m => m.City).Name("City");
        Map(m => m.State).Name("State");
        Map(m => m.Country).Name("Country");
        Map(m => m.Zip).Name("Zip");
        Map(m => m.Phone).Name("Phone");
        Map(m => m.VerifiedEmail).Name("Verified");
        Map(m => m.IsActive).Name("Active");
        Map(m => m.Schools).Name("Schools");
        Map(m => m.Districts).Name("Districts");
        Map(m => m.CreatedAt).Name("Created At");
    }
}

public class DistrictCsvRow
{
    public string DistrictName { get; set; } = "";
    public int SchoolCount { get; set; }
    public int AdministratorCount { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public sealed class DistrictCsvMap : ClassMap<DistrictCsvRow>
{
    public DistrictCsvMap()
    {
        Map(m => m.DistrictName).Name("District Name");
        Map(m => m.SchoolCount).Name("# Schools");
        Map(m => m.AdministratorCount).Name("# Administrators");
        Map(m => m.IsActive).Name("Active");
        Map(m => m.CreatedAt).Name("Created At");
    }
}

public class SchoolCsvRow
{
    public string Name { get; set; } = "";
    public string District { get; set; } = "";
    public int StaffCount { get; set; }
    public int StudentCount { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public sealed class SchoolCsvMap : ClassMap<SchoolCsvRow>
{
    public SchoolCsvMap()
    {
        Map(m => m.Name).Name("School Name");
        Map(m => m.District).Name("District");
        Map(m => m.StaffCount).Name("# Staff");
        Map(m => m.StudentCount).Name("# Students");
        Map(m => m.IsActive).Name("Active");
        Map(m => m.CreatedAt).Name("Created At");
    }
}

public class QuestionCsvRow
{
    public string QuestionText { get; set; } = "";
    public string QuestionType { get; set; } = "";
    public string AuthorEmail { get; set; } = "";
    public string AuthorName { get; set; } = "";
    public int AnswerCount { get; set; }
    public string Tags { get; set; } = "";
    public int Version { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public sealed class QuestionCsvMap : ClassMap<QuestionCsvRow>
{
    public QuestionCsvMap()
    {
        Map(m => m.QuestionText).Name("Question Text");
        Map(m => m.QuestionType).Name("Question Type");
        Map(m => m.AuthorEmail).Name("Author Email");
        Map(m => m.AuthorName).Name("Author Name");
        Map(m => m.AnswerCount).Name("# Answers");
        Map(m => m.Tags).Name("Tags");
        Map(m => m.Version).Name("Version");
        Map(m => m.IsActive).Name("Active");
        Map(m => m.CreatedAt).Name("Created At");
    }
}

public class ExamCsvRow
{
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
    public int? TimeLimitMinutes { get; set; }
    public bool AllowRetakes { get; set; }
    public int MaxAttempts { get; set; }
    public bool IsTest { get; set; }
    public int QuestionCount { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public sealed class ExamCsvMap : ClassMap<ExamCsvRow>
{
    public ExamCsvMap()
    {
        Map(m => m.Name).Name("Name");
        Map(m => m.Description).Name("Description");
        Map(m => m.TimeLimitMinutes).Name("Time Limit (min)");
        Map(m => m.AllowRetakes).Name("Allow Retakes");
        Map(m => m.MaxAttempts).Name("Max Attempts");
        Map(m => m.IsTest).Name("Is Test");
        Map(m => m.QuestionCount).Name("# Questions");
        Map(m => m.IsActive).Name("Active");
        Map(m => m.CreatedAt).Name("Created At");
    }
}

public class GradeCsvRow
{
    public string StudentEmail { get; set; } = "";
    public string StudentName { get; set; } = "";
    public string ExamName { get; set; } = "";
    public decimal Grade { get; set; }
    public DateTime CreatedAt { get; set; }
}

public sealed class GradeCsvMap : ClassMap<GradeCsvRow>
{
    public GradeCsvMap()
    {
        Map(m => m.StudentEmail).Name("Student Email");
        Map(m => m.StudentName).Name("Student Name");
        Map(m => m.ExamName).Name("Exam Name");
        Map(m => m.Grade).Name("Grade");
        Map(m => m.CreatedAt).Name("Created At");
    }
}

public class ExamResponseCsvRow
{
    public string StudentEmail { get; set; } = "";
    public string StudentName { get; set; } = "";
    public string ExamName { get; set; } = "";
    public string QuestionText { get; set; } = "";
    public string ResponseText { get; set; } = "";
    public string SelectedAnswer { get; set; } = "";
    public bool? IsCorrect { get; set; }
    public bool IsGraded { get; set; }
    public DateTime CreatedAt { get; set; }
}

public sealed class ExamResponseCsvMap : ClassMap<ExamResponseCsvRow>
{
    public ExamResponseCsvMap()
    {
        Map(m => m.StudentEmail).Name("Student Email");
        Map(m => m.StudentName).Name("Student Name");
        Map(m => m.ExamName).Name("Exam Name");
        Map(m => m.QuestionText).Name("Question Text");
        Map(m => m.ResponseText).Name("Response Text");
        Map(m => m.SelectedAnswer).Name("Selected Answer");
        Map(m => m.IsCorrect).Name("Is Correct");
        Map(m => m.IsGraded).Name("Is Graded");
        Map(m => m.CreatedAt).Name("Created At");
    }
}
