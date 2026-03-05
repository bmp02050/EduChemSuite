using System.Net;
using System.Text;
using EduChemSuite.API.Entities;
using EduChemSuite.API.Models;
using EduChemSuite.API.Tests.Fixtures;
using EduChemSuite.API.Tests.Helpers;
using FluentAssertions;
using Newtonsoft.Json;

namespace EduChemSuite.API.Tests.Tests;

public class UserControllerTests : IClassFixture<EduChemTestFactory>
{
    private readonly EduChemTestFactory _factory;

    public UserControllerTests(EduChemTestFactory factory)
    {
        _factory = factory;
    }

    private StringContent JsonBody(object obj) =>
        new(JsonConvert.SerializeObject(obj), Encoding.UTF8, "application/json");

    [Fact]
    public async Task ListAll_AsAdmin_ReturnsUsers()
    {
        var db = _factory.GetDbContext();
        var admin = TestDataSeeder.CreateUser(db, $"user-admin-listall-{Guid.NewGuid()}@test.com", "Pass123!", AccountType.Admin);

        var client = _factory.CreateAuthenticatedClient("Admin", admin.Id);
        var response = await client.GetAsync("/api/user/all");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        var users = JsonConvert.DeserializeObject<List<UserModel>>(content);
        users.Should().NotBeNull();
    }

    [Fact]
    public async Task ListAll_AsStudent_ReturnsForbidden()
    {
        var client = _factory.CreateAuthenticatedClient("Student");
        var response = await client.GetAsync("/api/user/all");

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task Register_AsAdmin_ReturnsOk()
    {
        var db = _factory.GetDbContext();
        var admin = TestDataSeeder.CreateUser(db, $"user-admin-register-{Guid.NewGuid()}@test.com", "Pass123!", AccountType.Admin);

        var newUserEmail = $"newuser-{Guid.NewGuid()}@test.com";
        var client = _factory.CreateAuthenticatedClient("Admin", admin.Id);
        var response = await client.PostAsync("/api/user/register",
            JsonBody(new
            {
                Email = newUserEmail,
                Password = "NewPass123!",
                FirstName = "New",
                LastName = "User",
                AccountType = (int)AccountType.Staff,
                Address1 = "123 Test",
                City = "City",
                State = "ST",
                Country = "US",
                Zip = "12345",
                Phone = "555-0100",
                IsAdmin = false,
            }));

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        var user = JsonConvert.DeserializeObject<UserModel>(content);
        user!.Email.Should().Be(newUserEmail);
    }

    [Fact]
    public async Task GetMe_Authenticated_ReturnsUser()
    {
        var db = _factory.GetDbContext();
        var user = TestDataSeeder.CreateUser(db, $"user-me-{Guid.NewGuid()}@test.com", "Pass123!", AccountType.Admin);

        var client = _factory.CreateAuthenticatedClient("Admin", user.Id);
        var response = await client.GetAsync("/api/user/me");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonConvert.DeserializeObject<UserModel>(content);
        result!.Id.Should().Be(user.Id);
    }

    [Fact]
    public async Task Update_OwnProfile_ReturnsOk()
    {
        var db = _factory.GetDbContext();
        var user = TestDataSeeder.CreateUser(db, $"user-update-{Guid.NewGuid()}@test.com", "Pass123!", AccountType.Admin);

        var client = _factory.CreateAuthenticatedClient("Admin", user.Id);
        var response = await client.PutAsync($"/api/user/{user.Id}",
            JsonBody(new
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = "Updated",
                LastName = "Name",
                AccountType = (int)AccountType.Admin,
                Address1 = "123 Test",
                City = "City",
                State = "ST",
                Country = "US",
                Zip = "12345",
                Phone = "555-0100",
                IsAdmin = true,
            }));

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task Update_OtherProfile_ReturnsUnauthorized()
    {
        var db = _factory.GetDbContext();
        var user1 = TestDataSeeder.CreateUser(db, $"user-update-other1-{Guid.NewGuid()}@test.com", "Pass123!", AccountType.Staff);
        var user2 = TestDataSeeder.CreateUser(db, $"user-update-other2-{Guid.NewGuid()}@test.com", "Pass123!", AccountType.Staff);

        var client = _factory.CreateAuthenticatedClient("Staff", user1.Id);
        var response = await client.PutAsync($"/api/user/{user2.Id}",
            JsonBody(new
            {
                Id = user2.Id,
                Email = user2.Email,
                FirstName = "Hacked",
                LastName = "Name",
                AccountType = (int)AccountType.Staff,
                Address1 = "123 Test",
                City = "City",
                State = "ST",
                Country = "US",
                Zip = "12345",
                Phone = "555-0100",
                IsAdmin = false,
            }));

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}
