using System.Net;
using System.Text;
using EduChemSuite.API.Entities;
using EduChemSuite.API.Models;
using EduChemSuite.API.Tests.Fixtures;
using EduChemSuite.API.Tests.Helpers;
using FluentAssertions;
using Newtonsoft.Json;

namespace EduChemSuite.API.Tests.Tests;

public class DistrictControllerTests : IClassFixture<EduChemTestFactory>
{
    private readonly EduChemTestFactory _factory;

    public DistrictControllerTests(EduChemTestFactory factory)
    {
        _factory = factory;
    }

    private StringContent JsonBody(object obj) =>
        new(JsonConvert.SerializeObject(obj), Encoding.UTF8, "application/json");

    [Fact]
    public async Task ListAll_AsAdmin_ReturnsDistricts()
    {
        var db = _factory.GetDbContext();
        var admin = TestDataSeeder.CreateUser(db, $"dist-admin-list-{Guid.NewGuid()}@test.com", "Pass123!", AccountType.Admin);
        TestDataSeeder.CreateDistrict(db, "ListAll District");

        var client = _factory.CreateAuthenticatedClient("Admin", admin.Id);
        var response = await client.GetAsync("/api/district");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        var districts = JsonConvert.DeserializeObject<List<DistrictModel>>(content);
        districts.Should().NotBeNull();
    }

    [Fact]
    public async Task ListAll_AsStudent_ReturnsForbidden()
    {
        var client = _factory.CreateAuthenticatedClient("Student");
        var response = await client.GetAsync("/api/district");

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task ListAll_Anonymous_ReturnsUnauthorized()
    {
        var client = _factory.CreateClient();
        var response = await client.GetAsync("/api/district");

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Create_AsAdmin_ReturnsOk()
    {
        var db = _factory.GetDbContext();
        var admin = TestDataSeeder.CreateUser(db, $"dist-admin-create-{Guid.NewGuid()}@test.com", "Pass123!", AccountType.Admin);

        var client = _factory.CreateAuthenticatedClient("Admin", admin.Id);
        var response = await client.PostAsync("/api/district",
            JsonBody(new { DistrictName = "New District", UserId = admin.Id }));

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        var district = JsonConvert.DeserializeObject<DistrictModel>(content);
        district!.DistrictName.Should().Be("New District");
    }

    [Fact]
    public async Task GetDetails_AsAdmin_ReturnsDistrict()
    {
        var db = _factory.GetDbContext();
        var admin = TestDataSeeder.CreateUser(db, $"dist-admin-details-{Guid.NewGuid()}@test.com", "Pass123!", AccountType.Admin);
        var district = TestDataSeeder.CreateDistrict(db, "Details District");

        var client = _factory.CreateAuthenticatedClient("Admin", admin.Id);
        var response = await client.GetAsync($"/api/district/details/{district.Id}");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonConvert.DeserializeObject<DistrictModel>(content);
        result!.DistrictName.Should().Be("Details District");
    }

    [Fact]
    public async Task Delete_AsAdmin_ReturnsOk()
    {
        var db = _factory.GetDbContext();
        var admin = TestDataSeeder.CreateUser(db, $"dist-admin-delete-{Guid.NewGuid()}@test.com", "Pass123!", AccountType.Admin);
        var district = TestDataSeeder.CreateDistrict(db, "Delete District");

        var client = _factory.CreateAuthenticatedClient("Admin", admin.Id);
        var response = await client.DeleteAsync($"/api/district/{district.Id}");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task AddUser_AsAdmin_ReturnsOk()
    {
        var db = _factory.GetDbContext();
        var admin = TestDataSeeder.CreateUser(db, $"dist-admin-adduser-{Guid.NewGuid()}@test.com", "Pass123!", AccountType.Admin);
        var user = TestDataSeeder.CreateUser(db, $"dist-user-adduser-{Guid.NewGuid()}@test.com", "Pass123!", AccountType.Staff);
        var district = TestDataSeeder.CreateDistrict(db, "AddUser District");

        var client = _factory.CreateAuthenticatedClient("Admin", admin.Id);
        var response = await client.PostAsync($"/api/district/{district.Id}/users/{user.Id}", null);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task RemoveUser_AsAdmin_ReturnsOk()
    {
        var db = _factory.GetDbContext();
        var admin = TestDataSeeder.CreateUser(db, $"dist-admin-rmuser-{Guid.NewGuid()}@test.com", "Pass123!", AccountType.Admin);
        var user = TestDataSeeder.CreateUser(db, $"dist-user-rmuser-{Guid.NewGuid()}@test.com", "Pass123!", AccountType.Staff);
        var district = TestDataSeeder.CreateDistrict(db, "RemoveUser District");

        // First add the user to the district
        db.UserDistricts.Add(new UserDistrict
        {
            DistrictId = district.Id,
            UserId = user.Id
        });
        db.SaveChanges();

        var client = _factory.CreateAuthenticatedClient("Admin", admin.Id);
        var response = await client.DeleteAsync($"/api/district/{district.Id}/users/{user.Id}");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }
}
