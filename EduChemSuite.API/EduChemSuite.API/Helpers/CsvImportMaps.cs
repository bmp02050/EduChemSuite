using CsvHelper.Configuration;

namespace EduChemSuite.API.Helpers;

public class UserImportRow
{
    public string FirstName { get; set; } = "";
    public string LastName { get; set; } = "";
    public string Email { get; set; } = "";
    public string AccountType { get; set; } = "";
    public string? Password { get; set; }
    public string Address { get; set; } = "";
    public string City { get; set; } = "";
    public string State { get; set; } = "";
    public string Country { get; set; } = "";
    public string Zip { get; set; } = "";
    public string Phone { get; set; } = "";
    public string? SchoolName { get; set; }
    public string? DistrictName { get; set; }
}

public sealed class UserImportMap : ClassMap<UserImportRow>
{
    public UserImportMap()
    {
        Map(m => m.FirstName).Name("First Name");
        Map(m => m.LastName).Name("Last Name");
        Map(m => m.Email).Name("Email");
        Map(m => m.AccountType).Name("Account Type");
        Map(m => m.Password).Name("Password").Optional();
        Map(m => m.Address).Name("Address");
        Map(m => m.City).Name("City");
        Map(m => m.State).Name("State");
        Map(m => m.Country).Name("Country");
        Map(m => m.Zip).Name("Zip");
        Map(m => m.Phone).Name("Phone");
        Map(m => m.SchoolName).Name("School Name").Optional();
        Map(m => m.DistrictName).Name("District Name").Optional();
    }
}

public class DistrictImportRow
{
    public string DistrictName { get; set; } = "";
}

public sealed class DistrictImportMap : ClassMap<DistrictImportRow>
{
    public DistrictImportMap()
    {
        Map(m => m.DistrictName).Name("District Name");
    }
}

public class SchoolImportRow
{
    public string Name { get; set; } = "";
    public string DistrictName { get; set; } = "";
}

public sealed class SchoolImportMap : ClassMap<SchoolImportRow>
{
    public SchoolImportMap()
    {
        Map(m => m.Name).Name("School Name");
        Map(m => m.DistrictName).Name("District Name");
    }
}

public class QuestionImportRow
{
    public string QuestionText { get; set; } = "";
    public string AuthorEmail { get; set; } = "";
    public string QuestionType { get; set; } = "";
    public string? Tags { get; set; }
}

public sealed class QuestionImportMap : ClassMap<QuestionImportRow>
{
    public QuestionImportMap()
    {
        Map(m => m.QuestionText).Name("Question Text");
        Map(m => m.AuthorEmail).Name("Author Email");
        Map(m => m.QuestionType).Name("Question Type");
        Map(m => m.Tags).Name("Tags").Optional();
    }
}

public class AnswerImportRow
{
    public string QuestionText { get; set; } = "";
    public string AnswerText { get; set; } = "";
    public bool IsCorrect { get; set; }
}

public sealed class AnswerImportMap : ClassMap<AnswerImportRow>
{
    public AnswerImportMap()
    {
        Map(m => m.QuestionText).Name("Question Text");
        Map(m => m.AnswerText).Name("Answer Text");
        Map(m => m.IsCorrect).Name("Is Correct");
    }
}

public class GradeImportRow
{
    public string StudentEmail { get; set; } = "";
    public string ExamName { get; set; } = "";
    public decimal GradeValue { get; set; }
}

public sealed class GradeImportMap : ClassMap<GradeImportRow>
{
    public GradeImportMap()
    {
        Map(m => m.StudentEmail).Name("Student Email");
        Map(m => m.ExamName).Name("Exam Name");
        Map(m => m.GradeValue).Name("Grade");
    }
}
