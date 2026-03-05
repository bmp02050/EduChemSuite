using System.Globalization;
using CsvHelper;
using CsvHelper.Configuration;
using EduChemSuite.API.Entities;
using EduChemSuite.API.Helpers;
using EduChemSuite.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EduChemSuite.API.Services;

public interface IImportService
{
    Task<ImportResultModel> ImportDistricts(Stream csvStream);
    Task<ImportResultModel> ImportSchools(Stream csvStream);
    Task<ImportResultModel> ImportUsers(Stream csvStream);
    Task<ImportResultModel> ImportQuestions(Stream csvStream);
    Task<ImportResultModel> ImportAnswers(Stream csvStream);
    Task<ImportResultModel> ImportGrades(Stream csvStream);
    byte[] GenerateTemplate(string entityType);
}

public class ImportService(Context context) : IImportService
{
    public async Task<ImportResultModel> ImportDistricts(Stream csvStream)
    {
        var result = new ImportResultModel();
        var rows = ReadCsv<DistrictImportRow, DistrictImportMap>(csvStream, result);
        result.TotalRows = rows.Count;

        foreach (var (row, index) in rows.Select((r, i) => (r, i)))
        {
            try
            {
                if (string.IsNullOrWhiteSpace(row.DistrictName))
                {
                    AddError(result, index + 2, row.DistrictName, "District Name is required");
                    continue;
                }

                var existing = await context.Districts
                    .FirstOrDefaultAsync(d => d.DistrictName.ToLower() == row.DistrictName.ToLower());

                if (existing != null)
                {
                    existing.DistrictName = row.DistrictName;
                    result.UpdatedCount++;
                }
                else
                {
                    context.Districts.Add(new District
                    {
                        Id = Guid.NewGuid(),
                        DistrictName = row.DistrictName,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    });
                    result.CreatedCount++;
                }

                result.SuccessCount++;
            }
            catch (Exception ex)
            {
                AddError(result, index + 2, row.DistrictName, ex.Message);
            }
        }

        await context.SaveChangesAsync();
        return result;
    }

    public async Task<ImportResultModel> ImportSchools(Stream csvStream)
    {
        var result = new ImportResultModel();
        var rows = ReadCsv<SchoolImportRow, SchoolImportMap>(csvStream, result);
        result.TotalRows = rows.Count;

        foreach (var (row, index) in rows.Select((r, i) => (r, i)))
        {
            try
            {
                if (string.IsNullOrWhiteSpace(row.Name))
                {
                    AddError(result, index + 2, row.Name, "School Name is required");
                    continue;
                }

                if (string.IsNullOrWhiteSpace(row.DistrictName))
                {
                    AddError(result, index + 2, row.Name, "District Name is required");
                    continue;
                }

                var district = await context.Districts
                    .FirstOrDefaultAsync(d => d.DistrictName.ToLower() == row.DistrictName.ToLower());

                if (district == null)
                {
                    district = new District
                    {
                        Id = Guid.NewGuid(),
                        DistrictName = row.DistrictName,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    };
                    context.Districts.Add(district);
                    await context.SaveChangesAsync();
                }

                var existing = await context.Schools
                    .Include(s => s.DistrictSchools)
                    .FirstOrDefaultAsync(s => s.Name.ToLower() == row.Name.ToLower()
                        && s.DistrictSchools != null
                        && s.DistrictSchools.Any(ds => ds.DistrictId == district.Id));

                if (existing != null)
                {
                    existing.Name = row.Name;
                    result.UpdatedCount++;
                }
                else
                {
                    var school = new School
                    {
                        Id = Guid.NewGuid(),
                        Name = row.Name,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    };
                    context.Schools.Add(school);
                    context.Set<DistrictSchools>().Add(new DistrictSchools
                    {
                        DistrictId = district.Id,
                        SchoolId = school.Id
                    });
                    result.CreatedCount++;
                }

                result.SuccessCount++;
            }
            catch (Exception ex)
            {
                AddError(result, index + 2, row.Name, ex.Message);
            }
        }

        await context.SaveChangesAsync();
        return result;
    }

