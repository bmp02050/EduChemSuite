using System.Net;
using System.Text;
using EduChemSuite.API.Entities;
using EduChemSuite.API.Models;
using EduChemSuite.API.Tests.Fixtures;
using EduChemSuite.API.Tests.Helpers;
using FluentAssertions;
using Newtonsoft.Json;

namespace EduChemSuite.API.Tests.Tests;

public class SchoolControllerTests : IClassFixture<EduChemTestFactory>
{
    private readonly EduChemTestFactory _factory;

    public SchoolControllerTests(EduChemTestFactory factory)
    {
        _factory = factory;
    }

    private StringContent JsonBody(object obj) =>
        new(JsonConvert.SerializeObject(obj), Encoding.UTF8, "application/json");

    [Fact]
    public async Task List_AsAdmin_ReturnsSchools()
    {
        var db = _factory.GetDbContext();
        var admin = TestDataSeeder.CreateUser(db, $"school-admin-list-{Guid.NewGuid()}@test.com", "Pass123!", AccountType.Admin);
        var district = TestDataSeeder.CreateDistrict(db, "School List District");
        TestDataSeeder.CreateSchool(db, "Test School", district.Id);

        var client = _factory.CreateAuthenticatedClient("Admin", admin.Id);
        var response = await client.GetAsync("/api/school");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        var schools = JsonConvert.DeserializeObject<List<SchoolModel>>(content);
        schools.Should().NotBeNull();
    }

    [Fact]
    public async Task List_Anonymous_ReturnsUnauthorized()
    {
        var client = _factory.CreateClient();
        var response = await client.GetAsync("/api/school");

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Create_AsAdmin_ReturnsOk()
    {
        var db = _factory.GetDbContext();
        var admin = TestDataSeeder.CreateUser(db, $"school-admin-create-{Guid.NewGuid()}@test.com", "Pass123!", AccountType.Admin);
        var district = TestDataSeeder.CreateDistrict(db, "School Create District");

        var client = _factory.CreateAuthenticatedClient("Admin", admin.Id);
        var response = await client.PostAsync("/api/school",
            JsonBody(new { Name = "New School", DistrictId = district.Id }));

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        var school = JsonConvert.DeserializeObject<SchoolModel>(content);
        school!.Name.Should().Be("New School");
    }

    [Fact]
    public async Task GetById_AsAdmin_ReturnsSchool()
    {
        var db = _factory.GetDbContext();
        var admin = TestDataSeeder.CreateUser(db, $"school-admin-getid-{Guid.NewGuid()}@test.com", "Pass123!", AccountType.Admin);
        var district = TestDataSeeder.CreateDistrict(db, "School GetById District");
        var school = TestDataSeeder.CreateSchool(db, "GetById School", district.Id);

        var client = _factory.CreateAuthenticatedClient("Admin", admin.Id);
        var response = await client.GetAsync($"/api/school/{school.Id}");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonConvert.DeserializeObject<SchoolModel>(content);
        result!.Name.Should().Be("GetById School");
    }

    [Fact]
    public async Task AddUser_AsAdmin_ReturnsOk()
    {
        var db = _factory.GetDbContext();
        var admin = TestDataSeeder.CreateUser(db, $"school-admin-adduser-{Guid.NewGuid()}@test.com", "Pass123!", AccountType.Admin);
        var user = TestDataSeeder.CreateUser(db, $"school-user-adduser-{Guid.NewGuid()}@test.com", "Pass123!", AccountType.Student);
        var district = TestDataSeeder.CreateDistrict(db, "School AddUser District");
        var school = TestDataSeeder.CreateSchool(db, "AddUser School", district.Id);

        var client = _factory.CreateAuthenticatedClient("Admin", admin.Id);
        var response = await client.PostAsync($"/api/school/{school.Id}/users/{user.Id}", null);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task Delete_AsAdmin_ReturnsOk()
    {
        var db = _factory.GetDbContext();
        var admin = TestDataSeeder.CreateUser(db, $"school-admin-delete-{Guid.NewGuid()}@test.com", "Pass123!", AccountType.Admin);
        var district = TestDataSeeder.CreateDistrict(db, "School Delete District");
        var school = TestDataSeeder.CreateSchool(db, "Delete School", district.Id);

        var client = _factory.CreateAuthenticatedClient("Admin", admin.Id);
        var response = await client.DeleteAsync($"/api/school/{school.Id}");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }
}
