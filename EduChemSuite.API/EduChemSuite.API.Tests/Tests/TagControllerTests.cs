using System.Net;
using System.Text;
using EduChemSuite.API.Entities;
using EduChemSuite.API.Models;
using EduChemSuite.API.Tests.Fixtures;
using EduChemSuite.API.Tests.Helpers;
using FluentAssertions;
using Newtonsoft.Json;

namespace EduChemSuite.API.Tests.Tests;

public class TagControllerTests : IClassFixture<EduChemTestFactory>
{
    private readonly EduChemTestFactory _factory;

    public TagControllerTests(EduChemTestFactory factory)
    {
        _factory = factory;
    }

    private StringContent JsonBody(object obj) =>
        new(JsonConvert.SerializeObject(obj), Encoding.UTF8, "application/json");

    [Fact]
    public async Task List_ReturnsTags()
    {
        var db = _factory.GetDbContext();
        var admin = TestDataSeeder.CreateUser(db, $"tag-admin-list-{Guid.NewGuid()}@test.com", "Pass123!", AccountType.Admin);
        TestDataSeeder.CreateTag(db, "Chemistry");

        var client = _factory.CreateAuthenticatedClient("Admin", admin.Id);
        var response = await client.GetAsync("/api/tag");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        var tags = JsonConvert.DeserializeObject<List<TagModel>>(content);
        tags.Should().NotBeNull();
    }

    [Fact]
    public async Task Create_ReturnsOk()
    {
        var db = _factory.GetDbContext();
        var admin = TestDataSeeder.CreateUser(db, $"tag-admin-create-{Guid.NewGuid()}@test.com", "Pass123!", AccountType.Admin);

        var client = _factory.CreateAuthenticatedClient("Admin", admin.Id);
        var response = await client.PostAsync("/api/tag",
            JsonBody(new { TagText = "Organic Chemistry" }));

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        var tag = JsonConvert.DeserializeObject<TagModel>(content);
        tag!.TagText.Should().Be("Organic Chemistry");
    }

    [Fact]
    public async Task GetById_ReturnsTag()
    {
        var db = _factory.GetDbContext();
        var admin = TestDataSeeder.CreateUser(db, $"tag-admin-getid-{Guid.NewGuid()}@test.com", "Pass123!", AccountType.Admin);
        var tag = TestDataSeeder.CreateTag(db, "Physics");

        var client = _factory.CreateAuthenticatedClient("Admin", admin.Id);
        var response = await client.GetAsync($"/api/tag/{tag.Id}");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonConvert.DeserializeObject<TagModel>(content);
        result!.TagText.Should().Be("Physics");
    }

    [Fact]
    public async Task Update_ReturnsOk()
    {
        var db = _factory.GetDbContext();
        var admin = TestDataSeeder.CreateUser(db, $"tag-admin-update-{Guid.NewGuid()}@test.com", "Pass123!", AccountType.Admin);
        var tag = TestDataSeeder.CreateTag(db, "Original Tag");

        var client = _factory.CreateAuthenticatedClient("Admin", admin.Id);
        var response = await client.PutAsync($"/api/tag/{tag.Id}",
            JsonBody(new { TagText = "Updated Tag" }));

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }
}