    public async Task<ImportResultModel> ImportUsers(Stream csvStream)
    {
        var result = new ImportResultModel();
        var rows = ReadCsv<UserImportRow, UserImportMap>(csvStream, result);
        result.TotalRows = rows.Count;

        foreach (var (row, index) in rows.Select((r, i) => (r, i)))
        {
            try
            {
                if (string.IsNullOrWhiteSpace(row.Email))
                {
                    AddError(result, index + 2, row.Email, "Email is required");
                    continue;
                }

                if (!Enum.TryParse<AccountType>(row.AccountType, true, out var accountType))
                {
                    AddError(result, index + 2, row.Email, $"Invalid Account Type: {row.AccountType}");
                    continue;
                }

                var existing = await context.Users
                    .Include(u => u.UserSchools)
                    .Include(u => u.UserDistricts)
                    .FirstOrDefaultAsync(u => u.Email.ToLower() == row.Email.ToLower());

                if (existing != null)
                {
                    existing.FirstName = row.FirstName;
                    existing.LastName = row.LastName;
                    existing.AccountType = accountType;
                    existing.Address1 = row.Address;
                    existing.City = row.City;
                    existing.State = row.State;
                    existing.Country = row.Country;
                    existing.Zip = row.Zip;
                    existing.Phone = row.Phone;

                    await ResolveUserRelationships(existing, row);
                    result.UpdatedCount++;
                }
                else
                {
                    if (string.IsNullOrWhiteSpace(row.Password))
                    {
                        AddError(result, index + 2, row.Email, "Password is required for new users");
                        continue;
                    }

                    PasswordHelper.CreatePasswordHash(row.Password, out var hash, out var salt);

                    var user = new User
                    {
                        Id = Guid.NewGuid(),
                        FirstName = row.FirstName,
                        LastName = row.LastName,
                        Email = row.Email,
                        AccountType = accountType,
                        PasswordHash = hash,
                        PasswordSalt = salt,
                        Address1 = row.Address,
                        City = row.City,
                        State = row.State,
                        Country = row.Country,
                        Zip = row.Zip,
                        Phone = row.Phone,
                        VerifiedEmail = false,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    };
                    context.Users.Add(user);
                    await context.SaveChangesAsync();
                    await ResolveUserRelationships(user, row);
                    result.CreatedCount++;
                }

                result.SuccessCount++;
            }
            catch (Exception ex)
            {
                AddError(result, index + 2, row.Email, ex.Message);
            }
        }

        await context.SaveChangesAsync();
        return result;
    }

    public async Task<ImportResultModel> ImportQuestions(Stream csvStream)
    {
        var result = new ImportResultModel();
        var rows = ReadCsv<QuestionImportRow, QuestionImportMap>(csvStream, result);
        result.TotalRows = rows.Count;

        foreach (var (row, index) in rows.Select((r, i) => (r, i)))
        {
            try
            {
                if (string.IsNullOrWhiteSpace(row.QuestionText))
                {
                    AddError(result, index + 2, row.QuestionText, "Question Text is required");
                    continue;
                }

                var author = await context.Users
                    .FirstOrDefaultAsync(u => u.Email.ToLower() == row.AuthorEmail.ToLower());

                if (author == null)
                {
                    AddError(result, index + 2, row.QuestionText, $"Author not found: {row.AuthorEmail}");
                    continue;
                }

                var questionType = await context.QuestionTypes
                    .FirstOrDefaultAsync(qt => qt.Description.ToLower() == row.QuestionType.ToLower());

                if (questionType == null)
                {
                    questionType = new QuestionType
                    {
                        Id = Guid.NewGuid(),
                        Description = row.QuestionType,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    };
                    context.QuestionTypes.Add(questionType);
                    await context.SaveChangesAsync();
                }

                var existing = await context.Questions
                    .FirstOrDefaultAsync(q => q.QuestionText.ToLower() == row.QuestionText.ToLower()
                        && q.UserId == author.Id);

                if (existing != null)
                {
                    existing.Version++;
                    existing.QuestionTypeId = questionType.Id;
                    result.UpdatedCount++;
                }
                else
                {
                    var question = new Question
                    {
                        Id = Guid.NewGuid(),
                        QuestionText = row.QuestionText,
                        UserId = author.Id,
                        QuestionTypeId = questionType.Id,
                        Version = 1,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    };
                    context.Questions.Add(question);
                    await context.SaveChangesAsync();

                    if (!string.IsNullOrWhiteSpace(row.Tags))
                    {
                        var tagNames = row.Tags.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
                        foreach (var tagName in tagNames)
                        {
                            var tag = await context.Tags
                                .FirstOrDefaultAsync(t => t.TagText.ToLower() == tagName.ToLower());

                            if (tag == null)
                            {
                                tag = new Tag
                                {
                                    Id = Guid.NewGuid(),
                                    TagText = tagName,
                                    IsActive = true,
                                    CreatedAt = DateTime.UtcNow
                                };
                                context.Tags.Add(tag);
                                await context.SaveChangesAsync();
                            }

                            context.QuestionTags.Add(new QuestionTag
                            {
                                Id = Guid.NewGuid(),
                                QuestionId = question.Id,
                                TagId = tag.Id,
                                IsActive = true,
                                CreatedAt = DateTime.UtcNow
                            });
                        }
                    }

                    result.CreatedCount++;
                }

                result.SuccessCount++;
            }
            catch (Exception ex)
            {
                AddError(result, index + 2, row.QuestionText, ex.Message);
            }
        }

        await context.SaveChangesAsync();
        return result;
    }

