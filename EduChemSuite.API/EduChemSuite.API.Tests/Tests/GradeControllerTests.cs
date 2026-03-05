using System.Net;
using System.Text;
using EduChemSuite.API.Entities;
using EduChemSuite.API.Models;
using EduChemSuite.API.Tests.Fixtures;
using EduChemSuite.API.Tests.Helpers;
using FluentAssertions;
using Newtonsoft.Json;

namespace EduChemSuite.API.Tests.Tests;

public class GradeControllerTests : IClassFixture<EduChemTestFactory>
{
    private readonly EduChemTestFactory _factory;

    public GradeControllerTests(EduChemTestFactory factory)
    {
        _factory = factory;
    }

    private StringContent JsonBody(object obj) =>
        new(JsonConvert.SerializeObject(obj), Encoding.UTF8, "application/json");

    [Fact]
    public async Task Create_ReturnsOk()
    {
        var db = _factory.GetDbContext();
        var admin = TestDataSeeder.CreateUser(db, $"grade-admin-create-{Guid.NewGuid()}@test.com", "Pass123!", AccountType.Admin);
        var student = TestDataSeeder.CreateUser(db, $"grade-student-create-{Guid.NewGuid()}@test.com", "Pass123!", AccountType.Student);
        var exam = TestDataSeeder.CreateExam(db, "Grade Create Exam");

        var client = _factory.CreateAuthenticatedClient("Admin", admin.Id);
        var response = await client.PostAsync("/api/grade",
            JsonBody(new
            {
                UserId = student.Id,
                ExamId = exam.Id,
                GradeValue = 95.5m,
            }));

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        var grade = JsonConvert.DeserializeObject<GradeModel>(content);
        grade!.GradeValue.Should().Be(95.5m);
    }

    [Fact]
    public async Task GetByExam_ReturnsGrades()
    {
        var db = _factory.GetDbContext();
        var admin = TestDataSeeder.CreateUser(db, $"grade-admin-byexam-{Guid.NewGuid()}@test.com", "Pass123!", AccountType.Admin);
        var student = TestDataSeeder.CreateUser(db, $"grade-student-byexam-{Guid.NewGuid()}@test.com", "Pass123!", AccountType.Student);
        var exam = TestDataSeeder.CreateExam(db, "Grade ByExam Exam");
        TestDataSeeder.CreateGrade(db, student.Id, exam.Id, 88.0m);

        var client = _factory.CreateAuthenticatedClient("Admin", admin.Id);
        var response = await client.GetAsync($"/api/grade/exam/{exam.Id}");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        var grades = JsonConvert.DeserializeObject<List<GradeModel>>(content);
        grades.Should().NotBeNull();
        grades!.Count.Should().BeGreaterThanOrEqualTo(1);
    }

    [Fact]
    public async Task GetByUser_ReturnsGrades()
    {
        var db = _factory.GetDbContext();
        var admin = TestDataSeeder.CreateUser(db, $"grade-admin-byuser-{Guid.NewGuid()}@test.com", "Pass123!", AccountType.Admin);
        var student = TestDataSeeder.CreateUser(db, $"grade-student-byuser-{Guid.NewGuid()}@test.com", "Pass123!", AccountType.Student);
        var exam = TestDataSeeder.CreateExam(db, "Grade ByUser Exam");
        TestDataSeeder.CreateGrade(db, student.Id, exam.Id, 92.0m);

        var client = _factory.CreateAuthenticatedClient("Admin", admin.Id);
        var response = await client.GetAsync($"/api/grade/user/{student.Id}");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        var grades = JsonConvert.DeserializeObject<List<GradeModel>>(content);
        grades.Should().NotBeNull();
        grades!.Count.Should().BeGreaterThanOrEqualTo(1);
    }

    [Fact]
    public async Task Update_ReturnsOk()
    {
        var db = _factory.GetDbContext();
        var admin = TestDataSeeder.CreateUser(db, $"grade-admin-update-{Guid.NewGuid()}@test.com", "Pass123!", AccountType.Admin);
        var student = TestDataSeeder.CreateUser(db, $"grade-student-update-{Guid.NewGuid()}@test.com", "Pass123!", AccountType.Student);
        var exam = TestDataSeeder.CreateExam(db, "Grade Update Exam");
        var grade = TestDataSeeder.CreateGrade(db, student.Id, exam.Id, 75.0m);

        var client = _factory.CreateAuthenticatedClient("Admin", admin.Id);
        var response = await client.PutAsync($"/api/grade/{grade.Id}",
            JsonBody(new
            {
                UserId = student.Id,
                ExamId = exam.Id,
                GradeValue = 80.0m,
            }));

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task Delete_ReturnsOk()
    {
        var db = _factory.GetDbContext();
        var admin = TestDataSeeder.CreateUser(db, $"grade-admin-delete-{Guid.NewGuid()}@test.com", "Pass123!", AccountType.Admin);
        var student = TestDataSeeder.CreateUser(db, $"grade-student-delete-{Guid.NewGuid()}@test.com", "Pass123!", AccountType.Student);
        var exam = TestDataSeeder.CreateExam(db, "Grade Delete Exam");
        var grade = TestDataSeeder.CreateGrade(db, student.Id, exam.Id, 60.0m);

        var client = _factory.CreateAuthenticatedClient("Admin", admin.Id);
        var response = await client.DeleteAsync($"/api/grade/{grade.Id}");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }
}