    public async Task<ImportResultModel> ImportAnswers(Stream csvStream)
    {
        var result = new ImportResultModel();
        var rows = ReadCsv<AnswerImportRow, AnswerImportMap>(csvStream, result);
        result.TotalRows = rows.Count;

        foreach (var (row, index) in rows.Select((r, i) => (r, i)))
        {
            try
            {
                if (string.IsNullOrWhiteSpace(row.QuestionText) || string.IsNullOrWhiteSpace(row.AnswerText))
                {
                    AddError(result, index + 2, row.AnswerText, "Question Text and Answer Text are required");
                    continue;
                }

                var question = await context.Questions
                    .FirstOrDefaultAsync(q => q.QuestionText.ToLower() == row.QuestionText.ToLower());

                if (question == null)
                {
                    AddError(result, index + 2, row.AnswerText, $"Question not found: {row.QuestionText}");
                    continue;
                }

                var existing = await context.Answers
                    .FirstOrDefaultAsync(a => a.QuestionId == question.Id
                        && a.AnswerText.ToLower() == row.AnswerText.ToLower());

                if (existing != null)
                {
                    existing.IsCorrect = row.IsCorrect;
                    result.UpdatedCount++;
                }
                else
                {
                    context.Answers.Add(new Answer
                    {
                        Id = Guid.NewGuid(),
                        QuestionId = question.Id,
                        AnswerText = row.AnswerText,
                        IsCorrect = row.IsCorrect,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    });
                    result.CreatedCount++;
                }

                result.SuccessCount++;
            }
            catch (Exception ex)
            {
                AddError(result, index + 2, row.AnswerText, ex.Message);
            }
        }

        await context.SaveChangesAsync();
        return result;
    }

    public async Task<ImportResultModel> ImportGrades(Stream csvStream)
    {
        var result = new ImportResultModel();
        var rows = ReadCsv<GradeImportRow, GradeImportMap>(csvStream, result);
        result.TotalRows = rows.Count;

        foreach (var (row, index) in rows.Select((r, i) => (r, i)))
        {
            try
            {
                var student = await context.Users
                    .FirstOrDefaultAsync(u => u.Email.ToLower() == row.StudentEmail.ToLower());

                if (student == null)
                {
                    AddError(result, index + 2, row.StudentEmail, $"Student not found: {row.StudentEmail}");
                    continue;
                }

                var exam = await context.Exams
                    .FirstOrDefaultAsync(e => e.Name.ToLower() == row.ExamName.ToLower());

                if (exam == null)
                {
                    AddError(result, index + 2, row.StudentEmail, $"Exam not found: {row.ExamName}");
                    continue;
                }

                var existing = await context.Grades
                    .FirstOrDefaultAsync(g => g.UserId == student.Id && g.ExamId == exam.Id);

                if (existing != null)
                {
                    existing.GradeValue = row.GradeValue;
                    result.UpdatedCount++;
                }
                else
                {
                    context.Grades.Add(new Grade
                    {
                        Id = Guid.NewGuid(),
                        UserId = student.Id,
                        ExamId = exam.Id,
                        GradeValue = row.GradeValue,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    });
                    result.CreatedCount++;
                }

                result.SuccessCount++;
            }
            catch (Exception ex)
            {
                AddError(result, index + 2, row.StudentEmail, ex.Message);
            }
        }

        await context.SaveChangesAsync();
        return result;
    }

    public byte[] GenerateTemplate(string entityType)
    {
        using var memoryStream = new MemoryStream();
        using var writer = new StreamWriter(memoryStream);
        using var csv = new CsvWriter(writer, CultureInfo.InvariantCulture);

        switch (entityType.ToLower())
        {
            case "districts":
                csv.Context.RegisterClassMap<DistrictImportMap>();
                csv.WriteHeader<DistrictImportRow>();
                break;
            case "schools":
                csv.Context.RegisterClassMap<SchoolImportMap>();
                csv.WriteHeader<SchoolImportRow>();
                break;
            case "users":
                csv.Context.RegisterClassMap<UserImportMap>();
                csv.WriteHeader<UserImportRow>();
                break;
            case "questions":
                csv.Context.RegisterClassMap<QuestionImportMap>();
                csv.WriteHeader<QuestionImportRow>();
                break;
            case "answers":
                csv.Context.RegisterClassMap<AnswerImportMap>();
                csv.WriteHeader<AnswerImportRow>();
                break;
            case "grades":
                csv.Context.RegisterClassMap<GradeImportMap>();
                csv.WriteHeader<GradeImportRow>();
                break;
            default:
                throw new ArgumentException($"Unknown entity type: {entityType}");
        }

        csv.NextRecord();
        writer.Flush();
        return memoryStream.ToArray();
    }

    private async Task ResolveUserRelationships(User user, UserImportRow row)
    {
        if (!string.IsNullOrWhiteSpace(row.SchoolName))
        {
            var school = await context.Schools
                .FirstOrDefaultAsync(s => s.Name.ToLower() == row.SchoolName.ToLower());

            if (school != null)
            {
                var existingJoin = await context.UserSchools
                    .FirstOrDefaultAsync(us => us.UserId == user.Id && us.SchoolId == school.Id);

                if (existingJoin == null)
                {
                    context.UserSchools.Add(new UserSchool
                    {
                        UserId = user.Id,
                        SchoolId = school.Id
                    });
                }
            }
        }

        if (!string.IsNullOrWhiteSpace(row.DistrictName))
        {
            var district = await context.Districts
                .FirstOrDefaultAsync(d => d.DistrictName.ToLower() == row.DistrictName.ToLower());

            if (district != null)
            {
                var existingJoin = await context.UserDistricts
                    .FirstOrDefaultAsync(ud => ud.UserId == user.Id && ud.DistrictId == district.Id);

                if (existingJoin == null)
                {
                    context.UserDistricts.Add(new UserDistrict
                    {
                        UserId = user.Id,
                        DistrictId = district.Id
                    });
                }
            }
        }
    }

    private static List<T> ReadCsv<T, TMap>(Stream stream, ImportResultModel result)
        where TMap : ClassMap<T>
    {
        using var reader = new StreamReader(stream);
        using var csv = new CsvReader(reader, CultureInfo.InvariantCulture);
        csv.Context.RegisterClassMap<TMap>();

        var records = new List<T>();
        try
        {
            records = csv.GetRecords<T>().ToList();
        }
        catch (Exception ex)
        {
            result.Errors.Add(new ImportRowError
            {
                RowNumber = 0,
                RawData = "",
                ErrorMessage = $"CSV parsing error: {ex.Message}"
            });
            result.ErrorCount++;
        }

        return records;
    }

    private static void AddError(ImportResultModel result, int rowNumber, string rawData, string message)
    {
        result.Errors.Add(new ImportRowError
        {
            RowNumber = rowNumber,
            RawData = rawData,
            ErrorMessage = message
        });
        result.ErrorCount++;
    }
}
